"""
Embedding service — Voyage AI primary, BAAI/bge-large-en-v1.5 local fallback.
Both produce 1024-dimensional vectors, so the pgvector column stays consistent.
"""

import logging
from typing import List
import voyageai
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Lazy-loaded fallback model
_local_model = None


def _get_local_model():
    global _local_model
    if _local_model is None:
        from sentence_transformers import SentenceTransformer
        logger.info("Loading local fallback embedding model (BAAI/bge-large-en-v1.5)…")
        _local_model = SentenceTransformer(
            "BAAI/bge-large-en-v1.5", 
            device="cpu"
        )
    return _local_model


def embed_texts(texts: List[str]) -> tuple[List[List[float]], str]:
    """
    Embed a list of texts. Returns (embeddings, model_name_used).
    Tries Voyage AI first; falls back to local sentence-transformers.
    """
    if not texts:
        return [], "none"

    # ── Voyage AI ──────────────────────────────────────────────────────────
    if settings.voyage_api_key:
        try:
            client = voyageai.Client(api_key=settings.voyage_api_key)
            # Voyage AI supports batches up to 128 texts
            all_embeddings: List[List[float]] = []
            batch_size = 64
            for i in range(0, len(texts), batch_size):
                batch = texts[i : i + batch_size]
                result = client.embed(batch, model=settings.voyage_model, input_type="document")
                all_embeddings.extend(result.embeddings)
            logger.info(f"Embedded {len(texts)} texts via Voyage AI ({settings.voyage_model}).")
            return all_embeddings, settings.voyage_model
        except Exception as exc:
            logger.warning(f"Voyage AI embedding failed ({exc}); switching to local model.")

    # ── Local fallback ──────────────────────────────────────────────────────
    model = _get_local_model()
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    logger.info(f"Embedded {len(texts)} texts via local model (BAAI/bge-large-en-v1.5).")
    return embeddings.tolist(), "BAAI/bge-large-en-v1.5"


def embed_query(query: str) -> tuple[List[float], str]:
    """Embed a single query string (uses query input_type for Voyage AI)."""
    if settings.voyage_api_key:
        try:
            client = voyageai.Client(api_key=settings.voyage_api_key)
            result = client.embed([query], model=settings.voyage_model, input_type="query")
            return result.embeddings[0], settings.voyage_model
        except Exception as exc:
            logger.warning(f"Voyage AI query embedding failed ({exc}); using local model.")

    model = _get_local_model()
    embedding = model.encode([query], normalize_embeddings=True, show_progress_bar=False)
    return embedding[0].tolist(), "BAAI/bge-large-en-v1.5"
