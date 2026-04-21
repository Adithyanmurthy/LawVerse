"""Document routes — list, get, impact analysis."""
import json
from fastapi import APIRouter, Query, HTTPException
from backend.src.api.schemas import ImpactResponse
from config.settings import CORPUS_DIR
from math import log1p

router = APIRouter(prefix="/documents", tags=["documents"])

def _load_corpus() -> list[dict]:
    path = CORPUS_DIR / "corpus.jsonl"
    if not path.exists():
        return []
    docs = []
    with open(path) as f:
        for line in f:
            docs.append(json.loads(line.strip()))
    return docs


@router.get("")
async def list_documents(jurisdiction: str = "", court: str = "",
                         year_start: int = 0, year_end: int = 9999,
                         offset: int = 0, limit: int = Query(20, le=100)):
    docs = _load_corpus()
    filtered = [d for d in docs
                if (not jurisdiction or d.get("jurisdiction", "").lower() == jurisdiction.lower())
                and (not court or d.get("court", "").lower() == court.lower())
                and year_start <= d.get("year", 0) <= year_end]
    return {"total": len(filtered),
            "documents": filtered[offset:offset + limit]}


@router.get("/{doc_id}")
async def get_document(doc_id: str):
    for d in _load_corpus():
        if d.get("id") == doc_id:
            return d
    raise HTTPException(404, "Document not found")


@router.get("/{doc_id}/impact", response_model=ImpactResponse)
async def get_impact(doc_id: str):
    docs = _load_corpus()
    target = None
    for d in docs:
        if d.get("id") == doc_id:
            target = d
            break
    if not target:
        raise HTTPException(404, "Document not found")

    target_id = target.get("id", "")
    target_name = target.get("case_name", "").lower()
    cite_count = 0
    for d in docs:
        if d.get("id") == target_id:
            continue
        for c in d.get("citations", []):
            if target_name and target_name in c.lower():
                cite_count += 1
                break
        else:
            if target_name and len(target_name) > 5 and target_name in d.get("text", "")[:2000].lower():
                cite_count += 1
    score = min(1.0, log1p(cite_count) / log1p(100))
    level = min(10, max(1, int(score * 10) + 1))

    return ImpactResponse(
        case_name=target.get("case_name", ""),
        year=target.get("year", 0),
        impact_score=round(score, 4),
        impact_level=level,
        citation_count=cite_count,
        influenced_concepts=[],
    )
