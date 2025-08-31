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
import { analyzePolicyWithAPI, extractPolicyFromService } from './services/analysisService.js';
import { AlertType } from './types.js';

const AnalyzerPage = () => {
  const [serviceName, setServiceName] = useState('');
  const [policyText, setPolicyText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [showPolicyField, setShowPolicyField] = useState(false);
  const [extractionAttempted, setExtractionAttempted] = useState(false);

  const handleExtractPolicy = useCallback(async () => {
    if (!serviceName.trim()) {
      setError('Please enter a service name first.');
      return;
    }
    
    setError(null);
    setIsExtracting(true);
    setExtractionAttempted(true);
    
    try {
      const result = await extractPolicyFromService(serviceName);
      if (result.success && result.policyText) {
        setPolicyText(result.policyText);
        setShowPolicyField(true);
        setError(null);
        // Show success message
        setTimeout(() => {
          setError(null);
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to extract policy');
      }
    } catch (e) {
      console.error("Extraction error:", e);
      setError(e.message || 'Failed to extract policy automatically. Please paste the policy text manually.');
      setShowPolicyField(true); // Show manual input field on failure
    } finally {
      setIsExtracting(false);
    }
  }, [serviceName]);

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

  const handleManualEntry = () => {
    setShowPolicyField(true);
    setExtractionAttempted(true);
  };

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
                placeholder="e.g., Google, Facebook, Microsoft"
                disabled={isLoading || isExtracting}
              />
              
              {/* Auto-extraction buttons - only show if policy field is not shown yet */}
              {!showPolicyField && (
                <div className="space-y-3">
                  <Button
                    onClick={handleExtractPolicy}
                    disabled={isExtracting || !serviceName.trim()}
                    className="w-full transition-all duration-300 ease-in-out hover:shadow-lg focus:ring-4 focus:ring-sky-500/50 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isExtracting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Finding Policy...</span>
                      </>
                    ) : (
                      'Get Policy Automatically'
                    )}
                  </Button>
                  
                  <div className="flex items-center">
                    <div className="flex-1 border-t border-slate-600"></div>
                    <span className="px-3 text-slate-400 text-sm">or</span>
                    <div className="flex-1 border-t border-slate-600"></div>
                  </div>
                  
                  <Button
                    onClick={handleManualEntry}
                    disabled={isExtracting}
                    className="w-full transition-all duration-300 ease-in-out hover:shadow-lg focus:ring-4 focus:ring-sky-500/50 bg-slate-600 hover:bg-slate-700"
                  >
                    Enter Policy Text Manually
                  </Button>
                </div>
              )}

              {/* Policy text field - shown after extraction attempt or manual selection */}
              {showPolicyField && (
                <>
                  <TextareaInput
                    label="Privacy Policy or Terms of Service Text"
                    id="policyText"
                    value={policyText}
                    onChange={(e) => setPolicyText(e.target.value)}
                    placeholder={policyText ? "Policy text extracted successfully! You can edit it if needed." : "Paste the full text of the policy here..."}
                    rows={12}
                    disabled={isLoading}
                  />
                  
                  {/* Option to retry extraction */}
                  {extractionAttempted && !policyText && (
                    <Button
                      onClick={handleExtractPolicy}
                      disabled={isExtracting || !serviceName.trim()}
                      className="w-full transition-all duration-300 ease-in-out hover:shadow-lg focus:ring-4 focus:ring-sky-500/50 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isExtracting ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Trying Again...</span>
                        </>
                      ) : (
                        'Try Auto-Extract Again'
                      )}
                    </Button>
                  )}
                </>
              )}

              {/* Analyze button - only show when policy text field is visible */}
              {showPolicyField && (
                <Button
                  onClick={handleAnalyzeClick}
                  disabled={isLoading || !serviceName.trim() || !policyText.trim()}
                  className="w-full transition-all duration-300 ease-in-out hover:shadow-lg focus:ring-4 focus:ring-sky-500/50"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Analyze Policy'}
                </Button>
              )}
            </div>
          </section>

          <section id="analysis-output" className="md:mt-0">
            <h2 className="text-2xl font-semibold mb-6 text-sky-400">Analysis Results</h2>
            
            {/* Extraction in progress */}
            {isExtracting && (
              <div className="flex flex-col items-center justify-center h-full bg-slate-700/50 p-6 rounded-lg">
                <LoadingSpinner />
                <p className="mt-4 text-slate-300">Searching for privacy policy...</p>
                <p className="mt-2 text-slate-400 text-sm">This may take a few moments</p>
              </div>
            )}
            
            {/* Analysis in progress */}
            {isLoading && !isExtracting && (
              <div className="flex flex-col items-center justify-center h-full bg-slate-700/50 p-6 rounded-lg">
                <LoadingSpinner />
                <p className="mt-4 text-slate-300">Analyzing policy... this may take a moment.</p>
              </div>
            )}
            
            {/* Error states */}
            {error && !isLoading && !isExtracting && (
              <Alert type={AlertType.Error} message={error} onClose={() => setError(null)} />
            )}
            
            {/* Success - policy extracted */}
            {showPolicyField && policyText && !error && !isLoading && !isExtracting && !analysisResult && (
              <div className="bg-emerald-900/20 border border-emerald-700 p-6 rounded-lg">
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-400 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-emerald-300">Policy Found!</h3>
                </div>
                <p className="text-emerald-200 text-sm">
                  Privacy policy extracted successfully. You can review and edit the text if needed, then click "Analyze Policy" to continue.
                </p>
              </div>
            )}
            
            {/* Analysis results */}
            {analysisResult && !isLoading && !isExtracting && !error && (
              <PolicyAnalysisDisplay result={analysisResult} />
            )}
            
            {/* Default state */}
            {!analysisResult && !isLoading && !isExtracting && !error && !showPolicyField && (
              <div className="flex items-center justify-center h-full bg-slate-700/50 p-6 rounded-lg text-center">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-400 mx-auto mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  <p className="text-slate-400">Enter a service name and choose how to get the privacy policy.</p>
                </div>
              </div>
            )}
            
            {/* Waiting for manual input */}
            {!analysisResult && !isLoading && !isExtracting && !error && showPolicyField && !policyText && (
              <div className="flex items-center justify-center h-full bg-slate-700/50 p-6 rounded-lg text-center">
                <p className="text-slate-400">Enter the privacy policy text and click "Analyze Policy" to see the results here.</p>
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
