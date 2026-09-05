'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Priority, TaskStatus } from '@/types';
import { X, Check, Users } from 'lucide-react';

export const NewTaskModal: React.FC = () => {
  const {
    isNewTaskModalOpen,
    setNewTaskModalOpen,
    projects,
    users,
    currentUser,
    selectedProjectId,
    addTask,
  } = useWorkspaceStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(selectedProjectId || 'p1');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [tagsInput, setTagsInput] = useState('Task');
  const [dueDate, setDueDate] = useState('2026-09-15');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser) {
      setSelectedAssigneeIds([currentUser.id]);
    } else if (users.length > 0) {
      setSelectedAssigneeIds([users[0].id]);
    }
  }, [currentUser, users, isNewTaskModalOpen]);

  useEffect(() => {
    if (selectedProjectId) {
      setProjectId(selectedProjectId);
    } else if (projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [selectedProjectId, projects, isNewTaskModalOpen]);

  if (!isNewTaskModalOpen || currentUser?.role === 'Viewer') return null;

  const toggleAssignee = (userId: string) => {
    if (selectedAssigneeIds.includes(userId)) {
      if (selectedAssigneeIds.length > 1) {
        setSelectedAssigneeIds(selectedAssigneeIds.filter((id) => id !== userId));
      }
    } else {
      setSelectedAssigneeIds([...selectedAssigneeIds, userId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addTask({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      projectId: projectId || projects[0]?.id || 'p1',
      assigneeIds: selectedAssigneeIds.length > 0 ? selectedAssigneeIds : [currentUser?.id || 'u1'],
      tags: tags.length > 0 ? tags : ['General'],
      dueDate,
      subtasks: [],
    });

    setTitle('');
    setDescription('');
    setTagsInput('Task');
    setNewTaskModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#141620] border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6 space-y-4 text-xs text-slate-800 dark:text-slate-200 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3.5">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Create New Task</h3>
            <p className="text-[11px] text-slate-400">Add and assign a task to team members</p>
          </div>
          <button
            onClick={() => setNewTaskModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium">Task Title *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Implement user authentication workflow..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1b1e2a] border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Project & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1b1e2a] border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1b1e2a] border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none capitalize cursor-pointer"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Assignees Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                Assign Team Members ({selectedAssigneeIds.length} selected)
              </label>
              <span className="text-[10px] text-slate-400">Click to select/unselect</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-[#181a24] border border-slate-200 dark:border-neutral-800">
              {users.map((u) => {
                const isSelected = selectedAssigneeIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleAssignee(u.id)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                        : 'bg-white dark:bg-[#1e2230] border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                      {isSelected && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-2 h-2" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium truncate leading-tight">{u.name}</p>
                      <p className="text-[9px] text-slate-400 truncate capitalize">{u.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium">Description</label>
            <textarea
              rows={2}
              placeholder="Task details and notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1b1e2a] border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-slate-100 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Due Date & Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1b1e2a] border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-slate-200 text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="Design, Feature, Bug"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1b1e2a] border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewTaskModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 text-xs font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
