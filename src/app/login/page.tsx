'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Eye, EyeOff, X } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { login, loginWithPassword, fetchWorkspaceData, theme, toggleTheme } = useWorkspaceStore();
  const router = useRouter();

  const [email, setEmail] = useState('admin@taskflow.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch updated workspace users on mount
  React.useEffect(() => {
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
      setError(result.error || 'Invalid email or password. You can use admin@taskflow.io');
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
      className="min-h-screen relative text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 bg-cover bg-center bg-no-repeat select-none"
      style={{ backgroundImage: `url('/background.png')` }}
    >
      {/* Background Soft Dark Overlay */}
      <div className="absolute inset-0 bg-slate-950/40 dark:bg-black/65 backdrop-blur-[2px] z-0" />

      {/* Top Spacer */}
      <div className="relative z-10 w-full max-w-5xl mx-auto h-6" />

      {/* Main Side-by-Side Login Card (Borderless, Flat, No Shadow) */}
      <div className="relative z-10 w-full max-w-3xl mx-auto my-auto py-4">
        <div className="bg-white/95 dark:bg-[#141620]/95 backdrop-blur-md rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Brand Logo & Showcase */}
          <div className="bg-slate-50/90 dark:bg-[#181b26]/90 p-8 sm:p-10 flex flex-col justify-between items-center text-center">
            <div className="w-full flex justify-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Workspace
              </span>
            </div>

            <div className="my-auto py-6 flex flex-col items-center space-y-4">
              {/* Logo (No Border, No Shadow) */}
              <div className="w-28 h-28 p-2 flex items-center justify-center">
                <img
                  src="/assets/logo.png"
                  alt="Company Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1.5 max-w-xs">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  TaskFlow
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Fast, minimal, and collaborative task management for modern teams.
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 dark:text-slate-500">
              v2.0 &bull; Secure Cloud Workspace
            </div>
          </div>

          {/* Right Column: Sign In Form (Borderless & Clean) */}
          <div className="p-8 sm:p-10 flex flex-col justify-center">
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
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                  Email
                </label>
                <input
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
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white dark:bg-[#1d202b] dark:hover:bg-[#222633] dark:focus:bg-[#181a24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-indigo-600 bg-slate-100 dark:bg-slate-800 border-none focus:ring-indigo-500"
                  />
                  <span className="text-slate-600 dark:text-slate-400">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Don't have a workspace?{' '}
              <Link
                href="/register"
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                Create new workspace
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#161822] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
                Reset Password
              </h2>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs">
                Password reset link has been sent to <strong>{forgotEmail}</strong>.
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
                <p className="text-slate-600 dark:text-slate-400">
                  Enter your email address to receive password reset instructions.
                </p>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Email
                  </label>
                  <input
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
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
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

      {/* Clean Minimal Footer with Theme Switch */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between text-[11px] text-white/80 py-2">
        <span>TaskFlow Workspace &bull; All rights reserved.</span>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-white text-xs backdrop-blur-xs transition-colors cursor-pointer border-none"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
