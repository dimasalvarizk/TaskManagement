'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Role } from '@/types';
import {
  Shield,
  UserPlus,
  Trash2,
  Mail,
  Send,
  Lock,
  Camera,
} from 'lucide-react';
import { AvatarEditModal } from './AvatarEditModal';
import { User } from '@/types';

export const TeamSettingsView: React.FC = () => {
  const {
    currentUser,
    users,
    smtpConfig,
    setSmtpConfig,
    updateUserRole,
    inviteUser,
    removeUser,
    switchUserRole,
    openConfirmModal,
    triggerNotification
  } = useWorkspaceStore();

  const [editingAvatarUser, setEditingAvatarUser] = useState<User | null>(null);

  const liveUser = users.find(
    (u) =>
      u.id === currentUser?.id ||
      (u.email && currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
  ) || currentUser;

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('Member');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  // Test Email state
  const [testRecipientEmail, setTestRecipientEmail] = useState(currentUser?.email || '');
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  React.useEffect(() => {
    if (currentUser?.email) {
      setTestRecipientEmail(currentUser.email);
    }
  }, [currentUser?.email]);

  const isAdmin = currentUser?.role === 'Admin';

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    setIsInviting(true);
    setInviteStatus({ type: 'info', msg: 'Sending invitation...' });

    const res = await inviteUser(inviteName, inviteEmail, inviteRole);
    if (res.realEmailSent) {
      setInviteStatus({ type: 'success', msg: `Email invitation sent to ${inviteEmail}.` });
    } else {
      setInviteStatus({
        type: 'info',
        msg: `Member successfully added to the team.`
      });
    }

    setInviteName('');
    setInviteEmail('');
    setIsInviting(false);
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipientEmail) return;
    setIsSendingTest(true);
    setTestStatus({ type: 'info', msg: 'Connecting to SMTP server...' });

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testRecipientEmail,
          subject: 'TaskFlow - SMTP Configuration Test',
          html: `
            <div style="font-family: sans-serif; background: #0f1117; color: #f8fafc; padding: 24px; border-radius: 8px;">
              <h2 style="color: #6366f1;">TaskFlow - SMTP Configuration Successful</h2>
              <p>Hello <strong>${testRecipientEmail}</strong>,</p>
              <p>Your SMTP email server configuration is working properly.</p>
            </div>
          `,
          smtpConfig,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.realEmailSent) {
          setTestStatus({ type: 'success', msg: `Test email sent successfully to ${testRecipientEmail}.` });
          triggerNotification('Email Sent', `Email delivered to ${testRecipientEmail}`, 'invite');
        } else {
          setTestStatus({ type: 'info', msg: data.note || 'SMTP configuration is incomplete. Please enter SMTP User & Password.' });
        }
      } else {
        setTestStatus({ type: 'error', msg: data.error || 'Failed to send email. Please check SMTP credentials.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setTestStatus({ type: 'error', msg: `Connection failed: ${msg}` });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto max-h-[calc(100vh-70px)] text-xs text-slate-800 dark:text-slate-200">
      {/* Current Session Role Quick Switcher */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16181f] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer" onClick={() => (liveUser || currentUser) && setEditingAvatarUser(liveUser || currentUser)}>
            <img
              src={liveUser?.avatar || currentUser?.avatar}
              alt={liveUser?.name || currentUser?.name}
              className="w-11 h-11 rounded-full border-2 border-indigo-500/30 object-cover shrink-0 transition-transform group-hover:scale-105 shadow-sm"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{liveUser?.name || currentUser?.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {liveUser?.role || currentUser?.role}
              </span>
              <button
                onClick={() => (liveUser || currentUser) && setEditingAvatarUser(liveUser || currentUser)}
                className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 ml-1 cursor-pointer"
              >
                <Camera className="w-3 h-3" />
                Change Photo
              </button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{liveUser?.email || currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* SMTP Email Server Configuration */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16181f] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
              Email Server Configuration (SMTP)
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Connect an SMTP server to deliver notifications and invitations directly to team inboxes.
            </p>
          </div>
          <div className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {smtpConfig.user ? 'SMTP Configured' : 'SMTP Not Configured'}
          </div>
        </div>

        <form onSubmit={handleSendTestEmail} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">SMTP Host</label>
              <input
                type="text"
                required
                value={smtpConfig.host}
                onChange={(e) => setSmtpConfig({ host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Port</label>
              <input
                type="text"
                required
                value={smtpConfig.port}
                onChange={(e) => setSmtpConfig({ port: e.target.value })}
                placeholder="587"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Email / User</label>
              <input
                type="email"
                placeholder="name@email.com"
                value={smtpConfig.user}
                onChange={(e) => setSmtpConfig({ user: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">App Password</label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={smtpConfig.pass}
                onChange={(e) => setSmtpConfig({ pass: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Test Dispatch Bar */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-slate-500 dark:text-slate-400 shrink-0">Test Recipient Email:</span>
              <input
                type="email"
                required
                placeholder="name@email.com"
                value={testRecipientEmail}
                onChange={(e) => setTestRecipientEmail(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingTest}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingTest ? 'Sending...' : 'Send Test Email'}</span>
            </button>
          </div>

          {/* Test Status Banner */}
          {testStatus && (
            <div
              className={`p-2.5 rounded-lg border text-xs ${
                testStatus.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
                  : testStatus.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {testStatus.msg}
            </div>
          )}
        </form>
      </div>

      {/* Team Member Management Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Team Members ({users.length})</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage access levels and permissions for team members in this workspace.</p>
          </div>

          {isAdmin ? (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Member</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Only Admins can invite members
            </div>
          )}
        </div>

        {/* Invite Form */}
        {isInviteOpen && (
          <form
            onSubmit={handleInviteSubmit}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs"
          >
            <div className="font-semibold text-slate-900 dark:text-slate-100">Invite New Member</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
              <input
                type="email"
                required
                placeholder="name@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            {inviteStatus && (
              <div
                className={`p-2 rounded-lg border text-xs ${
                  inviteStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {inviteStatus.msg}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsInviteOpen(false);
                  setInviteStatus(null);
                }}
                className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isInviting}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        )}

        {/* Member Table */}
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12141a] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[500px]">
              <thead className="bg-slate-50 dark:bg-slate-900/70 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="relative group cursor-pointer shrink-0"
                          onClick={() => (isAdmin || user.id === currentUser?.id) && setEditingAvatarUser(user)}
                          title="Click to edit photo"
                        >
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-800 transition-transform group-hover:scale-105"
                          />
                          {(isAdmin || user.id === currentUser?.id) && (
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{user.name}</span>
                            {user.status === 'invited' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                Invited
                              </span>
                            )}
                          </div>
                          {(isAdmin || user.id === currentUser?.id) && (
                            <button
                              onClick={() => setEditingAvatarUser(user)}
                              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline text-left cursor-pointer"
                            >
                              Edit Photo
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{user.email}</td>
                    <td className="py-3 px-4">
                      {isAdmin && user.id !== currentUser.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as Role)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded px-2 py-1 cursor-pointer focus:outline-none"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Member">Member</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {user.status === 'invited' && (
                          <button
                            onClick={() => {
                              const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?invite=${user.id}`;
                              navigator.clipboard.writeText(inviteUrl);
                              triggerNotification('Invite Link Copied', `Copied link for ${user.email}`, 'invite');
                            }}
                            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-[10px] font-medium transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                            title="Copy invitation link to clipboard"
                          >
                            Copy Link
                          </button>
                        )}
                        {isAdmin && user.id !== currentUser.id && (
                          <button
                            onClick={() => {
                              openConfirmModal({
                                title: 'Remove Team Member',
                                message: `Are you sure you want to remove "${user.name}" (${user.email}) from this workspace team?`,
                                confirmLabel: 'Remove Member',
                                variant: 'danger',
                                onConfirm: () => removeUser(user.id),
                              });
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Remove user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Avatar Edit Modal */}
      {editingAvatarUser && (
        <AvatarEditModal
          user={editingAvatarUser}
          isOpen={Boolean(editingAvatarUser)}
          onClose={() => setEditingAvatarUser(null)}
        />
      )}
    </div>
  );
};

