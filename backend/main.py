"""
FastAPI application entry point — Industrial Knowledge Intelligence Platform
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import get_settings
from routers import documents, chat, graph, compliance

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Industrial Knowledge Intelligence Platform starting…")
    logger.info(f"   Gemini model  : {settings.gemini_model}")
    logger.info(f"   Voyage AI key : {'✓ set' if settings.voyage_api_key else '✗ not set (using local fallback)'}")
    logger.info(f"   Supabase URL  : {settings.supabase_url[:40]}…" if settings.supabase_url else "   Supabase URL  : NOT SET")

    # ── Startup recovery: mark orphaned 'processing' docs as 'error' ──────────
    try:
        from db.supabase_client import get_supabase
        supabase = get_supabase()
        stuck = supabase.table("documents").select("id, filename").eq("status", "processing").execute()
        if stuck.data:
            ids = [d["id"] for d in stuck.data]
            names = [d["filename"] for d in stuck.data]
            logger.warning(f"⚠️  Found {len(ids)} document(s) stuck in 'processing': {names}")
            supabase.table("documents").update({
                "status": "error",
                "error_msg": "Processing was interrupted by a server restart. Please delete and re-upload this file."
            }).in_("id", ids).execute()
            logger.info(f"   Marked {len(ids)} stuck document(s) as 'error'.")
    except Exception as e:
        logger.warning(f"Startup recovery check failed (non-fatal): {e}")

    yield
    logger.info("🛑 Application shutting down.")


app = FastAPI(
    title="Industrial Knowledge Intelligence Platform",
    description="RAG-powered conversational AI for industrial documents with knowledge graph visualization.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(graph.router)
app.include_router(compliance.router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "Industrial Knowledge Intelligence Platform",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "model": settings.gemini_model,
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
