'use client';

import React from 'react';
import { Task } from '@/types';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { MessageSquare, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { users, setActiveTaskId } = useWorkspaceStore();

  const assignedUsers = users.filter((u) => task.assigneeIds.includes(u.id));
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const priorityColors = {
    urgent: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50',
    high: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50',
    medium: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50',
    low: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700',
  };

  return (
    <div
      onClick={() => setActiveTaskId(task.id)}
      className="p-3 rounded-lg cursor-pointer select-none space-y-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16181f] hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-sm transition-all"
    >
      {/* Top Header: Priority Badge & Tags */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider border ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>

        {/* Tags */}
        <div className="flex items-center gap-1 overflow-hidden justify-end">
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 truncate max-w-[70px]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-medium text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span>Subtasks</span>
            <span className="font-mono">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <div className="flex items-center -space-x-1.5">
          {assignedUsers.map((user) => (
            <img
              key={user.id}
              src={user.avatar}
              alt={user.name}
              title={user.name}
              className="w-5 h-5 rounded-full border border-white dark:border-slate-900 object-cover shrink-0"
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-[10px]">
              <MessageSquare className="w-3 h-3 text-slate-400" />
              <span>{task.comments.length}</span>
            </span>
          )}

          <span className="flex items-center gap-1 text-[10px] font-mono">
            <Calendar className="w-3 h-3 text-slate-400" />
            {task.dueDate.split('-').slice(1).join('/')}
          </span>
        </div>
      </div>
    </div>
  );
};

