"""
RAG (Retrieval-Augmented Generation) pipeline.
embed query → similarity search → Gemini → answer + citations + confidence
"""

import logging
from typing import Optional
from db.supabase_client import get_supabase
from services.embeddings import embed_query
from services.llm import generate_text, build_rag_prompt

logger = logging.getLogger(__name__)


def retrieve_chunks(
    query_embedding: list[float],
    top_k: int = 5,
    doc_id: Optional[str] = None,
) -> list[dict]:
    """Call the match_chunks RPC function in Supabase."""
    supabase = get_supabase()
    params = {
        "query_embedding": query_embedding,
        "match_count": top_k,
    }
    if doc_id:
        params["filter_doc_id"] = doc_id

    result = supabase.rpc("match_chunks", params).execute()
    return result.data or []


def compute_confidence(chunks: list[dict]) -> float:
    """
    Confidence score = mean cosine similarity of retrieved chunks.
    Similarity is already 0-1 from the SQL function (1 - cosine_distance).
    """
    if not chunks:
        return 0.0
    scores = [c.get("similarity", 0.0) for c in chunks]
    return round(sum(scores) / len(scores), 3)


async def chat(
    question: str,
    top_k: int = 5,
    filter_doc_id: Optional[str] = None,
) -> dict:
    """
    Full RAG pipeline.
    Returns {answer, citations, confidence, retrieved_chunks}.
    """
    # ── 1. Embed query ────────────────────────────────────────────────────────
    query_embedding, embed_model = embed_query(question)
    logger.info(f"Query embedded via {embed_model}.")

    # ── 2. Retrieve similar chunks ────────────────────────────────────────────
    chunks = retrieve_chunks(query_embedding, top_k=top_k, doc_id=filter_doc_id)
    logger.info(f"Retrieved {len(chunks)} chunks.")

    if not chunks:
        return {
            "answer": "I couldn't find relevant information in the document corpus to answer your question. Please upload relevant documents first.",
            "citations": [],
            "confidence": 0.0,
            "retrieved_chunks": [],
        }

    # ── 3. Build prompt + generate ────────────────────────────────────────────
    prompt = build_rag_prompt(question, chunks)
    answer = generate_text(prompt, temperature=0.2)

    # ── 4. Build citations ────────────────────────────────────────────────────
    citations = []
    for i, chunk in enumerate(chunks, 1):
        citations.append({
            "index": i,
            "doc_filename": chunk.get("doc_filename", "Unknown"),
            "document_id": chunk.get("document_id"),
            "page_number": chunk.get("page_number"),
            "chunk_index": chunk.get("chunk_index"),
            "excerpt": chunk.get("content", "")[:300] + ("…" if len(chunk.get("content", "")) > 300 else ""),
            "similarity": round(chunk.get("similarity", 0.0), 3),
        })

    # ── 5. Confidence score ────────────────────────────────────────────────────
    confidence = compute_confidence(chunks)

    return {
        "answer": answer,
        "citations": citations,
        "confidence": confidence,
        "retrieved_chunks": len(chunks),
    }
