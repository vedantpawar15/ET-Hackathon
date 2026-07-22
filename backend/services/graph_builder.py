"""
Entity extraction + NetworkX knowledge graph builder.
"""

import logging
import uuid
from collections import defaultdict

import networkx as nx
from db.supabase_client import get_supabase
from services.llm import generate_json, build_entity_extraction_prompt

logger = logging.getLogger(__name__)

# Entity type → color for frontend visualization
ENTITY_COLORS = {
    "equipment": "#f97316",    # orange
    "person": "#3b82f6",       # blue
    "regulation": "#8b5cf6",   # purple
    "location": "#10b981",     # green
    "chemical": "#ef4444",     # red
    "date": "#6b7280",         # gray
    "organization": "#f59e0b", # amber
    "document": "#06b6d4",     # cyan
}


# ─────────────────────────────────────────────────────────────────────────────
# Entity Extraction
# ─────────────────────────────────────────────────────────────────────────────

async def extract_and_store_entities(document_id: str, filename: str, chunks: list[dict]) -> int:
    """
    Run Gemini entity extraction on document chunks, store results in Supabase.
    Returns total entities extracted.
    """
    supabase = get_supabase()

    # Sample representative chunks (first 5 to keep API calls reasonable)
    sample_chunks = chunks[:5]
    combined_text = "\n\n".join(c["content"] for c in sample_chunks)

    prompt = build_entity_extraction_prompt(combined_text, filename)
    result = generate_json(prompt)

    entities_data = result.get("entities", [])
    relationships_data = result.get("relationships", [])

    # ── Store entities ─────────────────────────────────────────────────────────
    entity_name_to_id: dict[str, str] = {}
    entity_records = []

    for ent in entities_data:
        name = ent.get("name", "").strip()
        if not name:
            continue
        ent_id = str(uuid.uuid4())
        entity_name_to_id[name.lower()] = ent_id
        entity_records.append({
            "id": ent_id,
            "name": name,
            "entity_type": ent.get("type", "general"),
            "document_id": document_id,
            "metadata": {"context": ent.get("context", "")},
        })

    if entity_records:
        supabase.table("entities").insert(entity_records).execute()

    # ── Store relationships ────────────────────────────────────────────────────
    rel_records = []
    for rel in relationships_data:
        src_name = rel.get("source", "").lower()
        tgt_name = rel.get("target", "").lower()
        src_id = entity_name_to_id.get(src_name)
        tgt_id = entity_name_to_id.get(tgt_name)

        if src_id and tgt_id and src_id != tgt_id:
            rel_records.append({
                "id": str(uuid.uuid4()),
                "source_entity_id": src_id,
                "target_entity_id": tgt_id,
                "relationship_type": rel.get("type", "co_occurs_with"),
                "document_id": document_id,
                "weight": 1.0,
                "metadata": {"description": rel.get("description", "")},
            })

    if rel_records:
        supabase.table("relationships").insert(rel_records).execute()

    logger.info(
        f"Extracted {len(entity_records)} entities, {len(rel_records)} relationships for {filename}."
    )
    return len(entity_records)


# ─────────────────────────────────────────────────────────────────────────────
# Graph Builder
# ─────────────────────────────────────────────────────────────────────────────

def build_graph_from_db() -> dict:
    """
    Load all entities + relationships from Supabase, build a NetworkX graph,
    and export as a JSON dict compatible with react-force-graph.
    """
    supabase = get_supabase()

    # Fetch entities
    entities_resp = supabase.table("entities").select(
        "id, name, entity_type, document_id, metadata"
    ).execute()
    entities = entities_resp.data or []

    # Fetch relationships with entity names
    rels_resp = supabase.table("relationships").select(
        "id, source_entity_id, target_entity_id, relationship_type, document_id, weight, metadata"
    ).execute()
    relationships = rels_resp.data or []

    # Fetch document names for labelling
    docs_resp = supabase.table("documents").select("id, filename").execute()
    doc_map = {d["id"]: d["filename"] for d in (docs_resp.data or [])}

    # ── Build NetworkX graph ───────────────────────────────────────────────────
    G = nx.Graph()

    entity_id_map: dict[str, dict] = {}
    for ent in entities:
        eid = ent["id"]
        entity_id_map[eid] = ent
        G.add_node(
            eid,
            label=ent["name"],
            entity_type=ent.get("entity_type", "general"),
            document_id=ent.get("document_id"),
            color=ENTITY_COLORS.get(ent.get("entity_type", ""), "#94a3b8"),
        )

    for rel in relationships:
        src = rel["source_entity_id"]
        tgt = rel["target_entity_id"]
        if src in entity_id_map and tgt in entity_id_map:
            G.add_edge(
                src,
                tgt,
                id=rel["id"],
                relationship_type=rel.get("relationship_type", "related"),
                document_id=rel.get("document_id"),
                weight=rel.get("weight", 1.0),
                label=rel.get("relationship_type", "related"),
            )

    # Compute node degree for sizing
    degree_map = dict(G.degree())

    # ── Export as react-force-graph JSON ──────────────────────────────────────
    nodes = []
    for node_id, data in G.nodes(data=True):
        nodes.append({
            "id": node_id,
            "label": data.get("label", node_id),
            "entity_type": data.get("entity_type", "general"),
            "color": data.get("color", "#94a3b8"),
            "document_id": data.get("document_id"),
            "doc_filename": doc_map.get(data.get("document_id", ""), "Unknown"),
            "val": max(1, degree_map.get(node_id, 1)),  # node size by degree
        })

    links = []
    for src, tgt, data in G.edges(data=True):
        links.append({
            "id": data.get("id"),
            "source": src,
            "target": tgt,
            "relationship_type": data.get("relationship_type", "related"),
            "label": data.get("label", "related"),
            "document_id": data.get("document_id"),
            "doc_filename": doc_map.get(data.get("document_id", ""), "Unknown"),
            "weight": data.get("weight", 1.0),
        })

    return {
        "nodes": nodes,
        "links": links,
        "stats": {
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "connected_components": nx.number_connected_components(G),
        },
    }
