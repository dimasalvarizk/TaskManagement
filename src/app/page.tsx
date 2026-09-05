'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { ListView } from '@/components/board/ListView';
import { DocEditor } from '@/components/docs/DocEditor';
import { TeamSettingsView } from '@/components/settings/TeamSettingsView';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { NewTaskModal } from '@/components/tasks/NewTaskModal';
import { NewProjectModal } from '@/components/projects/NewProjectModal';
import { NotificationDrawer } from '@/components/layout/NotificationDrawer';
import { EmailPreviewModal } from '@/components/email/EmailPreviewModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';

export default function Home() {
  const { currentUser, activeView, fetchWorkspaceData } = useWorkspaceStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  useEffect(() => {
    if (mounted && !currentUser) {
      router.replace('/login');
    }
  }, [mounted, currentUser, router]);

  if (!mounted || !currentUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-[#0d0d0e] text-slate-400">
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>TaskFlow Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0d0d0e] text-slate-900 dark:text-neutral-100 font-sans transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Navbar />

        <main className="flex-1 overflow-hidden relative">
          {activeView === 'board' && <KanbanBoard />}
          {activeView === 'list' && <ListView />}
          {activeView === 'docs' && <DocEditor />}
          {activeView === 'settings' && <TeamSettingsView />}
          {activeView === 'analytics' && <TeamSettingsView />}
        </main>
      </div>

      <CommandPalette />
      <TaskDetailModal />
      <NewTaskModal />
      <NewProjectModal />
      <NotificationDrawer />
      <EmailPreviewModal />
      <ConfirmModal />
    </div>
  );
}
