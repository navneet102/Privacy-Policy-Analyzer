import React, { useState, useRef, useEffect } from 'react';
import { chatWithPolicyWithAPI } from '../services/analysisService.js';
import { LoadingSpinner } from './LoadingSpinner.jsx';

export const PolicyChat = ({ serviceName }) => {
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
    scrollToBottom();
  }, [messages, isLoading]);

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

  return (
    <div className="space-y-4 p-6 bg-slate-700/70 rounded-lg shadow-inner mt-6 border border-slate-700/50">
      <div>
        <h3 className="text-lg font-semibold text-sky-300 mb-1">Interactive Policy Chat</h3>
        <p className="text-xs text-slate-400">
          Ask specific questions to scan the policy using vector-based retrieval (RAG).
        </p>
      </div>

      {/* Messages Window */}
      <div className="h-64 overflow-y-auto p-4 bg-slate-800/60 rounded-lg border border-slate-700/80 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
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
          <div className="flex flex-col sm:flex-row gap-2">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug)}
                className="text-left text-xs text-sky-400 hover:text-sky-300 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
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
        className="flex items-center gap-2 mt-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${serviceName}'s data sharing, opt-outs, policies...`}
          className="flex-grow bg-slate-800 border border-slate-600/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 transition-colors"
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
  );
};
