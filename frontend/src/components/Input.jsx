import React from 'react';

export const Input = ({ label, id, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-sky-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
        {...props}
      />
    </div>
  );
};
