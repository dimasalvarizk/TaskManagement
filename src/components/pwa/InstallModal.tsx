'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Download, X, CheckCircle2 } from 'lucide-react';

export const InstallModal: React.FC = () => {
  const {
    isInstallModalOpen,
    setInstallModalOpen,
    pwaInstallPrompt,
    isAppInstalled,
    setIsAppInstalled,
  } = useWorkspaceStore();

  const [isPrompting, setIsPrompting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsAppInstalled(true);
      }
    }
  }, [setIsAppInstalled]);

  const effectivePrompt =
    pwaInstallPrompt || (typeof window !== 'undefined' ? (window as any).__PWA_PROMPT__ : null);

  const handleDirectInstall = async () => {
    const promptToUse = effectivePrompt;
    if (!promptToUse) return;
    setIsPrompting(true);
    try {
      await promptToUse.prompt();
      const choice = await promptToUse.userChoice;
      if (choice.outcome === 'accepted') {
        setIsAppInstalled(true);
        setInstallModalOpen(false);
        if (typeof window !== 'undefined') {
          (window as any).__PWA_PROMPT__ = null;
        }
      }
    } catch (err) {
      console.warn('Install prompt error:', err);
    } finally {
      setIsPrompting(false);
    }
  };

  if (!isInstallModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={() => setInstallModalOpen(false)}
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-[#15171e] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center p-1.5 shrink-0">
              <img src="/logo.png" alt="TaskFlow" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Install TaskFlow
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ODST Group Indonesia
              </p>
            </div>
          </div>

          <button
            onClick={() => setInstallModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Install this workspace application onto your device for faster access, offline support, and a standalone window.
        </p>

        {/* Status / Install Action */}
        {isAppInstalled ? (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Application is already installed on this device.</span>
          </div>
        ) : (
          <button
            onClick={handleDirectInstall}
            disabled={isPrompting}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isPrompting ? 'Installing...' : 'Install Application'}</span>
          </button>
        )}

        {/* Clean Minimal Hint */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500 text-center">
          You can also install via the icon in your browser address bar.
        </div>
      </div>
    </div>
  );
};
