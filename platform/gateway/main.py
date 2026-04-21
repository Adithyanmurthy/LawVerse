"""
Glaw Platform API Gateway
==========================
Single entry point that routes requests to the correct backend:
  /api/lcet/*      → LCET backend (port 8000)
  /api/contract/*  → AI Lawyer backend (port 8001)
  /api/billing/*   → Unified billing (Razorpay)
  /api/health      → Gateway health + status of both backends
"""
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from billing import router as billing_router

LCET_BACKEND = "http://localhost:8000"
CONTRACT_BACKEND = "http://localhost:8001"

app = FastAPI(title="Glaw Platform Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(billing_router)


async def _proxy(target_base: str, path: str, request: Request) -> Response:
    """Forward request to target backend and return response."""
    url = f"{target_base}{path}"
    headers = dict(request.headers)
    headers.pop("host", None)

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.request(
            method=request.method,
            url=url,
            headers=headers,
            params=dict(request.query_params),
            content=await request.body(),
        )
    return Response(
        content=resp.content,
        status_code=resp.status_code,
        headers=dict(resp.headers),
    )


# ── LCET Routes (legal intelligence) ──

@app.api_route("/api/lcet/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_lcet(path: str, request: Request):
    """Proxy to LCET backend: search, timeline, SMI, cases, alerts, concepts, auth."""
    return await _proxy(LCET_BACKEND, f"/api/v1/{path}", request)


# ── Contract Routes (AI Lawyer) ──

@app.api_route("/api/contract/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_contract(path: str, request: Request):
    """Proxy to AI Lawyer backend: upload, analyze, reports, billing."""
    return await _proxy(CONTRACT_BACKEND, f"/api/{path}", request)


# ── Health & Status ──

@app.get("/api/health")
async def gateway_health():
    """Check health of gateway and both backends."""
    status = {"gateway": "ok", "lcet": "unknown", "contract": "unknown"}

    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            r = await client.get(f"{LCET_BACKEND}/api/v1/concepts")
            status["lcet"] = "ok" if r.status_code == 200 else f"error ({r.status_code})"
        except Exception:
            status["lcet"] = "offline"

        try:
            r = await client.get(f"{CONTRACT_BACKEND}/health")
            status["contract"] = "ok" if r.status_code == 200 else f"error ({r.status_code})"
        except Exception:
            status["contract"] = "offline"

    return status


@app.get("/")
async def root():
    return {
        "name": "Glaw Platform",
        "version": "1.0.0",
        "services": {
            "lcet": f"{LCET_BACKEND} → /api/lcet/...",
            "contract": f"{CONTRACT_BACKEND} → /api/contract/...",
        },
        "docs": "/docs",
    }
