import React from 'react';
import { useAuth, ViewRoute } from '../context/AuthContext';
import {
  LayoutDashboard,
  AlertOctagon,
  FolderGit2,
  GitCompare,
  TrendingUp,
  ClockAlert,
  CopyCheck,
  MapPin,
  BotMessageSquare,
  ShieldCheck,
  FileSpreadsheet,
  FileCheck2,
  History,
  BarChart3,
  PieChart,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

interface NavItem {
  id: ViewRoute;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  section?: string;
}

export const Sidebar: React.FC = () => {
  const { activeRoute, setActiveRoute, openProjectDetail } = useAuth();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'National Command Center',
      icon: LayoutDashboard,
      section: 'Core Monitoring',
    },
    {
      id: 'queue',
      label: 'AI Investigation Queue',
      icon: AlertOctagon,
      badge: 'URGENT',
      badgeColor: 'bg-rose-600 text-white',
      section: 'Core Monitoring',
    },
    {
      id: 'projects',
      label: 'Projects Directory',
      icon: FolderGit2,
      badge: '52,480',
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
      section: 'Core Monitoring',
    },
    {
      id: 'reality',
      label: 'Financial vs Physical Reality',
      icon: GitCompare,
      badge: 'Engine',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      section: 'Risk & Anomaly Engines',
    },
    {
      id: 'cost-anomaly',
      label: 'Cost Anomaly Detection',
      icon: TrendingUp,
      section: 'Risk & Anomaly Engines',
    },
    {
      id: 'predictions',
      label: 'Predictive Delay Modeling',
      icon: ClockAlert,
      section: 'Risk & Anomaly Engines',
    },
    {
      id: 'duplicates',
      label: 'Duplicate / Overlap Radar',
      icon: CopyCheck,
      badge: 'NLP + GIS',
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
      section: 'Risk & Anomaly Engines',
    },
    {
      id: 'map',
      label: 'Geospatial Intelligence Map',
      icon: MapPin,
      badge: 'GIS Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      section: 'Geospatial Intelligence',
    },
    {
      id: 'ai-assistant',
      label: 'Ask MPLADS AI',
      icon: BotMessageSquare,
      badge: 'Gemini 3.8',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      section: 'Decision Support',
    },
    {
      id: 'ai-chart-bot',
      label: 'AI Chart Bot',
      icon: PieChart,
      badge: 'Recharts',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      section: 'Decision Support',
    },
    {
      id: 'reports',
      label: 'AI Investigation Dossiers',
      icon: FileCheck2,
      section: 'Decision Support',
    },
    {
      id: 'compliance',
      label: 'Compliance Monitoring',
      icon: ShieldCheck,
      section: 'Governance & Integrity',
    },
    {
      id: 'data-quality',
      label: 'Data Quality & Ingestion',
      icon: FileSpreadsheet,
      badge: '94.2%',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      section: 'Governance & Integrity',
    },
    {
      id: 'audit',
      label: 'Immutable Audit Trail',
      icon: History,
      section: 'Governance & Integrity',
    },
    {
      id: 'analytics',
      label: 'Analytics & Trend Hub',
      icon: BarChart3,
      section: 'Governance & Integrity',
    },
  ];

  let currentSection = '';

  return (
    <aside
      className="w-64 flex flex-col shrink-0 border-r min-h-[calc(100vh-69px)] select-none transition-colors rounded-xl overflow-hidden shadow-xs"
      style={{
        backgroundColor: 'var(--app-sidebar-bg)',
        color: 'var(--app-sidebar-text)',
        borderColor: 'var(--app-sidebar-border)',
      }}
    >
      {/* Subtle Tiranga Top Accent */}
      <div className="tiranga-smooth-strip" />

      {/* Signature Demo Quick Access Card */}
      <div
        className="p-3 border-b"
        style={{
          borderColor: 'var(--app-sidebar-border)',
          backgroundColor: 'rgba(0,0,0,0.15)',
        }}
      >
        <div
          onClick={() => openProjectDetail('MPL-1024')}
          className="p-2.5 rounded-lg border transition-all cursor-pointer group hover:scale-[1.01]"
          style={{
            backgroundColor: 'var(--app-sidebar-card-bg)',
            borderColor: 'var(--app-sidebar-border)',
          }}
        >
          <div className="flex items-center justify-between text-[10px] font-mono font-semibold mb-1">
            <span className="flex items-center gap-1 text-amber-400">
              <Flame className="w-3 h-3 text-rose-500 animate-pulse" />
              SIGNATURE DEMO CASE
            </span>
            <span className="bg-rose-500/20 text-rose-300 px-1 rounded text-[9px] border border-rose-500/30">
              RISK 94
            </span>
          </div>
          <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors flex items-center justify-between">
            <span>MPL-1024 Community Hall</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-[10px] opacity-75 mt-0.5">
            51% Progress Gap • ₹38.4L vs ₹21L
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isSectionHeader = item.section && item.section !== currentSection;
          if (item.section) currentSection = item.section;
          const isActive = activeRoute === item.id;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.id}>
              {isSectionHeader && (
                <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider font-mono opacity-50">
                  {item.section}
                </div>
              )}
              <button
                onClick={() => {
                  setActiveRoute(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'shadow-xs font-semibold'
                    : 'hover:bg-white/10 dark:hover:bg-slate-800/80 hover:text-white'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: 'var(--app-sidebar-active-bg)',
                        color: 'var(--app-sidebar-active-text)',
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'opacity-70'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ml-1.5 ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Bottom Status Info */}
      <div
        className="p-3 border-t text-[11px] transition-colors"
        style={{
          borderColor: 'var(--app-sidebar-border)',
          backgroundColor: 'rgba(0,0,0,0.2)',
        }}
      >
        <div className="flex items-center justify-between font-mono text-[10px]">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            AI Sentinel Active
          </span>
          <span className="opacity-60">ISO/IEC 27001</span>
        </div>
        <div className="mt-1 opacity-60 text-[10px] leading-tight">
          Decision Support System. Final authority rests with authorized human officers.
        </div>
      </div>
    </aside>
  );
};
