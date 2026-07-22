"""
FastAPI router — /chat endpoint (RAG Q&A)
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.rag import chat as rag_chat

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    question: str
    top_k: int = 5
    filter_doc_id: Optional[str] = None


@router.post("")
async def chat_endpoint(req: ChatRequest):
    """
    RAG-powered Q&A endpoint.
    Returns: answer (str), citations (list), confidence (float 0-1).
    """
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        result = await rag_chat(
            question=req.question,
            top_k=req.top_k,
            filter_doc_id=req.filter_doc_id,
        )
        return result
    except Exception as exc:
        logger.error(f"Chat endpoint error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
