import React, { useState } from 'react';

const getRankingColor = (ranking) => {
  if (!ranking) return 'text-sky-400';
  const lowerRanking = ranking.toLowerCase();
  if (lowerRanking.includes('good') || lowerRanking.includes('excellent')) return 'text-green-400';
  if (lowerRanking.includes('fair') || lowerRanking.includes('average')) return 'text-yellow-400';
  if (lowerRanking.includes('poor') || lowerRanking.includes('needs attention') || lowerRanking.includes('bad') || lowerRanking.includes('critical')) return 'text-red-400';
  return 'text-sky-400'; // Default
};

const getScoreColor = (score) => {
  if (score >= 70) return 'text-green-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
};

const ListItem = ({ children, icon }) => (
  <li className="flex items-start space-x-3 py-2">
    <div className="flex-shrink-0 mt-1">{icon}</div>
    <span>{children}</span>
  </li>
);

const WorryingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);

const PositiveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ChevronIcon = ({ isOpen }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export const PolicyAnalysisDisplay = ({ result }) => {
  const [isWorryingOpen, setIsWorryingOpen] = useState(false);
  const [isPositiveOpen, setIsPositiveOpen] = useState(false);

  const worryingCount = result?.worryingClauses ? result.worryingClauses.length : 0;
  const positiveCount = result?.positiveAspects ? result.positiveAspects.length : 0;

  return (
    <div className="space-y-6 p-6 bg-slate-700/70 rounded-lg shadow-inner">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-slate-600 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-sky-300 mb-1">Overall Ranking</h3>
          <p className={`text-2xl font-bold ${getRankingColor(result.ranking)}`}>
            {result.ranking}
          </p>
        </div>
        {result.score !== undefined && (
          <div className="mt-4 md:mt-0 md:text-right">
            <h3 className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Privacy Score</h3>
            <p className={`text-4xl font-black ${getScoreColor(result.score)}`}>
              {result.score}<span className="text-xl text-slate-500 font-medium">/100</span>
            </p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-sky-300 mb-1">Summary</h3>
        <p className="text-slate-300 leading-relaxed">{result.summary}</p>
      </div>

      {/* Potential Concerns Section (Expandable) */}
      <div className="border border-slate-600/80 rounded-lg overflow-hidden bg-slate-800/40">
        <button
          onClick={() => setIsWorryingOpen(!isWorryingOpen)}
          className="w-full flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-800 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30"
          aria-expanded={isWorryingOpen}
        >
          <div className="flex items-center space-x-3">
            <WorryingIcon />
            <h3 className="text-lg font-semibold text-red-400">Potential Concerns</h3>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
              {worryingCount}
            </span>
          </div>
          <ChevronIcon isOpen={isWorryingOpen} />
        </button>

        {isWorryingOpen && (
          <div className="p-4 border-t border-slate-600/60 bg-slate-900/30">
            {worryingCount > 0 ? (
              <ul className="space-y-1 text-slate-300">
                {result.worryingClauses.map((clause, index) => (
                  <ListItem key={`worry-${index}`} icon={<WorryingIcon />}>
                    {clause}
                  </ListItem>
                ))}
              </ul>
            ) : (
              <p className="text-slate-300 text-sm">No major worrying clauses identified by the AI.</p>
            )}
          </div>
        )}
      </div>

      {/* Positive Aspects Section (Expandable) */}
      <div className="border border-slate-600/80 rounded-lg overflow-hidden bg-slate-800/40">
        <button
          onClick={() => setIsPositiveOpen(!isPositiveOpen)}
          className="w-full flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-800 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/30"
          aria-expanded={isPositiveOpen}
        >
          <div className="flex items-center space-x-3">
            <PositiveIcon />
            <h3 className="text-lg font-semibold text-green-400">Positive Aspects</h3>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
              {positiveCount}
            </span>
          </div>
          <ChevronIcon isOpen={isPositiveOpen} />
        </button>

        {isPositiveOpen && (
          <div className="p-4 border-t border-slate-600/60 bg-slate-900/30">
            {positiveCount > 0 ? (
              <ul className="space-y-1 text-slate-300">
                {result.positiveAspects.map((aspect, index) => (
                  <ListItem key={`positive-${index}`} icon={<PositiveIcon />}>
                    {aspect}
                  </ListItem>
                ))}
              </ul>
            ) : (
              <p className="text-slate-300 text-sm">No specific positive aspects highlighted by the AI.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

