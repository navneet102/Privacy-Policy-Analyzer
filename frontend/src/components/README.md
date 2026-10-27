# Frontend UI Components

## Overview
Reusable presentational and interactive React UI components for the Privacy Lens frontend interface, spanning form inputs, informational alerts, policy analysis visualizations, and an interactive RAG conversational chat drawer.

## Interface
- `Alert({ type, message, onClose })`: Notification banner rendering themed icons and colors according to `AlertType` (Error, Success, Info, Warning).
- `Button({ children, className = '', ...props })`: Primary action button with default focus and styling states.
- `Disclaimer()`: Legal disclaimer component advising users that AI analysis is informational and not formal legal advice.
- `Footer()`: Application footer displaying copyright and creator links.
- `Header()`: Navigation banner containing application title, brand icon, and link to homepage.
- `Input({ label, id, ...props })`: Labeled single-line text input control.
- `LoadingSpinner({ size = 'md', color = 'currentColor' })`: SVG loading spinner with `sm`, `md`, or `lg` sizing.
- `PolicyAnalysisDisplay({ result })`: Structured display component rendering overall ranking, numeric score, summary, worrying clauses, and positive aspects.
- `PolicyChat({ serviceName })`: Floating interactive chat widget enabling conversational questions over analyzed privacy policies via RAG.
- `TextareaInput({ label, id, ...props })`: Labeled multi-line text input control for manual privacy policy pasting.

## Invariants
- `Header` requires a surrounding React Router context (`BrowserRouter` or `MemoryRouter`) for `<Link>` components to function without throwing.
- `Alert` requires `type` to match one of the predefined `AlertType` enum keys (`Error`, `Success`, `Info`, `Warning`).
- `PolicyAnalysisDisplay` expects a valid `result` object containing `ranking`, optional `score` (0–100), `summary`, `worryingClauses` (array), and `positiveAspects` (array). Collapsible detail sections default to closed.
- `PolicyChat` requires a valid `serviceName` prop to initialize conversational greeting and scope queries; suggestions are shown only when conversation history contains only the greeting and is not loading.
- `PolicyChat` suppresses sending empty or whitespace-only queries and locks user input while queries are pending (`isLoading === true`).
- `Button` defaults to `type="button"` unless overridden.
- `Input` and `TextareaInput` associate accessibility labels with input controls via `htmlFor={id}`.
- `LoadingSpinner` dimensions map strictly to `'sm'`, `'md'`, or `'lg'`.

## Side Effects
- `PolicyChat` triggers outbound network requests via `chatWithPolicyWithAPI(serviceName, questionText)`.
- `PolicyChat` executes DOM scrolling via `messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })` when messages update.
- `PolicyChat` logs API failures to `console.error`.
- `Header` triggers client-side route navigation upon click.
- `Alert` invokes the optional `onClose` callback when dismissed.
- Interactive controls (`Button`, `Input`, `TextareaInput`) dispatch synthetic DOM events (`onClick`, `onChange`, `onKeyDown`) to parent handlers.

## Verification
- Run: `npm run build --prefix frontend`
