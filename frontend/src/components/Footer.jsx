import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full max-w-4xl py-6 mt-8 text-center text-sm text-slate-400 border-t border-slate-700">
      <p>&copy; {new Date().getFullYear()} AI Policy Analyzer. For informational purposes only.</p>
      <p className="mt-1">
        Powered by AI Analysis. 
        <a href="#" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline ml-1">
          Learn more about our analysis
        </a>
      </p>
    </footer>
  );
};
