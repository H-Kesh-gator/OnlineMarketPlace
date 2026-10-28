# Freelance Marketplace — AI Workbench

Full-stack freelance marketplace with React/Vite, Express/MySQL, and an **experimental FastAPI AI service**.

## Features

- Existing marketplace: client/freelancer flows, requests, orders, messaging and reviews.
- Semantic job matching using local sentence-transformer embeddings (`POST /match`).
- AI proposal drafting grounded in freelancer and job information (`POST /proposal`).
- Resume PDF/TXT extraction and keyword-based insights (`POST /resume/upload`, `POST /analyze`).
- Retrieval-augmented project-document Q&A with source excerpts (`POST /ask`).
- React demo workbench at `/ai-workbench`.

## Architecture

```text
React/Vite ── existing marketplace ──> Express ──> MySQL
     └────── /ai-workbench ────────> FastAPI
                                      ├── sentence-transformers embeddings
                                      └── optional LLM API
```

## Local development

Start the original application according to `my-app/README.md`.

```bash
cd my-app/server && npm ci && npm start
# separate terminal
cd my-app && npm ci && npm run dev
# separate terminal
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.core:app --reload --port 8001
```

Visit `http://localhost:5173/ai-workbench`. The first semantic-search request downloads an embedding model. Set `OPENAI_API_KEY` in the **server environment only** for proposal generation and document Q&A. Never expose it through `VITE_*` environment variables.

## Tests

```bash
cd ai-service
pytest -q
```

CI configuration: `.github/workflows/ai-service-ci.yml`. Manual checks and integration notes: `docs/AI_WORKBENCH.md`.

## Status and limitations

This is a **prototype**, not a production deployment. The AI workbench currently uses supplied demo job JSON rather than authenticated marketplace job records. The AI endpoints do not yet enforce user authentication, document-level authorization, or rate limits; do not deploy them publicly. Use only non-sensitive test resumes and contracts. Generated proposals require human review. Full integration tests and deployment validation are pending.

## Roadmap

- Integrate real marketplace profiles and job records with access controls.
- Save proposals and recommendations to the existing database.
- Add persistent vector search and retrieval evaluations.
- Add integration tests, monitoring, and rate limits.
