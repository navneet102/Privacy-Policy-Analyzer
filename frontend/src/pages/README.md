# Frontend Pages

## Overview
Top-level page views for the Privacy Lens web application, rendering the public landing page (`Homepage`) and the project guide and technical overview page (`Aboutpage`).

## Interface
- `Homepage`: React functional component rendering the hero showcase, feature summaries, and quick-start links to the policy analyzer.
- `Aboutpage`: React functional component displaying project background, architectural workflows, key privacy evaluation criteria, legal disclaimers, and navigation links.

## Invariants
- Both components are stateless presentational views requiring no mandatory props.
- Both components depend on `react-router-dom` `<Link>` components and must be mounted within a router context (`BrowserRouter`).
- Navigation routes are static: `Homepage` navigates to `/about` and `/analyzer`; `Aboutpage` navigates to `/` and `/analyzer`.

## Side Effects
- Client-side navigation updates the browser URL and history state when navigation links are clicked.

## Verification
- Run: `npm run build --prefix frontend`
