'use client';

import React from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { INITIAL_COLUMNS } from '@/lib/initialData';
import { TaskStatus } from '@/types';

export const ListView: React.FC = () => {
  const {
    tasks,
    users,
    projects,
    currentUser,
    selectedProjectId,
    searchQuery,
    selectedPriority,
    selectedAssigneeId,
    moveTask,
    setActiveTaskId
  } = useWorkspaceStore();

  const isViewer = currentUser?.role === 'Viewer';

  const filteredTasks = tasks.filter((t) => {
    if (selectedProjectId && t.projectId !== selectedProjectId) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (selectedAssigneeId !== 'all' && !t.assigneeIds.includes(selectedAssigneeId)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 overflow-y-auto max-h-[calc(100vh-60px)]">
      {/* 1. Mobile Cards View (Visible on < md screens) */}
      <div className="md:hidden space-y-2.5">
        {filteredTasks.map((task) => {
          const project = projects.find((p) => p.id === task.projectId);
          const assigned = users.filter((u) => task.assigneeIds.includes(u.id));

          return (
            <div
              key={task.id}
              onClick={() => setActiveTaskId(task.id)}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12141a] shadow-xs space-y-2.5 cursor-pointer active:scale-[0.99] transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 leading-snug">
                    {task.title}
                  </h4>
                  {project && (
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                      <span className="truncate">{project.name}</span>
                    </div>
                  )}
                </div>

                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                  {task.priority}
                </span>
              </div>

              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {task.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Status and Footer Info */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
                {!isViewer ? (
                  <select
                    value={task.status}
                    onChange={(e) => moveTask(task.id, e.target.value as TaskStatus)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
                  >
                    {INITIAL_COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs capitalize">
                    {task.status.replace('_', ' ')}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-1.5">
                    {assigned.map((u) => (
                      <img
                        key={u.id}
                        src={u.avatar}
                        alt={u.name}
                        title={u.name}
                        className="w-5 h-5 rounded-full border border-white dark:border-slate-900 object-cover shrink-0"
                      />
                    ))}
                  </div>

                  <span className="font-mono text-slate-400 dark:text-slate-500 text-[10px]">
                    {task.dueDate}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs bg-white dark:bg-[#12141a] rounded-xl border border-slate-200 dark:border-slate-800">
            No tasks found.
          </div>
        )}
      </div>

      {/* 2. Desktop Table View (Visible on md+ screens) */}
      <div className="hidden md:block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12141a] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[650px]">
            <thead className="bg-slate-50 dark:bg-slate-900/70 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Task Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Assignees</th>
                <th className="py-3 px-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const assigned = users.filter((u) => task.assigneeIds.includes(u.id));

                return (
                  <tr
                    key={task.id}
                    onClick={() => setActiveTaskId(task.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-md">
                      <div className="flex flex-col gap-0.5">
                        <span>{task.title}</span>
                        <div className="flex items-center gap-1">
                          {task.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      {!isViewer ? (
                        <select
                          value={task.status}
                          onChange={(e) => moveTask(task.id, e.target.value as TaskStatus)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded px-2 py-1 cursor-pointer focus:outline-none"
                        >
                          {INITIAL_COLUMNS.map((col) => (
                            <option key={col.id} value={col.id}>
                              {col.title}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs capitalize">
                          {task.status.replace('_', ' ')}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {task.priority}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {project ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                          <span>{project.name}</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center -space-x-1.5">
                        {assigned.map((u) => (
                          <img
                            key={u.id}
                            src={u.avatar}
                            alt={u.name}
                            title={u.name}
                            className="w-5 h-5 rounded-full border border-white dark:border-slate-900 object-cover shrink-0"
                          />
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 text-xs">
                      {task.dueDate}
                    </td>
                  </tr>
                );
              })}

              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

