"""Analysis routes — SMI calculation, NER, drift classification."""
from fastapi import APIRouter
from backend.src.api.schemas import SMIRequest, SMIResponse, NEREntity, NERResponse
from model.smi import classify_drift
from pydantic import BaseModel
import json, numpy as np
from config.settings import EMBEDDINGS_DIR

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/smi", response_model=SMIResponse)
async def calculate_smi(req: SMIRequest):
    path = EMBEDDINGS_DIR / f"{req.concept.replace(' ', '_')}.json"
    if not path.exists():
        return SMIResponse(concept=req.concept, smi_score=0.0,
                           drift_type="STABLE", confidence=0.0)
    data = json.loads(path.read_text())

    def _get_emb(start: int, end: int):
        embs = []
        for decade, info in data.items():
            d_year = int(decade.rstrip("s"))
            if start <= d_year <= end:
                embs.append(np.array(info["embedding"]))
        return np.mean(embs, axis=0) if embs else None

    emb1 = _get_emb(req.period_1_start, req.period_1_end)
    emb2 = _get_emb(req.period_2_start, req.period_2_end)
    if emb1 is None or emb2 is None:
        return SMIResponse(concept=req.concept, smi_score=0.0,
                           drift_type="STABLE", confidence=0.0)
    smi = float(1 - np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2) + 1e-8))
    return SMIResponse(concept=req.concept, smi_score=round(smi, 4),
                       drift_type=classify_drift(smi), confidence=0.85)


class NERRequest(BaseModel):
    text: str
    labels: list[str] | None = None

@router.post("/ner", response_model=NERResponse)
async def extract_entities(req: NERRequest):
    from model import get_hub
    hub = get_hub()
    entities = hub.extract_entities(req.text, labels=req.labels)
    return NERResponse(entities=[NEREntity(**e) for e in entities],
                       text_length=len(req.text))


class DriftRequest(BaseModel):
    description: str

@router.post("/drift")
async def classify_drift_type(req: DriftRequest):
    from model import get_hub
    hub = get_hub()
    return hub.classify_drift(req.description)
