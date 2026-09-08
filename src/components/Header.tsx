import React, { useState } from 'react';
import { useAuth, ROLE_PROFILES } from '../context/AuthContext';
import { useTheme, THEME_OPTIONS, ThemeId } from '../context/ThemeContext';
import { UserRole } from '../types/mplads';
import { IndianFlag } from './IndianFlag';
import {
  ShieldAlert,
  Bell,
  Search,
  Sparkles,
  UserCheck,
  ChevronDown,
  LogOut,
  Palette,
  Check,
  Flame,
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export const AshokaChakraIcon: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-4 h-4',
  color = '#000080',
}) => {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.2" fill={color} />
      {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165].map((deg) => (
        <line
          key={deg}
          x1="12"
          y1="2"
          x2="12"
          y2="22"
          stroke={color}
          strokeWidth="0.8"
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="0.8" strokeDasharray="1.2 1.4" />
    </svg>
  );
};

export const TirangaFlagIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-3.5' }) => (
  <span
    className={`inline-flex flex-col rounded-xs overflow-hidden shadow-2xs border border-black/15 shrink-0 ${className}`}
    title="National Flag of India (तिरंगा)"
  >
    <span className="w-full h-1/3 bg-[#FF671F]" />
    <span className="w-full h-1/3 bg-white relative flex items-center justify-center">
      <span className="w-1.5 h-1.5 rounded-full border-[0.6px] border-[#000080] flex items-center justify-center">
        <span className="w-0.5 h-0.5 rounded-full bg-[#000080]" />
      </span>
    </span>
    <span className="w-full h-1/3 bg-[#138808]" />
  </span>
);

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications, unreadCount = 0 }) => {
  const {
    currentUser,
    currentRole,
    setRole,
    setActiveRoute,
    openProjectDetail,
    globalSearch,
    setGlobalSearch,
    logout,
    triggerRiskAlert,
  } = useAuth();

  const { currentTheme, setTheme, themeConfig } = useTheme();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
    setRoleDropdownOpen(false);
  };

  const handleThemeSelect = (themeId: ThemeId) => {
    setTheme(themeId);
    setThemeDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.toUpperCase().includes('1024') || globalSearch.toUpperCase().includes('MPL-1024')) {
      openProjectDetail('MPL-1024');
    } else {
      setActiveRoute('projects');
    }
  };

  return (
    <header className="sticky top-0 z-40 theme-surface border-b theme-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Indian National Flag Tricolor Ribbon Strip */}
      <div className="tiranga-top-strip" />

      {/* Top Government Strip */}
      <div
        className="text-xs px-4 py-1.5 flex items-center justify-between border-b transition-colors"
        style={{
          backgroundColor: 'var(--app-topbar-bg)',
          color: 'var(--app-topbar-text)',
          borderColor: 'var(--app-topbar-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-medium">
            <TirangaFlagIcon className="w-5 h-3.5" />
            <span className="font-semibold tracking-wide flex items-center gap-1.5">
              <span>भारत सरकार</span>
              <span className="opacity-40">|</span>
              <span>Government of India</span>
            </span>
            <AshokaChakraIcon className="w-3.5 h-3.5 text-blue-300 ml-1 inline-block" color="#93C5FD" />
          </div>
          <span className="opacity-30">|</span>
          <span className="hidden sm:inline opacity-85 text-[11px]">
            Ministry of Statistics and Programme Implementation (MoSPI)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span
            className="px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] border flex items-center gap-1.5"
            style={{
              backgroundColor: 'rgba(255, 103, 31, 0.18)',
              color: '#FED7AA',
              borderColor: 'rgba(255, 103, 31, 0.4)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-pulse" />
            <span>सत्यमेव जयते • TIRANGA EDITION</span>
          </span>
          <span className="hidden md:inline font-mono opacity-70">
            MoSPI • v2.4
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveRoute('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="shrink-0 transition-transform group-hover:scale-105">
              <IndianFlag className="w-10 h-7 rounded-xs shadow-md border border-slate-300/80 dark:border-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg theme-text font-sans">
                  TEAM <span style={{ color: 'var(--app-brand-highlight)' }}>DRISHTI</span>
                </span>
                <span
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1"
                  style={{
                    backgroundColor: 'var(--app-pill-bg)',
                    color: 'var(--app-pill-text)',
                    borderColor: 'var(--app-pill-border)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#138808]" />
                  AI Early Warning
                </span>
              </div>
              <p className="text-[11px] theme-text-secondary font-medium hidden sm:block leading-tight">
                AI-Powered Project Risk & Predictive Fund Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Global Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md mx-2 relative items-center"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search work ID (e.g. MPL-1024), district, MP or vendor..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full theme-surface-subtle theme-text text-xs pl-9 pr-24 py-2 rounded-lg border theme-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => openProjectDetail('MPL-1024')}
            className="absolute right-1.5 text-[10px] px-2 py-1 rounded font-medium border transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--app-pill-bg)',
              color: 'var(--app-pill-text)',
              borderColor: 'var(--app-pill-border)',
            }}
          >
            Demo MPL-1024
          </button>
        </form>

        {/* Actions, Theme Switcher & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Ask AI Button */}
          <button
            onClick={() => setActiveRoute('ai-assistant')}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg shadow-xs border transition-all cursor-pointer hover:opacity-95"
            style={{
              backgroundColor: 'var(--app-brand-accent)',
              color: 'var(--app-brand-accent-text)',
              borderColor: 'var(--app-brand-accent)',
            }}
            title="Open Natural Language MPLADS AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            <span className="hidden sm:inline">Ask MPLADS AI</span>
          </button>

          {/* Interface Color / Theme Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setThemeDropdownOpen(!themeDropdownOpen);
                setRoleDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg border theme-border theme-surface-subtle hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Change Interface Color Theme"
            >
              <div className="flex items-center gap-0.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-800 shadow-2xs shrink-0"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                />
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-800 shadow-2xs -ml-1.5 shrink-0"
                  style={{ backgroundColor: themeConfig.accentColor }}
                />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider leading-none">Theme</span>
                <span className="text-xs font-bold theme-text leading-tight">{themeConfig.name.split(' ')[0]}</span>
              </div>
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Theme Selector Popover */}
            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 theme-surface rounded-xl shadow-2xl border theme-border py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b theme-border flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Interface Color Theme
                    </p>
                    <p className="text-xs theme-text font-medium">
                      Select your preferred executive palette
                    </p>
                  </div>
                  <Palette className="w-4 h-4 text-blue-600" />
                </div>
                <div className="p-2 space-y-1.5 max-h-80 overflow-y-auto">
                  {THEME_OPTIONS.map((theme) => {
                    const isSelected = currentTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeSelect(theme.id)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 shadow-2xs'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="flex items-center gap-1 mt-0.5 shrink-0">
                            <span
                              className="w-4 h-4 rounded-full border border-white dark:border-slate-800 shadow-xs"
                              style={{ backgroundColor: theme.primaryColor }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-white dark:border-slate-800 shadow-xs -ml-2"
                              style={{ backgroundColor: theme.accentColor }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold theme-text flex items-center gap-2">
                              <span>{theme.name}</span>
                              {theme.isDark && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono font-normal">
                                  DARK
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight truncate">
                              {theme.tagline}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Trigger High Risk Alert button */}
          <button
            type="button"
            onClick={triggerRiskAlert}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Trigger High-Risk Project Alert Pop-up"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="text-[11px] font-mono">Risk Alert</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg theme-text hover:bg-slate-100 dark:hover:bg-slate-800 border theme-border transition-colors cursor-pointer"
            title="View Active Risk Signals & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Role Persona Switcher (Crucial for Demo / Hackathon) */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setThemeDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border theme-border theme-surface-subtle hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
            >
              <div
                className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: 'var(--app-brand-accent)' }}
              >
                {currentUser.name.slice(0, 1)}
              </div>
              <div className="hidden lg:block text-left pr-1">
                <div className="text-xs font-bold theme-text leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight flex items-center gap-1">
                  <span style={{ color: 'var(--app-brand-highlight)' }}>{currentUser.badge}</span>
                  <span className="opacity-40">•</span>
                  <span>{currentUser.district}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Role Switcher Menu */}
            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 theme-surface rounded-xl shadow-2xl border theme-border py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b theme-border">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Switch Active User Persona
                  </p>
                  <p className="text-xs theme-text font-medium">
                    Test role-based access & permissions instantly
                  </p>
                </div>
                <div className="py-1 max-h-72 overflow-y-auto">
                  {(Object.keys(ROLE_PROFILES) as UserRole[]).map((roleKey) => {
                    const profile = ROLE_PROFILES[roleKey];
                    const isSelected = currentRole === roleKey;
                    return (
                      <button
                        key={roleKey}
                        onClick={() => handleRoleSelect(roleKey)}
                        className={`w-full text-left px-3 py-2 flex items-start gap-2.5 text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-slate-800/80 theme-text font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <UserCheck
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                          }`}
                        />
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{profile.badge}</span>
                            {isSelected && (
                              <span
                                className="text-[9px] text-white px-1.5 py-0.2 rounded font-mono"
                                style={{ backgroundColor: 'var(--app-brand-accent)' }}
                              >
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] theme-text font-normal">
                            {profile.name}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {profile.designation}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="px-3 pt-2 mt-1 border-t theme-border flex items-center justify-between">
                  <button
                    onClick={logout}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">
                    NIC Security ID: 88921
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
