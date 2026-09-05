'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { TaskStatus, Priority } from '@/types';
import { INITIAL_COLUMNS } from '@/lib/initialData';
import {
  X,
  Trash2,
  CheckSquare,
  MessageSquare,
  Plus,
  Send,
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const {
    tasks,
    users,
    projects,
    currentUser,
    activeTaskId,
    setActiveTaskId,
    updateTask,
    deleteTask,
    toggleSubtask,
    addComment
  } = useWorkspaceStore();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [commentInput, setCommentInput] = useState('');

  const task = tasks.find((t) => t.id === activeTaskId);

  if (!task) return null;

  const project = projects.find((p) => p.id === task.projectId);
  const isAdmin = currentUser?.role === 'Admin';
  const isViewer = currentUser?.role === 'Viewer';

  const handleAddSubtask = () => {
    if (isViewer || !newSubtaskTitle.trim()) return;
    const newSt = {
      id: 'st-' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    updateTask(task.id, { subtasks: [...task.subtasks, newSt] });
    setNewSubtaskTitle('');
  };

  const handleSendComment = () => {
    if (!commentInput.trim()) return;
    addComment(task.id, commentInput);
    setCommentInput('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
      onClick={() => setActiveTaskId(null)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#16181f] border-l border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between shadow-2xl text-xs text-slate-800 dark:text-slate-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {project ? project.name : 'Task'}
            </span>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="font-mono text-slate-400 dark:text-slate-500 text-[11px]">{task.id}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setActiveTaskId(null)}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Title */}
          <div>
            <input
              type="text"
              disabled={isViewer}
              value={task.title}
              onChange={(e) => updateTask(task.id, { title: e.target.value })}
              className="w-full text-base font-semibold bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none rounded py-1"
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 dark:text-slate-500 w-16 shrink-0">Status</span>
              {!isViewer ? (
                <select
                  value={task.status}
                  onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none flex-1 max-w-[150px]"
                >
                  {INITIAL_COLUMNS.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-medium text-slate-700 dark:text-slate-300 capitalize text-xs">
                  {task.status.replace('_', ' ')}
                </span>
              )}
            </div>

            {/* Priority */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 dark:text-slate-500 w-16 shrink-0">Priority</span>
              {!isViewer ? (
                <select
                  value={task.priority}
                  onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 uppercase text-xs font-medium focus:outline-none flex-1 max-w-[150px]"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              ) : (
                <span className="uppercase text-xs font-medium text-slate-700 dark:text-slate-300">
                  {task.priority}
                </span>
              )}
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 dark:text-slate-500 w-16 shrink-0">Due Date</span>
              <input
                type="date"
                disabled={isViewer}
                value={task.dueDate}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none flex-1 max-w-[150px]"
              />
            </div>

            {/* Assignees (Full Width) */}
            <div className="col-span-1 sm:col-span-2 space-y-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">Assigned Team Members:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {users.map((u) => {
                  const isAssigned = task.assigneeIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      disabled={isViewer}
                      onClick={() => {
                        if (isViewer) return;
                        const newAssignees = isAssigned
                          ? task.assigneeIds.filter((id) => id !== u.id)
                          : [...task.assigneeIds, u.id];
                        updateTask(task.id, { assigneeIds: newAssignees.length > 0 ? newAssignees : [u.id] });
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border cursor-pointer ${
                        isAssigned
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-medium'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-4 h-4 rounded-full object-cover shrink-0"
                      />
                      <span className="text-[11px]">{u.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider text-[10px]">
              Description
            </h4>
            <textarea
              rows={3}
              disabled={isViewer}
              value={task.description}
              onChange={(e) => updateTask(task.id, { description: e.target.value })}
              placeholder="Task details and notes..."
              className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Subtasks */}
          <div className="space-y-2.5">
            <h4 className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
              Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
            </h4>

            <div className="space-y-1.5">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => !isViewer && toggleSubtask(task.id, st.id)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    disabled={isViewer}
                    checked={st.completed}
                    onChange={() => {}}
                    className="w-3.5 h-3.5 accent-indigo-600 rounded"
                  />
                  <span
                    className={`text-xs ${
                      st.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
              ))}
            </div>

            {!isViewer && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtask();
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                />
                <button
                  onClick={handleAddSubtask}
                  className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Comments Thread */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Team Comments ({task.comments.length})
            </h4>

            <div className="space-y-2">
              {task.comments.map((comment) => {
                const author = users.find((u) => u.id === comment.authorId);
                return (
                  <div key={comment.id} className="flex gap-2 text-xs">
                    <img
                      src={author?.avatar}
                      alt={author?.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900 dark:text-slate-200">{author?.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {comment.createdAt}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-xs">{comment.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendComment();
                }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              />
              <button
                onClick={handleSendComment}
                className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

