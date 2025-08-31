import React from 'react';

export const Header = () => {
  return (
    <header className="w-full max-w-4xl py-6 text-center">
      <div className="flex items-center justify-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-sky-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
          Privacy Policy Analyzer
        </h1>
      </div>
      <p className="mt-3 text-lg text-slate-300">
        Understand website terms and privacy policies with AI-powered insights.
      </p>
    </header>
  );
};
