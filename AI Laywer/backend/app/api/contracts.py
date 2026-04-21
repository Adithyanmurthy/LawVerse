import asyncio
import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Analysis, Contract, User
from app.services.analysis_pipeline import analyze_contract_file
from app.services.storage import download_contract, upload_contract

router = APIRouter(prefix="/api/contracts", tags=["contracts"])


def _enforce_plan_limit(user: User) -> None:
    user.reset_if_needed()
    if user.analyses_used >= user.monthly_limit:
        raise HTTPException(
            status_code=429,
            detail=f"{user.plan.title()} plan limit reached ({user.monthly_limit} analyses/month). Upgrade to continue.",
        )


async def _run_analysis(contract_id: str, storage_path: str, filename: str) -> None:
    """Background task: run analysis pipeline and persist results."""
    from app.db.session import AsyncSessionLocal  # local import to avoid circular

    async with AsyncSessionLocal() as db:
        contract = await db.get(Contract, contract_id)
        if not contract:
            return

        suffix = Path(filename).suffix.lower() or ".pdf"
        tmp_path: str | None = None
        try:
            raw = download_contract(storage_path)
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(raw)
                tmp_path = tmp.name

            data = await analyze_contract_file(tmp_path)

            contract.text_content = data["text"]
            contract.status = "done"
            contract.contract_type = data.get("contract_type", "")
            contract.word_count = len(data["text"].split())

            analysis = Analysis(
                contract_id=contract_id,
                risk_score=data["risk_score"],
                risk_level=data["risk_level"],
                confidence=data["confidence"],
                summary=data["summary"],
                contract_type=data["contract_type"],
                parties=data["parties"],
                governing_law=data["governing_law"],
                issues=data["issues"],
                clauses=data["clauses"],
                processing_ms=data["processing_ms"],
                provider_used=data["provider_used"],
            )
            db.add(analysis)
            await db.commit()

        except Exception as exc:
            if contract:
                contract.status = "error"
                await db.commit()
            print(f"[Pipeline] ERROR for {contract_id}: {exc}")
        finally:
            if tmp_path:
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _enforce_plan_limit(user)

    if not file.filename:
        raise HTTPException(status_code=400, detail="File is required")

    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in [".pdf", ".docx"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file type '{file_ext}'. Upload PDF or DOCX only.")

    try:
        storage_path = await upload_contract(file, user.id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    size_bytes = 0
    if storage_path.startswith("local:"):
        try:
            size_bytes = Path(storage_path.split(":", 1)[1]).stat().st_size
        except Exception:
            pass

    contract = Contract(
        user_id=user.id,
        filename=file.filename,
        storage_path=storage_path,
        mime_type=file.content_type or "application/octet-stream",
        size_bytes=size_bytes,
        status="processing",
    )
    db.add(contract)

    # Increment monthly usage counter
    user.analyses_used += 1
    await db.commit()
    await db.refresh(contract)

    # Fire-and-forget background analysis
    background_tasks.add_task(_run_analysis, contract.id, storage_path, file.filename)

    return {"contract_id": contract.id, "status": "processing", "filename": file.filename}


@router.get("")
async def list_contracts(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Contract)
        .where(Contract.user_id == user.id, Contract.is_deleted == False)  # noqa: E712
        .order_by(Contract.created_at.desc())
        .limit(50)
    )
    contracts = result.scalars().all()
    return [
        {
            "id": c.id,
            "filename": c.filename,
            "status": c.status,
            "contract_type": c.contract_type,
            "size_bytes": c.size_bytes,
            "word_count": c.word_count,
            "created_at": c.created_at.isoformat(),
        }
        for c in contracts
    ]


@router.delete("/{contract_id}")
async def delete_contract(
    contract_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    contract = await db.get(Contract, contract_id)
    if not contract or contract.user_id != user.id:
        raise HTTPException(status_code=404, detail="Contract not found")
    contract.is_deleted = True
    contract.storage_path = ""
    await db.commit()
    return {"message": "Contract deleted"}
