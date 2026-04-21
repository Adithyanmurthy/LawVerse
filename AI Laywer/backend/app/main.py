from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analyses import router as analyses_router
from app.api.auth import router as auth_router
from app.api.billing import router as billing_router
from app.api.contracts import router as contracts_router
from app.core.config import settings
from app.db.session import Base, engine
from app.models import Analysis, Contract, IssueFeedback, User  # noqa: F401

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.app_env == "development" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(contracts_router)
app.include_router(analyses_router)
app.include_router(billing_router)


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok", "app": settings.app_name, "env": settings.app_env}


@app.on_event("startup")
async def startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health() -> dict:
    return {"ok": True, "service": settings.app_name}
