"""
Unified Billing API — handles payments for the entire platform.
Uses Razorpay (keys from AI Lawyer's .env).
"""
import hashlib, hmac, json, os
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from pricing import PLANS, PRICING_DISPLAY

# Load Razorpay keys from AI Lawyer's .env
_env_path = os.path.join(os.path.dirname(__file__), "..", "..", "AI Laywer", "backend", ".env")
RAZORPAY_KEY_ID = ""
RAZORPAY_KEY_SECRET = ""

if os.path.exists(_env_path):
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line.startswith("RAZORPAY_KEY_ID="):
                RAZORPAY_KEY_ID = line.split("=", 1)[1].strip().strip('"')
            elif line.startswith("RAZORPAY_KEY_SECRET="):
                RAZORPAY_KEY_SECRET = line.split("=", 1)[1].strip().strip('"')

router = APIRouter(prefix="/api/billing", tags=["billing"])


class OrderRequest(BaseModel):
    plan: str  # "pro" or "firm"
    billing: str = "monthly"  # "monthly" or "yearly"


class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan: str


@router.get("/plans")
async def get_plans():
    """Get all available plans with pricing."""
    return {
        "plans": {k: {
            "name": v["name"],
            "price_monthly": v["price_monthly"],
            "price_yearly": v["price_yearly"],
            "currency": v["currency"],
            "description": v["description"],
            "features": v["features"],
        } for k, v in PLANS.items()},
        "display": PRICING_DISPLAY,
    }


@router.post("/order")
async def create_order(req: OrderRequest):
    """Create a Razorpay order for plan upgrade."""
    if req.plan not in PLANS or req.plan == "free":
        raise HTTPException(400, "Invalid plan")

    plan = PLANS[req.plan]
    amount = plan["price_yearly"] if req.billing == "yearly" else plan["price_monthly"]
    amount_paise = amount * 100  # Razorpay uses paise

    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(500, "Payment not configured")

    import httpx
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.razorpay.com/v1/orders",
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
            json={
                "amount": amount_paise,
                "currency": "INR",
                "notes": {"plan": req.plan, "billing": req.billing},
            },
        )
        if resp.status_code != 200:
            raise HTTPException(500, "Failed to create order")
        order = resp.json()

    return {
        "order_id": order["id"],
        "amount": amount,
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID,
        "plan": req.plan,
        "billing": req.billing,
    }


@router.post("/verify")
async def verify_payment(req: VerifyRequest):
    """Verify Razorpay payment signature."""
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(500, "Payment not configured")

    message = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256,
    ).hexdigest()

    if expected != req.razorpay_signature:
        raise HTTPException(400, "Invalid payment signature")

    # Payment verified — in production, update user's plan in database
    return {
        "verified": True,
        "plan": req.plan,
        "message": f"Upgraded to {PLANS[req.plan]['name']} plan",
    }
