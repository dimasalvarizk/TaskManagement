'use client';

import React, { useEffect, useState } from 'react';
import { Download, WifiOff, CheckCircle2, X } from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { InstallModal } from './InstallModal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaManager: React.FC = () => {
  const {
    fetchWorkspaceData,
    setPwaInstallPrompt,
    setIsAppInstalled,
    isAppInstalled,
    pwaInstallPrompt,
    promptInstallApp,
  } = useWorkspaceStore();

  const [isOffline, setIsOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [dismissInstallBanner, setDismissInstallBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Check initial online status
      setIsOffline(!navigator.onLine);

      const handleOnline = () => {
        setIsOffline(false);
        setShowOnlineToast(true);
        fetchWorkspaceData();
        setTimeout(() => setShowOnlineToast(false), 4000);
      };

      const handleOffline = () => {
        setIsOffline(true);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // 2. Check standalone mode
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsAppInstalled(true);
      }

      // 3. Register Service Worker unconditionally
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      }

      // 4. Listen for PWA Install Prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setPwaInstallPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // 5. Listen for appinstalled
      const handleAppInstalled = () => {
        setIsAppInstalled(true);
        setPwaInstallPrompt(null);
        console.log('[PWA] TaskFlow successfully installed!');
      };

      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, [fetchWorkspaceData, setIsAppInstalled, setPwaInstallPrompt]);

  return (
    <>
      {/* 1. Offline Mode Banner */}
      {isOffline && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm p-3 rounded-xl bg-amber-500/95 text-slate-950 font-medium text-xs shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span className="truncate">Offline Mode — Data disimpan lokal di perangkat.</span>
          </div>
        </div>
      )}

      {/* 2. Re-connected Online Toast */}
      {showOnlineToast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm p-3 rounded-xl bg-emerald-600 text-white font-medium text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
          <span>Kembali Online — Sinkronisasi dengan database...</span>
        </div>
      )}

      {/* 3. Floating Quick Install Banner */}
      {pwaInstallPrompt && !isAppInstalled && !dismissInstallBanner && !isOffline && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm p-3.5 rounded-2xl bg-white dark:bg-[#181a24] border border-slate-200 dark:border-neutral-800 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 p-1 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
              <img src="/logo.png" alt="TaskFlow" className="w-6 h-6 object-contain" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                Install TaskFlow App
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                Akses cepat, mode offline & desktop window
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => promptInstallApp()}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setDismissInstallBanner(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Complete Step-by-Step PWA Install Guide Modal */}
      <InstallModal />
    </>
  );
};
