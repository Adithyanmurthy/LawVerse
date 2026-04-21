"""LCET v2 — FastAPI backend."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.src.services.database import init_db
from config.settings import API_PREFIX


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="LCET v2 API", version="2.0.0", lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Import and include routers
from backend.src.api.routes.auth_routes import router as auth_router
from backend.src.api.routes.concepts import router as concepts_router
from backend.src.api.routes.analysis import router as analysis_router
from backend.src.api.routes.documents import router as documents_router
from backend.src.api.routes.search import router as search_router
from backend.src.api.routes.cases import router as cases_router

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(concepts_router, prefix=API_PREFIX)
app.include_router(analysis_router, prefix=API_PREFIX)
app.include_router(documents_router, prefix=API_PREFIX)
app.include_router(search_router, prefix=API_PREFIX)
app.include_router(cases_router, prefix=API_PREFIX)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0", "approach": "pre-trained-models"}
