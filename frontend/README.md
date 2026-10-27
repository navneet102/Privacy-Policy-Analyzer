# Frontend Blueprint

## Overview
Vite and React single-page application frontend for Privacy Lens. Provides user interfaces for submitting privacy policies, viewing structured AI evaluations, and asking conversational policy questions via an integrated RAG assistant.

## Subdirectories & Boundaries
- [src](./src/README.md) - Application source tree including UI components, page layouts, Axios client configuration, and API services.

## Development & Build Setup
Built using Vite with Fast Refresh and ESLint:
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh.
- Development dev-server: `npm run dev`
- Production bundling: `npm run build`
- Linter verification: `npm run lint`

## Expanding the ESLint Configuration
If expanding this application with TypeScript or type-aware linting rules, refer to [`typescript-eslint`](https://typescript-eslint.io) and Vite's TypeScript templates.

## Verification
- Run: `npm run build`
