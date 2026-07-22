-- ============================================================
-- Industrial Knowledge Intelligence Platform — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ─────────────────────────────────────────────
-- Documents table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename     TEXT NOT NULL,
    doc_type     TEXT,                          -- e.g. maintenance_log, safety_procedure, regulation, incident_report
    upload_date  TIMESTAMPTZ DEFAULT NOW(),
    page_count   INT,
    file_size    BIGINT,                        -- bytes
    status       TEXT DEFAULT 'processing',     -- processing | ready | error
    error_msg    TEXT,
    metadata     JSONB DEFAULT '{}'
);

-- ─────────────────────────────────────────────
-- Chunks table with vector column
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chunks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id   UUID REFERENCES documents(id) ON DELETE CASCADE,
    content       TEXT NOT NULL,
    page_number   INT,
    chunk_index   INT,
    token_count   INT,
    embedding     vector(1024),                 -- Voyage AI voyage-2 / BAAI bge-large-en-v1.5 = 1024 dims
    embedding_model TEXT DEFAULT 'voyage-2',
    metadata      JSONB DEFAULT '{}'
);

-- ─────────────────────────────────────────────
-- Entities table (extracted by Gemini)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entities (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    entity_type   TEXT,                         -- equipment | person | regulation | location | chemical
    document_id   UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_id      UUID REFERENCES chunks(id) ON DELETE SET NULL,
    metadata      JSONB DEFAULT '{}'
);

-- ─────────────────────────────────────────────
-- Relationships table (graph edges)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS relationships (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_id   UUID REFERENCES entities(id) ON DELETE CASCADE,
    target_entity_id   UUID REFERENCES entities(id) ON DELETE CASCADE,
    relationship_type  TEXT,                    -- mentioned_in | maintained_by | regulated_by | co_occurs_with
    document_id        UUID REFERENCES documents(id) ON DELETE SET NULL,
    weight             FLOAT DEFAULT 1.0,
    metadata           JSONB DEFAULT '{}'
);

-- ─────────────────────────────────────────────
-- Indexes for performance
-- ─────────────────────────────────────────────

-- Vector similarity search index (IVFFlat — fast approximate search)
CREATE INDEX IF NOT EXISTS chunks_embedding_idx
    ON chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Fast document lookups
CREATE INDEX IF NOT EXISTS chunks_document_id_idx ON chunks (document_id);
CREATE INDEX IF NOT EXISTS entities_document_id_idx ON entities (document_id);
CREATE INDEX IF NOT EXISTS entities_name_idx ON entities (name);
CREATE INDEX IF NOT EXISTS relationships_source_idx ON relationships (source_entity_id);
CREATE INDEX IF NOT EXISTS relationships_target_idx ON relationships (target_entity_id);

-- ─────────────────────────────────────────────
-- Helper function: cosine similarity search
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION match_chunks(
    query_embedding vector(1024),
    match_count     INT DEFAULT 5,
    filter_doc_id   UUID DEFAULT NULL
)
RETURNS TABLE (
    id           UUID,
    document_id  UUID,
    content      TEXT,
    page_number  INT,
    chunk_index  INT,
    similarity   FLOAT,
    metadata     JSONB,
    doc_filename TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.document_id,
        c.content,
        c.page_number,
        c.chunk_index,
        1 - (c.embedding <=> query_embedding) AS similarity,
        c.metadata,
        d.filename AS doc_filename
    FROM chunks c
    JOIN documents d ON d.id = c.document_id
    WHERE
        c.embedding IS NOT NULL
        AND (filter_doc_id IS NULL OR c.document_id = filter_doc_id)
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
