# LCET v2 — Legal Concept Evolution Tracker (Pre-trained Model Approach)

AI platform that tracks how legal concepts change meaning over time using pre-trained legal NLP models.

## Architecture

| Component | Model / Tech | Purpose |
|-----------|-------------|---------|
| Legal Embeddings | `lexlms/legal-roberta-large` (355M) | Core concept embeddings, diachronic analysis |
| Legal NER | `urchade/gliner_large-v2.1` (zero-shot) | Extract legal entities from any text |
| Drift Classification | `DeBERTa-v3-large-mnli` (zero-shot) | Classify semantic drift types |
| Search Embeddings | `BAAI/bge-large-en-v1.5` (1024-dim) | Semantic search across documents |
| Backend | FastAPI + SQLite/PostgreSQL | REST API with JWT auth |
| Frontend | Next.js 14 + Three.js + D3.js | Dashboard with 3D visualizations |
| DevOps | Docker + K8s + Prometheus + Grafana | Production deployment |

## Quick Start

```bash
cd legal_new

# 1. Run the full pipeline (install deps → download models → download data → preprocess → build embeddings)
bash scripts/run_pipeline.sh

# 2. Start the API
PYTHONPATH=. uvicorn backend.src.api.main:app --reload --port 8000

# 3. Start the frontend
cd frontend && npm install && npm run dev
```

## Project Structure

```
legal_new/
├── config/          # Settings, model IDs, API keys reference
├── model/           # Model hub (loads all 4 pre-trained models)
│   ├── __init__.py  # LCETModelHub — embed, NER, drift, search
│   ├── smi.py       # Semantic Movement Index computation
│   └── pretrained/  # Downloaded model weights
├── data/            # Data pipeline
│   ├── downloaders.py  # CourtListener, HUDOC, LiveLaw
│   ├── preprocessor.py # Clean, extract year/citations
│   ├── indexer.py      # Build per-concept per-decade embeddings
│   └── raw/processed/corpus/embeddings/
├── backend/         # FastAPI API
│   └── src/api/     # Routes: auth, concepts, documents, analysis, search
├── frontend/        # Next.js 14 dashboard (copied from Lperson_4)
├── devops/          # Docker, K8s, monitoring
├── scripts/         # Pipeline runner, model downloader
└── requirements.txt
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login, get JWT |
| GET | `/api/v1/concepts` | List tracked legal concepts |
| GET | `/api/v1/concepts/{name}/evolution` | Get SMI evolution timeline |
| POST | `/api/v1/analysis/smi` | Calculate SMI between two periods |
| POST | `/api/v1/analysis/ner` | Extract legal entities (zero-shot) |
| POST | `/api/v1/analysis/drift` | Classify drift type |
| GET | `/api/v1/documents` | List documents |
| GET | `/api/v1/documents/{id}/impact` | Precedent impact analysis |
| GET | `/api/v1/search?q=...` | Semantic search |
| GET | `/health` | Health check |
