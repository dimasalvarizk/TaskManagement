'use client';

import React, { useState, useRef } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { DocBlock } from '@/types';
import {
  Plus,
  Trash2,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  Info,
  Code,
  Type,
  List,
  FileText,
  Sparkles,
  Pencil,
  X,
} from 'lucide-react';

const BLOCK_TYPES = [
  {
    type: 'paragraph' as const,
    label: 'Text',
    description: 'Plain body text',
    icon: Type,
    badge: 'Text',
  },
  {
    type: 'h1' as const,
    label: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1,
    badge: 'H1',
  },
  {
    type: 'h2' as const,
    label: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    badge: 'H2',
  },
  {
    type: 'todo' as const,
    label: 'To-do List',
    description: 'Track tasks with checkboxes',
    icon: CheckSquare,
    badge: 'To-do',
  },
  {
    type: 'bullet' as const,
    label: 'Bullet List',
    description: 'Simple bulleted list',
    icon: List,
    badge: 'Bullet',
  },
  {
    type: 'callout' as const,
    label: 'Callout',
    description: 'Highlight important notice',
    icon: Info,
    badge: 'Callout',
  },
  {
    type: 'code' as const,
    label: 'Code Block',
    description: 'Syntax code snippet',
    icon: Code,
    badge: 'Code',
  },
];

