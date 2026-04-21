"""
Razorpay billing service.

Flow:
  1. Frontend calls POST /api/billing/order  → backend creates a Razorpay order, returns {order_id, amount, currency, key_id}
  2. Frontend opens Razorpay checkout JS with those details
  3. On payment success Razorpay calls POST /api/billing/webhook (or frontend calls POST /api/billing/verify)
  4. Backend verifies signature → upgrades user plan

Plan amounts are in the smallest currency unit (paise for INR, cents for USD).
"""

import hashlib
import hmac

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import User

try:
    import razorpay
except ImportError:  # pragma: no cover
    razorpay = None  # type: ignore

# ── Plan config ───────────────────────────────────────────────────────────────
# Amounts in paise (INR). 1 INR = 100 paise.
# Change currency / amounts to match your Razorpay dashboard.
PLAN_CONFIG = {
    "starter": {
        "amount": settings.razorpay_amount_starter or 2400_00,   # ₹2400/month
        "currency": settings.razorpay_currency or "INR",
        "description": "AI Contract Copilot — Starter Plan",
    },
    "pro": {
        "amount": settings.razorpay_amount_pro or 6500_00,        # ₹6500/month
        "currency": settings.razorpay_currency or "INR",
        "description": "AI Contract Copilot — Pro Plan",
    },
    "team": {
        "amount": settings.razorpay_amount_team or 20000_00,      # ₹20000/month
        "currency": settings.razorpay_currency or "INR",
        "description": "AI Contract Copilot — Team Plan",
    },
}


def _client():
    if not razorpay:
        raise RuntimeError("razorpay package not installed")
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        raise RuntimeError("Razorpay credentials not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)")
    return razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


def create_order(plan: str, user_id: str) -> dict:
    """Create a Razorpay order. Returns data the frontend needs to open checkout."""
    if plan not in PLAN_CONFIG:
        raise ValueError(f"Unknown plan: {plan}")

    cfg = PLAN_CONFIG[plan]
    client = _client()

    order = client.order.create({
        "amount": cfg["amount"],
        "currency": cfg["currency"],
        "receipt": f"plan_{plan}_{user_id[:8]}",
        "notes": {
            "user_id": user_id,
            "plan": plan,
        },
    })

    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "description": cfg["description"],
        "key_id": settings.razorpay_key_id,   # safe to expose — public key
    }


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Verify Razorpay payment signature (HMAC-SHA256)."""
    if not settings.razorpay_key_secret:
        return False
    message = f"{order_id}|{payment_id}"
    expected = hmac.new(
        settings.razorpay_key_secret.encode(),
        message.encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


async def _upgrade_user(db: AsyncSession, user_id: str, plan: str) -> None:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return
    user.plan = plan
    # Reset monthly counter on upgrade
    user.analyses_used = 0
    await db.commit()


async def handle_verified_payment(
    db: AsyncSession,
    order_id: str,
    payment_id: str,
    signature: str,
) -> dict:
    """Called after frontend payment success. Verifies and upgrades plan."""
    if not verify_payment_signature(order_id, payment_id, signature):
        raise ValueError("Invalid payment signature")

    # Fetch order notes to get user_id + plan
    client = _client()
    order = client.order.fetch(order_id)
    notes = order.get("notes", {})
    user_id = notes.get("user_id")
    plan = notes.get("plan")

    if not user_id or not plan:
        raise ValueError("Order notes missing user_id or plan")

    await _upgrade_user(db, user_id, plan)
    return {"status": "upgraded", "plan": plan}


async def handle_webhook(payload: bytes, signature: str, db: AsyncSession) -> dict:
    """
    Razorpay webhook handler.
    Razorpay sends X-Razorpay-Signature header (HMAC-SHA256 of raw body with webhook secret).
    """
    if not settings.razorpay_webhook_secret:
        raise RuntimeError("RAZORPAY_WEBHOOK_SECRET not configured")

    expected = hmac.new(
        settings.razorpay_webhook_secret.encode(),
        payload,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise ValueError("Invalid webhook signature")

    import json
    event = json.loads(payload)
    event_type = event.get("event", "")

    if event_type == "payment.captured":
        payment = event["payload"]["payment"]["entity"]
        order_id = payment.get("order_id")
        if order_id:
            client = _client()
            order = client.order.fetch(order_id)
            notes = order.get("notes", {})
            user_id = notes.get("user_id")
            plan = notes.get("plan")
            if user_id and plan:
                await _upgrade_user(db, user_id, plan)

    elif event_type == "subscription.cancelled":
        # Downgrade to free on cancellation
        sub = event["payload"]["subscription"]["entity"]
        notes = sub.get("notes", {})
        user_id = notes.get("user_id")
        if user_id:
            await _upgrade_user(db, user_id, "free")

    return {"received": True, "event": event_type}
