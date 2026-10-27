# Backend

## Overview
Express backend service powering Privacy Lens. Manages HTTP server initialization, API routing, CORS policies, static asset serving in production, and coordinates privacy policy extraction, Gemini AI scoring, and RAG chat services.

## Interface
- `server.js`: Entry point script initializing the Express application, middleware, API route mounting, and HTTP server listener.
- Subdirectories:
  - [controllers](./controllers/README.md): Express request handlers for policy extraction, analysis, and chat.
  - [lib](./lib/README.md): Google Gemini AI SDK client and structured rubric evaluation.
  - [routes](./routes/README.md): Express API router defining `/api` endpoints.
  - [services](./services/README.md): Scraping (Brave Search / Playwright) and RAG vector search implementations.

## Invariants
- Defaults server port to `5000` when `process.env.PORT` is unset.
- Enables CORS for `http://localhost:5173` with credentials when `NODE_ENV !== "production"`.
- Configures request body payload limit strictly to `50mb` for large privacy policy texts.
- Mounts all API endpoints under the `/api` route prefix.
- In `production`, acts as static file server for `frontend/dist` with client-side SPA fallback to `frontend/dist/index.html`.

## Side Effects
- Reads environment variables via `dotenv.config()`.
- Binds to network socket on `PORT` (`5000` by default).
- Logs server startup messages to `console.log`.
- Dispatches HTTP requests to external APIs via route handlers.

## Verification
- Run: `node backend/server.js`
