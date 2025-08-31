import React from 'react';

const getRankingColor = (ranking) => {
  const lowerRanking = ranking.toLowerCase();
  if (lowerRanking.includes('good') || lowerRanking.includes('excellent')) return 'text-green-400';
  if (lowerRanking.includes('fair') || lowerRanking.includes('average')) return 'text-yellow-400';
  if (lowerRanking.includes('poor') || lowerRanking.includes('needs attention') || lowerRanking.includes('bad')) return 'text-red-400';
  return 'text-sky-400'; // Default
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

export const PolicyAnalysisDisplay = ({ result }) => {
  return (
    <div className="space-y-6 p-6 bg-slate-700/70 rounded-lg shadow-inner">
      <div>
        <h3 className="text-lg font-semibold text-sky-300 mb-1">Overall Ranking</h3>
        <p className={`text-2xl font-bold ${getRankingColor(result.ranking)}`}>
          {result.ranking}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-sky-300 mb-1">Summary</h3>
        <p className="text-slate-300 leading-relaxed">{result.summary}</p>
      </div>

      {result.worryingClauses && result.worryingClauses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Potential Concerns</h3>
          <ul className="space-y-1 text-slate-300 list-inside">
            {result.worryingClauses.map((clause, index) => (
              <ListItem key={`worry-${index}`} icon={<WorryingIcon/>}>
                {clause}
              </ListItem>
            ))}
          </ul>
        </div>
      )}
      {(result.worryingClauses?.length === 0) && (
        <div>
          <h3 className="text-lg font-semibold text-green-400 mb-2">Potential Concerns</h3>
          <p className="text-slate-300">No major worrying clauses identified by the AI.</p>
        </div>
      )}

      {result.positiveAspects && result.positiveAspects.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-400 mb-2">Positive Aspects</h3>
          <ul className="space-y-1 text-slate-300 list-inside">
            {result.positiveAspects.map((aspect, index) => (
               <ListItem key={`positive-${index}`} icon={<PositiveIcon/>}>
                {aspect}
              </ListItem>
            ))}
          </ul>
        </div>
      )}
      {(result.positiveAspects?.length === 0) && (
        <div>
          <h3 className="text-lg font-semibold text-sky-400 mb-2">Positive Aspects</h3>
          <p className="text-slate-300">No specific positive aspects highlighted by the AI.</p>
        </div>
      )}
    </div>
  );
};
