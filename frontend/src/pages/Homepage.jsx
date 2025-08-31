import React from 'react';
import { Link } from 'react-router-dom';

const Homepage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
            {/* Navigation */}
            <nav className="w-full px-6 py-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-sky-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                        </svg>
                        <span className="text-xl font-bold text-sky-400">Privacy Analyzer</span>
                    </div>
                    <div className="flex space-x-6">
                        <Link to="/analyzer" className="text-slate-300 hover:text-sky-400 transition-colors">
                            Analyzer
                        </Link>
                        <Link to="/about" className="text-slate-300 hover:text-sky-400 transition-colors">
                            About
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="container mx-auto px-6 py-20 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-sky-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                        </svg>
                        <h1 className="text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
                            Privacy Policy Analyzer
                        </h1>
                    </div>
                    
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Understand website terms and privacy policies with AI-powered insights. 
                        Get clear, concise analysis of complex legal documents in seconds.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                            <div className="flex justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-sky-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-sky-300 mb-2">AI-Powered Analysis</h3>
                            <p className="text-slate-400">Advanced AI breaks down complex privacy policies into clear, understandable insights.</p>
                        </div>

                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                            <div className="flex justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-sky-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-sky-300 mb-2">Identify Concerns</h3>
                            <p className="text-slate-400">Automatically highlights potentially concerning clauses and privacy risks.</p>
                        </div>

                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                            <div className="flex justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-sky-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-sky-300 mb-2">Quick Results</h3>
                            <p className="text-slate-400">Get comprehensive analysis results in seconds, not hours of manual reading.</p>
                        </div>
                    </div>

                    <Link 
                        to="/analyzer"
                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg shadow-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/50 transition-all duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-1"
                    >
                        Start Analyzing Policies
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-700 py-8">
                <div className="container mx-auto px-6 text-center text-slate-400">
                    <p>&copy; {new Date().getFullYear()} Privacy Policy Analyzer. For informational purposes only.</p>
                    <p className="mt-1">
                        Powered by AI Analysis. Always consult legal professionals for critical decisions.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;