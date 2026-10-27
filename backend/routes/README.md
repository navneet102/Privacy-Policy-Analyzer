# Backend Routes

## Overview
Express routing definitions mapping API endpoints to policy extraction, AI analysis, and RAG chat controller actions.

## Interface
- `router`: Default exported `express.Router` instance configuring endpoints:
  - `POST /extract-policy` -> `extract_policy`
  - `POST /analyze` -> `analyze`
  - `POST /chat-policy` -> `chatWithPolicy`

## Invariants
- All registered route endpoints are bound strictly to the `POST` HTTP verb.
- Route handlers directly delegate request execution to corresponding controller functions in `api.controller.js`.

## Side Effects
- Instantiates an Express Router instance and registers route handlers on module evaluation.

## Verification
- Run: `node backend/server.js`
