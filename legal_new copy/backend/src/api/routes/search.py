"""Semantic search route — uses BGE embeddings with pre-computed cache."""
import json, pickle, hashlib
from fastapi import APIRouter, Query
from backend.src.api.schemas import SearchResponse, SearchResult
from config.settings import CORPUS_DIR, EMBEDDINGS_DIR
import numpy as np

router = APIRouter(prefix="/search", tags=["search"])

_cache = {"docs": None, "embs": None, "hash": None}


def _load_corpus_with_cache():
    corpus_path = CORPUS_DIR / "corpus.jsonl"
    if not corpus_path.exists():
        return [], None
    file_hash = hashlib.md5(corpus_path.read_bytes()).hexdigest()
    if _cache["hash"] == file_hash and _cache["docs"] is not None:
        return _cache["docs"], _cache["embs"]

    docs = []
    with open(corpus_path) as f:
        for line in f:
            docs.append(json.loads(line.strip()))

    cache_path = EMBEDDINGS_DIR / "search_cache.pkl"
    if cache_path.exists():
        with open(cache_path, "rb") as f:
            cached = pickle.load(f)
            if cached.get("hash") == file_hash:
                _cache.update(docs=docs, embs=cached["embs"], hash=file_hash)
                return docs, cached["embs"]

    from model import get_hub
    hub = get_hub()
    snippets = [d["text"][:500] for d in docs]
    embs = hub.search_embed(snippets)
    with open(cache_path, "wb") as f:
        pickle.dump({"hash": file_hash, "embs": embs}, f)
    _cache.update(docs=docs, embs=embs, hash=file_hash)
    return docs, embs


@router.get("", response_model=SearchResponse)
async def semantic_search(q: str = Query(..., description="Search query"),
                          jurisdiction: str = "", limit: int = Query(20, le=100)):
    from model import get_hub
    hub = get_hub()

    docs, doc_embs = _load_corpus_with_cache()
    if not docs or doc_embs is None:
        return SearchResponse(results=[], total=0, query=q)

    if jurisdiction:
        mask = [i for i, d in enumerate(docs)
                if d.get("jurisdiction", "").lower() == jurisdiction.lower()]
        if not mask:
            return SearchResponse(results=[], total=0, query=q)
        filtered_docs = [docs[i] for i in mask]
        filtered_embs = doc_embs[mask]
    else:
        filtered_docs = docs
        filtered_embs = doc_embs

    query_emb = hub.search_embed([q])
    scores = (filtered_embs @ query_emb.T).flatten()
    top_idx = np.argsort(scores)[::-1][:limit]

    results = []
    for idx in top_idx:
        d = filtered_docs[idx]
        results.append(SearchResult(
            id=d.get("id", ""),
            case_name=d.get("case_name", ""),
            court=d.get("court", ""),
            year=d.get("year"),
            relevance_score=round(float(scores[idx]), 4),
            snippet=d["text"][:250],
        ))

    return SearchResponse(results=results, total=len(filtered_docs), query=q)
