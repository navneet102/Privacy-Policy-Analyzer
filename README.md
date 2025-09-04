# Privacy Lens

A modern, responsive web application that uses AI to analyze privacy policies and terms of service documents, making complex legal language accessible to everyday users.

![Privacy Lens](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=Privacy+Lens)

## Features

- 🤖 **AI-Powered Analysis**: Uses Google's Gemini AI to analyze complex legal documents
- 📊 **Overall Ranking**: Get quick assessments of how privacy-friendly policies are
- 📝 **Clear Summaries**: Understand key points in plain language
- ⚠️ **Concern Identification**: Automatically spots potentially problematic clauses
- ✅ **Positive Aspects**: Highlights user-friendly and privacy-respecting features
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS and DaisyUI
- 🚀 **Fast & Responsive**: Built with React and Vite for optimal performance

## Tech Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4** - Utility-first CSS framework
- **DaisyUI** - Beautiful component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Google Gemini AI** - AI model for policy analysis
- **Playwright** (optional) - Web scraping for automatic policy extraction
- **CORS** - Cross-origin resource sharing

## Project Structure

```
Privacy-Policy-Analyser/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Alert.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Disclaimer.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── PolicyAnalysisDisplay.jsx
│   │   │   └── TextareaInput.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── Homepage.jsx
│   │   │   └── Aboutpage.jsx
│   │   ├── services/           # API services
│   │   │   └── analysisService.js
│   │   ├── lib/               # Utility libraries
│   │   │   └── axios.js
│   │   ├── App.jsx            # Main app component with analyzer
│   │   ├── main.jsx           # App entry point
│   │   ├── types.js           # Type definitions
│   │   └── index.css          # Global styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/
│   ├── server.js              # Express server with API routes
│   ├── .env.example          # Environment variables template
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Google Gemini API key

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

# Add your Gemini API key to .env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

### 4. Get Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy the key to your `.env` file in the backend directory

### 5. Start the Application

#### Start Backend Server
```bash
cd backend
node server.js
```
The backend will run on `http://localhost:5000`

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

## Usage

### 1. Navigate to the Application
Open your browser and go to `http://localhost:5173`

### 2. Analyze a Policy
1. Click "Start Analyzing Policies" or navigate to `/analyzer`
2. Enter the service/website name
3. Paste the privacy policy text
4. Click "Analyze Policy"
5. Wait for the AI analysis results

### 3. View Results
The analysis will show:
- **Overall Ranking**: How privacy-friendly the policy is
- **Summary**: Key points in simple language
- **Potential Concerns**: Worrying clauses to be aware of
- **Positive Aspects**: User-friendly features

## API Endpoints

### `POST /api/analyze`
Analyzes a privacy policy using AI.

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
  "summary": "This policy has clear data handling practices...",
  "worryingClauses": [
    "Data may be shared with third parties for advertising"
  ],
  "positiveAspects": [
    "Users can request data deletion",
    "Clear explanation of data collection purposes"
  ]
}
```

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Design Philosophy

This application follows modern web development best practices:

- **Component-Based Architecture**: Reusable, modular components
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Modern Styling**: Clean, professional design with Tailwind CSS
- **Type Safety**: Consistent data structures and validation
- **Error Handling**: Graceful error states and user feedback
- **Performance**: Optimized with Vite and modern React patterns

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool provides AI-generated analysis for informational purposes only. It should not be considered as legal advice or a substitute for consultation with qualified legal professionals. While we strive for accuracy, AI interpretations may not always be complete or up-to-date with the latest legal standards. Always review policies carefully yourself and consult legal experts for critical decisions.

## Support

If you encounter any issues or have questions, please:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## Acknowledgments

- **Google Gemini AI** - For providing the AI analysis capabilities
- **Tailwind CSS** - For the beautiful styling framework
- **DaisyUI** - For the component library
- **React Team** - For the amazing frontend framework
- **Vite Team** - For the fast build tool
