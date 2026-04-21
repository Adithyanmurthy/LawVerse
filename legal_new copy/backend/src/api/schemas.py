"""Pydantic schemas for the LCET API."""
from pydantic import BaseModel


class ConceptResponse(BaseModel):
    name: str
    category: str = "general"
    document_count: int = 0
    latest_smi: float | None = None


class EvolutionPeriod(BaseModel):
    period_start: str
    period_end: str
    smi_score: float
    drift_type: str


class EvolutionTimeline(BaseModel):
    concept: str
    periods: list[EvolutionPeriod]
    overall_drift: str = "STABLE"


class SMIRequest(BaseModel):
    concept: str
    period_1_start: int
    period_1_end: int
    period_2_start: int
    period_2_end: int


class SMIResponse(BaseModel):
    concept: str
    smi_score: float
    drift_type: str
    confidence: float


class NEREntity(BaseModel):
    text: str
    label: str
    score: float
    start: int
    end: int


class NERResponse(BaseModel):
    entities: list[NEREntity]
    text_length: int


class SearchResult(BaseModel):
    id: str
    case_name: str
    court: str
    year: int | None = None
    relevance_score: float
    snippet: str


class SearchResponse(BaseModel):
    results: list[SearchResult]
    total: int
    query: str


class ImpactResponse(BaseModel):
    case_name: str
    year: int
    impact_score: float
    impact_level: int
    citation_count: int
    influenced_concepts: list[str]
