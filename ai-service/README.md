# AI service (experimental feature branch)

A separate FastAPI service that augments the existing React + Express + MySQL marketplace. No database migration is required for this first version.

## Features
- `POST /match`: semantic job ranking with local sentence-transformer embeddings and cosine similarity.
- `POST /proposal`: grounded proposal draft using an optional OpenAI API key.
- `POST /analyze`: resume keyword extraction and job recommendations.
- `POST /resume/upload`: PDF/plain-text resume extraction (2 MB limit).
- `POST /ask`: retrieval-augmented document Q&A with source excerpts.

## Run
```bash
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
# export OPENAI_API_KEY=...  # optional for proposal and Q&A
uvicorn app.core:app --reload --port 8001
pytest -q
```

The first semantic-search request downloads the embedding model. An API key is required only for generation endpoints; it must remain on the server, never in the React bundle.

## API examples
```bash
curl -X POST http://localhost:8001/match -H 'Content-Type: application/json' -d '{"profile":"Python backend developer","jobs":[{"id":"1","title":"Backend API","description":"Build a REST API","skills":["Python"]}]}'
```

## Security and production follow-up
These endpoints are intended for local development. Before public deployment, integrate the Express authentication/session layer, add per-user authorization and rate limits, restrict document access to project participants, add upload malware checks, persist vectors in pgvector or another vector database, and add evaluation datasets for matching and RAG. Do not send sensitive resumes or contracts to an external model without consent. This prototype does not modify existing MySQL tables.
