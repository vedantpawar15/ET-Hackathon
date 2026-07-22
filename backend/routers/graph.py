"""
FastAPI router — /graph endpoint
"""

import logging
from fastapi import APIRouter, HTTPException
from services.graph_builder import build_graph_from_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/graph", tags=["Graph"])


@router.get("")
async def get_graph():
    """
    Return the full knowledge graph as JSON for react-force-graph.
    Shape: { nodes: [...], links: [...], stats: {...} }
    """
    try:
        graph_data = build_graph_from_db()
        return graph_data
    except Exception as exc:
        logger.error(f"Graph build failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
