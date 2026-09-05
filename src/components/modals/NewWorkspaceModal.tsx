'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { X, Building2, Sparkles, ArrowRight, Shield } from 'lucide-react';

export const NewWorkspaceModal: React.FC = () => {
  const {
    isNewWorkspaceModalOpen,
    setNewWorkspaceModalOpen,
    createNewWorkspace,
  } = useWorkspaceStore();

  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isNewWorkspaceModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError('');

    const res = await createNewWorkspace(name.trim());
    setIsLoading(false);

    if (res.success) {
      setName('');
      setNewWorkspaceModalOpen(false);
    } else {
      setError(res.error || 'Failed to create workspace');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-[#141620] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Create Workspace</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Set up a new isolated organization or project space
              </p>
            </div>
          </div>

          <button
            onClick={() => setNewWorkspaceModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Workspace / Company Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ODST Group Indonesia, Acme Labs"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1d202b] border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white text-xs focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Shield className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              You will be the <strong>Admin</strong> of this new workspace. Tasks, Kanban boards, docs, and members will be 100% isolated.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewWorkspaceModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Creating...' : 'Create & Launch'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
