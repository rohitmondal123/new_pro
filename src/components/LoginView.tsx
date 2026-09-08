import React from 'react';
import { useAuth, ROLE_PROFILES } from '../context/AuthContext';
import { useTheme, THEME_OPTIONS } from '../context/ThemeContext';
import { UserRole } from '../types/mplads';
import { ShieldAlert, ArrowRight, Palette } from 'lucide-react';
import { TirangaFlagIcon, AshokaChakraIcon } from './Header';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { currentTheme, setTheme } = useTheme();

  return (
    <div
      className="min-h-screen flex flex-col justify-between transition-colors"
      style={{
        backgroundColor: 'var(--app-topbar-bg)',
        color: 'var(--app-topbar-text)',
      }}
    >
      {/* Indian Flag Top Ribbon */}
      <div className="tiranga-top-strip" />

      {/* Top Bar */}
      <div
        className="px-6 py-3 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--app-sidebar-border)' }}
      >
        <div className="flex items-center gap-2.5 text-xs font-semibold">
          <TirangaFlagIcon className="w-5 h-3.5" />
          <span>भारत सरकार | Government of India — MoSPI</span>
          <AshokaChakraIcon className="w-3.5 h-3.5 text-blue-300 ml-1 hidden sm:inline-block" color="#93C5FD" />
        </div>
        <div className="flex items-center gap-3">
          {/* Quick theme swatches */}
          <div className="hidden sm:flex items-center gap-1.5 bg-black/25 px-3 py-1 rounded-full border border-white/10">
            <Palette className="w-3.5 h-3.5 opacity-70" />
            <span className="text-[10px] opacity-70 mr-1 font-medium">Palette:</span>
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.name}
                className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                  currentTheme === t.id
                    ? 'border-white scale-110 shadow-xs ring-1 ring-white/50'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: t.accentColor }}
              />
            ))}
          </div>

          <span
            className="text-xs font-mono px-2 py-0.5 rounded border"
            style={{
              backgroundColor: 'var(--app-topbar-badge-bg)',
              color: 'var(--app-topbar-badge-text)',
              borderColor: 'var(--app-sidebar-border)',
            }}
          >
            TIRANGA GOV EDITION
          </span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="theme-surface theme-text rounded-3xl shadow-2xl border theme-border w-full max-w-xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <div
              className="w-14 h-14 rounded-2xl text-white flex items-center justify-center mx-auto shadow-md border"
              style={{
                backgroundColor: 'var(--app-brand-logo-bg)',
                borderColor: 'var(--app-sidebar-border)',
              }}
            >
              <ShieldAlert className="w-8 h-8" style={{ color: 'var(--app-brand-highlight)' }} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight theme-text">
              MPLADS <span style={{ color: 'var(--app-brand-highlight)' }}>SENTINEL</span>
            </h1>
            <p className="text-xs theme-text-secondary">
              National AI Monitoring & Predictive Risk Intelligence Platform
            </p>
          </div>

          <div className="border-t theme-border pt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center font-mono">
              Select Role Persona to Enter Command Center
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(ROLE_PROFILES) as UserRole[]).map((roleKey) => {
                const profile = ROLE_PROFILES[roleKey];
                return (
                  <button
                    key={roleKey}
                    onClick={() => login(roleKey)}
                    className="p-3 rounded-xl border theme-border hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase border"
                          style={{
                            backgroundColor: 'var(--app-pill-bg)',
                            color: 'var(--app-pill-text)',
                            borderColor: 'var(--app-pill-border)',
                          }}
                        >
                          {profile.badge}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="text-xs font-bold theme-text mt-1.5">{profile.name}</div>
                      <div className="text-[11px] theme-text-secondary truncate">{profile.designation}</div>
                    </div>
                    <div className="text-[10px] theme-text-muted mt-2 font-mono">{profile.district}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center text-[11px] theme-text-muted font-mono pt-2">
            NIC Single Sign-On (SSO) • e-Office 7.0 Standard Enforced
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="p-4 text-center text-xs opacity-60 border-t"
        style={{ borderColor: 'var(--app-sidebar-border)' }}
      >
        © 2024-2026 Ministry of Statistics and Programme Implementation (MoSPI), Government of India.
      </div>
    </div>
  );
};
