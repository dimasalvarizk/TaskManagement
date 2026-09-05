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
                Standalone desktop & mobile app, works seamlessly offline & online.
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

        {/* Quick Benefits Pills */}
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-around text-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <WifiOff className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Offline Access</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Fast & Native</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col items-center gap-1">
            <Laptop className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Window Mode</span>
          </div>
        </div>

        {/* 1-Click Install Button if Prompt Ready */}
        {effectivePrompt && !isAppInstalled && (
          <div className="p-4 mx-5 my-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-xs text-indigo-950 dark:text-indigo-200">
                Browser Supports 1-Click Installation
              </div>
              <div className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                Click the button below to install TaskFlow directly to your system.
              </div>
            </div>
            <button
              onClick={handleDirectInstall}
              disabled={isPrompting}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isPrompting ? 'Installing...' : 'Install Now'}</span>
            </button>
          </div>
        )}

        {/* Standalone Status */}
        {isAppInstalled && (
          <div className="p-3 mx-5 my-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>TaskFlow is already installed and ready from your system application menu.</span>
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
              <span>PC / Mac (Chrome & Edge)</span>
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
                  How to Install on Google Chrome / Microsoft Edge:
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        Click the Install Icon in the URL Address Bar
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Look at the right side of the browser URL bar (next to the bookmark star), click the screen icon with down arrow{' '}
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
                        Or via the Three-Dot Menu (⋮)
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Click the <strong className="text-slate-700 dark:text-slate-300">⋮</strong> menu at top right &gt; select{' '}
                        <strong className="text-slate-700 dark:text-slate-300">"Save and share" / "Apps"</strong> &gt; click{' '}
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
                        Click "Install" in the browser confirmation prompt
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        TaskFlow will launch immediately in an independent, distraction-free desktop window with an icon on your Desktop/Start Menu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'android' && (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white text-xs">
                  How to Install on Android Phone / Tablet:
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      Open TaskFlow in <strong>Google Chrome</strong> or your default browser.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      Tap the <strong className="text-slate-800 dark:text-slate-200">three-dot menu (⋮)</strong> in the top right corner.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      Select <strong className="text-indigo-600 dark:text-indigo-400">"Install app"</strong> or <strong className="text-indigo-600 dark:text-indigo-400">"Add to Home screen"</strong>.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ios' && (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white text-xs">
                  How to Install on iOS (iPhone / iPad):
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      Open TaskFlow in the <strong>Safari</strong> browser.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      Tap the <strong>Share</strong> button (square icon with an upward arrow) in the bottom toolbar.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      Scroll down and tap <strong className="text-indigo-600 dark:text-indigo-400">"Add to Home Screen"</strong>, then tap <strong>Add</strong> at top right.
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
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
