# AI Marketplace Workbench

This branch builds on `feature/ai-marketplace` and adds a React UI at `/ai-workbench`. It is intentionally isolated from the production marketplace's existing session and database flows.

## Local setup
1. Start the existing MySQL database and Express backend as documented in `my-app/README.md`.
2. From `ai-service/`, install `requirements-dev.txt`, set `OPENAI_API_KEY` only in the AI-service environment if using generation, and run `uvicorn app.core:app --port 8001`.
3. From `my-app/`, run `npm ci && npm run dev`. Optionally set `VITE_AI_API_URL` in a local `.env`.
4. Visit `http://localhost:5173/ai-workbench`.

## Manual acceptance checks
- Enter a freelancer profile and run Job matching; confirm scores and sorted jobs.
- Upload a text resume; confirm the text populates the profile field.
- Run Resume insights; confirm keyword extraction and suggested job IDs.
- Run Proposal draft without an API key; confirm the service explains the missing configuration.
- With a key, verify generated proposals do not invent freelancer qualifications.
- Enter two documents separated by `---`, ask a question, and inspect source excerpts.
- Stop the AI service and confirm the UI displays a connection error.
- Confirm original marketplace routes still load.

## Limitations
- Demo jobs are supplied as JSON rather than fetched from authenticated marketplace data.
- The service is not authenticated and must not be exposed publicly.
- Semantic matching loads a local embedding model on first request.
- No claim of production readiness or fully integrated marketplace workflows is made.
