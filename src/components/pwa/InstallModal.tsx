'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import {
  Download,
  X,
  Laptop,
  Smartphone,
  Apple,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  WifiOff,
  Zap,
} from 'lucide-react';

export const InstallModal: React.FC = () => {
  const {
    isInstallModalOpen,
    setInstallModalOpen,
    pwaInstallPrompt,
    isAppInstalled,
    setIsAppInstalled,
  } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState<'desktop' | 'android' | 'ios'>('desktop');
  const [isPrompting, setIsPrompting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsAppInstalled(true);
      }

      // Auto-detect user OS
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setActiveTab('ios');
      } else if (/android/.test(userAgent)) {
        setActiveTab('android');
      } else {
        setActiveTab('desktop');
      }
    }
  }, [setIsAppInstalled]);

  if (!isInstallModalOpen) return null;

  const handleDirectInstall = async () => {
    if (!pwaInstallPrompt) return;
    setIsPrompting(true);
    try {
      await pwaInstallPrompt.prompt();
      const choice = await pwaInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsAppInstalled(true);
        setInstallModalOpen(false);
      }
    } catch (err) {
      console.warn('Install prompt error:', err);
    } finally {
      setIsPrompting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setInstallModalOpen(false)}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#15171e] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center p-1.5 shrink-0">
              <img src="/logo.png" alt="TaskFlow" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                Install TaskFlow Workspace
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  PWA App
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aplikasi desktop & mobile mandiri, bekerja lancar offline & online.
              </p>
            </div>
          </div>
          <button
            onClick={() => setInstallModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Benefits Pills */}
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-around text-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <WifiOff className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Akses Offline</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Cepat & Ringan</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col items-center gap-1">
            <Laptop className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Jendela Mandiri</span>
          </div>
        </div>

        {/* 1-Click Install Button if Prompt Ready */}
        {pwaInstallPrompt && !isAppInstalled && (
          <div className="p-4 mx-5 my-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-xs text-indigo-950 dark:text-indigo-200">
                Browser Mendukung Instalasi Langsung
              </div>
              <div className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                Klik tombol untuk memasang TaskFlow ke komputer / HP Anda sekarang.
              </div>
            </div>
            <button
              onClick={handleDirectInstall}
              disabled={isPrompting}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isPrompting ? 'Memasang...' : 'Install Sekarang'}</span>
            </button>
          </div>
        )}

        {/* Standalone Status */}
        {isAppInstalled && (
          <div className="p-3 mx-5 my-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>TaskFlow sudah terpasang dan siap digunakan dari daftar aplikasi perangkat Anda.</span>
          </div>
        )}

        {/* OS / Platform Tabs */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'desktop'
                  ? 'bg-white dark:bg-[#1f232d] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>PC / Laptop (Chrome & Edge)</span>
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'android'
                  ? 'bg-white dark:bg-[#1f232d] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'ios'
                  ? 'bg-white dark:bg-[#1f232d] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iPhone / iPad (iOS)</span>
            </button>
          </div>

          {/* Guide Content */}
          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            {activeTab === 'desktop' && (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white text-xs">
                  Cara Pasang di Google Chrome / Microsoft Edge:
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        Klik Ikon Install di Baris Alamat (Address Bar URL)
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Lihat ke pojok kanan atas bilah alamat URL browser (sebelah ikon bintang bookmark), klik ikon monitor dengan panah ke bawah{' '}
                        <strong className="text-slate-700 dark:text-slate-300">"Install TaskFlow"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        Atau melalui Menu Titik Tiga (⋮)
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Klik menu <strong className="text-slate-700 dark:text-slate-300">⋮</strong> di pojok kanan atas Chrome &gt; pilih{' '}
                        <strong className="text-slate-700 dark:text-slate-300">"Simpan dan bagikan" / "Aplikasi"</strong> &gt; klik{' '}
                        <strong className="text-indigo-600 dark:text-indigo-400">"Install TaskFlow"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        Klik "Install" pada popup konfirmasi browser
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Aplikasi TaskFlow akan langsung terbuka di jendela desktop terpisah dan ikonnya muncul di Desktop / Start Menu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'android' && (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white text-xs">
                  Cara Pasang di HP Android:
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      Buka aplikasi TaskFlow di Google Chrome atau browser bawaan.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      Tap ikon menu <strong className="text-slate-800 dark:text-slate-200">titik tiga (⋮)</strong> di sudut kanan atas.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      Pilih <strong className="text-indigo-600 dark:text-indigo-400">"Install aplikasi"</strong> atau <strong className="text-indigo-600 dark:text-indigo-400">"Tambahkan ke Layar Utama"</strong>.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ios' && (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white text-xs">
                  Cara Pasang di Safari (iPhone / iPad):
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      Buka aplikasi TaskFlow di browser <strong>Safari</strong>.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      Tap tombol <strong>Share / Bagikan</strong> (ikon kotak dengan panah ke atas) di bar bawah Safari.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      Gulir ke bawah dan tap <strong className="text-indigo-600 dark:text-indigo-400">"Add to Home Screen" (Tambah ke Layar Utama)</strong> lalu tap <strong>Add</strong> di kanan atas.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#181a24] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            TaskFlow Progressive Web Application
          </div>
          <button
            onClick={() => setInstallModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer"
          >
            Mengerti, Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
