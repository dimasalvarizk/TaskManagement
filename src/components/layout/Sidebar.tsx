'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useRouter } from 'next/navigation';
import {
  Kanban,
  ListTodo,
  FileText,
  Shield,
  Plus,
  Layers,
  LogOut,
  Trash2,
  Pencil,
  X,
  Download,
  ChevronsUpDown,
  Check,
  Building2,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    users,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    activeView,
    setActiveView,
    setNewTaskModalOpen,
    setNewProjectModalOpen,
    setNewWorkspaceModalOpen,
    switchWorkspace,
    updateProject,
    deleteProject,
    openConfirmModal,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    logout,
    promptInstallApp,
    isAppInstalled,
  } = useWorkspaceStore();

  const liveUser = users.find(
    (u) =>
      u.id === currentUser?.id ||
      (u.email && currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
  ) || currentUser;

  const [mounted, setMounted] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState<string>('');
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close workspace switcher popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(e.target as Node)) {
        setIsWorkspaceMenuOpen(false);
      }
    };
    if (isWorkspaceMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isWorkspaceMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleItemSelect = (action: () => void) => {
    action();
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileSidebarOpen(false);
    }
  };

  const isViewer = currentUser?.role === 'Viewer';
  const memberships = currentUser?.memberships || [
    {
      id: 'default-m',
      workspaceId: currentUser?.workspaceId || 'default',
      workspaceName: currentUser?.workspaceName || 'TaskFlow Workspace',
      role: currentUser?.role || 'Admin',
      status: 'active' as const,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Responsive Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 md:w-56 h-screen bg-slate-50 dark:bg-[#111318] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between select-none shrink-0 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto flex-1">
          {/* Workspace Switcher Brand Header */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 relative" ref={workspaceMenuRef}>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/80 transition-all text-left flex-1 min-w-0 group cursor-pointer"
                title="Switch or Create Workspace"
              >
                <div className="w-7 h-7 rounded-lg bg-white shadow-xs ring-1 ring-slate-200 dark:ring-white/20 flex items-center justify-center p-1 shrink-0">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h1 className="font-semibold text-slate-900 dark:text-slate-100 text-xs tracking-tight truncate">
                      {currentUser?.workspaceName || 'TaskFlow'}
                    </h1>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <span className="truncate">{currentUser?.role || 'Member'} Workspace</span>
                  </div>
                </div>
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0" />
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors shrink-0 ml-1"
                title="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Workspace Switcher Popover Menu */}
            {isWorkspaceMenuOpen && (
              <div className="absolute top-full left-2 right-2 mt-1 z-50 bg-white dark:bg-[#151720] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Your Workspaces
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {memberships.map((m) => {
                    const isActive = m.workspaceId === currentUser?.workspaceId;
                    return (
                      <button
                        key={m.workspaceId || m.id}
                        type="button"
                        onClick={() => {
                          setIsWorkspaceMenuOpen(false);
                          if (!isActive) {
                            switchWorkspace(m.workspaceId);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Building2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                          <div className="text-left truncate">
                            <div className="truncate text-xs">{m.workspaceName}</div>
                            <div className="text-[10px] opacity-70 font-normal">{m.role}</div>
                          </div>
                        </div>

                        {isActive && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      setNewWorkspaceModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Create Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* New Task Action Button (Disabled for Viewer) */}
          {!isViewer && (
            <div className="p-2.5">
              <button
                onClick={() => handleItemSelect(() => setNewTaskModalOpen(true))}
                className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>
          )}

          {/* Navigation Views */}
          <div className="px-2 py-1.5 space-y-0.5">
            <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 px-2.5 py-1 uppercase tracking-wider">
              Views
            </div>

            <button
              onClick={() => handleItemSelect(() => setActiveView('board'))}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'board'
                  ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/50'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Kanban Board</span>
            </button>

            <button
              onClick={() => handleItemSelect(() => setActiveView('list'))}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'list'
                  ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/50'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>List View</span>
            </button>

            <button
              onClick={() => handleItemSelect(() => setActiveView('docs'))}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'docs'
                  ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Documents</span>
            </button>

            <button
              onClick={() => handleItemSelect(() => setActiveView('settings'))}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeView === 'settings'
                  ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/50'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Team & Permissions</span>
            </button>
          </div>

          {/* Projects List */}
          <div className="px-2 py-1.5 mt-2">
            <div className="flex items-center justify-between px-2.5 py-1">
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Projects
              </span>
              {!isViewer && (
                <button
                  onClick={() => handleItemSelect(() => setNewProjectModalOpen(true))}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer transition-colors"
                  title="Create New Project"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-0.5">
              <button
                onClick={() => handleItemSelect(() => setSelectedProjectId(null))}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedProjectId === null
                    ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>All Projects</span>
              </button>

              {projects.map((p) => (
                <div
                  key={p.id}
                  className={`group w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedProjectId === p.id
                      ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/50'
                  }`}
                  onClick={() => handleItemSelect(() => setSelectedProjectId(p.id))}
                  onDoubleClick={(e) => {
                    if (isViewer) return;
                    e.stopPropagation();
                    setEditingProjectId(p.id);
                    setEditingProjectName(p.name);
                  }}
                >
                  {editingProjectId === p.id ? (
                    <div
                      className="flex items-center gap-1.5 flex-1 min-w-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <input
                        type="text"
                        autoFocus
                        value={editingProjectName}
                        onChange={(e) => setEditingProjectName(e.target.value)}
                        onBlur={() => {
                          if (editingProjectName.trim() && editingProjectName.trim() !== p.name) {
                            updateProject(p.id, { name: editingProjectName.trim() });
                          }
                          setEditingProjectId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingProjectName.trim() && editingProjectName.trim() !== p.name) {
                              updateProject(p.id, { name: editingProjectName.trim() });
                            }
                            setEditingProjectId(null);
                          } else if (e.key === 'Escape') {
                            setEditingProjectId(null);
                          }
                        }}
                        className="w-full px-1.5 py-0.5 text-xs bg-white dark:bg-slate-900 border border-indigo-500 rounded text-slate-900 dark:text-white focus:outline-none shadow-xs"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="truncate" title="Double click to rename">{p.name}</span>
                    </div>
                  )}

                  {!isViewer && editingProjectId !== p.id && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProjectId(p.id);
                          setEditingProjectName(p.name);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        title="Rename project (or double click)"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openConfirmModal({
                            title: 'Delete Project',
                            message: `Are you sure you want to delete project "${p.name}"? All associated tasks and documents will also be removed permanently.`,
                            confirmLabel: 'Delete Project',
                            variant: 'danger',
                            onConfirm: () => deleteProject(p.id),
                          });
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title={`Delete ${p.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Footer Profile & Role Badge */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-200/40 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={liveUser?.avatar || currentUser?.avatar}
                alt={liveUser?.name || currentUser?.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="truncate text-xs">
                <div className="font-medium text-slate-800 dark:text-slate-200 truncate text-[11px]">
                  {liveUser?.name || currentUser?.name}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">
                  {liveUser?.role || currentUser?.role}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors shrink-0 cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