export const DocEditor: React.FC = () => {
  const {
    docs,
    activeDocId,
    currentUser,
    setActiveDocId,
    updateDocBlocks,
    updateDocTitle,
    createDoc,
    deleteDoc,
    selectedProjectId,
  } = useWorkspaceStore();

  const isViewer = currentUser?.role === 'Viewer';
  const activeDoc = docs.find((d) => d.id === activeDocId) || docs[0];

  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingDocTitle, setEditingDocTitle] = useState<string>('');
  const [isMobileDocListOpen, setIsMobileDocListOpen] = useState(false);

  // Slash menu state
  const [slashMenuBlockId, setSlashMenuBlockId] = useState<string | null>(null);
  const [activePickerBlockId, setActivePickerBlockId] = useState<string | null>(null);

  const inputRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  if (!activeDoc) return null;

  const handleContentChange = (blockId: string, content: string) => {
    if (isViewer) return;

    // Auto-detect markdown shorthand prefixes:
    if (content === '[] ' || content === '[ ] ') {
      changeBlockType(blockId, 'todo', '');
      return;
    }
    if (content === '# ') {
      changeBlockType(blockId, 'h1', '');
      return;
    }
    if (content === '## ') {
      changeBlockType(blockId, 'h2', '');
      return;
    }
    if (content === '- ' || content === '* ') {
      changeBlockType(blockId, 'bullet', '');
      return;
    }
    if (content === '> ') {
      changeBlockType(blockId, 'callout', '');
      return;
    }

    // Detect if slash menu should be triggered
    if (content === '/' || content.endsWith(' /')) {
      setSlashMenuBlockId(blockId);
    } else if (slashMenuBlockId === blockId && !content.includes('/')) {
      setSlashMenuBlockId(null);
    }

    const updatedBlocks = activeDoc.blocks.map((b) => {
      if (b.id !== blockId) return b;
      return { ...b, content };
    });
    updateDocBlocks(activeDoc.id, updatedBlocks);
  };

  const changeBlockType = (blockId: string, newType: DocBlock['type'], content?: string) => {
    const updatedBlocks = activeDoc.blocks.map((b) => {
      if (b.id !== blockId) return b;
      return {
        ...b,
        type: newType,
        content: content !== undefined ? content : b.content,
        checked: newType === 'todo' ? false : undefined,
      };
    });
    setSlashMenuBlockId(null);
    setActivePickerBlockId(null);
    updateDocBlocks(activeDoc.id, updatedBlocks);
  };

  const handleSelectSlashCommand = (blockId: string, newType: DocBlock['type']) => {
    const targetBlock = activeDoc.blocks.find((b) => b.id === blockId);
    const cleanContent = (targetBlock?.content || '').replace(/\/$/, '').trim();
    changeBlockType(blockId, newType, cleanContent);
  };

  const handleToggleTodo = (blockId: string) => {
    if (isViewer) return;
    const updatedBlocks = activeDoc.blocks.map((b) =>
      b.id === blockId ? { ...b, checked: !b.checked } : b
    );
    updateDocBlocks(activeDoc.id, updatedBlocks);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    block: DocBlock,
    index: number
  ) => {
    if (isViewer) return;

    // Press ENTER: Create new block below
    if (e.key === 'Enter' && !e.shiftKey) {
      if (block.type === 'code') return; // let code blocks have normal newlines

      e.preventDefault();
      // If current block is todo, default next block to todo as well!
      const nextType = block.type === 'todo' ? 'todo' : block.type === 'bullet' ? 'bullet' : 'paragraph';
      
      const newBlock: DocBlock = {
        id: 'b-' + Date.now(),
        type: nextType,
        content: '',
        checked: nextType === 'todo' ? false : undefined,
      };

      const updatedBlocks = [...activeDoc.blocks];
      updatedBlocks.splice(index + 1, 0, newBlock);
      updateDocBlocks(activeDoc.id, updatedBlocks);

      // Auto-focus new block
      setTimeout(() => {
        const nextElem = inputRefs.current[newBlock.id];
        if (nextElem) nextElem.focus();
      }, 50);
    }

    // Press BACKSPACE on empty block: Remove block and focus previous
    if (e.key === 'Backspace' && block.content === '' && activeDoc.blocks.length > 1) {
      e.preventDefault();
      const updatedBlocks = activeDoc.blocks.filter((b) => b.id !== block.id);
      updateDocBlocks(activeDoc.id, updatedBlocks);

      const prevBlock = activeDoc.blocks[index - 1];
      if (prevBlock) {
        setTimeout(() => {
          const prevElem = inputRefs.current[prevBlock.id];
          if (prevElem) prevElem.focus();
        }, 50);
      }
    }
  };

  const handleAddBlock = (afterBlockId?: string, type: DocBlock['type'] = 'paragraph') => {
    if (isViewer) return;
    const newBlock: DocBlock = {
      id: 'b-' + Date.now(),
      type,
      content: '',
      checked: type === 'todo' ? false : undefined,
    };

    let updatedBlocks = [...activeDoc.blocks];
    if (afterBlockId) {
      const index = activeDoc.blocks.findIndex((b) => b.id === afterBlockId);
      updatedBlocks.splice(index + 1, 0, newBlock);
    } else {
      updatedBlocks.push(newBlock);
    }

    setActivePickerBlockId(null);
    updateDocBlocks(activeDoc.id, updatedBlocks);

    setTimeout(() => {
      const elem = inputRefs.current[newBlock.id];
      if (elem) elem.focus();
    }, 50);
  };

  const handleDeleteBlock = (blockId: string) => {
    if (isViewer || activeDoc.blocks.length <= 1) return;
    const updatedBlocks = activeDoc.blocks.filter((b) => b.id !== blockId);
    updateDocBlocks(activeDoc.id, updatedBlocks);
  };

  const formatDocDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="h-full flex overflow-hidden relative">
      {/* Mobile Backdrop for Notes Drawer */}
      {isMobileDocListOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileDocListOpen(false)}
        />
      )}

      {/* Left Selector Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-50 dark:bg-[#111318] p-3 space-y-2 select-none transition-transform duration-200 md:static md:translate-x-0 md:w-56 border-r border-slate-200 dark:border-neutral-800 ${
          isMobileDocListOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Documents
          </h3>
          <div className="flex items-center gap-1">
            {!isViewer && (
              <button
                onClick={() => {
                  createDoc('New Note', selectedProjectId || 'p1');
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setIsMobileDocListOpen(false);
                  }
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
                title="Add Document"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsMobileDocListOpen(false)}
              className="md:hidden p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Close list"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-0.5 overflow-y-auto max-h-[calc(100vh-120px)]">
          {docs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => {
                setActiveDocId(doc.id);
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setIsMobileDocListOpen(false);
                }
              }}
              onDoubleClick={(e) => {
                if (isViewer) return;
                e.stopPropagation();
                setEditingDocId(doc.id);
                setEditingDocTitle(doc.title);
              }}
              className={`group w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeDoc.id === doc.id
                  ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/50'
              }`}
            >
              {editingDocId === doc.id ? (
                <div
                  className="flex items-center gap-1.5 flex-1 min-w-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    value={editingDocTitle}
                    onChange={(e) => setEditingDocTitle(e.target.value)}
                    onBlur={() => {
                      if (editingDocTitle.trim() && editingDocTitle.trim() !== doc.title) {
                        updateDocTitle(doc.id, editingDocTitle.trim());
                      }
                      setEditingDocId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editingDocTitle.trim() && editingDocTitle.trim() !== doc.title) {
                          updateDocTitle(doc.id, editingDocTitle.trim());
                        }
                        setEditingDocId(null);
                      } else if (e.key === 'Escape') {
                        setEditingDocId(null);
                      }
                    }}
                    className="w-full px-1.5 py-0.5 text-xs bg-white dark:bg-slate-900 border border-indigo-500 rounded text-slate-900 dark:text-white focus:outline-none shadow-xs"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-left" title="Double click to rename">{doc.title}</span>
                </div>
              )}

              {!isViewer && editingDocId !== doc.id && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDocId(doc.id);
                      setEditingDocTitle(doc.title);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                    title="Rename note (or double click)"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  {docs.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete "${doc.title}"?`)) {
                          deleteDoc(doc.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0"
                      title={`Delete ${doc.title}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Document Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-3xl mx-auto space-y-5 w-full">
        {/* Mobile Notes Drawer Open Toggle */}
        <button
          onClick={() => setIsMobileDocListOpen(true)}
          className="md:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-neutral-700 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-500" />
          <span>Switch Note ({docs.length} notes)</span>
        </button>

        {/* Document Header */}
        <div className="space-y-2 border-b border-slate-200 dark:border-neutral-800 pb-4">
          <input
            type="text"
            disabled={isViewer}
            value={activeDoc.title}
            placeholder="Untitled Document"
            onChange={(e) => {
              const updatedDocs = docs.map((d) =>
                d.id === activeDoc.id ? { ...d, title: e.target.value } : d
              );
              useWorkspaceStore.setState({ docs: updatedDocs });
            }}
            onBlur={(e) => {
              if (e.target.value.trim()) {
                updateDocTitle(activeDoc.id, e.target.value.trim());
              }
            }}
            className="text-2xl font-bold bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none w-full tracking-tight"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            <span>Updated {formatDocDate(activeDoc.updatedAt)}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-slate-500">
                Tip: Type &quot;/&quot; or click toolbar buttons below
              </span>
              {!isViewer && docs.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${activeDoc.title}"?`)) {
                      deleteDoc(activeDoc.id);
                    }
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete this note"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Insert Toolbar */}
          {!isViewer && (
            <div className="pt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Insert:
              </span>
              {BLOCK_TYPES.map((b) => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.type}
                    onClick={() => handleAddBlock(undefined, b.type)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800/90 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-all cursor-pointer border border-slate-200/60 dark:border-neutral-700/60"
                  >
                    <Icon className="w-3 h-3 text-slate-400" />
                    <span>{b.badge}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Blocks List */}
        <div className="space-y-2.5">
          {activeDoc.blocks.map((block, index) => (
            <div key={block.id} className="group relative flex items-start">
              
              {/* Left Action Gutter */}
              {!isViewer ? (
                <div className="w-14 -ml-14 shrink-0 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pt-1 pr-2 relative">
                  <button
                    onClick={() => setActivePickerBlockId(activePickerBlockId === block.id ? null : block.id)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Insert block below"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Plus Button Type Picker Dropdown */}
                  {activePickerBlockId === block.id && (
                    <div className="absolute left-10 top-0 z-40 w-48 bg-white dark:bg-[#161824] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xl p-1 animate-in fade-in zoom-in-95">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-400">Add Block</p>
                      {BLOCK_TYPES.map((bt) => {
                        const Icon = bt.icon;
                        return (
                          <button
                            key={bt.type}
                            onClick={() => handleAddBlock(block.id, bt.type)}
                            className="w-full flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 text-xs text-left cursor-pointer"
                          >
                            <Icon className="w-3.5 h-3.5 text-slate-400" />
                            <span>{bt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-0 shrink-0" />
              )}

              {/* Block Content Renderers */}
              <div className="flex-1 relative min-w-0">
                {block.type === 'h1' && (
                  <input
                    ref={(el) => { inputRefs.current[block.id] = el; }}
                    type="text"
                    disabled={isViewer}
                    placeholder="Heading 1"
                    value={block.content}
                    onChange={(e) => handleContentChange(block.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, block, index)}
                    className="w-full text-xl font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none py-1 tracking-tight"
                  />
                )}

                {block.type === 'h2' && (
                  <input
                    ref={(el) => { inputRefs.current[block.id] = el; }}
                    type="text"
                    disabled={isViewer}
                    placeholder="Heading 2"
                    value={block.content}
                    onChange={(e) => handleContentChange(block.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, block, index)}
                    className="w-full text-base font-semibold text-indigo-600 dark:text-indigo-400 bg-transparent focus:outline-none py-1"
                  />
                )}

                {block.type === 'paragraph' && (
                  <textarea
                    ref={(el) => { inputRefs.current[block.id] = el; }}
                    rows={1}
                    disabled={isViewer}
                    placeholder="Type text or press '/' for commands..."
                    value={block.content}
                    onChange={(e) => handleContentChange(block.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, block, index)}
                    className="w-full text-xs text-slate-700 dark:text-slate-300 bg-transparent focus:outline-none resize-none py-1.5 leading-relaxed"
                  />
                )}

                {/* Interactive To-Do Checkbox Block */}
                {block.type === 'todo' && (
                  <div className="flex items-center gap-2.5 py-1">
                    <input
                      type="checkbox"
                      disabled={isViewer}
                      checked={block.checked || false}
                      onChange={() => handleToggleTodo(block.id)}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer shrink-0"
                    />
                    <input
                      ref={(el) => { inputRefs.current[block.id] = el; }}
                      type="text"
                      disabled={isViewer}
                      placeholder="To-do item (Press Enter for next)..."
                      value={block.content}
                      onChange={(e) => handleContentChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, block, index)}
                      className={`w-full text-xs bg-transparent focus:outline-none ${
                        block.checked
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    />
                  </div>
                )}

                {/* Bullet List Block */}
                {block.type === 'bullet' && (
                  <div className="flex items-center gap-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 dark:bg-slate-300 shrink-0 ml-1" />
                    <input
                      ref={(el) => { inputRefs.current[block.id] = el; }}
                      type="text"
                      disabled={isViewer}
                      placeholder="List item..."
                      value={block.content}
                      onChange={(e) => handleContentChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, block, index)}
                      className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                )}

                {/* Callout Notice Block */}
                {block.type === 'callout' && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-100/80 dark:bg-[#161824] border border-slate-200 dark:border-neutral-800 text-xs">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <input
                      ref={(el) => { inputRefs.current[block.id] = el; }}
                      type="text"
                      disabled={isViewer}
                      placeholder="Highlight important note..."
                      value={block.content}
                      onChange={(e) => handleContentChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, block, index)}
                      className="w-full bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none text-xs"
                    />
                  </div>
                )}

                {/* Code Snippet Block */}
                {block.type === 'code' && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-100">
                    <textarea
                      ref={(el) => { inputRefs.current[block.id] = el; }}
                      rows={3}
                      disabled={isViewer}
                      placeholder="// Write code snippet here..."
                      value={block.content}
                      onChange={(e) => handleContentChange(block.id, e.target.value)}
                      className="w-full bg-transparent focus:outline-none resize-none text-xs text-indigo-300"
                    />
                  </div>
                )}

                {/* Floating Interactive Slash Command Menu */}
                {slashMenuBlockId === block.id && !isViewer && (
                  <div className="absolute left-0 top-full mt-1 z-30 w-64 bg-white dark:bg-[#161824] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Transform Block (/ Commands)
                    </div>
                    <div className="space-y-0.5">
                      {BLOCK_TYPES.map((cmd) => {
                        const Icon = cmd.icon;
                        return (
                          <button
                            key={cmd.type}
                            onClick={() => handleSelectSlashCommand(block.id, cmd.type)}
                            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800/80 text-left transition-colors cursor-pointer group/item"
                          >
                            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover/item:bg-indigo-50 dark:group-hover/item:bg-indigo-950 group-hover/item:text-indigo-600">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight">
                                {cmd.label}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                {cmd.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Clickable Area to Add New Line */}
        {!isViewer && (
          <div
            onClick={() => handleAddBlock()}
            className="py-4 px-2 border-t border-dashed border-slate-200 dark:border-neutral-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 text-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Click to add a new block or press &quot;/&quot; for options</span>
          </div>
        )}
      </div>
    </div>
  );
};
