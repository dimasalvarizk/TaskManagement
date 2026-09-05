'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

export const AnalyticsView: React.FC = () => {
  const { tasks, users, activities } = useWorkspaceStore();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto max-h-[calc(100vh-80px)] text-xs text-slate-800 dark:text-slate-200">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16181f] space-y-1">
          <div className="text-slate-500 dark:text-slate-400 text-xs">Total Tasks</div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalTasks}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Active tasks in workspace</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16181f] space-y-1">
          <div className="text-slate-500 dark:text-slate-400 text-xs">Completion Rate</div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{completionRate}%</div>
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16181f] space-y-1">
          <div className="text-slate-500 dark:text-slate-400 text-xs">In Progress</div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{inProgressTasks}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Tasks currently active</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16181f] space-y-1">
          <div className="text-slate-500 dark:text-slate-400 text-xs">Urgent Priority</div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{urgentTasks}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Requires immediate attention</div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16181f] p-5 space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          Recent Activity
        </h3>

        <div className="space-y-2">
          {activities.map((act) => {
            const user = users.find((u) => u.id === act.userId);
            return (
              <div
                key={act.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{user?.name} </span>
                    <span className="text-slate-600 dark:text-slate-400">{act.action} </span>
                    <span className="text-indigo-600 dark:text-indigo-400">"{act.target}"</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{act.timestamp}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
