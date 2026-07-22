"""
Gemini LLM wrapper — handles generation, JSON extraction, and chat.
"""

import json
import logging
import re
from typing import Any
import google.generativeai as genai
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure SDK once at import time
if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)


def _get_model(temperature: float = 0.2):
    return genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config=genai.types.GenerationConfig(temperature=temperature),
    )


def generate_text(prompt: str, temperature: float = 0.2) -> str:
    """Generate a text response from Gemini."""
    model = _get_model(temperature)
    response = model.generate_content(prompt)
    return response.text.strip()


def generate_json(prompt: str, temperature: float = 0.1) -> Any:
    """
    Generate a response expected to be JSON. Extracts JSON even if wrapped in markdown.
    """
    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config=genai.types.GenerationConfig(
            temperature=temperature,
            response_mime_type="application/json",
        ),
    )
    response = model.generate_content(prompt)
    text = response.text.strip()

    # Strip markdown code fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        logger.warning(f"Could not parse Gemini JSON response: {text[:300]}")
        return {}


def build_rag_prompt(question: str, context_chunks: list[dict]) -> str:
    """Build a RAG prompt with context chunks for Gemini."""
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
