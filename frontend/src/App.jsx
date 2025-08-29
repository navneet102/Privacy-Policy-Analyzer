import React, { useState, useCallback } from 'react';
import { Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage.jsx";
import Aboutpage from "./pages/Aboutpage.jsx";
import { Input } from './components/Input.jsx';
import { TextareaInput } from './components/TextareaInput.jsx';
import { Button } from './components/Button.jsx';
import { LoadingSpinner } from './components/LoadingSpinner.jsx';
import { PolicyAnalysisDisplay } from './components/PolicyAnalysisDisplay.jsx';
import { Alert } from './components/Alert.jsx';
import { Disclaimer } from './components/Disclaimer.jsx';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { analyzePolicyWithAPI } from './services/analysisService.js';
import { AlertType } from './types.js';

const AnalyzerPage = () => {
  const [serviceName, setServiceName] = useState('');
  const [policyText, setPolicyText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyzeClick = useCallback(async () => {
    if (!serviceName.trim() || !policyText.trim()) {
      setError('Please enter both the service name and the policy text.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const result = await analyzePolicyWithAPI(serviceName, policyText);
      setAnalysisResult(result);
    } catch (e) {
      console.error("Analysis error:", e);
      setError(e.message || 'Failed to analyze policy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [serviceName, policyText]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex flex-col items-center p-4 selection:bg-sky-500 selection:text-white">
      <Header />
      <main className="container mx-auto flex-grow w-full max-w-4xl p-6 bg-slate-800 shadow-2xl rounded-xl mt-8">
        <div className="grid md:grid-cols-2 gap-8">
          <section id="input-section">
            <h2 className="text-2xl font-semibold mb-6 text-sky-400">Policy Details</h2>
            <div className="space-y-6">
              <Input
                label="Service/Website Name"
                id="serviceName"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g., Google, Facebook"
                disabled={isLoading}
              />
              <TextareaInput
                label="Paste Privacy Policy or Terms of Service Text"
                id="policyText"
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                placeholder="Paste the full text of the policy here..."
                rows={12}
                disabled={isLoading}
              />
              <Button
                onClick={handleAnalyzeClick}
                disabled={isLoading || !serviceName.trim() || !policyText.trim()}
                className="w-full transition-all duration-300 ease-in-out hover:shadow-lg focus:ring-4 focus:ring-sky-500/50"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Analyze Policy'}
              </Button>
            </div>
          </section>

          <section id="analysis-output" className="md:mt-0">
            <h2 className="text-2xl font-semibold mb-6 text-sky-400">Analysis Results</h2>
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full bg-slate-700/50 p-6 rounded-lg">
                <LoadingSpinner />
                <p className="mt-4 text-slate-300">Analyzing policy... this may take a moment.</p>
              </div>
            )}
            {error && !isLoading && (
              <Alert type={AlertType.Error} message={error} onClose={() => setError(null)} />
            )}
            {analysisResult && !isLoading && !error && (
              <PolicyAnalysisDisplay result={analysisResult} />
            )}
            {!analysisResult && !isLoading && !error && (
              <div className="flex items-center justify-center h-full bg-slate-700/50 p-6 rounded-lg text-center">
                <p className="text-slate-400">Enter policy details and click "Analyze Policy" to see the results here.</p>
              </div>
            )}
          </section>
        </div>
        <Disclaimer />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path='/' element={<Homepage />} />
      <Route path='/analyzer' element={<AnalyzerPage />} />
      <Route path='/about' element={<Aboutpage />} />
    </Routes>
  );
}

export default App;
