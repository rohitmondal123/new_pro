import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sparkles,
  X,
  Send,
  FileText,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Zap,
  RotateCcw,
  BarChart3,
  Search,
  CheckCircle2,
  ExternalLink,
  User,
  Trash2,
  Type,
  Bot,
} from 'lucide-react';

interface WorkTask {
  id: string;
  sender?: 'user' | 'bot';
  type: 'scan' | 'memo' | 'gap' | 'chat';
  title: string;
  result: string;
  matchedProjects?: string[];
  suggestedAction?: {
    label: string;
    route?: string;
    projectId?: string;
  };
  timestamp: string;
}

export const FloatingAiRobot: React.FC = () => {
  const { activeRoute, setActiveRoute, openProjectDetail, currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [workingStatus, setWorkingStatus] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showGreetingBubble, setShowGreetingBubble] = useState(true);
  const [robotBlink, setRobotBlink] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial tasks/history
  const [taskHistory, setTaskHistory] = useState<WorkTask[]>([
    {
      id: 'task-init',
      sender: 'bot',
      type: 'chat',
      title: 'Sentinel Robot AI',
      result:
        'Namaste! I am your automated Sentinel AI Work Bot. You can chat with me directly, or click the directives above to run deep scans, draft inspection memos, or calculate fund risks.',
      timestamp: 'Online',
    },
  ]);

  // Periodic blinking effect for the robot avatar
  useEffect(() => {
    const interval = setInterval(() => {
      setRobotBlink(true);
      setTimeout(() => setRobotBlink(false), 200);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Hide greeting bubble after 10 seconds or when opened
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreetingBubble(false);
    }, 9000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowGreetingBubble(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, taskHistory, isWorking]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setTaskHistory([
      {
        id: `task-reset-${Date.now()}`,
        sender: 'bot',
        type: 'chat',
        title: 'Sentinel Robot AI',
        result: 'Conversation cleared. How can I assist you with project scrutiny today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Automated Task 1: Audit Current View
  const handleScanCurrentView = async () => {
    setIsWorking(true);
    setWorkingStatus('Scanning active telemetry on ' + activeRoute.toUpperCase() + '...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      let reportText = '';
      let targetProjectId = 'MPL-1024';

      if (activeRoute === 'dashboard' || activeRoute === 'queue') {
        reportText =
          'CRITICAL AUDIT FINDING: Discovered high anomaly divergence in West Bengal (Bankura). Work ID MPL-1024 shows 92% financial disbursement with only 41% authenticated physical completion (51% progress gap). Risk score elevated to 94/100.';
      } else if (activeRoute === 'cost-anomaly') {
        reportText =
          'COST RADAR SCAN: 3,420 works flagged exceeding +25% cost variance. Top anomaly: Multipurpose Community Hall Bankura exceeds sanction by +82.8% (₹38.4L vs ₹21.0L).';
      } else if (activeRoute === 'reality') {
        reportText =
          'REALITY CHECK COMPLETE: Physical milestones stalled in Phase 2 despite 3 PFMS payment tranches cleared. Recommended action: withhold remaining ₹2.6L balance.';
      } else {
        reportText =
          `LIVE SCAN REPORT for [${activeRoute.toUpperCase()}]: Telemetry feed active. 52,480 total works under continuous automated neural monitoring. 186 critical anomalies queued for officer review.`;
      }

      setTaskHistory((prev) => [
        ...prev,
        {
          id: `task-${Date.now()}`,
          sender: 'bot',
          type: 'scan',
          title: `Audit Scan: ${activeRoute.toUpperCase()}`,
          result: reportText,
          matchedProjects: ['MPL-1024'],
          suggestedAction: {
            label: 'Inspect MPL-1024 Digital Twin',
            projectId: targetProjectId,
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsWorking(false);
      setWorkingStatus('');
    }
  };

  // Automated Task 2: Draft Official Inspection Memo
  const handleDraftInspectionMemo = async () => {
    setIsWorking(true);
    setWorkingStatus('Drafting official MoSPI field inspection memo...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const memoText = `GOVERNMENT OF INDIA
MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION
MPLADS MONITORING WING - NEW DELHI

MEMORANDUM REF: MoSPI/MPLADS/2026/ANOMALY-1024
DATE: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}

TO: District Magistrate & Collector, Bankura District, West Bengal
SUBJECT: Urgent Physical Verification Notice - Work Code MPL-1024

1. Surveillance telemetry flagged Work ID MPL-1024 (Multipurpose Community Hall & Skill Training Center) under MP Local Area Development Scheme.
2. DISBURSEMENT STATUS: ₹38.4 Lakhs disbursed (92.0% of revised estimate).
3. AUTHENTICATED GROUND REALITY: Geo-tagged physical progress verified at 41.0% (Progress Gap: -51.0%).
4. ACTION ORDERED:
   (a) Constitute an independent tripartite inspection team within 72 hours.
   (b) Freeze all further disbursements on PFMS Portal for this sanctioned head.
   (c) Upload GIS drone survey and muster roll geotags to MPLADS Portal.

Issued with approval of Competent Authority.
[Generated by MPLADS Sentinel AI Work Engine]`;

      setTaskHistory((prev) => [
        ...prev,
        {
          id: `task-${Date.now()}`,
          sender: 'bot',
          type: 'memo',
          title: 'Official Field Inspection Memo Generated',
          result: memoText,
          matchedProjects: ['MPL-1024'],
          suggestedAction: {
            label: 'Open Investigation Dossiers',
            route: 'reports',
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsWorking(false);
      setWorkingStatus('');
    }
  };

  // Automated Task 3: Calculate Gap & Fund at Risk
  const handleCalculateFundRisk = async () => {
    setIsWorking(true);
    setWorkingStatus('Calculating quantitative fund exposure and gap delta...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const calcText = `FINANCIAL REALITY GAP CALCULATION:
• Sanctioned Allocation: ₹21.00 Lakhs
• Cumulative Disbursed: ₹38.40 Lakhs (+82.8% Overrun)
• Expected Completion Rate: 92.0%
• Actual Ground Completion: 41.0%
• Divergence Delta: -51.0% Unaccounted Gap
• Estimated Fund Exposure / Risk Capital: ₹19.58 Lakhs
• High Probability Root Causes: Contractor billing ahead of physical masonry, missing inspection sign-offs.`;

      setTaskHistory((prev) => [
        ...prev,
        {
          id: `task-${Date.now()}`,
          sender: 'bot',
          type: 'gap',
          title: 'Quantitative Risk & Gap Calculation',
          result: calcText,
          matchedProjects: ['MPL-1024'],
          suggestedAction: {
            label: 'View Reality Engine',
            route: 'reality',
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsWorking(false);
      setWorkingStatus('');
    }
  };

  // Custom User Query via Gemini AI
  const handleCustomQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isWorking) return;

    const userText = inputQuery.trim();
    setInputQuery('');

    // Append User's message first so it is immediately visible in the chat!
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTaskHistory((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        type: 'chat',
        title: 'You',
        result: userText,
        timestamp: userTimestamp,
      },
    ]);

    setIsWorking(true);
    setWorkingStatus('Sentinel AI thinking...');

    try {
      const response = await api.askAi(userText, currentUser.role);
      setTaskHistory((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          type: 'chat',
          title: 'Sentinel Robot AI',
          result: response.answer,
          matchedProjects: response.matched_projects,
          suggestedAction: response.matched_projects?.length
            ? {
                label: `Inspect ${response.matched_projects[0]}`,
                projectId: response.matched_projects[0],
              }
            : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
      setTaskHistory((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          type: 'chat',
          title: 'Sentinel Robot AI',
          result:
            'Telemetry gateway notice: Showing active baseline intelligence — Work ID MPL-1024 in Bankura, West Bengal is currently flagged with the highest composite risk (Score 94) due to a 51% financial-physical progress gap.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsWorking(false);
      setWorkingStatus('');
    }
  };

  return (
    <>
      {/* Floating Robot Avatar Trigger Button */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
        {/* Floating Greeting Speech Bubble */}
        {showGreetingBubble && !isOpen && (
          <div className="mb-3 mr-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xl max-w-xs animate-in fade-in slide-in-from-bottom-3 duration-300 relative">
            <button
              onClick={() => setShowGreetingBubble(false)}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] hover:bg-slate-300 cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Sentinel Robot AI</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-700 font-mono">
                    ONLINE
                  </span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                  Click me to run automated audits, draft legal memos, or calculate fund risks on the fly!
                </p>
              </div>
            </div>
            {/* Pointer arrow */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800 rotate-45" />
          </div>
        )}

        {/* The Animated Robot Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setIsMinimized(false);
          }}
          className="relative group p-1 rounded-full cursor-pointer focus:outline-none transition-transform hover:scale-108 active:scale-95 animate-float"
          title="Open Sentinel AI Work Robot"
          aria-label="Open Sentinel AI Work Robot"
        >
          {/* Animated Rotating Radar Ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#138808] opacity-70 blur-xs group-hover:opacity-100 animate-spin-slow" />

          {/* Main Floating Robot Sphere */}
          <div className="relative w-14 h-14 rounded-full bg-[#0B192C] text-white flex items-center justify-center shadow-2xl border-2 border-white/80 overflow-hidden">
            {/* Robot Head Graphic */}
            <svg
              viewBox="0 0 48 48"
              className="w-10 h-10 transition-transform group-hover:rotate-6 duration-300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Antenna */}
              <line x1="24" y1="12" x2="24" y2="4" stroke="#FF671F" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="24" cy="4" r="3" fill="#FF671F" className="animate-pulse" />

              {/* Ears / Head bolts */}
              <rect x="7" y="18" width="3" height="10" rx="1.5" fill="#94A3B8" />
              <rect x="38" y="18" width="3" height="10" rx="1.5" fill="#94A3B8" />

              {/* Robot Face / Visor Screen */}
              <rect
                x="9"
                y="11"
                width="30"
                height="24"
                rx="6"
                fill="#1E293B"
                stroke="#64748B"
                strokeWidth="1.5"
              />
              <rect x="12" y="14" width="24" height="18" rx="4" fill="#030712" />

              {/* Eyes with Blinking State */}
              {robotBlink ? (
                <>
                  <line x1="16" y1="23" x2="21" y2="23" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="27" y1="23" x2="32" y2="23" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <circle cx="18.5" cy="23" r="3" fill="#38BDF8">
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="29.5" cy="23" r="3" fill="#38BDF8">
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  {/* Eye pupils */}
                  <circle cx="19.5" cy="22" r="1" fill="#FFFFFF" />
                  <circle cx="30.5" cy="22" r="1" fill="#FFFFFF" />
                </>
              )}

              {/* Digital Mouth Display */}
              <rect x="18" y="28" width="12" height="1.8" rx="0.9" fill="#10B981" />

              {/* Tricolor Chest Accents */}
              <rect x="15" y="38" width="6" height="3" rx="1" fill="#FF671F" />
              <rect x="21" y="38" width="6" height="3" rx="1" fill="#FFFFFF" />
              <rect x="27" y="38" width="6" height="3" rx="1" fill="#138808" />
            </svg>

            {/* Glowing Active Status LED */}
            <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B192C] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          </div>

          {/* Badge Label */}
          <span className="absolute -top-1 -right-1 bg-[#FF671F] text-white text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-full shadow-md border border-white">
            AI
          </span>
        </button>
      </div>

      {/* Floating Interactive Work Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-5 z-50 w-[92vw] sm:w-[410px] theme-surface rounded-2xl shadow-2xl border-2 theme-border overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-6 ${
            isMinimized ? 'h-14' : 'max-h-[82vh] h-[580px]'
          } flex flex-col`}
        >
          {/* Top Indian Tricolor Strip */}
          <div className="tiranga-top-strip" />

          {/* Header */}
          <div className="px-4 py-3 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4 text-[#FF9933] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs tracking-wide">SENTINEL WORK BOT</span>
                  <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-mono">
                  Autonomous Anomaly & Audit Worker
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Text Size / Contrast Toggle */}
              <button
                onClick={() => setLargeFont(!largeFont)}
                className={`px-2 py-1 rounded text-xs font-bold font-mono transition-colors cursor-pointer border ${
                  largeFont
                    ? 'bg-amber-400 text-slate-900 border-amber-300'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title={largeFont ? 'Switch to standard font' : 'Switch to extra large readable font'}
              >
                {largeFont ? 'A+ Large' : 'A Normal'}
              </button>

              {/* Clear History */}
              <button
                onClick={handleClearHistory}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Clear chat history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? '▢' : '—'}
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Automated "One-Click Work" Action Bar */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 font-mono mb-1.5 flex items-center justify-between">
                  <span>Robot Work Directives:</span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Telemetry Active
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={handleScanCurrentView}
                    disabled={isWorking}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 text-left transition-all hover:border-[#FF671F] flex flex-col justify-between cursor-pointer disabled:opacity-50 group shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Search className="w-3.5 h-3.5 text-[#FF671F]" />
                      <Zap className="w-2.5 h-2.5 text-amber-500" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-[#FF671F]">
                      Audit Scan Page
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono truncate">Live telemetry</span>
                  </button>

                  <button
                    onClick={handleDraftInspectionMemo}
                    disabled={isWorking}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 text-left transition-all hover:border-[#138808] flex flex-col justify-between cursor-pointer disabled:opacity-50 group shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <FileText className="w-3.5 h-3.5 text-[#138808]" />
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-[#138808]">
                      Draft Legal Memo
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono truncate">Official notice</span>
                  </button>

                  <button
                    onClick={handleCalculateFundRisk}
                    disabled={isWorking}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 text-left transition-all hover:border-blue-500 flex flex-col justify-between cursor-pointer disabled:opacity-50 group shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-blue-600">
                      Calculate Gap
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono truncate">Fund exposure</span>
                  </button>
                </div>
              </div>

              {/* Task & Chat Results Stream */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-100/60 dark:bg-slate-950/60">
                {taskHistory.map((task) => {
                  const isUser = task.sender === 'user';

                  if (isUser) {
                    return (
                      <div key={task.id} className="flex justify-end">
                        <div className="max-w-[88%] bg-[#0B192C] text-white p-3.5 rounded-2xl rounded-tr-xs shadow-md border border-slate-700 space-y-1.5">
                          <div className="flex items-center justify-between gap-3 text-[11px] font-mono border-b border-slate-700/80 pb-1 text-slate-300">
                            <span className="font-bold text-amber-400 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#FF9933]" />
                              You (Officer)
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{task.timestamp}</span>
                          </div>
                          <p
                            className={`${
                              largeFont ? 'text-base' : 'text-sm'
                            } font-semibold text-white leading-relaxed whitespace-pre-wrap`}
                          >
                            {task.result}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={task.id} className="flex justify-start">
                      <div className="w-full max-w-[96%] p-3.5 rounded-2xl rounded-tl-xs border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-mono border-b border-slate-200 dark:border-slate-800 pb-2">
                          <span className="font-bold text-[#FF671F] flex items-center gap-1.5">
                            <Bot className="w-4 h-4 text-[#FF671F]" />
                            {task.title}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {task.timestamp}
                          </span>
                        </div>

                        <div
                          className={`${
                            largeFont ? 'text-base' : 'text-sm'
                          } text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-sans font-medium`}
                        >
                          {task.result}
                        </div>

                        {/* Action Bar (Copy result, inspect project, etc.) */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <button
                            onClick={() => handleCopy(task.id, task.result)}
                            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-[#0B192C] dark:hover:text-white font-medium transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            {copiedId === task.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  Copied Output
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Output</span>
                              </>
                            )}
                          </button>

                          {task.suggestedAction && (
                            <button
                              onClick={() => {
                                if (task.suggestedAction?.projectId) {
                                  openProjectDetail(task.suggestedAction.projectId);
                                  setIsOpen(false);
                                } else if (task.suggestedAction?.route) {
                                  setActiveRoute(task.suggestedAction.route as any);
                                  setIsOpen(false);
                                }
                              }}
                              className="flex items-center gap-1.5 font-bold text-xs text-white px-3 py-1.5 rounded-lg transition-transform hover:scale-102 cursor-pointer shadow-xs bg-[#FF671F] hover:bg-[#e85a15]"
                            >
                              <span>{task.suggestedAction.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Working Status Spinner */}
                {isWorking && (
                  <div className="p-3.5 rounded-xl border-2 border-amber-300 bg-amber-50 dark:bg-slate-900 dark:border-amber-700/60 flex items-center gap-2.5 text-sm font-semibold text-amber-950 dark:text-amber-200 shadow-sm animate-pulse">
                    <span className="w-3 h-3 rounded-full bg-[#FF671F] animate-ping" />
                    <span>{workingStatus}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Helper Chips */}
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono shrink-0">Try:</span>
                {[
                  'Why is MPL-1024 risk 94?',
                  'Audit Bankura works',
                  'Summarize financial gap',
                ].map((promptText, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => {
                      setInputQuery(promptText);
                    }}
                    className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#FF671F] hover:text-[#FF671F] whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {promptText}
                  </button>
                ))}
              </div>

              {/* Chat & Instruction Input Form */}
              <div className="p-3 border-t-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <form onSubmit={handleCustomQuery} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type message or question for robot..."
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    disabled={isWorking}
                    className="flex-1 theme-input border-2 border-slate-300 dark:border-slate-600 focus:border-[#FF671F] rounded-xl px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF671F]/30 transition-all shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    style={{
                      color: 'var(--app-text-primary, #0B192C)',
                      backgroundColor: 'var(--app-surface-subtle, #F5F7FA)',
                      caretColor: '#FF671F',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isWorking || !inputQuery.trim()}
                    className="px-4 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-40 transition-all cursor-pointer shrink-0 bg-[#FF671F] hover:bg-[#e85a15] active:scale-95 shadow-md flex items-center gap-1.5"
                    title="Send message to robot"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-2 px-1 font-mono">
                  <span>Text Size: {largeFont ? 'Extra Large (16px)' : 'Standard High Contrast (14px)'}</span>
                  <span className="font-semibold text-[#FF671F]">Press Enter ↵ to send</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
