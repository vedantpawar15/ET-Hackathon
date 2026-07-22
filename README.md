# Industrial Knowledge Intelligence Platform

> **ET AI Hackathon 2026** — RAG-powered conversational AI for industrial document intelligence with interactive knowledge graph visualization.

## Problem Statement

**#8: AI for Industrial Knowledge Intelligence — Unified Asset & Operations Brain**
Theme: Industrial Intelligence / Document Management / Knowledge Engineering / Quality

Asset-intensive industries lose an estimated **35% of working hours** to searching for information or recreating documents that already exist somewhere in the organization. A typical large plant operates across **7–12 disconnected document systems**, contributing to **18–22% of unplanned downtime events** in Indian heavy industry. Meanwhile, an estimated **25% of India's experienced industrial engineers** will retire within the next decade, taking undocumented operational knowledge with them.

Our platform unifies scattered industrial documents — engineering drawings, maintenance records, safety procedures, inspection reports — into a single, queryable, continuously updated intelligence layer.

## Features

- 📄 **Multi-format document ingestion** — PDF text extraction (pdfplumber → PyMuPDF → Tesseract OCR fallback)
- 🔍 **RAG Chat Copilot** — Gemini-powered Q&A with inline source citations and confidence scores
- 🕸️ **Knowledge Graph** — NetworkX entity extraction → interactive react-force-graph visualization
- 📚 **Document Library** — Manage ingested documents with type classification and status tracking
- ✅ **Compliance Checker** — AI-powered gap analysis between regulation and procedure documents

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| LLM | Gemini 1.5 Flash (google-generativeai) |
| Embeddings | Voyage AI → BAAI/bge-large-en-v1.5 fallback (both 1024-dim) |
| Vector DB | Supabase (Postgres + pgvector) |
| Graph | NetworkX → react-force-graph |
| PDF Parsing | pdfplumber / PyMuPDF + pytesseract OCR |

## Quick Start

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `backend/db/schema.sql` in the Supabase SQL Editor

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt

# Copy and fill in your API keys
copy .env.example .env

uvicorn main:app --reload --port 8000
```

**Required env vars** (in `.env`):
```
GEMINI_API_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...
VOYAGE_API_KEY=...   # Optional — falls back to local model
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev          # → http://localhost:5173
```

### 4. Generate Sample Data

```bash
cd backend
pip install fpdf2    # optional — for real PDFs
python sample_data/generate_samples.py
```

Then upload the generated PDFs from `backend/sample_data/generated/` via the UI.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/documents/upload` | Upload + ingest PDF |
| GET | `/documents` | List documents |
| GET | `/documents/{id}` | Document detail |
| DELETE | `/documents/{id}` | Delete document |
| POST | `/chat` | RAG Q&A |
| GET | `/graph` | Knowledge graph JSON |
| POST | `/compliance/check` | Compliance gap analysis |

Interactive docs: `http://localhost:8000/docs`

## Sample Documents (10 synthetic)

Consistent equipment IDs across all documents for rich graph cross-links:

| Equipment | Appears In |
|---|---|
| Pump P-101 | Docs 1, 4, 5, 6, 7, 8, 10 |
| Compressor C-204 | Docs 2, 4, 6, 7, 9, 10 |
| Heat Exchanger HX-502 | Docs 3, 4, 5, 6, 10 |
| Vessel V-301 | Docs 2, 5, 6, 9, 10 |

## System Architecture

```
                         ┌─────────────────────┐
                         │   React Frontend     │
                         │  (Chat / Graph /     │
                         │  Documents / Comp.)  │
                         └──────────┬───────────┘
                                    │ REST API
                         ┌──────────▼───────────┐
                         │   FastAPI Backend     │
                         └──────────┬───────────┘
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
        ┌────────▼────────┐ ┌───────▼────────┐ ┌───────▼────────┐
        │ Ingestion Service │ │  RAG Service   │ │ Graph Builder  │
        │ (pdfplumber/      │ │  (Gemini +     │ │ (NetworkX      │
        │  PyMuPDF/Tesseract│ │  embeddings)   │ │  entity graph) │
        └────────┬──────────┘ └───────┬────────┘ └───────┬────────┘
                  │                   │                   │
                  └───────────────────┼───────────────────┘
                                      │
                          ┌───────────▼────────────┐
                          │   Supabase (Postgres    │
                          │   + pgvector)           │
                          │  documents / chunks /   │
                          │  entities / relations   │
                          └─────────────────────────┘
```

## Alignment with Evaluation Focus

| Evaluation Criterion | How We Address It |
|---|---|
| Entity extraction accuracy | Gemini-based entity extraction validated against 10-document synthetic corpus |
| Query answer quality | RAG answers grounded with citations + confidence scoring |
| Knowledge graph linkage completeness | Consistent equipment IDs across documents produce dense, meaningful graph connections |
| Time-to-answer vs. traditional search | Chat interface returns sourced answers in seconds |
| Compliance gap detection accuracy | Dedicated Compliance Checker comparing regulation vs. procedure documents |
| Cross-functional knowledge discovery | Single unified interface across engineering, safety, maintenance, and compliance domains |

## Judging Criteria Mapping

| Criteria | Weight | Our Approach |
|---|---|---|
| Innovation | 25% | Unified RAG + Knowledge Graph interface with real-time chat-to-graph linking |
| Business Impact | 25% | Targets the 35% time-loss and 18–22% unplanned downtime statistics |
| Technical Excellence | 20% | Full RAG pipeline + entity graph construction |
| Scalability | 15% | pgvector indexing scales to large document corpora |
| User Experience | 15% | Clean chat UI, clickable citations, interactive graph visualization |

## Project Structure

```
ET-Hackathon/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Settings + env vars
│   ├── requirements.txt
│   ├── db/
│   │   ├── schema.sql       # Supabase schema (run this first!)
│   │   └── supabase_client.py
│   ├── services/
│   │   ├── embeddings.py    # Voyage AI + local fallback
│   │   ├── llm.py           # Gemini wrapper + prompts
│   │   ├── ingestion.py     # PDF → chunks → embed → store
│   │   ├── rag.py           # RAG pipeline
│   │   └── graph_builder.py # NetworkX graph
│   ├── routers/
│   │   ├── documents.py
│   │   ├── chat.py
│   │   ├── graph.py
│   │   └── compliance.py
│   └── sample_data/
│       └── generate_samples.py
└── frontend/
    └── src/
        ├── api/             # Axios API layer
        ├── store/           # Zustand state
        ├── types/           # TypeScript interfaces
        └── components/
            ├── Chat/        # ChatView, CitationChip, ConfidenceBar
            ├── Graph/       # GraphView (react-force-graph)
            ├── Documents/   # DocumentsView
            ├── Compliance/  # ComplianceView
            └── Layout/      # Navbar, Sidebar
```

## Team

| Name | Role |
|---|---|
| — | Backend Infrastructure & Data Quality |
| — | Frontend — Chat & Graph Integration |
| — | Frontend — Documents, Compliance UI & Deliverables |
| — | Project Lead / Backend Setup |

## Deliverables Checklist

- [x] Working Prototype
- [ ] Architecture Diagram
- [ ] Presentation Deck
- [ ] Demo Video
