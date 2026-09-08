import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  X,
  ArrowRight,
  ShieldAlert,
  Volume2,
  VolumeX,
  Flame,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export interface HighRiskAlertItem {
  projectId: string;
  projectName: string;
  location: string;
  state: string;
  riskScore: number;
  gapPercent: number;
  expenditure: string;
  sanctioned: string;
  anomalySummary: string;
  severity: 'CRITICAL' | 'HIGH';
  timestamp: string;
}

const DEFAULT_HIGH_RISK_PROJECTS: HighRiskAlertItem[] = [
  {
    projectId: 'MPL-1024',
    projectName: 'Multipurpose Community Hall & Skill Training Center',
    location: 'Bankura, West Bengal',
    state: 'West Bengal',
    riskScore: 94,
    gapPercent: 51,
    expenditure: '₹38.4 Lakh',
    sanctioned: '₹21.0 Lakh',
    anomalySummary:
      'Critical 51% gap between financial disbursement (92%) and authenticated physical progress (41%). Expenditure exceeds sanction by +82.8%.',
    severity: 'CRITICAL',
    timestamp: 'Just now',
  },
  {
    projectId: 'MPL-3321',
    projectName: 'Solar Powered Drinking Water & RO Purification Plant',
    location: 'Varanasi, Uttar Pradesh',
    state: 'Uttar Pradesh',
    riskScore: 91,
    gapPercent: 46,
    expenditure: '₹42.0 Lakh',
    sanctioned: '₹27.0 Lakh',
    anomalySummary:
      '98% funds disbursed with only 52% ground delivery. Significant unit cost anomaly detected (+56% above state benchmark).',
    severity: 'CRITICAL',
    timestamp: '4 mins ago',
  },
  {
    projectId: 'MPL-5512',
    projectName: 'All-Weather Rural Link Road with Concrete Culvert',
    location: 'Nagpur Rural, Maharashtra',
    state: 'Maharashtra',
    riskScore: 87,
    gapPercent: 38,
    expenditure: '₹64.2 Lakh',
    sanctioned: '₹48.0 Lakh',
    anomalySummary:
      '98 days milestone slippage beyond statutory SLA. Contractor vendor concentration exceeds 42% of district block works.',
    severity: 'HIGH',
    timestamp: '12 mins ago',
  },
];

interface HighRiskNotificationPopupProps {
  onAcknowledge?: (projectId: string) => void;
  autoShow?: boolean;
}

export const HighRiskNotificationPopup: React.FC<HighRiskNotificationPopupProps> = ({
  autoShow = true,
}) => {
  const { openProjectDetail } = useAuth();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [paused, setPaused] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(100);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Play subtle warning audio chime
  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Tone 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5
      gain2.gain.setValueAtTime(0.08, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.4);
    } catch {
      // Audio context might be restricted by browser policy before first user gesture
    }
  };

  // Initial trigger after 1.5s
  useEffect(() => {
    if (autoShow && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        playAlertChime();
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [autoShow, isDismissed]);

  // Listen for custom trigger event (e.g. from header bell or button)
  useEffect(() => {
    const handleTrigger = () => {
      setIsDismissed(false);
      setIsVisible(true);
      setCountdown(100);
      playAlertChime();
    };
    window.addEventListener('mplads-trigger-high-risk-alert', handleTrigger);
    return () => window.removeEventListener('mplads-trigger-high-risk-alert', handleTrigger);
  }, [soundEnabled]);

  // Auto-dismiss timer progress
  useEffect(() => {
    if (!isVisible || paused) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 150); // ~15 seconds total

    return () => clearInterval(interval);
  }, [isVisible, paused]);

  if (!isVisible) return null;

  const alert = DEFAULT_HIGH_RISK_PROJECTS[currentIndex];

  const handleInspect = () => {
    setIsVisible(false);
    openProjectDetail(alert.projectId);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DEFAULT_HIGH_RISK_PROJECTS.length);
    setCountdown(100);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + DEFAULT_HIGH_RISK_PROJECTS.length) % DEFAULT_HIGH_RISK_PROJECTS.length
    );
    setCountdown(100);
  };

  return (
    <aside
      aria-label="High Risk Project Notification"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="fixed top-14 sm:top-16 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-rose-500/80 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ring-4 ring-rose-500/20"
    >
      {/* Top Warning Strip */}
      <div className="bg-rose-600 px-4 py-2 text-white flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs font-extrabold tracking-wider uppercase">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300" />
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" />
            <span>CRITICAL HIGH-RISK DETECTED</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors"
            title={soundEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
            aria-label={soundEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="Dismiss Alert"
            aria-label="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar for Auto-dismiss */}
      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-rose-500 transition-all duration-150 ease-linear"
          style={{ width: `${countdown}%` }}
        />
      </div>

      {/* Alert Content */}
      <div className="p-4 space-y-3">
        {/* Project ID & Risk Badge */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-black text-xs bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300">
                {alert.projectId}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {alert.location}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">
              {alert.projectName}
            </h4>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-rose-600 font-mono font-black text-lg leading-none">
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>{alert.riskScore}</span>
              <span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <span className="text-[9px] font-mono font-bold uppercase text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-1 rounded">
              {alert.severity} PRIORITY
            </span>
          </div>
        </div>

        {/* Anomaly Callout Box */}
        <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
          <p className="leading-relaxed font-medium">
            {alert.anomalySummary}
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-rose-200/50 dark:border-rose-900/40">
            <span>Disbursed: <strong className="text-rose-700 dark:text-rose-300">{alert.expenditure}</strong></span>
            <span>Sanctioned: <strong className="text-slate-700 dark:text-slate-300">{alert.sanctioned}</strong></span>
            <span className="text-rose-600 font-bold">{alert.gapPercent}% Gap</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleInspect}
            className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Inspect Project Twin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="py-2 px-3 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>

        {/* Footer Navigation for multiple alerts */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="font-mono text-[10px]">
            Alert {currentIndex + 1} of {DEFAULT_HIGH_RISK_PROJECTS.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Previous Alert"
              aria-label="Previous Alert"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Next Alert"
              aria-label="Next Alert"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
