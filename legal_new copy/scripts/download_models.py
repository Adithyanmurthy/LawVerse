#!/usr/bin/env python3
"""Download all pre-trained models into legal_new/model/pretrained/."""
import sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from config.settings import (
    MODEL_DIR, CACHE_DIR,
    LEGAL_EMBED_MODEL, NER_MODEL, DRIFT_CLF_MODEL, SEARCH_EMBED_MODEL,
)

def main():
    import os
    os.environ["HF_HOME"] = str(CACHE_DIR)
    os.environ["TRANSFORMERS_CACHE"] = str(CACHE_DIR)

    # 1. Legal backbone (LexLM Large — 355M)
    print(f"\n{'='*60}")
    print(f"[1/4] Downloading {LEGAL_EMBED_MODEL} ...")
    print(f"{'='*60}")
    from transformers import AutoTokenizer, AutoModel
    tok = AutoTokenizer.from_pretrained(LEGAL_EMBED_MODEL, cache_dir=CACHE_DIR)
    mdl = AutoModel.from_pretrained(LEGAL_EMBED_MODEL, cache_dir=CACHE_DIR)
    save_to = MODEL_DIR / "legal-roberta-large"
    tok.save_pretrained(save_to)
    mdl.save_pretrained(save_to)
    print(f"  ✓ Saved to {save_to}")

    # 2. GLiNER (zero-shot NER)
    print(f"\n{'='*60}")
    print(f"[2/4] Downloading {NER_MODEL} ...")
    print(f"{'='*60}")
    from gliner import GLiNER
    ner = GLiNER.from_pretrained(NER_MODEL, cache_dir=str(CACHE_DIR))
    ner_path = MODEL_DIR / "gliner-large-v2.1"
    ner_path.mkdir(exist_ok=True)
    ner.save_pretrained(str(ner_path))
    print(f"  ✓ Saved to {ner_path}")

    # 3. Zero-shot classifier (DeBERTa MNLI)
    print(f"\n{'='*60}")
    print(f"[3/4] Downloading {DRIFT_CLF_MODEL} ...")
    print(f"{'='*60}")
    from transformers import pipeline
    clf = pipeline("zero-shot-classification", model=DRIFT_CLF_MODEL,
                    model_kwargs={"cache_dir": str(CACHE_DIR)})
    clf_path = MODEL_DIR / "deberta-v3-mnli"
    clf.model.save_pretrained(clf_path)
    clf.tokenizer.save_pretrained(clf_path)
    print(f"  ✓ Saved to {clf_path}")

    # 4. Search embeddings (BGE Large)
    print(f"\n{'='*60}")
    print(f"[4/4] Downloading {SEARCH_EMBED_MODEL} ...")
    print(f"{'='*60}")
    from sentence_transformers import SentenceTransformer
    st = SentenceTransformer(SEARCH_EMBED_MODEL, cache_folder=str(CACHE_DIR))
    st_path = MODEL_DIR / "bge-large-en-v1.5"
    st.save(str(st_path))
    print(f"  ✓ Saved to {st_path}")

    print(f"\n{'='*60}")
    print("All models downloaded successfully!")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
