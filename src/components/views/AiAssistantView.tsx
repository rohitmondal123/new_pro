import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { WorkItem } from '../../types/mplads';
import {
  Sparkles,
  Send,
  User,
  ShieldAlert,
  BarChart3,
  Bot,
  Trash2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  matchedProjects?: WorkItem[];
  suggestedFollowups?: string[];
  timestamp: string;
}

export const AiAssistantView: React.FC = () => {
  const { openProjectDetail, setActiveRoute, currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [largeFont, setLargeFont] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello, I am your Team Drishti AI Assistant, grounded in real-time project risk data, cost anomaly models, and spatial records.

How can I assist you with project scrutiny, compliance audit, or fund allocation today?`,
      suggestedFollowups: [
        'Why is MPL-1024 flagged as 94 Risk Score?',
        'Show high risk projects in Bankura',
        'Summarize financial vs physical discrepancy for Community Hall',
        'Identify duplicate proposals in West Bengal',
      ],
      timestamp: '09:00 AM',
    },
  ]);

  const handleSend = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const response = await api.askAi(userText, currentUser.role);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        matchedProjects: response.matched_projects,
        suggestedFollowups: response.suggested_followups,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to ask assistant', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'An error occurred while communicating with the Team Drishti intelligence engine. Please retry your query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(query);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history cleared. What questions or projects would you like to investigate?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="theme-surface p-5 rounded-2xl border theme-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--app-pill-bg)',
                color: 'var(--app-pill-text)',
                borderColor: 'var(--app-pill-border)',
              }}
            >
              Conversational Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Gemini 3.8 Flash • Real-Time Database Grounding
            </span>
          </div>
          <h1 className="text-2xl font-extrabold theme-text tracking-tight mt-1 flex items-center gap-2">
            <span>Ask MPLADS AI</span>
          </h1>
          <p className="text-xs theme-text-secondary max-w-2xl">
            Query project risks, analyze cost deviations, search geographic duplicates, and synthesize
            district audit dossiers in natural language.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Font Size Toggle Button */}
          <button
            onClick={() => setLargeFont(!largeFont)}
            className={`text-xs px-3 py-1.5 rounded-full font-mono font-bold border transition-colors cursor-pointer ${
              largeFont
                ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs'
                : 'theme-surface-subtle hover:bg-slate-100 dark:hover:bg-slate-800 theme-text border-slate-300 dark:border-slate-700'
            }`}
            title="Toggle between standard readable font (14px) and extra large font (16px)"
          >
            {largeFont ? 'A+ Large Font (16px)' : 'A Normal Font (14px)'}
          </button>

          {/* Clear History Button */}
          <button
            onClick={handleClearHistory}
            className="text-xs theme-surface-subtle hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border theme-border px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={() => setActiveRoute('ai-chart-bot')}
            className="text-xs theme-surface-subtle hover:bg-slate-100 dark:hover:bg-slate-800 theme-text border theme-border px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>AI Chart Bot Studio</span>
            <span className="text-[10px] text-amber-600 font-mono font-bold ml-0.5">NEW</span>
          </button>
          <span
            className="text-xs px-3 py-1.5 rounded-full font-mono font-bold flex items-center gap-1.5 border"
            style={{
              backgroundColor: 'var(--app-pill-bg)',
              color: 'var(--app-pill-text)',
              borderColor: 'var(--app-pill-border)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Team Drishti AI Grounded
          </span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="theme-surface rounded-2xl border-2 theme-border shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/40">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 ${
                  isBot ? 'max-w-4xl' : 'max-w-xl ml-auto flex-row-reverse'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs ${
                    !isBot ? 'bg-[#0B192C] text-white border border-slate-700' : 'bg-[#FF671F] text-white'
                  }`}
                >
                  {isBot ? <Sparkles className="w-4 h-4 text-amber-300" /> : <User className="w-4 h-4 text-[#FF9933]" />}
                </div>

                <div
                  className={`p-4 sm:p-5 rounded-2xl space-y-3 leading-relaxed shadow-sm ${
                    isBot
                      ? 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-tl-xs'
                      : 'bg-[#0B192C] text-white border border-slate-700 rounded-tr-xs shadow-md'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-3 text-[11px] font-mono border-b pb-1.5 opacity-80 border-slate-200 dark:border-slate-800">
                    <span className={`font-bold ${isBot ? 'text-[#FF671F]' : 'text-amber-400'}`}>
                      {isBot ? 'Team Drishti AI' : 'You (Officer)'}
                    </span>
                    <span className={isBot ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400'}>
                      {msg.timestamp}
                    </span>
                  </div>

                  <div
                    className={`whitespace-pre-line ${
                      largeFont ? 'text-base' : 'text-sm'
                    } font-sans ${
                      isBot
                        ? 'text-slate-900 dark:text-slate-100 font-medium'
                        : 'text-white font-semibold'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Grounded Matching Projects Cards */}
                  {msg.matchedProjects && msg.matchedProjects.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Live Database Projects Matched ({msg.matchedProjects.length}):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {msg.matchedProjects.map((p) => (
                          <div
                            key={p.work_id}
                            onClick={() => openProjectDetail(p.work_id)}
                            className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-blue-500 cursor-pointer transition-colors shadow-2xs group"
                          >
                            <div className="flex justify-between items-center text-xs font-bold mb-1">
                              <span className="font-mono text-blue-600 dark:text-blue-400 group-hover:underline">
                                {p.work_id}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  p.risk_score >= 90
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                                }`}
                              >
                                RISK {p.risk_score}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {p.title}
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex justify-between font-mono">
                              <span>Gap: +{p.progress_gap}pp</span>
                              <span>₹{p.expenditure}L / ₹{p.sanctioned_cost}L</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Followups Chips */}
                  {msg.suggestedFollowups && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
                      {msg.suggestedFollowups.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(s)}
                          className="text-xs px-3 py-1.5 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#FF671F] hover:text-[#FF671F] text-slate-800 dark:text-slate-200 font-semibold transition-colors text-left cursor-pointer shadow-2xs"
                        >
                          {s} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 max-w-md">
              <div className="w-9 h-9 rounded-xl bg-[#FF671F] text-white flex items-center justify-center animate-pulse shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center gap-2.5 shadow-sm font-semibold text-slate-900 dark:text-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                <span>Team Drishti AI analyzing telemetry database...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-950 border-t-2 border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
            <input
              type="text"
              placeholder="Ask anything (e.g. 'Why is MPL-1024 high risk?' or 'Show works with >40% gap in Bankura')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 theme-input border-2 border-slate-300 dark:border-slate-600 focus:border-[#FF671F] rounded-xl px-4 py-3 text-sm sm:text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#FF671F]/30 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              style={{
                color: 'var(--app-text-primary, #0B192C)',
                backgroundColor: 'var(--app-surface-subtle, #F5F7FA)',
                caretColor: '#FF671F',
              }}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-3 disabled:opacity-50 font-bold text-sm rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer bg-[#FF671F] hover:bg-[#e85a15] text-white shrink-0 active:scale-95"
            >
              <span>Ask AI</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex justify-between px-1 font-mono">
            <span>Powered by Gemini 3.8 Flash • Telemetry ground-truth verified</span>
            <span>Current display font: {largeFont ? '16px (Extra Large)' : '14px (Standard)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
