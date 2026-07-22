"""
LLM wrapper — uses OpenRouter (OpenAI-compatible) with Gemini fallback.
OpenRouter provides access to many models including free ones.
"""

import json
import logging
import re
from typing import Any
from openai import OpenAI
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# OpenRouter client (OpenAI-compatible)
_openrouter_client = None
if settings.openrouter_api_key:
    _openrouter_client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.openrouter_api_key,
    )
    logger.info(f"OpenRouter client initialized. Model: {settings.openrouter_model}")
else:
    logger.warning("No OPENROUTER_API_KEY set — LLM calls will fail.")


def _chat(prompt: str, temperature: float = 0.2, json_mode: bool = False) -> str:
    """Send a prompt to OpenRouter and return the text response."""
    if not _openrouter_client:
        raise RuntimeError("No LLM API key configured. Set OPENROUTER_API_KEY in .env.")

    kwargs = {
        "model": settings.openrouter_model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "extra_headers": {
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "Expert Knowledge 1.5",
        },
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    try:
        response = _openrouter_client.chat.completions.create(**kwargs)
        return response.choices[0].message.content.strip()
    except Exception as e:
        err_str = str(e)
        if "429" in err_str or "quota" in err_str.lower() or "rate" in err_str.lower():
            raise RuntimeError(
                "⚠️ API rate limit reached. Please wait 15–30 seconds and try again."
            ) from e
        raise


def generate_text(prompt: str, temperature: float = 0.2) -> str:
    """Generate a text response."""
    return _chat(prompt, temperature=temperature)


def generate_json(prompt: str, temperature: float = 0.1) -> Any:
    """
    Generate a JSON response. Tries json_mode first, falls back to text parsing.
    """
    try:
        text = _chat(prompt, temperature=temperature, json_mode=True)
    except Exception:
        # Some models don't support json_mode — fall back to plain text
        text = _chat(prompt, temperature=temperature)

    # Strip markdown fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        logger.warning(f"Could not parse LLM JSON response: {text[:300]}")
        return {}


def build_rag_prompt(question: str, context_chunks: list[dict]) -> str:
    """Build a RAG prompt with context chunks."""
    context_parts = []
    for i, chunk in enumerate(context_chunks, 1):
        source = f"[Source {i}: {chunk['doc_filename']}, Page {chunk.get('page_number', '?')}]"
        context_parts.append(f"{source}\n{chunk['content']}")

    context_text = "\n\n---\n\n".join(context_parts)

    return f"""You are an expert industrial knowledge assistant. Answer the question using ONLY the provided context from industrial documents.

## Context from Documents:
{context_text}

## Question:
{question}

## Instructions:
- Answer concisely and accurately based on the context above.
- For every key fact or claim, add an inline citation like [Source 1] or [Source 2].
- If the context does not contain enough information to answer, say so clearly.
- Format your answer in clear, professional language.

## Answer:"""


def build_entity_extraction_prompt(text: str, doc_filename: str) -> str:
    """Build prompt for structured entity extraction."""
    return f"""Extract all named entities from the following industrial document excerpt.

Document: {doc_filename}

Text:
{text[:3000]}

Return a JSON object with this exact structure:
{{
  "entities": [
    {{
      "name": "entity name",
      "type": "equipment|person|regulation|location|chemical|date|organization",
      "context": "brief context of how this entity appears"
    }}
  ],
  "relationships": [
    {{
      "source": "entity name",
      "target": "entity name",
      "type": "maintained_by|regulated_by|mentioned_in|co_occurs_with|caused_by|inspected_by",
      "description": "brief description of the relationship"
    }}
  ]
}}

Focus on:
- Equipment IDs (e.g., "Pump P-101", "Compressor C-204", "HX-502")
- Personnel names and roles
- Regulation references (e.g., "OISD-105", "Factory Act Section 7B")
- Dates and events
- Chemicals and materials
- Locations and areas

Return ONLY valid JSON, no explanation."""


def build_compliance_prompt(regulation_text: str, procedure_text: str) -> str:
    """Build prompt for compliance gap analysis."""
    return f"""You are a compliance expert. Analyze the procedure document against the regulation document and identify compliance gaps.

## Regulation Document:
{regulation_text[:3000]}

## Procedure Document:
{procedure_text[:3000]}

Return a JSON array of compliance items:
[
  {{
    "requirement": "specific requirement from regulation",
    "status": "compliant|non_compliant|partial|not_assessed",
    "evidence": "relevant text from procedure, or explanation of gap",
    "severity": "critical|high|medium|low"
  }}
]

Return ONLY valid JSON."""
