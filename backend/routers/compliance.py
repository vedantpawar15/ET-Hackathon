"""
FastAPI router — /compliance/check (stretch goal)
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.llm import generate_json, build_compliance_prompt
from db.supabase_client import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/compliance", tags=["Compliance"])


class ComplianceRequest(BaseModel):
    regulation_doc_id: str
    procedure_doc_id: str


@router.post("/check")
async def check_compliance(req: ComplianceRequest):
    """
    Compare a regulation document against a procedure document and return a
    compliance gap table: [{requirement, status, evidence, severity}]
    """
    supabase = get_supabase()

    def get_doc_text(doc_id: str) -> tuple[str, str]:
        chunks_resp = supabase.table("chunks").select("content, page_number").eq(
            "document_id", doc_id
        ).order("chunk_index").limit(10).execute()
        chunks = chunks_resp.data or []
        if not chunks:
            raise HTTPException(status_code=404, detail=f"No chunks found for document {doc_id}.")
        text = "\n\n".join(c["content"] for c in chunks)
        doc_resp = supabase.table("documents").select("filename").eq("id", doc_id).single().execute()
        filename = doc_resp.data["filename"] if doc_resp.data else "Unknown"
        return text, filename

    reg_text, reg_name = get_doc_text(req.regulation_doc_id)
    proc_text, proc_name = get_doc_text(req.procedure_doc_id)

    prompt = build_compliance_prompt(reg_text, proc_text)
    items = generate_json(prompt)

    if not isinstance(items, list):
        if isinstance(items, dict):
            # Extract the first list found in the dictionary values (handles {"items": []}, {"compliance_items": []}, etc.)
            extracted_list = next((v for v in items.values() if isinstance(v, list)), [])
            items = extracted_list
        else:
            items = []

    return {
        "regulation_doc": reg_name,
        "procedure_doc": proc_name,
        "compliance_items": items,
        "summary": {
            "total": len(items),
            "compliant": sum(1 for i in items if i.get("status") == "compliant"),
            "non_compliant": sum(1 for i in items if i.get("status") == "non_compliant"),
            "partial": sum(1 for i in items if i.get("status") == "partial"),
        },
    }
