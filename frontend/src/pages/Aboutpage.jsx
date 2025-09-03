import React from 'react';
import { Link } from 'react-router-dom';

const Aboutpage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
            {/* Navigation */}
            <nav className="w-full px-6 py-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-sky-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                        </svg>
                        <span className="text-xl font-bold text-sky-400">Privacy Lens</span>
                    </Link>
                    <div className="flex space-x-6">
                        <Link to="/" className="text-slate-300 hover:text-sky-400 transition-colors">
                            Home
                        </Link>
                        <Link to="/analyzer" className="text-slate-300 hover:text-sky-400 transition-colors">
                            Analyzer
                        </Link>
                    </div>
                </div>
            </nav>

            {/* About Content */}
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
                        About Privacy Lens
                    </h1>

                    <div className="space-y-8">
                        <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700">
                            <h2 className="text-2xl font-semibold text-sky-300 mb-4">Our Mission</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Privacy policies and terms of service are often lengthy, complex, and filled with legal jargon that makes them 
                                difficult for everyday users to understand. Our mission is to make these important documents accessible to everyone 
                                by providing AI-powered analysis that breaks down complex terms into clear, understandable insights.
                            </p>
                        </div>

                        <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700">
                            <h2 className="text-2xl font-semibold text-sky-300 mb-4">How It Works</h2>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                                    <div>
                                        <h3 className="font-semibold text-slate-200 mb-1">Paste Policy Text</h3>
                                        <p className="text-slate-400">Simply copy and paste the privacy policy or terms of service text you want to analyze.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                                    <div>
                                        <h3 className="font-semibold text-slate-200 mb-1">AI Analysis</h3>
                                        <p className="text-slate-400">Our advanced AI model analyzes the document, identifying key points, concerns, and positive aspects.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                                    <div>
                                        <h3 className="font-semibold text-slate-200 mb-1">Get Clear Results</h3>
                                        <p className="text-slate-400">Receive a comprehensive analysis with an overall ranking, summary, and highlighted concerns and benefits.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700">
                            <h2 className="text-2xl font-semibold text-sky-300 mb-4">Features</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-slate-200 mb-2">📊 Overall Ranking</h3>
                                    <p className="text-slate-400">Get a quick assessment of how privacy-friendly the policy is.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-200 mb-2">📝 Clear Summary</h3>
                                    <p className="text-slate-400">Understand the key points in plain language.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-200 mb-2">⚠️ Concern Identification</h3>
                                    <p className="text-slate-400">Automatically spots potentially problematic clauses.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-200 mb-2">✅ Positive Aspects</h3>
                                    <p className="text-slate-400">Highlights user-friendly and privacy-respecting features.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-900/20 border border-amber-700 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold text-amber-300 mb-3">Important Disclaimer</h2>
                            <p className="text-amber-200 text-sm leading-relaxed">
                                This tool provides AI-generated analysis for informational purposes only. It should not be considered 
                                as legal advice or a substitute for consultation with qualified legal professionals. While we strive 
                                for accuracy, AI interpretations may not always be complete or up-to-date with the latest legal standards. 
                                Always review policies carefully yourself and consult legal experts for critical decisions.
                            </p>
                        </div>

                        <div className="text-center">
                            <Link 
                                to="/analyzer"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg shadow-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/50 transition-all duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Try the Analyzer
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-700 py-8">
                <div className="container mx-auto px-6 text-center text-slate-400">
                    <p>&copy; {new Date().getFullYear()} Privacy Lens. For informational purposes only.</p>
                </div>
            </footer>
        </div>
    );
};

export default Aboutpage;