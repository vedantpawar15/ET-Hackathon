"""
FastAPI router — /documents endpoints
"""

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from db.supabase_client import get_supabase
from services.ingestion import create_document_record, process_document_background

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_TYPES = {
    "application/pdf", 
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream"
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """
    Upload and ingest a PDF document.
    Extraction, chunking, and embedding happen synchronously.
    Entity extraction runs in the background.
    """
    if not (file.filename.lower().endswith(".pdf") or file.filename.lower().endswith((".doc", ".docx", ".xls", ".xlsx"))):
        raise HTTPException(status_code=400, detail="Only PDF, Word, and Excel files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 50 MB limit.")

    try:
        doc = create_document_record(
            filename=file.filename,
            file_size=len(file_bytes),
        )

        background_tasks.add_task(
            process_document_background,
            doc_id=doc["id"],
            file_bytes=file_bytes,
            filename=file.filename
        )

        return JSONResponse(status_code=201, content={"success": True, "document": doc})

    except Exception as exc:
        logger.error(f"Upload failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("")
async def list_documents():
    """List all ingested documents."""
    supabase = get_supabase()
    result = supabase.table("documents").select(
        "id, filename, doc_type, upload_date, page_count, file_size, status"
    ).order("upload_date", desc=True).execute()
    return {"documents": result.data or []}


@router.get("/{doc_id}")
async def get_document(doc_id: str):
    """Get a single document's metadata and chunk count."""
    supabase = get_supabase()
    doc_resp = supabase.table("documents").select("*").eq("id", doc_id).single().execute()
    if not doc_resp.data:
        raise HTTPException(status_code=404, detail="Document not found.")

    chunks_resp = supabase.table("chunks").select("id", count="exact").eq(
        "document_id", doc_id
    ).execute()
    chunk_count = chunks_resp.count or 0

    return {**doc_resp.data, "chunk_count": chunk_count}


@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document and all its chunks, entities, and relationships to prevent orphans."""
    supabase = get_supabase()
    try:
        # Delete related relationships first (referencing entities and document)
        supabase.table("relationships").delete().eq("document_id", doc_id).execute()
        
        # Delete related entities (referencing document)
        supabase.table("entities").delete().eq("document_id", doc_id).execute()
        
        # Delete related chunks (referencing document)
        supabase.table("chunks").delete().eq("document_id", doc_id).execute()
        
        # Delete the document record itself
        result = supabase.table("documents").delete().eq("id", doc_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Document not found.")
        return {"success": True, "deleted_id": doc_id}
    except Exception as exc:
        logger.error(f"Failed to delete document {doc_id}: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
