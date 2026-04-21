"""Semantic Movement Index — diachronic embedding analysis using pre-trained LexLM."""
import numpy as np
from scipy.spatial.distance import cosine
from typing import Optional
from config.settings import SMI_THRESHOLDS


def compute_smi(emb_t1: np.ndarray, emb_t2: np.ndarray) -> float:
    """SMI = 1 - cosine_similarity(avg_emb_t1, avg_emb_t2). Range [0, 1]."""
    v1 = emb_t1.mean(axis=0) if emb_t1.ndim > 1 else emb_t1
    v2 = emb_t2.mean(axis=0) if emb_t2.ndim > 1 else emb_t2
    return float(cosine(v1, v2))


def classify_drift(smi_score: float) -> str:
    for label, (lo, hi) in SMI_THRESHOLDS.items():
        if lo <= smi_score < hi:
            return label
    return "MERGER"


def compute_smi_with_confidence(emb_t1: np.ndarray, emb_t2: np.ndarray,
                                 n_bootstrap: int = 100) -> dict:
    """Bootstrap confidence interval for SMI."""
    scores = []
    n1, n2 = len(emb_t1), len(emb_t2)
    for _ in range(n_bootstrap):
        idx1 = np.random.choice(n1, size=max(1, n1), replace=True)
        idx2 = np.random.choice(n2, size=max(1, n2), replace=True)
        scores.append(compute_smi(emb_t1[idx1], emb_t2[idx2]))
    mean_smi = float(np.mean(scores))
    return {
        "smi_score": round(mean_smi, 4),
        "confidence_low": round(float(np.percentile(scores, 2.5)), 4),
        "confidence_high": round(float(np.percentile(scores, 97.5)), 4),
        "drift_type": classify_drift(mean_smi),
    }


def build_concept_timeline(concept: str, docs_by_period: dict[str, list[str]],
                            hub) -> list[dict]:
    """Build SMI timeline for a concept across time periods.

    Args:
        concept: legal concept string (e.g. "privacy")
        docs_by_period: {period_label: [doc_texts]} sorted chronologically
        hub: LCETModelHub instance
    Returns:
        list of {period_start, period_end, smi_score, drift_type, ...}
    """
    periods = sorted(docs_by_period.keys())
    if len(periods) < 2:
        return []

    # Compute per-period concept embeddings
    period_embs = {}
    for p in periods:
        texts = docs_by_period[p]
        if texts:
            period_embs[p] = hub.embed_concept_in_context(texts, concept)

    timeline = []
    for i in range(1, len(periods)):
        p_prev, p_curr = periods[i - 1], periods[i]
        if p_prev not in period_embs or p_curr not in period_embs:
            continue
        result = compute_smi_with_confidence(period_embs[p_prev], period_embs[p_curr])
        result["period_start"] = p_prev
        result["period_end"] = p_curr
        timeline.append(result)
    return timeline


def cross_jurisdictional_smi(concept: str,
                              docs_jurisdiction_a: dict[str, list[str]],
                              docs_jurisdiction_b: dict[str, list[str]],
                              hub) -> dict:
    """Compare concept evolution across two jurisdictions."""
    timeline_a = build_concept_timeline(concept, docs_jurisdiction_a, hub)
    timeline_b = build_concept_timeline(concept, docs_jurisdiction_b, hub)
    avg_smi_a = np.mean([t["smi_score"] for t in timeline_a]) if timeline_a else 0.0
    avg_smi_b = np.mean([t["smi_score"] for t in timeline_b]) if timeline_b else 0.0
    return {
        "jurisdiction_a": {"avg_smi": round(float(avg_smi_a), 4), "timeline": timeline_a},
        "jurisdiction_b": {"avg_smi": round(float(avg_smi_b), 4), "timeline": timeline_b},
        "divergence": round(abs(float(avg_smi_a - avg_smi_b)), 4),
    }
