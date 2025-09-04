import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full max-w-4xl py-6 mt-8 text-center text-sm text-slate-400 border-t border-slate-700">
      <p>&copy; {new Date().getFullYear()} Privacy Lens. For informational purposes only.</p>
      <p className="mt-1">
        Made with ❤️ by 
        <a href="https://www.linkedin.com/in/navneet-kumar-35989128a/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 ml-1">
        Navneet Kumar
        </a>
      </p>
    </footer>
  );
};
