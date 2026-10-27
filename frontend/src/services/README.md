# Frontend Services

## Overview
Frontend API service client providing typed invocation methods for policy extraction, AI analysis, and RAG-based conversational querying using the shared `axiosInstance`.

## Interface
- `analyzePolicyWithAPI(serviceName: string, policyText: string): Promise<any>`: Submits a service name and policy text to `/api/analyze` for AI assessment.
- `extractPolicyFromService(serviceName: string): Promise<any>`: Sends a service name to `/api/extract-policy` to trigger automated backend scraping and extraction.
- `chatWithPolicyWithAPI(serviceName: string, question: string): Promise<any>`: Dispatches user questions to `/api/chat-policy` for RAG-assisted answers.

## Invariants
- All service operations dispatch via HTTP `POST` requests through `axiosInstance` targeting relative API routes (`/api/analyze`, `/api/extract-policy`, `/api/chat-policy`).
- Successful calls resolve directly with the parsed response payload (`response.data`).
- Rejections and network failures are normalized into standard `Error` objects, prioritizing backend error messages (`error.response.data.message` or `error.response.data.answer`) before falling back to network failure text.

## Side Effects
- Dispatches outbound HTTP POST network calls via `axiosInstance`.
- Logs network failures and API errors to `console.error`.

## Verification
- Run: `npm run build --prefix frontend`
