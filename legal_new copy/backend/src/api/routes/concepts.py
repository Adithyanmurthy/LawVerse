"""Concept routes — list, get, evolution timeline."""
import json
import numpy as np
from fastapi import APIRouter, Query, HTTPException
from backend.src.api.schemas import ConceptResponse, EvolutionTimeline, EvolutionPeriod
from config.settings import EMBEDDINGS_DIR, SEED_CONCEPTS
from model.smi import classify_drift

router = APIRouter(prefix="/concepts", tags=["concepts"])


def _load_concept_data(concept: str) -> dict | None:
    path = EMBEDDINGS_DIR / f"{concept.replace(' ', '_')}.json"
    if path.exists():
        return json.loads(path.read_text())
    return None


@router.get("", response_model=list[ConceptResponse])
async def list_concepts(search: str = Query("", description="Filter by name")):
    results = []
    for c in SEED_CONCEPTS:
        if search and search.lower() not in c.lower():
            continue
        data = _load_concept_data(c)
        doc_count = sum(v["doc_count"] for v in data.values()) if data else 0
        results.append(ConceptResponse(name=c, document_count=doc_count))
    return results


@router.get("/{name}", response_model=ConceptResponse)
async def get_concept(name: str):
    data = _load_concept_data(name)
    if not data:
        raise HTTPException(404, f"Concept '{name}' not found")
    doc_count = sum(v["doc_count"] for v in data.values())
    return ConceptResponse(name=name, document_count=doc_count)


@router.get("/{name}/evolution", response_model=EvolutionTimeline)
async def get_evolution(name: str,
                        start_year: int = Query(1900), end_year: int = Query(2029)):
    data = _load_concept_data(name)
    if not data:
        raise HTTPException(404, f"Concept '{name}' not found or not yet indexed")

    decades = sorted(data.keys())
    periods = []
    for i in range(1, len(decades)):
        d_prev, d_curr = decades[i - 1], decades[i]
        prev_year = int(d_prev.rstrip("s"))
        curr_year = int(d_curr.rstrip("s"))
        if curr_year < start_year or prev_year > end_year:
            continue
        emb_prev = np.array(data[d_prev]["embedding"])
        emb_curr = np.array(data[d_curr]["embedding"])
        smi = float(1 - np.dot(emb_prev, emb_curr) /
                     (np.linalg.norm(emb_prev) * np.linalg.norm(emb_curr) + 1e-8))
        drift = classify_drift(smi)
        periods.append(EvolutionPeriod(
            period_start=d_prev, period_end=d_curr,
            smi_score=round(smi, 4), drift_type=drift,
        ))

    overall = "STABLE"
    if periods:
        avg_smi = np.mean([p.smi_score for p in periods])
        overall = classify_drift(float(avg_smi))

    return EvolutionTimeline(concept=name, periods=periods, overall_drift=overall)


@router.get("/{name}/citations")
async def get_citations(name: str):
    """Generate citation network from corpus documents mentioning this concept."""
    import json as _json
    from config.settings import CORPUS_DIR
    corpus_path = CORPUS_DIR / "corpus.jsonl"
    if not corpus_path.exists():
        return {"concept": name, "nodes": [], "edges": []}
    docs = []
    with open(corpus_path) as f:
        for line in f:
            docs.append(_json.loads(line.strip()))
    # Filter docs mentioning this concept
    relevant = [d for d in docs if name.lower() in d.get("text", "").lower()][:30]
    if not relevant:
        return {"concept": name, "nodes": [], "edges": []}
    nodes = []
    for d in relevant:
        nodes.append({
            "id": d["id"],
            "label": (d.get("case_name") or d["id"])[:40],
            "year": d.get("year", 2020),
            "impact_score": round(min(1.0, d.get("word_count", 500) / 10000), 3),
        })
    # Build edges: if doc A's case_name appears in doc B's text, A->B
    edges = []
    for i, a in enumerate(relevant):
        a_name = (a.get("case_name") or "").lower()
        if len(a_name) < 5:
            continue
        for j, b in enumerate(relevant):
            if i == j:
                continue
            if a_name in b.get("text", "").lower()[:3000]:
                edges.append({"source": a["id"], "target": b["id"], "weight": 0.8})
    return {"concept": name, "nodes": nodes, "edges": edges}
