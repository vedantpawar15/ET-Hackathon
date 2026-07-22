"""
Document ingestion pipeline:
  PDF upload → text extraction (pdfplumber / OCR) → chunking → embedding → Supabase storage
"""

import io
import logging
import uuid
from pathlib import Path
from typing import Optional

import tiktoken
from db.supabase_client import get_supabase
from services.embeddings import embed_texts

logger = logging.getLogger(__name__)

# Token encoder for chunking
_encoder = tiktoken.get_encoding("cl100k_base")

# ─────────────────────────────────────────────────────────────────────────────
# PDF Text Extraction
# ─────────────────────────────────────────────────────────────────────────────

def extract_text_from_pdf(file_bytes: bytes, filename: str) -> list[dict]:
    """
    Extract text from a PDF. Returns a list of {page_number, text} dicts.
    Tries pdfplumber first; falls back to pytesseract OCR if no text layer found.
    """
    pages = []

    # ── pdfplumber ────────────────────────────────────────────────────────────
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for i, page in enumerate(pdf.pages, 1):
                text = page.extract_text() or ""
                pages.append({"page_number": i, "text": text.strip()})

        total_text = " ".join(p["text"] for p in pages)
        if len(total_text.split()) > 50:
            logger.info(f"[{filename}] Extracted text via pdfplumber ({len(pages)} pages).")
            return pages
    except Exception as exc:
        logger.warning(f"[{filename}] pdfplumber failed: {exc}")

    # ── PyMuPDF fallback ──────────────────────────────────────────────────────
    try:
        import fitz  # PyMuPDF
        pages = []
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for i, page in enumerate(doc, 1):
            text = page.get_text("text") or ""
            pages.append({"page_number": i, "text": text.strip()})

        total_text = " ".join(p["text"] for p in pages)
        if len(total_text.split()) > 50:
            logger.info(f"[{filename}] Extracted text via PyMuPDF ({len(pages)} pages).")
            return pages
    except Exception as exc:
        logger.warning(f"[{filename}] PyMuPDF failed: {exc}")

    # ── Tesseract OCR fallback ────────────────────────────────────────────────
    logger.info(f"[{filename}] No text layer detected; attempting OCR with Tesseract…")
    return _ocr_pdf(file_bytes, filename)


def _ocr_pdf(file_bytes: bytes, filename: str) -> list[dict]:
    """Convert each PDF page to image and run Tesseract OCR."""
    try:
        import fitz
        import pytesseract
        from PIL import Image

        pages = []
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for i, page in enumerate(doc, 1):
            mat = fitz.Matrix(2, 2)  # 2x zoom for better OCR quality
            pix = page.get_pixmap(matrix=mat)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            text = pytesseract.image_to_string(img, lang="eng")
            pages.append({"page_number": i, "text": text.strip()})

        logger.info(f"[{filename}] OCR complete ({len(pages)} pages).")
        return pages
    except Exception as exc:
        logger.error(f"[{filename}] OCR also failed: {exc}")
        return []


# ─────────────────────────────────────────────────────────────────────────────
# Word and Excel Text Extraction
# ─────────────────────────────────────────────────────────────────────────────

def extract_text_from_word(file_bytes: bytes, filename: str) -> list[dict]:
    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        text = "\n".join(full_text)
        return [{"page_number": 1, "text": text.strip()}]
    except Exception as exc:
        logger.error(f"[{filename}] Word extraction failed: {exc}")
        return []

def extract_text_from_excel(file_bytes: bytes, filename: str) -> list[dict]:
    try:
        import pandas as pd
        # Read all sheets
        xls = pd.read_excel(io.BytesIO(file_bytes), sheet_name=None)
        pages = []
        for i, (sheet_name, df) in enumerate(xls.items(), 1):
            text = f"Sheet: {sheet_name}\n" + df.to_string()
            pages.append({"page_number": i, "text": text.strip()})
        return pages
    except Exception as exc:
        logger.error(f"[{filename}] Excel extraction failed: {exc}")
        return []

def extract_text(file_bytes: bytes, filename: str) -> list[dict]:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes, filename)
    elif lower.endswith(".docx") or lower.endswith(".doc"):
        return extract_text_from_word(file_bytes, filename)
    elif lower.endswith(".xlsx") or lower.endswith(".xls"):
        return extract_text_from_excel(file_bytes, filename)
    else:
        raise ValueError(f"Unsupported file format: {filename}")

# ─────────────────────────────────────────────────────────────────────────────
# Text Chunking
# ─────────────────────────────────────────────────────────────────────────────

