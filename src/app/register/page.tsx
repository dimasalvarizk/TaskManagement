'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sun, Moon, Download, Building2, User as UserIcon, Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function RegisterForm() {
  const {
    login,
    fetchWorkspaceData,
    theme,
    toggleTheme,
    promptInstallApp,
    isAppInstalled,
  } = useWorkspaceStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteId = searchParams ? searchParams.get('invite') || '' : '';

  const [mounted, setMounted] = useState(false);
  const [checkingInvite, setCheckingInvite] = useState(Boolean(inviteId));
  const [isInviteFlow, setIsInviteFlow] = useState(Boolean(inviteId));
  const [inviteValid, setInviteValid] = useState(false);
  const [invitedRole, setInvitedRole] = useState('Member');
  const [invitedWorkspaceName, setInvitedWorkspaceName] = useState('ODST Task Management');

  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);

    if (inviteId) {
      // Verify invite status with server
      fetch(`/api/auth/register?invite=${encodeURIComponent(inviteId)}`)
        .then((res) => res.json())
        .then((data) => {
          setCheckingInvite(false);
          if (data.success && data.inviteValid && data.invite) {
            setIsInviteFlow(true);
            setInviteValid(true);
            setName(data.invite.name || '');
            setEmail(data.invite.email || '');
            setInvitedRole(data.invite.role || 'Member');
            setInvitedWorkspaceName(data.invite.workspaceName || 'ODST Task Management');
          } else {
            setIsInviteFlow(true);
            setInviteValid(false);
          }
        })
        .catch(() => {
          setCheckingInvite(false);
          setIsInviteFlow(true);
          setInviteValid(false);
        });
    } else {
      setCheckingInvite(false);
      setIsInviteFlow(false);
    }
  }, [inviteId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          workspaceName: workspaceName.trim(),
          email: email.trim(),
          password,
          inviteId: isInviteFlow ? inviteId : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('taskflow_user', JSON.stringify(data.user));
        }
        await fetchWorkspaceData();
        router.push('/');
      } else {
        setIsLoading(false);
        setError(data.error || 'Failed to complete registration');
      }
    } catch {
      setIsLoading(false);
      setError('Network or server error during registration.');
    }
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
            <img src="/logo.png" alt="ODST Task Management" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-tight drop-shadow-sm">
              ODST
            </span>
            <span className="text-[11px] text-white/70 ml-1.5 font-normal">Task Management</span>
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
              title="Download & Install ODST Task Management (PWA)"
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

      {/* 2. Main Register / Gatekeeper Card */}
      <main
        suppressHydrationWarning
        className="relative z-10 w-full max-w-4xl mx-auto my-auto py-6"
      >
        <div className="bg-white/95 dark:bg-[#141620]/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Column: Brand Logo & Overview */}
          <div className="md:col-span-5 bg-slate-50/90 dark:bg-[#181b26]/90 p-8 sm:p-10 flex flex-col justify-between items-center text-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80">
            <div className="w-full flex justify-start">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3 h-3" />
                {isInviteFlow ? 'Private Invitation' : 'Multi-Tenant Cloud'}
              </span>
            </div>

            <div className="my-auto py-6 flex flex-col items-center space-y-4">
              {/* Logo */}
              <div className="w-24 h-24 p-2 flex items-center justify-center">
                <img
                  src="/assets/logo.png"
                  alt="Company Logo"
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>

              <div className="space-y-1.5 max-w-xs">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ODST Task Management
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isInviteFlow
                    ? `Join your team workspace on ${invitedWorkspaceName}`
                    : 'Create your private workspace with zero data leakage & dedicated team access.'}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-1.5 w-full text-left bg-white/60 dark:bg-black/20 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Strict Data & Workspace Isolation</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Invite-Only Team Security</span>
                </div>
              </div>
            </div>

            <div className="w-full text-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                v2.0 &bull; Enterprise Edition
              </span>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center" suppressHydrationWarning>
            {checkingInvite ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Verifying invitation token...</p>
              </div>
            ) : isInviteFlow && !inviteValid ? (
              /* Invalid Invite Warning Gate */
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                    Invitation Invalid or Expired
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    This invitation link could not be found or has already been used. You can sign in to your existing account or create a brand new workspace.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
                  >
                    <span>Create a New Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-all"
                  >
                    <span>Sign In to Existing Account</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Registration Form (Invite Acceptance or New Workspace) */
              <>
                <div className="space-y-1.5 mb-5">
                  <div className="flex items-center gap-1.5">
                    {isInviteFlow ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {invitedRole} Access &bull; {invitedWorkspaceName}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        Workspace Admin
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {isInviteFlow ? 'Join Your Workspace' : 'Create Your Workspace'}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isInviteFlow
                      ? `Complete your profile to join ${invitedWorkspaceName}`
                      : 'Set up your company workspace and become the Admin'}
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
                  onSubmit={handleRegister}
                  className="space-y-3.5 text-xs"
                >
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        suppressHydrationWarning
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white dark:bg-[#1d202b] dark:hover:bg-[#222633] dark:focus:bg-[#181a24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                      />
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  {!isInviteFlow && (
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        Company / Workspace Name
                      </label>
                      <div className="relative">
                        <input
                          suppressHydrationWarning
                          type="text"
                          required
                          value={workspaceName}
                          onChange={(e) => setWorkspaceName(e.target.value)}
                          placeholder="e.g. ODST Group Indonesia"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white dark:bg-[#1d202b] dark:hover:bg-[#222633] dark:focus:bg-[#181a24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                        />
                        <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Work Email
                    </label>
                    <div className="relative">
                      <input
                        suppressHydrationWarning
                        type="email"
                        required
                        readOnly={Boolean(isInviteFlow && email)}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1d202b] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none transition-all border-none ${
                          isInviteFlow ? 'cursor-not-allowed opacity-90' : 'hover:bg-slate-100/80 focus:ring-2 focus:ring-indigo-500'
                        }`}
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        suppressHydrationWarning
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white dark:bg-[#1d202b] dark:hover:bg-[#222633] dark:focus:bg-[#181a24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <button
                    suppressHydrationWarning
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
                  >
                    {isLoading
                      ? 'Creating Account...'
                      : isInviteFlow
                      ? 'Accept & Join Workspace'
                      : 'Create Workspace & Launch'}
                  </button>
                </form>

                <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* 3. Clean Minimal Footer */}
      <footer
        suppressHydrationWarning
        className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center text-[11px] text-white/70 py-2"
      >
        <span>ODST Task Management &bull; Multi-Tenant Enterprise &bull; All rights reserved.</span>
      </footer>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
