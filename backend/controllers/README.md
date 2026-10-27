# Backend Controllers

## Overview
Express request controllers handling privacy policy automated extraction, AI-powered policy analysis, and RAG-based conversational querying.

## Interface
- `extract_policy(req, res)`: Express controller that coordinates search, scraping, and readability extraction for a service policy.
- `analyze(req, res)`: Express controller that runs Gemini AI policy analysis against a rubric and asynchronously triggers vector embedding generation.
- `chatWithPolicy(req, res)`: Express controller that handles user questions about a specific policy via similarity search and LLM response generation.

## Invariants
- `serviceName` must be present and non-empty in request bodies for all controller endpoints.
- Extracted policy text in `extract_policy` must exceed 100 characters to be deemed valid; otherwise, a 404 response is returned.
- `analyze` requires both `serviceName` and `policyText` in `req.body`.
- `chatWithPolicy` requires both `serviceName` and `question` in `req.body`.
- RAG embedding generation errors during `analyze` are caught and logged without failing the main analysis HTTP response.
- Raw error details in `extract_policy` 500 responses are only returned if `NODE_ENV === 'development'`.

## Side Effects
- Logs extraction and analysis lifecycle events and errors to `console.log` and `console.error`.
- Initiates external HTTP network requests via `scraper.service.js` (Brave Search API) and Google Gemini AI API.
- Mutates the in-memory vector store via `storeEmbeddings` in `rag.service.js`.
- Dispatches HTTP responses and status codes via Express `res`.

## Verification
- Run: `node backend/server.js`
