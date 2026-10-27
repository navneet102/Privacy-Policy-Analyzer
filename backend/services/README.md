# Backend Services

## Overview
Core business logic and external integration services providing automated privacy policy scraping and retrieval (via Brave Search and Playwright) and Retrieval-Augmented Generation (RAG) vector embeddings and question answering (via Google Gemini).

## Interface
- `chunkText(text: string, chunkSize?: number, overlap?: number): string[]`: Splits raw policy text into overlapping string chunks while attempting to preserve word boundaries.
- `cosineSimilarity(vecA: number[], vecB: number[]): number`: Calculates the cosine similarity metric between two numerical embedding vectors.
- `storeEmbeddings(serviceName: string, policyText: string): Promise<void>`: Chunks policy text, fetches vector embeddings via Google GenAI (`gemini-embedding-2`), and stores them in an in-memory vector cache keyed by normalized service name.
- `queryPolicy(serviceName: string, question: string): Promise<{ success: boolean, answer: string, sources?: string[] }>`: Embeds a user question, retrieves the top 4 most similar chunks from cached vectors, and prompts Google Gemini (`gemini-3.6-flash`) to generate a grounded conversational answer.
- `search(serviceName: string): Promise<{ success: boolean, htmlContent: string, url: string, error?: string }>`: Queries Brave Search API to discover the privacy policy URL for a target service, then scrapes the page HTML using Playwright Chromium with stealth plugins.

## Invariants
- Environment variable validation: Both modules immediately throw runtime errors on import if required environment variables are unset (`GEMINI_API_KEY` for `rag.service.js`, `BRAVE_API_KEY` for `scraper.service.js`).
- In-memory vector store lifecycle: `vectorStore` in `rag.service.js` is an ephemeral in-memory Map; embeddings do not persist across server restarts or across independent process instances.
- Service key normalization: Cache keys in `vectorStore` are consistently trimmed and lowercased (`serviceName.trim().toLowerCase()`).
- Query prerequisites: `queryPolicy` requires embeddings to have been populated previously via `storeEmbeddings` for the target service; otherwise, it returns `{ success: false }` with an instructional message.
- Word boundary preservation: Word boundaries in `chunkText` are only preserved if the preceding space is within the upper 40% of the chunk window (`lastSpace > i + chunkSize * 0.6`); otherwise text is hard-cut at `chunkSize`.
- Cosine similarity safety: Returns 0 if either vector norm evaluates to 0.
- Browser cleanup guarantee: In `scraper.service.js`, browser contexts and browser instances are always closed in a `finally` block.
- Scraper error resilience: If Brave Search finds a URL but page scraping fails, `search` resolves with `{ success: false, url, htmlContent: '', error }` rather than rejecting. If Brave Search itself fails, an error is thrown.

## Side Effects
- Calls `dotenv.config()` upon loading each module.
- Instantiates a top-level `GoogleGenAI` client in `rag.service.js`.
- Dispatches outbound HTTP requests to Brave Search API (`https://api.search.brave.com/res/v1/web/search`) and Google Gemini AI endpoints (`embedContent` and `generateContent`).
- Launches and manages headless Chromium browser subprocesses via `playwright-extra` with `puppeteer-extra-plugin-stealth`.
- Mutates the module-level `vectorStore` Map in memory.
- Writes diagnostic and error logs to `console.log`, `console.warn`, and `console.error`.

## Verification
- Run: `node backend/server.js`