def chunk_pages(
    pages: list[dict],
    max_tokens: int = 600,
    overlap_tokens: int = 100,
) -> list[dict]:
    """
    Split pages into overlapping token-bounded chunks.
    Returns list of {content, page_number, chunk_index, token_count}.
    """
    chunks = []
    chunk_index = 0

    for page in pages:
        text = page["text"]
        if not text:
            continue

        tokens = _encoder.encode(text)
        start = 0

        while start < len(tokens):
            end = min(start + max_tokens, len(tokens))
            chunk_tokens = tokens[start:end]
            chunk_text = _encoder.decode(chunk_tokens).strip()

            if chunk_text:
                chunks.append({
                    "content": chunk_text,
                    "page_number": page["page_number"],
                    "chunk_index": chunk_index,
                    "token_count": len(chunk_tokens),
                })
                chunk_index += 1

            if end >= len(tokens):
                break
            start += max_tokens - overlap_tokens

    logger.info(f"Created {len(chunks)} chunks.")
    return chunks


# ─────────────────────────────────────────────────────────────────────────────
# Classify document type from filename
# ─────────────────────────────────────────────────────────────────────────────

def classify_doc_type(filename: str) -> str:
    lower = filename.lower()
    if any(k in lower for k in ["maintenance", "maint", "log"]):
        return "maintenance_log"
    if any(k in lower for k in ["safety", "procedure", "sop"]):
        return "safety_procedure"
    if any(k in lower for k in ["regulation", "oisd", "factory", "standard", "regulatory"]):
        return "regulation"
    if any(k in lower for k in ["incident", "near_miss", "accident", "report"]):
        return "incident_report"
    if any(k in lower for k in ["audit"]):
        return "audit_report"
    return "general"


# ─────────────────────────────────────────────────────────────────────────────
# Full ingestion pipeline
# ─────────────────────────────────────────────────────────────────────────────

async def ingest_document(
    file_bytes: bytes,
    filename: str,
    file_size: int,
    doc_type: Optional[str] = None,
) -> dict:
    """
    Full pipeline: extract → chunk → embed → store in Supabase.
    Returns the document record.
    """
    supabase = get_supabase()
    doc_id = str(uuid.uuid4())
    doc_type = doc_type or classify_doc_type(filename)

    # ── 1. Insert document record ────────────────────────────────────────────
    doc_record = {
        "id": doc_id,
        "filename": filename,
        "doc_type": doc_type,
        "file_size": file_size,
        "status": "processing",
    }
    supabase.table("documents").insert(doc_record).execute()
    logger.info(f"Document record created: {doc_id} ({filename})")

    try:
        # ── 2. Extract text ──────────────────────────────────────────────────
        pages = extract_text(file_bytes, filename)
        page_count = len(pages)

        # ── 3. Chunk ─────────────────────────────────────────────────────────
        chunks = chunk_pages(pages)
        if not chunks:
            raise ValueError("No text content could be extracted from the document.")

        # ── 4. Embed ─────────────────────────────────────────────────────────
        texts = [c["content"] for c in chunks]
        embeddings, model_used = embed_texts(texts)

        # ── 5. Store chunks ──────────────────────────────────────────────────
        chunk_records = []
        for chunk, embedding in zip(chunks, embeddings):
            chunk_records.append({
                "id": str(uuid.uuid4()),
                "document_id": doc_id,
                "content": chunk["content"],
                "page_number": chunk["page_number"],
                "chunk_index": chunk["chunk_index"],
                "token_count": chunk["token_count"],
                "embedding": embedding,
                "embedding_model": model_used,
                "metadata": {"source": filename},
            })

        # Insert in batches of 50
        batch_size = 50
        for i in range(0, len(chunk_records), batch_size):
            supabase.table("chunks").insert(chunk_records[i : i + batch_size]).execute()

        logger.info(f"Stored {len(chunk_records)} chunks for document {doc_id}.")

        # ── 6. Update document status ────────────────────────────────────────
        supabase.table("documents").update({
            "status": "ready",
            "page_count": page_count,
        }).eq("id", doc_id).execute()

        return {**doc_record, "status": "ready", "page_count": page_count, "chunk_count": len(chunks)}

    except Exception as exc:
        logger.error(f"Ingestion failed for {filename}: {exc}")
        supabase.table("documents").update({
            "status": "error",
            "error_msg": str(exc),
        }).eq("id", doc_id).execute()
        raise
