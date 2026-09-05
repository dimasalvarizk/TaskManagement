'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Eye, EyeOff, X, Download, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const {
    loginWithPassword,
    fetchWorkspaceData,
    theme,
    toggleTheme,
    promptInstallApp,
    isAppInstalled,
  } = useWorkspaceStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch updated workspace users on mount & ensure client hydration match
  useEffect(() => {
    setMounted(true);
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await loginWithPassword(email, password);
    if (result.success) {
      router.push('/');
    } else {
      setIsLoading(false);
      setError(result.error || 'Invalid email or password');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSubmitted(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen relative text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 bg-cover bg-center bg-no-repeat select-none"
      style={{ backgroundImage: `url('/background.png')` }}
    >
      {/* Background Soft Dark Overlay */}
      <div className="absolute inset-0 bg-slate-950/45 dark:bg-black/70 backdrop-blur-[2px] z-0" />

      {/* 1. Top Clean Header Navigation Bar */}
      <header
        suppressHydrationWarning
        className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between py-2 px-2"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center p-1 shrink-0 ring-1 ring-white/20">
            <img src="/logo.png" alt="TaskFlow" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-tight drop-shadow-sm">
              TaskFlow
            </span>
            <span className="text-[11px] text-white/70 ml-1.5 font-normal">Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-2" suppressHydrationWarning>
          {/* Prominent Install / Download App Button */}
          {(!mounted || !isAppInstalled) && (
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => promptInstallApp()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer border border-indigo-400/40"
              title="Download & Install TaskFlow App (PWA)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          <button
            suppressHydrationWarning
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs backdrop-blur-md transition-colors cursor-pointer border border-white/10"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-200" />
            )}
          </button>
        </div>
      </header>

      {/* 2. Main Side-by-Side Login Card */}
      <main
        suppressHydrationWarning
        className="relative z-10 w-full max-w-3xl mx-auto my-auto py-6"
      >
        <div className="bg-white/95 dark:bg-[#141620]/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Brand Logo & Showcase */}
          <div className="bg-slate-50/90 dark:bg-[#181b26]/90 p-8 sm:p-10 flex flex-col justify-between items-center text-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80">
            <div className="w-full flex justify-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Workspace
              </span>
            </div>

            <div className="my-auto py-6 flex flex-col items-center space-y-4">
              {/* Logo */}
              <div className="w-28 h-28 p-2 flex items-center justify-center">
                <img
                  src="/assets/logo.png"
                  alt="Company Logo"
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>

              <div className="space-y-1.5 max-w-xs">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  TaskFlow
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Fast, minimal, and collaborative task management for modern teams.
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              v2.0 &bull; ODST Group Indonesia
            </div>
          </div>

          {/* Right Column: Sign In Form */}
          <div className="p-8 sm:p-10 flex flex-col justify-center" suppressHydrationWarning>
            <div className="space-y-1.5 mb-6">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sign In
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your credentials to access workspace
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs border border-red-200 dark:border-red-900/50">
                {error}
              </div>
            )}

            {/* Form */}
            <form
              suppressHydrationWarning
              onSubmit={handleLogin}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                  Email
                </label>
                <input
                  suppressHydrationWarning
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white dark:bg-[#1d202b] dark:hover:bg-[#222633] dark:focus:bg-[#181a24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-medium">
                    Password
                  </label>
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    suppressHydrationWarning
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white dark:bg-[#1d202b] dark:hover:bg-[#222633] dark:focus:bg-[#181a24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                  />
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center" suppressHydrationWarning>
                <input
                  suppressHydrationWarning
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-slate-600 dark:text-slate-400 text-xs cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              <button
                suppressHydrationWarning
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Workspace access is invite-only by Administrators.
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          suppressHydrationWarning
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#181b26] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Reset Password
              </h3>
              <button
                suppressHydrationWarning
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Password reset link has been sent to <strong>{forgotEmail}</strong>
                </p>
              </div>
            ) : (
              <form
                suppressHydrationWarning
                onSubmit={handleForgotSubmit}
                className="space-y-3 text-xs"
              >
                <p className="text-slate-500 dark:text-slate-400">
                  Enter your email address to receive password reset instructions.
                </p>
                <div>
                  <input
                    suppressHydrationWarning
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1d202b] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 border-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    suppressHydrationWarning
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium cursor-pointer"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. Clean Minimal Footer */}
      <footer
        suppressHydrationWarning
        className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center text-[11px] text-white/70 py-2"
      >
        <span>TaskFlow Workspace &bull; ODST Group Indonesia &bull; All rights reserved.</span>
      </footer>
    </div>
  );
}
