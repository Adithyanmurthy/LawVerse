from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.services.billing import create_order, handle_verified_payment, handle_webhook

router = APIRouter(prefix="/api/billing", tags=["billing"])


class OrderRequest(BaseModel):
    plan: str


class VerifyRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str


@router.post("/order")
async def create_razorpay_order(
    payload: OrderRequest,
    user: User = Depends(get_current_user),
):
    """Create a Razorpay order. Frontend uses the returned data to open Razorpay checkout."""
    try:
        order = create_order(payload.plan, user.id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return order


@router.post("/verify")
async def verify_payment(
    payload: VerifyRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Called by frontend after Razorpay payment success.
    Verifies HMAC signature and upgrades user plan.
    """
    try:
        result = await handle_verified_payment(
            db,
            order_id=payload.order_id,
            payment_id=payload.payment_id,
            signature=payload.signature,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return result


@router.post("/webhook")
async def webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_razorpay_signature: str = Header(default=""),
):
    """Razorpay webhook — receives payment.captured and subscription.cancelled events."""
    body = await request.body()
    try:
        result = await handle_webhook(body, x_razorpay_signature, db)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return result
