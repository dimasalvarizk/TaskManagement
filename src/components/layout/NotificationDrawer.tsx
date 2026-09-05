'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { NotificationType } from '@/types';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  Mail,
  ExternalLink
} from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const {
    notifications,
    isNotificationDrawerOpen,
    setNotificationDrawerOpen,
    isSoundEnabled,
    toggleSound,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    setActiveTaskId,
    setEmailInspectorOpen
  } = useWorkspaceStore();

  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  if (!isNotificationDrawerOpen) return null;

  const filteredNotifs = notifications.filter((n) =>
    filter === 'all' ? true : n.type === filter
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotifClick = (notifId: string, linkTaskId?: string) => {
    markNotificationAsRead(notifId);
    if (linkTaskId) {
      setActiveTaskId(linkTaskId);
      setNotificationDrawerOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-sm bg-white dark:bg-[#16181f] border-l border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between shadow-2xl text-xs select-none text-slate-800 dark:text-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-600 text-white font-medium">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isSoundEnabled ? 'Sound Enabled' : 'Muted'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              onClick={() => setNotificationDrawerOpen(false)}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills & Actions */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-1">
            {(['all', 'task', 'invite', 'comment'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 rounded text-[10px] font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'task' ? 'Tasks' : f === 'invite' ? 'Invites' : 'Comments'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={markAllNotificationsAsRead}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearNotifications}
              className="p-1 rounded text-slate-400 hover:text-red-500"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotifClick(n.id, n.linkTaskId)}
              className={`p-3 rounded-lg border transition-colors cursor-pointer space-y-1 ${
                n.read
                  ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  : 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 text-slate-900 dark:text-slate-100 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-xs truncate">{n.title}</span>
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 shrink-0">{n.createdAt}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">{n.message}</p>
              {n.linkTaskId && (
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono flex items-center gap-1 pt-1">
                  <span>View Task</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}

          {filteredNotifs.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              No notifications.
            </div>
          )}
        </div>

        {/* Email Inspector Quick Trigger Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <button
            onClick={() => {
              setEmailInspectorOpen(true);
              setNotificationDrawerOpen(false);
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Outbox Email Log</span>
          </button>
        </div>
      </div>
    </div>
  );
};

