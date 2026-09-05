'use client';

import React, { useEffect, useState } from 'react';
import { Download, WifiOff, CheckCircle2, X } from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { InstallModal } from './InstallModal';

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

      // 4. Check early captured prompt and listen for new ones
      if ((window as any).__PWA_PROMPT__) {
        setPwaInstallPrompt((window as any).__PWA_PROMPT__);
      }

      const handlePromptCaptured = () => {
        if ((window as any).__PWA_PROMPT__) {
          setPwaInstallPrompt((window as any).__PWA_PROMPT__);
        }
      };
      window.addEventListener('pwa-prompt-captured', handlePromptCaptured);

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        (window as any).__PWA_PROMPT__ = e;
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
            <span className="truncate">Offline Mode — Local data stored on this device.</span>
          </div>
        </div>
      )}

      {/* 2. Re-connected Online Toast */}
      {showOnlineToast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm p-3 rounded-xl bg-emerald-600 text-white font-medium text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
          <span>Back Online — Synchronizing with database...</span>
        </div>
      )}

      {/* 3. Install Dialog */}
      <InstallModal />
    </>
  );
};
