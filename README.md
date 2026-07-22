# Industrial Knowledge Intelligence Platform

> **ET AI Hackathon 2026** — RAG-powered conversational AI for industrial document intelligence with interactive knowledge graph visualization.

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
