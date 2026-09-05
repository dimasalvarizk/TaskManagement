'use client';

import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Search, Kanban, ListTodo, FileText, Shield, Plus, X } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    tasks,
    docs,
    setActiveTaskId,
    setActiveDocId,
    setActiveView,
    setNewTaskModalOpen,
    createDoc
  } = useWorkspaceStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredDocs = docs.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#16181f] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Input Bar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search tasks, documents, or actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
          {/* Quick Actions */}
          <div className="py-1.5">
            <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2.5 mb-1">
              Quick Actions
            </div>
            <button
              onClick={() => {
                setCommandPaletteOpen(false);
                setNewTaskModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-slate-400" />
                <span>Create New Task</span>
              </div>
            </button>

            <button
              onClick={() => {
                setCommandPaletteOpen(false);
                createDoc('New Note', 'p1');
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Create New Document</span>
              </div>
            </button>
          </div>

          {/* Navigation Views */}
          <div className="py-1.5">
            <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2.5 mb-1">
              Navigation
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => {
                  setActiveView('board');
                  setCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Kanban className="w-3.5 h-3.5 text-slate-400" />
                <span>Kanban Board</span>
              </button>
              <button
                onClick={() => {
                  setActiveView('list');
                  setCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ListTodo className="w-3.5 h-3.5 text-slate-400" />
                <span>List View</span>
              </button>
              <button
                onClick={() => {
                  setActiveView('docs');
                  setCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Documents</span>
              </button>
              <button
                onClick={() => {
                  setActiveView('settings');
                  setCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Team & Permissions</span>
              </button>
            </div>
          </div>

          {/* Matching Tasks */}
          {filteredTasks.length > 0 && (
            <div className="py-1.5">
              <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2.5 mb-1">
                Tasks ({filteredTasks.length})
              </div>
              {filteredTasks.slice(0, 5).map((task) => (
                <button
                  key={task.id}
                  onClick={() => {
                    setActiveTaskId(task.id);
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <span className="truncate">{task.title}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono shrink-0 ml-2">
                    {task.status.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Matching Docs */}
          {filteredDocs.length > 0 && (
            <div className="py-1.5">
              <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2.5 mb-1">
                Documents ({filteredDocs.length})
              </div>
              {filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setActiveDocId(doc.id);
                    setActiveView('docs');
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <span className="truncate">{doc.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
