import React, { useState, useRef, useEffect } from 'react';
import { chatWithPolicyWithAPI } from '../services/analysisService.js';
import { LoadingSpinner } from './LoadingSpinner.jsx';

export const PolicyChat = ({ serviceName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi there! I am your privacy assistant for ${serviceName}. Ask me anything about their privacy policy!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const suggestions = [
    `Does this service sell my personal data?`,
    `How can I request to delete my account and data?`,
    `What details do they track if I am not logged in?`,
  ];

  const handleSend = async (textToSend) => {
    const questionText = textToSend || input;
    if (!questionText.trim() || isLoading) return;

    setError(null);
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: questionText }]);

    try {
      const response = await chatWithPolicyWithAPI(serviceName, questionText);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.answer }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to get an answer. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 border border-sky-300/30 focus:outline-none focus:ring-4 focus:ring-sky-500/50 group"
          aria-label="Open Policy Chat"
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-1.012-.914c.319-1.025.438-2.13.319-3.21C3.65 15.46 3 13.805 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-400"></span>
            </span>
          </div>
          <span className="font-semibold text-sm tracking-wide">RAG Policy Chat</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 sm:w-[420px] max-w-[calc(100vw-2rem)] max-h-[85vh] shadow-2xl rounded-2xl border border-slate-700/80 bg-slate-800 flex flex-col overflow-hidden transition-all duration-300">
      {/* Header with Title, Description, and Close Button */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-700/80 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-sky-300">Interactive Policy Chat</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ask specific questions to scan the policy using vector retrieval (RAG).
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-700/60 transition-colors flex-shrink-0 ml-2"
          aria-label="Close Chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-4.5rem)] flex-1">
        {/* Messages Window */}
        <div className="h-64 overflow-y-auto p-4 bg-slate-900/50 rounded-lg border border-slate-700/80 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed border ${
                  msg.role === 'user'
                    ? 'bg-sky-600/20 border-sky-500/30 text-sky-200'
                    : 'bg-slate-700/50 border-slate-600/50 text-slate-200'
                }`}
              >
                <div className="text-[10px] font-semibold opacity-60 mb-1">
                  {msg.role === 'user' ? 'YOU' : `${serviceName.toUpperCase()} ASSISTANT`}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-3 rounded-lg text-sm bg-slate-700/50 border border-slate-600/50 text-slate-400 flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Scanning policy excerpts...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error alert */}
        {error && (
          <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/50 p-2.5 rounded-lg">
            {error}
          </div>
        )}

        {/* Suggestions */}
        {messages.length === 1 && !isLoading && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Suggested Questions:</p>
            <div className="flex flex-col gap-2">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="text-left text-xs text-sky-400 hover:text-sky-300 bg-slate-900/70 hover:bg-slate-900 px-3 py-2 rounded-lg border border-slate-700/80 hover:border-slate-600 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input controls */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-1"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${serviceName}'s data sharing...`}
            className="flex-grow bg-slate-900/80 border border-slate-600/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

