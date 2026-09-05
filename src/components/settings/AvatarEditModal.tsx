'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { User } from '@/types';
import { X, Upload, Link as LinkIcon, Camera, Check, Sparkles } from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
];

interface AvatarEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarEditModal: React.FC<AvatarEditModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const { updateUserAvatar } = useWorkspaceStore();
  const [selectedUrl, setSelectedUrl] = useState(user.avatar || PRESET_AVATARS[0]);
  const [customUrl, setCustomUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setSelectedUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateUserAvatar(user.id, selectedUrl);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141620] border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-xl animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Edit Profile Photo
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Updating avatar for <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Current Avatar Preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#181a24] border border-slate-200 dark:border-neutral-800">
            <div className="relative">
              <img
                src={selectedUrl}
                alt="Selected Avatar Preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#181a24]" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white text-xs">
                Live Photo Preview
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                This photo will appear on your tasks, comments, and navbar.
              </p>
            </div>
          </div>

          {/* Preset Choices */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Select Preset Avatar
              </label>
              <span className="text-[10px] text-slate-400">12 Presets</span>
            </div>
            <div className="grid grid-cols-6 gap-2.5">
              {PRESET_AVATARS.map((url, idx) => {
                const isSelected = selectedUrl === url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedUrl(url)}
                    className={`relative rounded-full aspect-square overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 scale-105 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:scale-105'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Custom File */}
          <div className="space-y-2">
            <label className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              Upload Image from Computer
            </label>
            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-neutral-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-[#1b1e2a]/50 hover:bg-slate-100/80 dark:hover:bg-[#1e2230] cursor-pointer transition-all text-slate-600 dark:text-slate-300">
              <Upload className="w-4 h-4 text-slate-400" />
              <span>Choose PNG, JPG, or WebP file</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Custom Image URL */}
          <div className="space-y-2">
            <label className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
              Or Paste Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1b1e2a] border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (customUrl.trim()) {
                    setSelectedUrl(customUrl.trim());
                    setCustomUrl('');
                  }
                }}
                disabled={!customUrl.trim()}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save Avatar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
