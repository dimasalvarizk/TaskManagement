'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { X, Mail, ArrowLeft, ExternalLink } from 'lucide-react';

export const EmailPreviewModal: React.FC = () => {
  const {
    sentEmails,
    isEmailInspectorOpen,
    setEmailInspectorOpen,
    activeEmailPreview,
    setActiveEmailPreview
  } = useWorkspaceStore();

  const [mobileView, setMobileView] = useState<'list' | 'preview'>('list');

  if (!isEmailInspectorOpen) return null;

  const currentEmail = activeEmailPreview || sentEmails[0];

  const handleSelectEmail = (em: typeof sentEmails[0]) => {
    setActiveEmailPreview(em);
    setMobileView('preview');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-[#16181f] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] max-h-[600px] text-xs select-none">
        {/* 1. Sent Emails Outbox List (Hidden on mobile when viewing preview) */}
        <div
          className={`w-full md:w-72 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#12141a] p-4 space-y-3 shrink-0 flex flex-col justify-between ${
            mobileView === 'preview' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" /> Sent Emails ({sentEmails.length})
              </h3>
              <button
                onClick={() => setEmailInspectorOpen(false)}
                className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3">
              System notifications and invitation dispatch logs.
            </p>

            <div className="space-y-1.5 overflow-y-auto max-h-[calc(85vh-160px)] md:max-h-[460px]">
              {sentEmails.map((em) => (
                <button
                  key={em.id}
                  onClick={() => handleSelectEmail(em)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    currentEmail?.id === em.id
                      ? 'bg-white dark:bg-slate-800 border-indigo-500 font-medium text-slate-900 dark:text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="font-medium truncate text-[11px]">{em.subject}</div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                    <span className="truncate">{em.to}</span>
                    <span>{em.sentAt}</span>
                  </div>
                </button>
              ))}

              {sentEmails.length === 0 && (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No sent emails yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Live Email HTML Inspector (Hidden on mobile when viewing list) */}
        <div
          className={`flex-1 flex flex-col justify-between overflow-hidden bg-slate-100 dark:bg-[#0f1117] ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#16181f]">
            <div className="flex items-center gap-2 min-w-0">
              {/* Back to list on mobile */}
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white shrink-0"
                title="Back to list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
                  {currentEmail ? currentEmail.subject : 'No email selected'}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate">
                  To: {currentEmail?.to}
                </div>
              </div>
            </div>

            <button
              onClick={() => setEmailInspectorOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* HTML Render Container */}
          <div className="flex-1 p-3 sm:p-5 overflow-y-auto">
            {currentEmail ? (
              <div
                className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs overflow-auto"
                dangerouslySetInnerHTML={{ __html: currentEmail.html }}
              />
            ) : (
              <div className="py-20 text-center text-slate-400 dark:text-slate-500 text-xs">
                Select an email from the list to preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
