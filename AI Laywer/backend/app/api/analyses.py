from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Analysis, Contract, IssueFeedback, User
from app.services.report_generator import generate_pdf_report

router = APIRouter(prefix="/api/analyses", tags=["analyses"])


@router.get("/{contract_id}")
async def get_analysis(contract_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    contract = await db.get(Contract, contract_id)
    if not contract or contract.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    if contract.status == "error":
        return {"status": "error", "contract_id": contract_id, "message": "Analysis failed. Please try re-uploading."}
    if contract.status != "done":
        return {"status": "processing", "contract_id": contract_id}

    result = await db.execute(select(Analysis).where(Analysis.contract_id == contract_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        return {"status": "processing", "contract_id": contract_id}

    return {
        "status": "done",
        "contract_id": contract_id,
        "filename": contract.filename,
        "risk_score": analysis.risk_score,
        "risk_level": analysis.risk_level,
        "confidence": analysis.confidence,
        "summary": analysis.summary,
        "contract_type": analysis.contract_type,
        "parties": analysis.parties,
        "governing_law": analysis.governing_law,
        "issues": analysis.issues,
        "clauses": analysis.clauses,
        "processing_ms": analysis.processing_ms,
        "provider_used": analysis.provider_used,
    }


@router.get("/{contract_id}/report")
async def download_report(contract_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    contract = await db.get(Contract, contract_id)
    if not contract or contract.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    result = await db.execute(select(Analysis).where(Analysis.contract_id == contract_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not ready")

    pdf = generate_pdf_report(contract, analysis)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=analysis_{contract_id[:8]}.pdf"},
    )


@router.post("/{analysis_id}/feedback")
async def submit_feedback(
    analysis_id: str,
    clause_id: str,
    is_correct: bool,
    comment: str = "",
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    analysis = await db.get(Analysis, analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    contract = await db.get(Contract, analysis.contract_id)
    if not contract or contract.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")

    fb = IssueFeedback(
        analysis_id=analysis_id,
        clause_id=clause_id,
        user_id=user.id,
        is_correct=1 if is_correct else 0,
        comment=comment,
    )
    db.add(fb)
    await db.commit()
    return {"message": "Feedback recorded"}
