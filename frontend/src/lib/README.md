# Frontend Lib

## Overview
Shared HTTP client configuration providing a centralized Axios instance configured for cross-origin requests, environment-specific base URLs, and JSON serialization.

## Interface
- `axiosInstance`: Pre-configured `AxiosInstance` exported as default export.

## Invariants
- `baseURL` resolves to `http://localhost:5000` when `import.meta.env.MODE === 'development'`; otherwise defaults to production backend (`https://privacy-policy-analyser.onrender.com`).
- `withCredentials` is permanently configured to `true` to ensure session and cross-origin cookie propagation.
- Default `Content-Type` header is permanently set to `application/json`.

## Side Effects
- Instantiates an Axios client via `axios.create()` on module evaluation.
- Reads `import.meta.env.MODE` at runtime.

## Verification
- Run: `npm run build --prefix frontend`
