# Privacy Lens Blueprint

A modern, responsive web application that uses AI to analyze privacy policies and terms of service documents, making complex legal language accessible to everyday users.

## System Overview
Privacy Lens combines an automated policy scraper (Brave Search + Playwright), a generative AI evaluation pipeline (Google Gemini 3.6 Flash against a structured rubric), and a Retrieval-Augmented Generation (RAG) conversational engine (Gemini embeddings + in-memory vector cache) wrapped in an Express REST API backend and a React/Vite single-page application.

## Subdirectories & System Boundaries
- [backend](./backend/README.md) - Express backend service managing API routes, policy scraping, Gemini rubric analysis, and RAG vector question-answering.
- [frontend](./frontend/README.md) - React and Vite client application delivering policy input forms, evaluation dashboards, and interactive chat drawer.

## Global Invariants
- `GEMINI_API_KEY` must be configured in the backend environment (`.env`); runtime initialization fails without it.
- `BRAVE_API_KEY` is required for automated web search and privacy policy URL discovery.
- The Express backend operates on port `5000` (or `process.env.PORT`), with CORS permitted for `http://localhost:5173` during development.
- Request payload body parser enforces a strict limit of `50mb` to accommodate lengthy legal policies.
- Vector embeddings in the RAG service are maintained in an ephemeral in-memory cache keyed by normalized service name.

## Global Side Effects
- Outbound network requests to Google Gemini AI endpoints for generative evaluation and vector embeddings.
- Outbound network requests to Brave Search API and target websites via automated Playwright Chromium browser sessions.
- In-memory cache updates to the backend vector store for active analyzed services.

## System Verification
- Run: `npm run build`

---

## Tech Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4** - Utility-first CSS framework
- **DaisyUI** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Google Gemini AI** - AI model for policy analysis and RAG embeddings
- **Playwright** - Headless browser automation for policy extraction
- **Brave Search API** - Policy discovery

---

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Google Gemini API key
- Brave Search API key (for automated URL scraping)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Privacy-Policy-Analyser
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your API keys to .env
GEMINI_API_KEY=your_gemini_api_key_here
BRAVE_API_KEY=your_brave_api_key_here
PORT=5000
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

### 4. Start the Application

#### Start Backend Server
```bash
cd backend
node server.js
```
The backend runs on `http://localhost:5000`.

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend runs on `http://localhost:5173`.

---

## API Endpoints

### `POST /api/extract-policy`
Automatically searches and scrapes privacy policy text for a given company or service name.

**Request Body:**
```json
{
  "serviceName": "Spotify"
}
```

### `POST /api/analyze`
Analyzes a privacy policy using Google Gemini AI and generates RAG vector embeddings.

**Request Body:**
```json
{
  "serviceName": "Google",
  "policyText": "Privacy policy text here..."
}
```

**Response:**
```json
{
  "ranking": "Good - User-Focused",
  "score": 75,
  "summary": "This policy has clear data handling practices...",
  "worryingClauses": [
    "Data may be shared with third parties for advertising"
  ],
  "positiveAspects": [
    "Users can request data deletion",
    "Clear explanation of data collection purposes"
  ],
  "rubricDetails": []
}
```

### `POST /api/chat-policy`
Queries an analyzed privacy policy using RAG vector similarity and Google Gemini conversational answering.

**Request Body:**
```json
{
  "serviceName": "Google",
  "question": "Does this service sell my data?"
}
```

---

## Acknowledgments
- **Google Gemini AI** - For AI evaluation and vector embedding capabilities
- **Brave Search API** - For privacy policy link discovery
- **Tailwind CSS & DaisyUI** - For styling and UI components
- **React & Vite** - For frontend build and client framework
