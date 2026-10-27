# Frontend Source

## Overview
Source package containing the core application root components, global styles, router configuration, and child subsystem modules for the Privacy Lens client application.

## Interface
- `App.jsx`: Main application component configuring client routes (`/`, `/about`, `/analyzer`) and hosting the privacy policy analyzer workflow and RAG chat integration.
- `main.jsx`: Application bootstrap entry point mounting the React root with `StrictMode` and `BrowserRouter`.
- `types.js`: Enumerations including `AlertType` (`Error`, `Success`, `Info`, `Warning`).
- `index.css`: Global styles including Tailwind CSS imports.
- Subdirectories:
  - [components](./components/README.md): Reusable UI primitives and domain widgets.
  - [lib](./lib/README.md): Shared Axios HTTP client instance.
  - [pages](./pages/README.md): Landing page and about page views.
  - [services](./services/README.md): API client methods for policy analysis and chat.

## Invariants
- `main.jsx` mounts directly onto the DOM element with id `#root`.
- `App.jsx` requires wrapping in a `BrowserRouter` provider.
- `AnalyzerPage` in `App.jsx` coordinates a multi-stage flow: manual input or automated policy scraping via `extractPolicyFromService`, followed by AI analysis via `analyzePolicyWithAPI`.
- When an analyzed policy is available, `PolicyChat` is conditionally mounted using the active `serviceName`.

## Side Effects
- Manipulates the DOM root node upon initial load.
- Dispatches HTTP requests through service modules during user interactions.
- Modifies browser navigation history via React Router route transitions.

## Verification
- Run: `npm run build --prefix frontend`
