'use client';

import React, { useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';

export const ConfirmModal: React.FC = () => {
  const { confirmModal, closeConfirmModal } = useWorkspaceStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirmModal?.isOpen) {
        closeConfirmModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmModal, closeConfirmModal]);

  if (!confirmModal || !confirmModal.isOpen) return null;

  const {
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
  } = confirmModal;

  const handleConfirm = () => {
    onConfirm();
    closeConfirmModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={closeConfirmModal}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#141620] border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 text-xs text-slate-800 dark:text-slate-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon and Close Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                variant === 'danger'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                  : variant === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50'
              }`}
            >
              {variant === 'danger' ? (
                <Trash2 className="w-5 h-5" />
              ) : variant === 'warning' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Konfirmasi Tindakan</p>
            </div>
          </div>

          <button
            onClick={closeConfirmModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Content */}
        <div className="py-1">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeConfirmModal}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium text-xs transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            autoFocus
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {variant === 'danger' && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
