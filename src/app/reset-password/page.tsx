'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Sun, Moon, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, Lock, KeyRound } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get('token') : null;

  const { theme, toggleTheme } = useWorkspaceStore();
  const [mounted, setMounted] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [targetUser, setTargetUser] = useState<{ name: string; email: string } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      setTokenValid(false);
      setError('Token reset password tidak ditemukan pada tautan.');
      return;
    }

    const checkToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok && data.valid) {
          setTokenValid(true);
          setTargetUser(data.user);
        } else {
          setTokenValid(false);
          setError(data.error || 'Tautan reset password sudah kadaluarsa atau tidak valid.');
        }
      } catch {
        setTokenValid(false);
        setError('Gagal memverifikasi token reset password. Periksa koneksi internet Anda.');
      } finally {
        setIsVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Gagal mereset password. Silakan coba lagi.');
      }
    } catch {
      setError('Terjadi kesalahan jaringan saat memperbarui password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen relative text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 bg-cover bg-center bg-no-repeat select-none"
      style={{ backgroundImage: `url('/background.png')` }}
    >
      {/* Background Soft Dark Overlay */}
      <div className="absolute inset-0 bg-slate-950/50 dark:bg-black/75 backdrop-blur-[2px] z-0" />

      {/* Top Header */}
      <header
        suppressHydrationWarning
        className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between py-2 px-2"
      >
        <Link href="/login" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center p-1 shrink-0 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="ODST Task Management" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-tight drop-shadow-sm">
              ODST
            </span>
            <span className="text-[11px] text-white/70 ml-1.5 font-normal">Task Management</span>
          </div>
        </Link>

        <div className="flex items-center gap-2" suppressHydrationWarning>
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs backdrop-blur-md transition-colors border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>

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

      {/* Main Card */}
      <main
        suppressHydrationWarning
        className="relative z-10 w-full max-w-md mx-auto my-auto py-6"
      >
        <div className="bg-white/95 dark:bg-[#141620]/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800/80 p-8 sm:p-10">
          
          {/* Brand Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>
          </div>

          <div className="text-center space-y-1.5 mb-6">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Set New Password
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {targetUser?.email
                ? `Create a secure new password for ${targetUser.email}`
                : 'Enter your new account password below'}
            </p>
          </div>

          {/* Verification Loading */}
          {isVerifying ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Memverifikasi token reset password...
              </p>
            </div>
          ) : success ? (
            /* Success View */
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Password Berhasil Diperbarui!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Akun Anda sekarang telah menggunakan password baru. Silakan masuk untuk mengakses workspace Anda.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                <span>Masuk Sekarang (Sign In) &rarr;</span>
              </Link>
            </div>
          ) : !tokenValid ? (
            /* Invalid / Expired Token View */
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-center justify-center mx-auto text-red-500">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tautan Tidak Valid
                </h3>
                <p className="text-xs text-red-500 dark:text-red-400 leading-relaxed">
                  {error || 'Tautan reset password sudah kadaluarsa atau tidak ditemukan.'}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all duration-150 active:scale-[0.98] cursor-pointer"
                >
                  <span>Minta Tautan Reset Baru di Login &rarr;</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white dark:bg-[#1d202b] dark:hover:bg-[#222633] dark:focus:bg-[#181a24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white dark:bg-[#1d202b] dark:hover:bg-[#222633] dark:focus:bg-[#181a24] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Menyimpan Password...' : 'Simpan Password Baru'}</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs transition-colors"
                >
                  Batal dan kembali ke Login
                </Link>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer
        suppressHydrationWarning
        className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-center text-[11px] text-white/70 py-2"
      >
        <span>ODST Task Management &bull; ODST Group Indonesia &bull; All rights reserved.</span>
      </footer>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#141620] text-white">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
