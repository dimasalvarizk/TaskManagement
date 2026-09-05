'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import {
  Search,
  Command,
  Bell,
  Volume2,
  VolumeX,
  Mail,
  Plus,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  X,
  Shield,
  User as UserIcon,
  Check,
  Kanban,
  ListTodo,
  FileText,
  Sparkles,
  Sun,
  Moon,
  Menu,
  Download,
} from 'lucide-react';
import { Priority, Role } from '@/types';

const PRIORITY_OPTIONS: { value: Priority | 'all'; label: string; dotColor: string }[] = [
  { value: 'all', label: 'All Priorities', dotColor: 'bg-neutral-400 dark:bg-neutral-500' },
  { value: 'urgent', label: 'Urgent', dotColor: 'bg-red-500' },
  { value: 'high', label: 'High', dotColor: 'bg-amber-500' },
  { value: 'medium', label: 'Medium', dotColor: 'bg-blue-500' },
  { value: 'low', label: 'Low', dotColor: 'bg-slate-400 dark:bg-neutral-400' },
];

export const Navbar: React.FC = () => {
  const {
    projects,
    tasks,
    users,
    currentUser,
    notifications,
    sentEmails,
    isSoundEnabled,
    toggleSound,
    theme,
    toggleTheme,
    isMobileSidebarOpen,
    toggleMobileSidebar,
    setNotificationDrawerOpen,
    setEmailInspectorOpen,
    selectedProjectId,
    activeView,
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
    selectedAssigneeId,
    setSelectedAssigneeId,
    setCommandPaletteOpen,
    setNewTaskModalOpen,
    promptInstallApp,
    isAppInstalled,
  } = useWorkspaceStore();

  const [mounted, setMounted] = useState(false);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const priorityRef = useRef<HTMLDivElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);
  const mobileFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setIsMac(typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);

    const handleClickOutside = (e: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(e.target as Node)) {
        setPriorityMenuOpen(false);
      }
      if (assigneeRef.current && !assigneeRef.current.contains(e.target as Node)) {
        setAssigneeMenuOpen(false);
      }
      if (mobileFilterRef.current && !mobileFilterRef.current.contains(e.target as Node)) {
        setMobileFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isViewer = currentUser?.role === 'Viewer';
  const showTaskFilters = activeView === 'board' || activeView === 'list';

  // Total tasks in current scope
  const scopedTasks = selectedProjectId
    ? tasks.filter((t) => t.projectId === selectedProjectId)
    : tasks;

  // Selected Assignee User
  const selectedAssignee = users.find((u) => u.id === selectedAssigneeId);

  // Active filter count
  const hasActiveFilters = searchQuery !== '' || selectedPriority !== 'all' || selectedAssigneeId !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedPriority('all');
    setSelectedAssigneeId('all');
  };

  // View Metadata
  const getViewLabel = () => {
    switch (activeView) {
      case 'board':
        return 'Kanban';
      case 'list':
        return 'List';
      case 'docs':
        return 'Documents';
      case 'settings':
      case 'analytics':
        return 'Team & Settings';
      default:
        return 'Workspace';
    }
  };

  const getRoleBadge = (role?: Role) => {
    switch (role) {
      case 'Admin':
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/80';
      case 'Member':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80';
      case 'Viewer':
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <header className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111318]/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between z-10 shrink-0 select-none gap-2 sm:gap-4 transition-colors">
      {/* 1. Left Breadcrumbs & Project Scope */}
      <div className="flex items-center gap-2 text-xs min-w-0">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200 truncate">
          {currentProject ? (
            <>
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: currentProject.color }}
              />
              <span className="truncate max-w-[100px] sm:max-w-[200px]">{currentProject.name}</span>
            </>
          ) : (
            <span className="text-slate-700 dark:text-slate-300">All Projects</span>
          )}
        </div>

        <span className="text-slate-300 dark:text-slate-700 font-light hidden sm:inline">/</span>

        <span className="text-slate-500 dark:text-slate-400 font-normal truncate hidden sm:inline">
          {getViewLabel()}
        </span>

        {showTaskFilters && (
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
            {scopedTasks.length} {scopedTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        )}
      </div>

      {/* 2. Center Search & Filters */}
      <div className="flex items-center gap-2 flex-1 justify-center max-w-md">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks or press Ctrl+K..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-12 py-1.5 rounded-lg bg-slate-100/70 hover:bg-slate-100 focus:bg-white dark:bg-[#181b22] dark:hover:bg-[#1c2029] dark:focus:bg-[#181b22] border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Open Command Palette"
            >
              {isMac ? '⌘K' : 'Ctrl K'}
            </button>
          )}
        </div>

        {/* Filter Dropdowns (Desktop) */}
        {showTaskFilters && (
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {/* Priority Filter */}
            <div className="relative" ref={priorityRef}>
              <button
                onClick={() => {
                  setPriorityMenuOpen(!priorityMenuOpen);
                  setAssigneeMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  selectedPriority !== 'all'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="capitalize">
                  {selectedPriority === 'all' ? 'Priority' : selectedPriority}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {priorityMenuOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#181b22] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-1 z-30 animate-fade-in">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedPriority(opt.value);
                        setPriorityMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                        selectedPriority === opt.value
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${opt.dotColor}`} />
                        <span>{opt.label}</span>
                      </div>
                      {selectedPriority === opt.value && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assignee Filter */}
            <div className="relative" ref={assigneeRef}>
              <button
                onClick={() => {
                  setAssigneeMenuOpen(!assigneeMenuOpen);
                  setPriorityMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  selectedAssigneeId !== 'all'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="truncate max-w-[80px]">
                  {selectedAssignee ? selectedAssignee.name.split(' ')[0] : 'Assignee'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {assigneeMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#181b22] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-1 z-30 animate-fade-in">
                  <button
                    onClick={() => {
                      setSelectedAssigneeId('all');
                      setAssigneeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                      selectedAssigneeId === 'all'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <span>All Members</span>
                    {selectedAssigneeId === 'all' && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedAssigneeId(u.id);
                        setAssigneeMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                        selectedAssigneeId === u.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                        <span className="truncate">{u.name}</span>
                      </div>
                      {selectedAssigneeId === u.id && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Reset filters"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Mobile Filter Button (< lg screens) */}
        {showTaskFilters && (
          <div className="lg:hidden relative shrink-0" ref={mobileFilterRef}>
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className={`p-1.5 rounded-lg border text-xs font-medium transition-colors relative cursor-pointer ${
                hasActiveFilters
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Filters"
            >
              <Filter className="w-3.5 h-3.5" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-600" />
              )}
            </button>

            {mobileFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#181b22] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-3 z-40 space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">Filter Tasks</span>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Priority</label>
                  <div className="grid grid-cols-2 gap-1">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedPriority(opt.value)}
                        className={`px-2 py-1 rounded text-[11px] font-medium text-left flex items-center gap-1.5 transition-colors ${
                          selectedPriority === opt.value
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${opt.dotColor}`} />
                        <span className="capitalize truncate">{opt.value === 'all' ? 'All' : opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assignee */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Assignee</label>
                  <select
                    value={selectedAssigneeId}
                    onChange={(e) => setSelectedAssigneeId(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="all">All Members</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Right Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {!isViewer && (
          <button
            onClick={() => setNewTaskModalOpen(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
            title="Create New Task"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        )}

        {/* Install App Button */}
        {(!mounted || !isAppInstalled) && (
          <button
            suppressHydrationWarning
            onClick={() => promptInstallApp()}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 font-medium text-xs transition-colors cursor-pointer shadow-2xs"
            title="Install TaskFlow App (PWA)"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1" />

        <button
          suppressHydrationWarning
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          title={mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {mounted && theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        <button
          onClick={() => setNotificationDrawerOpen(true)}
          className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600" />
          )}
        </button>

        {/* User Role Badge (Hidden on very tiny screens to save space) */}
        <span
          className={`hidden xs:inline-flex px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-medium border ${getRoleBadge(
            currentUser?.role
          )}`}
        >
          {currentUser?.role || 'Guest'}
        </span>
      </div>
    </header>
  );
};


