"""Central configuration — all paths relative to legal_new/."""
import os, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
CORPUS_DIR = DATA_DIR / "corpus"
EMBEDDINGS_DIR = DATA_DIR / "embeddings"
MODEL_DIR = ROOT / "model" / "pretrained"
CACHE_DIR = ROOT / "model" / "cache"
LOG_DIR = ROOT / "logs"

for d in [RAW_DIR, PROCESSED_DIR, CORPUS_DIR, EMBEDDINGS_DIR, MODEL_DIR, CACHE_DIR, LOG_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ── API keys (loaded from the existing project config) ──
_keys_path = ROOT / "config" / "api_keys.json"
API_KEYS: dict = json.loads(_keys_path.read_text()) if _keys_path.exists() else {}

COURTLISTENER_TOKEN = API_KEYS.get("courtlistener", {}).get("api_key", "")
COURTLISTENER_BASE = API_KEYS.get("courtlistener", {}).get("base_url", "https://www.courtlistener.com/api/rest/v3/")

# ── Model identifiers (HuggingFace) ──
LEGAL_EMBED_MODEL = "lexlms/legal-roberta-large"      # 355M, legal backbone
NER_MODEL          = "urchade/gliner_large-v2.1"       # zero-shot NER
DRIFT_CLF_MODEL    = "MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli"  # zero-shot classification
SEARCH_EMBED_MODEL = "BAAI/bge-large-en-v1.5"         # 1024-dim search embeddings

# ── SMI thresholds (same as original) ──
SMI_THRESHOLDS = {
    "STABLE":       (0.0, 0.1),
    "EXPANSION":    (0.1, 0.3),
    "CONTRACTION":  (0.3, 0.5),
    "BIFURCATION":  (0.5, 0.7),
    "MERGER":       (0.7, 1.0),
}

# ── Seed legal concepts ──
SEED_CONCEPTS = [
    "due process", "equal protection", "free speech", "privacy",
    "search and seizure", "probable cause", "reasonable doubt",
    "negligence", "breach of contract", "fiduciary duty",
    "right to life", "freedom of expression", "fair trial",
    "habeas corpus", "judicial review",
    "dowry", "bail", "sedition", "defamation",
    "contempt of court", "arbitration", "consumer protection",
    "right to education", "environmental law", "cyber crime",
]

# ── Indian legal concepts (for Indian Kanoon scraper) ──
INDIAN_CONCEPTS = [
    "right to life", "right to equality", "freedom of speech",
    "right to privacy", "due process", "natural justice",
    "anticipatory bail", "dowry", "cruelty section 498a",
    "sedition", "defamation", "contempt of court",
    "judicial review", "fundamental rights", "reasonable restriction",
    "right to education", "right to information", "environmental law",
    "consumer protection", "arbitration", "specific performance",
    "negligence", "breach of contract", "intellectual property",
    "cyber crime", "money laundering", "prevention of corruption",
]

# ── Backend ──
DB_URL = os.getenv("LCET_DB_URL", "sqlite+aiosqlite:///" + str(DATA_DIR / "lcet.db"))
JWT_SECRET = os.getenv("JWT_SECRET", "lcet-dev-secret-change-in-prod")
API_PREFIX = "/api/v1"
