import React, { useState } from 'react';
import { useAuth, ROLE_PROFILES } from '../context/AuthContext';
import { useTheme, THEME_OPTIONS } from '../context/ThemeContext';
import { UserRole } from '../types/mplads';
import { IndianFlag } from './IndianFlag';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Palette,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { TirangaFlagIcon, AshokaChakraIcon } from './Header';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { currentTheme, setTheme } = useTheme();

  const [email, setEmail] = useState<string>('dm.bankura@gov.in');
  const [password, setPassword] = useState<string>('SecureGov@2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [showDemoProfiles, setShowDemoProfiles] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your official Email or Gmail address');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      login({ email, password });
      setIsLoading(false);
    }, 600);
  };

  const handleQuickFill = (roleKey: UserRole) => {
    const profile = ROLE_PROFILES[roleKey];
    setEmail(profile.email);
    setPassword('SecureGov@2026');
    setErrorMsg('');
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      login({ email: 'officer.nic@gmail.com', password: 'google-oauth-token' });
      setIsLoading(false);
    }, 700);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between transition-colors relative"
      style={{
        backgroundColor: 'var(--app-topbar-bg)',
        color: 'var(--app-topbar-text)',
      }}
    >
      {/* Indian Flag Top Ribbon */}
      <div className="tiranga-top-strip" />

      {/* Top Bar */}
      <header
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
            <span className="text-[10px] opacity-70 mr-1 font-medium">Theme:</span>
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
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
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="theme-surface theme-text rounded-3xl shadow-2xl border theme-border w-full max-w-lg p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Brand Header with Indian Flag beside TEAM DRISHTI */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3.5">
              <IndianFlag className="w-12 h-8 rounded-sm shadow-md" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight theme-text font-sans">
                TEAM <span style={{ color: 'var(--app-brand-highlight)' }}>DRISHTI</span>
              </h1>
            </div>
            <p className="text-xs theme-text-secondary font-medium max-w-sm mx-auto">
              National AI Monitoring & Predictive Risk Intelligence Platform
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>e-Pramaan Single Sign-On • e-Office 7.0 Standard</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Gmail Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold theme-text uppercase tracking-wider font-mono">
                Email Address / Gmail
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com or officer@gov.in"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border theme-border theme-surface theme-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold theme-text uppercase tracking-wider font-mono">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border theme-border theme-surface theme-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="theme-text-secondary font-medium">Keep me signed in on this workstation</span>
              </label>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 disabled:opacity-60 active:scale-[0.99]"
              style={{
                backgroundColor: 'var(--app-brand-accent)',
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Continue with Google / Gmail divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t theme-border w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-mono absolute">
              or continue with
            </span>
          </div>

          {/* Continue with Gmail / Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border theme-border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold theme-text cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google / Gmail ID</span>
          </button>

          {/* Quick Demo Credentials Assistant */}
          <div className="border-t theme-border pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Quick-Fill Demo Officer Credentials:
              </span>
              <button
                type="button"
                onClick={() => setShowDemoProfiles(!showDemoProfiles)}
                className="text-[10px] text-blue-600 hover:underline font-semibold"
              >
                {showDemoProfiles ? 'Hide Profiles' : 'Show Profiles'}
              </button>
            </div>

            {showDemoProfiles && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {(Object.keys(ROLE_PROFILES) as UserRole[]).map((roleKey) => {
                  const profile = ROLE_PROFILES[roleKey];
                  const isSelected = email === profile.email;
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleQuickFill(roleKey)}
                      className={`p-2 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                          : 'theme-border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold truncate text-[11px]">{profile.badge}</div>
                      <div className="text-[10px] text-slate-400 truncate">{profile.email}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-center text-[10px] theme-text-muted font-mono pt-1">
            NIC Single Sign-On (SSO) • 256-bit Encrypted Session • MoSPI Government Telemetry
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border theme-border space-y-4">
            <div className="flex items-center gap-2.5 text-blue-600">
              <Info className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                MoSPI Credential Recovery
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In this preview environment, all demo accounts share the password{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-blue-600">
                SecureGov@2026
              </code>
              . You can also type any custom Gmail or official email to log in directly.
            </p>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className="p-4 text-center text-xs opacity-75 border-t transition-colors"
        style={{ borderColor: 'var(--app-sidebar-border)' }}
      >
        © 2024-2026 Ministry of Statistics and Programme Implementation (MoSPI), Government of India.
      </footer>
    </div>
  );
};
