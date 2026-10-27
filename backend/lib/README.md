# Backend Lib

## Overview
Shared library integration client for the Google Gemini AI API, providing structured JSON prompt execution, deterministic scoring, and evaluation against privacy policy criteria.

## Interface
- `analyzePolicyWithGemini(serviceName: string, policyText: string)`: Asynchronous function that submits policy text to Google Gemini 3.6 Flash with a structured rubric schema, parses the resulting JSON, and computes a clamped 0–100 privacy score and category breakdown.

## Invariants
- `process.env.GEMINI_API_KEY` must be defined when the module is imported; throws a runtime error synchronously on module load if missing.
- Final privacy score is clamped between 0 and 100 based on a baseline score of 50 and category point adjustments.
- Deterministic ranking label assignments:
  - Score >= 80: "Excellent - Privacy Champion"
  - Score >= 60: "Good - User-Focused"
  - Score >= 40: "Fair - Proceed with Caution"
  - Score >= 20: "Poor - High Privacy Risks"
  - Score < 20: "Critical - Severe Privacy Concerns"
- Model output is strictly enforced to JSON conforming to `rubricSchema`.

## Side Effects
- Calls `dotenv.config()` upon module import.
- Instantiates a `GoogleGenAI` client instance upon module import.
- Dispatches outbound HTTP/HTTPS requests to the Google Gemini API (`ai.models.generateContent`).
- Writes errors to `console.error` when Gemini API requests fail.

## Verification
- Run: `node backend/server.js`
