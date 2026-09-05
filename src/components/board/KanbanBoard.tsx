'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { INITIAL_COLUMNS } from '@/lib/initialData';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { TaskStatus } from '@/types';

export const KanbanBoard: React.FC = () => {
  const {
    tasks,
    currentUser,
    selectedProjectId,
    searchQuery,
    selectedPriority,
    selectedAssigneeId,
    moveTask,
    addTask
  } = useWorkspaceStore();

  const [quickTitle, setQuickTitle] = useState<{ [key in TaskStatus]?: string }>({});
  const [activeInlineCol, setActiveInlineCol] = useState<TaskStatus | null>(null);

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

  const onDragEnd = (result: DropResult) => {
    if (isViewer) return;
    const { destination, draggableId } = result;
    if (!destination) return;
    const targetStatus = destination.droppableId as TaskStatus;
    moveTask(draggableId, targetStatus);
  };

  const handleQuickAdd = (status: TaskStatus) => {
    if (isViewer) return;
    const title = quickTitle[status]?.trim();
    if (!title) return;

    addTask({
      title,
      description: 'Task notes',
      status,
      priority: 'medium',
      projectId: selectedProjectId || 'p1',
      assigneeIds: [currentUser?.id || 'u1'],
      tags: ['Task'],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtasks: [],
    });

    setQuickTitle({ ...quickTitle, [status]: '' });
    setActiveInlineCol(null);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-full w-full flex gap-3 overflow-x-auto p-4 sm:p-5 items-stretch">
        {INITIAL_COLUMNS.map((column) => {
          const colTasks = filteredTasks.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              className="flex-1 min-w-[220px] max-w-[320px] shrink-0 xl:shrink rounded-xl p-3 flex flex-col h-[calc(100vh-80px)] border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#111318]/80 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-1 py-1 mb-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">
                    {column.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    ({colTasks.length})
                  </span>
                </div>
                {!isViewer && (
                  <button
                    onClick={() => setActiveInlineCol(activeInlineCol === column.id ? null : column.id)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors shrink-0"
                    title={`Add task to ${column.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Inline Quick Add */}
              {!isViewer && activeInlineCol === column.id && (
                <div className="mb-2.5 p-2 rounded-lg bg-white dark:bg-[#16181f] border border-slate-200 dark:border-slate-700 space-y-2 shrink-0">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Task title..."
                    value={quickTitle[column.id] || ''}
                    onChange={(e) =>
                      setQuickTitle({ ...quickTitle, [column.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuickAdd(column.id);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex items-center justify-end gap-2 text-[10px]">
                    <button
                      onClick={() => setActiveInlineCol(null)}
                      className="px-2 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleQuickAdd(column.id)}
                      className="px-2.5 py-1 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Task Droppable Column */}
              <Droppable droppableId={column.id} isDropDisabled={isViewer}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto space-y-2 p-1 rounded-lg transition-colors min-h-[100px] ${
                      snapshot.isDraggingOver ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border border-dashed border-indigo-400/50' : ''
                    }`}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                        isDragDisabled={isViewer}
                      >
                        {(providedDrag, snapshotDrag) => (
                          <div
                            ref={providedDrag.innerRef}
                            {...providedDrag.draggableProps}
                            {...providedDrag.dragHandleProps}
                            className={`transition-shadow ${
                              snapshotDrag.isDragging ? 'shadow-xl ring-1 ring-indigo-500/50' : ''
                            }`}
                          >
                            <TaskCard task={task} index={index} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {colTasks.length === 0 && (
                      <div className="h-24 flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        No tasks
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};


