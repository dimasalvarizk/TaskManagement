'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useRouter } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const { inviteUser, login, fetchWorkspaceData, theme, toggleTheme } = useWorkspaceStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchWorkspaceData();
        login(email);
        router.push('/');
      } else {
        setIsLoading(false);
        setError(data.error || 'Failed to register account');
      }
    } catch {
      setIsLoading(false);
      setError('Registration error. Please check server.');
    }
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

      {/* Main Side-by-Side Register Card (Flat & Borderless, No Shadow) */}
      <div className="relative z-10 w-full max-w-3xl mx-auto my-auto py-4">
        <div className="bg-white/95 dark:bg-[#141620]/95 backdrop-blur-md rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Brand Logo Section */}
          <div className="bg-slate-50/90 dark:bg-[#181b26]/90 p-8 sm:p-10 flex flex-col justify-between items-center text-center">
            <div className="w-full flex justify-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                New Workspace
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

              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  DST TaskFlow
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                  Enterprise Task & Document Workspace for ODST Group Indonesia
                </p>
              </div>
            </div>

            <div className="w-full text-center">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                v2.0 &bull; Fast & Minimal
              </span>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            <div className="space-y-1.5 mb-6">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Create Workspace
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register an administrator account for your team
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white dark:bg-[#1d202b] dark:hover:bg-[#222633] dark:focus:bg-[#181a24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white dark:bg-[#1d202b] dark:hover:bg-[#222633] dark:focus:bg-[#181a24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white dark:bg-[#1d202b] dark:hover:bg-[#222633] dark:focus:bg-[#181a24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors disabled:opacity-60 flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                {isLoading ? 'Creating account...' : 'Create & Get Started'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Theme Toggle */}
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
