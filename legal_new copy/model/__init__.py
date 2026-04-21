"""LCET Model Hub — loads all pre-trained models once, exposes inference methods."""
import torch, numpy as np, pathlib, os
from typing import Optional

_ROOT = pathlib.Path(__file__).resolve().parent.parent
os.environ.setdefault("HF_HOME", str(_ROOT / "model" / "cache"))

class LCETModelHub:
    """Singleton-style hub that lazily loads each model on first use."""

    def __init__(self, device: Optional[str] = None):
        self.device = device or ("mps" if torch.backends.mps.is_available() else
                                  "cuda" if torch.cuda.is_available() else "cpu")
        self._embed_model = None
        self._embed_tok = None
        self._ner_model = None
        self._drift_clf = None
        self._search_model = None

    # ── Legal Backbone (LexLM Large) ──────────────────────────
    def _load_embed(self):
        if self._embed_model is None:
            from transformers import AutoTokenizer, AutoModel
            p = _ROOT / "model" / "pretrained" / "legal-roberta-large"
            self._embed_tok = AutoTokenizer.from_pretrained(str(p))
            self._embed_model = AutoModel.from_pretrained(str(p)).to(self.device).eval()
        return self._embed_tok, self._embed_model

    def embed_texts(self, texts: list[str], batch_size: int = 8) -> np.ndarray:
        """Return (N, 1024) mean-pooled embeddings from LexLM Large."""
        tok, model = self._load_embed()
        all_embs = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            enc = tok(batch, padding=True, truncation=True, max_length=512, return_tensors="pt").to(self.device)
            with torch.no_grad():
                out = model(**enc)
            mask = enc["attention_mask"].unsqueeze(-1).float()
            emb = (out.last_hidden_state * mask).sum(1) / mask.sum(1)
            all_embs.append(emb.cpu().numpy())
        return np.vstack(all_embs)

    def embed_concept_in_context(self, texts: list[str], concept: str, batch_size: int = 8) -> np.ndarray:
        """Return embeddings of `concept` tokens averaged across contexts."""
        tok, model = self._load_embed()
        concept_ids = set(tok.encode(concept, add_special_tokens=False))
        all_embs = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            enc = tok(batch, padding=True, truncation=True, max_length=512, return_tensors="pt").to(self.device)
            with torch.no_grad():
                out = model(**enc)
            for j, input_ids in enumerate(enc["input_ids"]):
                idxs = [k for k, tid in enumerate(input_ids.tolist()) if tid in concept_ids]
                if idxs:
                    all_embs.append(out.last_hidden_state[j, idxs].mean(0).cpu().numpy())
        if not all_embs:
            return self.embed_texts([concept])
        return np.mean(all_embs, axis=0, keepdims=True)

    # ── NER (GLiNER zero-shot) ────────────────────────────────
    def _load_ner(self):
        if self._ner_model is None:
            from gliner import GLiNER
            p = _ROOT / "model" / "pretrained" / "gliner-large-v2.1"
            self._ner_model = GLiNER.from_pretrained(str(p))
        return self._ner_model

    def extract_entities(self, text: str, labels: list[str] | None = None, threshold: float = 0.4) -> list[dict]:
        """Zero-shot NER. Returns [{text, label, score, start, end}, ...]."""
        if labels is None:
            labels = ["COURT", "JUDGE", "STATUTE", "CASE_NAME", "LEGAL_CONCEPT",
                      "JURISDICTION", "DATE", "PARTY", "PRECEDENT", "LEGISLATION"]
        ner = self._load_ner()
        entities = ner.predict_entities(text, labels, threshold=threshold)
        return [{"text": e["text"], "label": e["label"],
                 "score": round(float(e["score"]), 4),
                 "start": e["start"], "end": e["end"]} for e in entities]

    # ── Drift Classification (zero-shot NLI) ──────────────────
    def _load_drift_clf(self):
        if self._drift_clf is None:
            from transformers import pipeline
            p = _ROOT / "model" / "pretrained" / "deberta-v3-mnli"
            self._drift_clf = pipeline("zero-shot-classification",
                                        model=str(p), tokenizer=str(p),
                                        device=self.device if self.device != "mps" else -1)
        return self._drift_clf

    def classify_drift(self, description: str) -> dict:
        """Classify a textual description of concept change into drift types."""
        clf = self._load_drift_clf()
        labels = ["semantic expansion and broadening",
                  "semantic contraction and narrowing",
                  "bifurcation into multiple meanings",
                  "merger of previously distinct meanings",
                  "stable with no significant change"]
        result = clf(description, candidate_labels=labels, multi_label=False)
        label_map = {
            "semantic expansion and broadening": "EXPANSION",
            "semantic contraction and narrowing": "CONTRACTION",
            "bifurcation into multiple meanings": "BIFURCATION",
            "merger of previously distinct meanings": "MERGER",
            "stable with no significant change": "STABLE",
        }
        return {
            "drift_type": label_map.get(result["labels"][0], "STABLE"),
            "confidence": round(float(result["scores"][0]), 4),
            "all_scores": {label_map.get(l, l): round(float(s), 4)
                          for l, s in zip(result["labels"], result["scores"])},
        }

    # ── Search Embeddings (BGE Large) ─────────────────────────
    def _load_search(self):
        if self._search_model is None:
            from sentence_transformers import SentenceTransformer
            p = _ROOT / "model" / "pretrained" / "bge-large-en-v1.5"
            try:
                self._search_model = SentenceTransformer(str(p), device=self.device)
            except Exception:
                self._search_model = SentenceTransformer("BAAI/bge-large-en-v1.5", device=self.device)
        return self._search_model

    def search_embed(self, texts: list[str]) -> np.ndarray:
        """Return (N, 1024) search embeddings from BGE Large."""
        model = self._load_search()
        return model.encode(texts, normalize_embeddings=True, show_progress_bar=False)


# Module-level singleton
_hub: LCETModelHub | None = None

def get_hub(device: str | None = None) -> LCETModelHub:
    global _hub
    if _hub is None:
        _hub = LCETModelHub(device=device)
    return _hub
