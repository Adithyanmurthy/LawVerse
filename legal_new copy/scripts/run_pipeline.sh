#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
ROOT=$(pwd)

echo "============================================"
echo "  LCET legal_new — Full Pipeline"
echo "============================================"

# 1. Install deps
echo -e "\n[1/5] Installing dependencies..."
pip install -q -r requirements.txt 2>&1 | tail -3

# 2. Download models
echo -e "\n[2/5] Downloading pre-trained models..."
PYTHONPATH="$ROOT" python scripts/download_models.py

# 3. Download data
echo -e "\n[3/5] Downloading legal data..."
PYTHONPATH="$ROOT" python -c "from data.downloaders import download_all; download_all()"

# 4. Preprocess
echo -e "\n[4/5] Preprocessing corpus..."
PYTHONPATH="$ROOT" python -c "from data.preprocessor import preprocess_all; preprocess_all()"

# 5. Build embeddings
echo -e "\n[5/5] Building concept embeddings (this takes a while)..."
PYTHONPATH="$ROOT" python -c "from data.indexer import build_embeddings; build_embeddings()"

echo -e "\n============================================"
echo "  Pipeline complete!"
echo "  Start the API:  cd legal_new && PYTHONPATH=. uvicorn backend.src.api.main:app --reload --port 8000"
echo "============================================"
