import { create } from 'zustand';
import { Task, Project, Document, User, TaskStatus, Priority, DocBlock, Activity, Role, NotificationItem, SentEmail } from '@/types';
import { INITIAL_COLUMNS, INITIAL_DOCS, INITIAL_PROJECTS, INITIAL_TASKS, INITIAL_USERS, INITIAL_ACTIVITIES, INITIAL_NOTIFICATIONS, INITIAL_SENT_EMAILS } from '@/lib/initialData';
import { playNotificationSound } from '@/lib/audio';
import { getInvitationEmailTemplate } from '@/lib/emailTemplates';

interface SMTPConfig {
  host: string;
  port: string;
  user: string;
  pass: string;
  from: string;
}

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
}

interface WorkspaceState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  docs: Document[];
  activities: Activity[];
  notifications: NotificationItem[];
  sentEmails: SentEmail[];
  isDatabaseConnected: boolean;
  
  // Custom Confirmation Dialog
  confirmModal: ConfirmModalState | null;
  openConfirmModal: (options: Omit<ConfirmModalState, 'isOpen'>) => void;
  closeConfirmModal: () => void;
  
  // Real SMTP Configuration State
  smtpConfig: SMTPConfig;
  setSmtpConfig: (config: Partial<SMTPConfig>) => void;
  
  // Audio & Notification Preferences
  isSoundEnabled: boolean;
  isNotificationDrawerOpen: boolean;
  isEmailInspectorOpen: boolean;
  activeEmailPreview: SentEmail | null;
  
  // Navigation & View Filters
  selectedProjectId: string | null;
  activeView: 'board' | 'list' | 'docs' | 'analytics' | 'settings';
  searchQuery: string;
  selectedPriority: Priority | 'all';
  selectedAssigneeId: string | 'all';
  
  // Theme State
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Selected Item Modals
  activeTaskId: string | null;
  activeDocId: string | null;
  isCommandPaletteOpen: boolean;
  isNewTaskModalOpen: boolean;
  isNewProjectModalOpen: boolean;
  isInstallModalOpen: boolean;
  setInstallModalOpen: (open: boolean) => void;
  isAppInstalled: boolean;
  setIsAppInstalled: (installed: boolean) => void;
  pwaInstallPrompt: any;
  setPwaInstallPrompt: (prompt: any) => void;
  promptInstallApp: () => Promise<boolean>;
  
  // Multi-Workspace Switcher
  isNewWorkspaceModalOpen: boolean;
  setNewWorkspaceModalOpen: (open: boolean) => void;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createNewWorkspace: (name: string) => Promise<{ success: boolean; error?: string }>;
  
  // Data Sync
  fetchWorkspaceData: () => Promise<void>;
  
  // Project Actions
  createProject: (name: string, color?: string, description?: string) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  setNewProjectModalOpen: (open: boolean) => void;
  
  // Auth Actions
  login: (email: string) => boolean;
  loginWithPassword: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUserRole: (role: Role) => void;
  
  // Audio & Drawer Toggles
  toggleSound: () => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setEmailInspectorOpen: (open: boolean) => void;
  setActiveEmailPreview: (email: SentEmail | null) => void;
  
  // Navigation Setters
  setSelectedProjectId: (id: string | null) => void;
  setActiveView: (view: 'board' | 'list' | 'docs' | 'analytics' | 'settings') => void;
  setSearchQuery: (query: string) => void;
  setSelectedPriority: (priority: Priority | 'all') => void;
  setSelectedAssigneeId: (userId: string | 'all') => void;
  setActiveTaskId: (id: string | null) => void;
  setActiveDocId: (id: string | null) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setNewTaskModalOpen: (open: boolean) => void;
  
  // Notifications Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  triggerNotification: (title: string, message: string, type: NotificationItem['type'], linkTaskId?: string) => void;
  
  // Team & User Permissions Actions
  updateUserRole: (userId: string, newRole: Role) => void;
  updateUserAvatar: (userId: string, avatarUrl: string) => Promise<void>;
  inviteUser: (name: string, email: string, role: Role) => Promise<{ success: boolean; realEmailSent: boolean; message: string }>;
  removeUser: (userId: string) => void;
  
  // Task Actions
  moveTask: (taskId: string, targetStatus: TaskStatus) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addComment: (taskId: string, text: string) => void;
  
  // Doc Actions
  updateDocBlocks: (docId: string, blocks: DocBlock[]) => void;
  updateDocTitle: (docId: string, title: string) => Promise<void>;
  createDoc: (title: string, projectId: string) => void;
  deleteDoc: (docId: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => {
  // Helper to read initial offline cache
  const cachedData = typeof window !== 'undefined' ? (() => {
    try {
      const raw = localStorage.getItem('taskflow_workspace_data');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })() : null;

  return {
    currentUser: typeof window !== 'undefined' ? (() => {
      try {
        const stored = localStorage.getItem('taskflow_user');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })() : null,
    users: cachedData?.users && cachedData.users.length ? cachedData.users : INITIAL_USERS,
    projects: cachedData?.projects && cachedData.projects.length ? cachedData.projects : INITIAL_PROJECTS,
    tasks: cachedData?.tasks && cachedData.tasks.length ? cachedData.tasks : INITIAL_TASKS,
    docs: cachedData?.docs && cachedData.docs.length ? cachedData.docs : INITIAL_DOCS,
    activities: cachedData?.activities && cachedData.activities.length ? cachedData.activities : INITIAL_ACTIVITIES,
    notifications: cachedData?.notifications && cachedData.notifications.length ? cachedData.notifications : INITIAL_NOTIFICATIONS,
    sentEmails: cachedData?.sentEmails && cachedData.sentEmails.length ? cachedData.sentEmails : INITIAL_SENT_EMAILS,
    isDatabaseConnected: false,

    confirmModal: null,
    openConfirmModal: (options) => set({ confirmModal: { ...options, isOpen: true } }),
    closeConfirmModal: () => set({ confirmModal: null }),
  
  smtpConfig: {
    host: 'smtp.gmail.com',
    port: '587',
    user: '',
    pass: '',
    from: 'ODST Workspace <noreply@odst.com>',
  },
  
  setSmtpConfig: (updates) =>
    set((state) => ({ smtpConfig: { ...state.smtpConfig, ...updates } })),
  
  isSoundEnabled: true,
  isNotificationDrawerOpen: false,
  isMobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  isEmailInspectorOpen: false,
  activeEmailPreview: INITIAL_SENT_EMAILS[0],
  
  selectedProjectId: null,
  activeView: 'board',
  searchQuery: '',
  selectedPriority: 'all',
  selectedAssigneeId: 'all',
  
  theme: typeof window !== 'undefined' && localStorage.getItem('taskflow_theme') === 'dark' ? 'dark' : 'light',
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskflow_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme: nextTheme });
  },
  setTheme: (newTheme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskflow_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme: newTheme });
  },

  activeTaskId: null,
  activeDocId: 'doc-1',
  isCommandPaletteOpen: false,
  isNewWorkspaceModalOpen: false,
  setNewWorkspaceModalOpen: (open) => set({ isNewWorkspaceModalOpen: open }),
  isNewTaskModalOpen: false,
  setNewTaskModalOpen: (open) => set({ isNewTaskModalOpen: open }),
  isNewProjectModalOpen: false,
  setNewProjectModalOpen: (open) => set({ isNewProjectModalOpen: open }),
  isInstallModalOpen: false,
  setInstallModalOpen: (open) => set({ isInstallModalOpen: open }),
  isAppInstalled: false,
  setIsAppInstalled: (installed) => set({ isAppInstalled: installed }),
  pwaInstallPrompt: null,
  setPwaInstallPrompt: (prompt) => set({ pwaInstallPrompt: prompt }),
  promptInstallApp: async () => {
    set({ isInstallModalOpen: true });
    return true;
  },
  
  switchWorkspace: async (workspaceId: string) => {
    const current = get().currentUser;
    if (!current) return;
    const targetMembership = current.memberships?.find((m) => m.workspaceId === workspaceId);
    if (!targetMembership) return;

    const updatedUser: User = {
      ...current,
      workspaceId: targetMembership.workspaceId,
      workspaceName: targetMembership.workspaceName,
      role: targetMembership.role,
      status: targetMembership.status,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('taskflow_user', JSON.stringify(updatedUser));
    }

    set({
      currentUser: updatedUser,
      selectedProjectId: null,
      activeTaskId: null,
      activeDocId: null,
    });

    get().triggerNotification('Switched Workspace', `Active workspace is now "${targetMembership.workspaceName}"`, 'system');
    await get().fetchWorkspaceData();
  },

  createNewWorkspace: async (name: string) => {
    const current = get().currentUser;
    if (!current) return { success: false, error: 'User not logged in' };

    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId: current.id }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.membership) {
        const updatedMemberships = [...(current.memberships || []), data.membership];
        const updatedUser: User = {
          ...current,
          workspaceId: data.membership.workspaceId,
          workspaceName: data.membership.workspaceName,
          role: 'Admin',
          status: 'active',
          memberships: updatedMemberships,
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('taskflow_user', JSON.stringify(updatedUser));
        }

        set({
          currentUser: updatedUser,
          isNewWorkspaceModalOpen: false,
          selectedProjectId: null,
        });

        get().triggerNotification('Workspace Created', `Created and switched to "${name}"`, 'system');
        await get().fetchWorkspaceData();
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to create workspace' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },
  
  createProject: async (name: string, color = '#6366f1', description = '') => {
    const current = get().currentUser;
    const tempId = 'p-' + Date.now();
    const newProject: Project = {
      id: tempId,
      name,
      icon: '🚀',
      color,
      description,
      workspaceId: current?.workspaceId,
    };

    set((state) => ({
      projects: [...state.projects, newProject],
      selectedProjectId: tempId,
      isNewProjectModalOpen: false,
    }));

    get().triggerNotification('Project Created', `Added "${name}" to workspace`, 'system');

    // Sync to MySQL
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, description, workspaceId: current?.workspaceId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          set((state) => ({
            projects: state.projects.map((p) => (p.id === tempId ? data.project : p)),
            selectedProjectId: state.selectedProjectId === tempId ? data.project.id : state.selectedProjectId,
          }));
        }
      }
    } catch (err) {
      console.warn('Sync createProject error:', err);
    }
  },

  updateProject: async (projectId: string, updates: Partial<Project>) => {
    const current = get().currentUser;
    if (current?.role === 'Viewer') return;

    set((state) => ({
      projects: state.projects.map((p) => (p.id === projectId ? { ...p, ...updates } : p)),
    }));

    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.warn('Sync updateProject error:', err);
    }
  },

  deleteProject: async (projectId: string) => {
    const current = get().currentUser;
    if (current?.role === 'Viewer') return;

    const targetProject = get().projects.find((p) => p.id === projectId);
    const projectName = targetProject?.name || 'Project';

    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      tasks: state.tasks.filter((t) => t.projectId !== projectId),
      docs: state.docs.filter((d) => d.projectId !== projectId),
      selectedProjectId: state.selectedProjectId === projectId ? null : state.selectedProjectId,
    }));

    get().triggerNotification('Project Deleted', `Deleted "${projectName}" and its tasks/docs`, 'system');

    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Sync deleteProject error:', err);
    }
  },
  
  fetchWorkspaceData: async () => {
    try {
      const current = get().currentUser;
      const queryParams = new URLSearchParams();
      if (current?.workspaceId) queryParams.set('workspaceId', current.workspaceId);
      if (current?.email) queryParams.set('email', current.email);

      const url = `/api/workspace/sync${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const newWorkspaceData = {
            users: data.users && data.users.length ? data.users : (current ? [current] : get().users),
            projects: data.projects || [],
            tasks: data.tasks || [],
            docs: data.docs || [],
            activities: data.activities || [],
            notifications: data.notifications || [],
            sentEmails: data.sentEmails || [],
            isDatabaseConnected: true,
          };

          // Refresh current user if exists
          let nextCurrentUser = current;
          if (current && data.users) {
            const updatedCurrent = data.users.find(
              (u: User) =>
                u.id === current.id ||
                (u.email && current.email && u.email.toLowerCase() === current.email.toLowerCase())
            );
            if (updatedCurrent) {
              nextCurrentUser = {
                ...current,
                ...updatedCurrent,
                workspaceId: updatedCurrent.workspaceId || current.workspaceId,
                workspaceName: current.workspaceName,
              };
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem('taskflow_user', JSON.stringify(nextCurrentUser));
                } catch (_) {}
              }
            }
          }

          set({
            ...newWorkspaceData,
            currentUser: nextCurrentUser,
          });
        }
      }
    } catch (err) {
      console.warn('Workspace sync warning: fallback to local cached state.', err);
      // Attempt restore from local storage cache
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('taskflow_workspace_data');
          if (cached) {
            const parsed = JSON.parse(cached);
            set({
              users: parsed.users || get().users,
              projects: parsed.projects || get().projects,
              tasks: parsed.tasks || get().tasks,
              docs: parsed.docs || get().docs,
              activities: parsed.activities || get().activities,
              notifications: parsed.notifications || get().notifications,
              sentEmails: parsed.sentEmails || get().sentEmails,
            });
          }
        } catch (_) {}
      }
    }
  },

  login: (email: string) => {
    const found = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('taskflow_user', JSON.stringify(found));
      }
      set({ currentUser: found });
      return true;
    }
    return false;
  },

  loginWithPassword: async (email: string, password?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('taskflow_user', JSON.stringify(data.user));
        }
        set({ currentUser: data.user });
        await get().fetchWorkspaceData();
        return { success: true };
      } else {
        // Fallback to local user check
        const localUser = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (localUser) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('taskflow_user', JSON.stringify(localUser));
          }
          set({ currentUser: localUser });
          return { success: true };
        }
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch {
      const localUser = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (localUser) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('taskflow_user', JSON.stringify(localUser));
        }
        set({ currentUser: localUser });
        return { success: true };
      }
      return { success: false, error: 'Failed to authenticate' };
    }
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('taskflow_user');
      localStorage.removeItem('taskflow_workspace_data');
    }
    set({
      currentUser: null,
      projects: [],
      tasks: [],
      docs: [],
      users: [],
      activities: [],
      notifications: [],
      sentEmails: [],
    });
  },
  
  switchUserRole: (role: Role) => {
    const matchedUser = get().users.find((u) => u.role === role) || get().users[0];
    if (matchedUser) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('taskflow_user', JSON.stringify(matchedUser));
      }
      set({ currentUser: matchedUser });
    }
  },
  
  toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
  setNotificationDrawerOpen: (open) => set({ isNotificationDrawerOpen: open }),
  setEmailInspectorOpen: (open) => set({ isEmailInspectorOpen: open }),
  setActiveEmailPreview: (email) => set({ activeEmailPreview: email }),
  
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setActiveView: (view) => set({ activeView: view }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedPriority: (priority) => set({ selectedPriority: priority }),
  setSelectedAssigneeId: (userId) => set({ selectedAssigneeId: userId }),
  setActiveTaskId: (id) => set({ activeTaskId: id }),
  setActiveDocId: (id) => set({ activeDocId: id }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  
  // Notification Dispatcher
  triggerNotification: (title, message, type, linkTaskId) => {
    const current = get().currentUser;
    if (get().isSoundEnabled) {
      playNotificationSound();
    }
    
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: current?.id || 'u1',
      title,
      message,
      type,
      read: false,
      createdAt: 'Just now',
      linkTaskId,
    };
    
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
    }));
  },
  
  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));

    // Async sync to MySQL
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  },
  
  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));

    // Async sync to MySQL
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readAll: true }),
    }).catch(() => {});
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
    fetch('/api/notifications', { method: 'DELETE' }).catch(() => {});
  },
  
  // Real Email Member Invitation
  inviteUser: async (name, email, role) => {
    const current = get().currentUser;
    if (current?.role !== 'Admin') {
      return { success: false, realEmailSent: false, message: 'Only Admins can invite team members.' };
    }
    
    const cleanEmail = email.toLowerCase().trim();
    let dbUser: User = {
      id: 'u-' + Date.now(),
      name,
      email: cleanEmail,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      role,
      status: 'invited',
      workspaceId: current.workspaceId,
      workspaceName: current.workspaceName,
    };

    // 1. First save to MySQL via API to get real DB IDs
    try {
      const userRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: cleanEmail, role, workspaceId: current.workspaceId }),
      });
      const userData = await userRes.json();
      if (userData.success && userData.user) {
        dbUser = {
          id: userData.user.id || userData.user.userId || dbUser.id,
          name: userData.user.name || name,
          email: userData.user.email || cleanEmail,
          avatar: userData.user.avatar || dbUser.avatar,
          role: userData.user.role || role,
          status: userData.user.status || 'invited',
          workspaceId: userData.user.workspaceId || current.workspaceId,
          workspaceName: current.workspaceName,
        };
      }
    } catch (err) {
      console.warn('User create sync warning:', err);
    }
    
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteUrl = `${origin}/register?invite=${dbUser.id}`;
    const emailHtml = getInvitationEmailTemplate(name, cleanEmail, role, inviteUrl);
    
    const sentEmailItem: SentEmail = {
      id: 'em-' + Date.now(),
      to: cleanEmail,
      subject: `⚡ Invitation to join ${current.workspaceName || 'ODST Task Management'} (${role})`,
      html: emailHtml,
      sentAt: 'Just now',
      type: 'invitation',
    };
    
    let realEmailSent = false;
    let resultMessage = `Invitation sent to ${cleanEmail}`;

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cleanEmail,
          subject: sentEmailItem.subject,
          html: emailHtml,
          type: 'invitation',
          smtpConfig: get().smtpConfig,
        }),
      });
      
      const data = await res.json();
      if (res.ok && data.realEmailSent) {
        realEmailSent = true;
        resultMessage = `Real email delivered to ${cleanEmail} via SMTP!`;
      } else if (data.note) {
        resultMessage = data.note;
      }
    } catch (err: unknown) {
      console.error('Email API call error:', err);
    }
    
    get().triggerNotification(
      realEmailSent ? 'Real Invitation Email Sent' : 'Team Member Invited',
      realEmailSent ? `Delivered real email to ${cleanEmail}` : `Invited ${cleanEmail} (${role})`,
      'invite'
    );
    
    set((state) => ({
      users: [...state.users.filter((u) => u.email !== cleanEmail), dbUser],
      sentEmails: [sentEmailItem, ...state.sentEmails],
      activities: [
        {
          id: 'act-' + Date.now(),
          userId: current.id,
          action: realEmailSent ? 'sent real invitation email to' : 'invited team member',
          target: `${name} (${cleanEmail})`,
          timestamp: 'Just now',
        },
        ...state.activities,
      ],
    }));

    return { success: true, realEmailSent, message: resultMessage };
  },
  
  updateUserRole: (userId, newRole) => {
    const current = get().currentUser;
    if (current?.role !== 'Admin') return;
    
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      currentUser: state.currentUser?.id === userId ? { ...state.currentUser, role: newRole } : state.currentUser,
    }));
    
    // Sync to MySQL
    fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    }).catch(() => {});

    get().triggerNotification('User Role Updated', `Role updated to ${newRole}.`, 'system');
  },
  
  updateUserAvatar: async (userId: string, avatarUrl: string) => {
    set((state) => {
      const updatedUsers = state.users.map((u) => (u.id === userId ? { ...u, avatar: avatarUrl } : u));
      let updatedCurrent = state.currentUser;
      if (state.currentUser && (state.currentUser.id === userId || state.currentUser.email.toLowerCase() === get().users.find(u => u.id === userId)?.email.toLowerCase())) {
        updatedCurrent = { ...state.currentUser, avatar: avatarUrl };
        if (typeof window !== 'undefined') {
          localStorage.setItem('taskflow_user', JSON.stringify(updatedCurrent));
        }
      }
      return {
        users: updatedUsers,
        currentUser: updatedCurrent,
      };
    });

    get().triggerNotification('Profile Photo Updated', 'Your avatar has been updated.', 'system');

    // Sync to MySQL
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarUrl }),
      });
      await get().fetchWorkspaceData();
    } catch (err) {
      console.warn('Sync avatar error:', err);
    }
  },
  
  removeUser: (userId) => {
    const current = get().currentUser;
    if (current?.role !== 'Admin' || userId === current.id) return;
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    }));

    // Sync to MySQL
    fetch(`/api/users/${userId}`, { method: 'DELETE' }).catch(() => {});
  },
  
  // Task Actions
  moveTask: (taskId, targetStatus) => {
    const current = get().currentUser;
    if (current?.role === 'Viewer') return;
    
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;
    
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: targetStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : t
      ),
    }));

    // Sync status change to MySQL
    fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetStatus }),
    }).catch((err) => console.warn('Sync moveTask error:', err));

    get().triggerNotification(
      'Task Status Changed',
      `Moved "${task.title}" to ${targetStatus.replace('_', ' ').toUpperCase()}`,
      'task',
      taskId
    );
  },
  
  addTask: async (newTaskData) => {
    const current = get().currentUser;
    if (current?.role === 'Viewer') return;
    
    const tempId = 'task-' + Date.now();
    const newTask: Task = {
      ...newTaskData,
      id: tempId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      comments: [],
    };
    
    set((state) => ({
      tasks: [newTask, ...state.tasks],
      isNewTaskModalOpen: false,
    }));

    get().triggerNotification('New Task Created', `Added "${newTask.title}"`, 'task', newTask.id);

    // Sync to MySQL
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.task) {
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === tempId ? data.task : t)),
          }));
        }
      }
    } catch (err) {
      console.warn('Sync addTask error:', err);
    }
  },
  
  updateTask: (taskId, updates) => {
    const current = get().currentUser;
    if (current?.role === 'Viewer') return;
    
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : t
      ),
    }));

    // Sync to MySQL
    fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  },
  
  deleteTask: (taskId) => {
    const current = get().currentUser;
    if (current?.role !== 'Admin') return;
    
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId,
    }));

    // Sync to MySQL
    fetch(`/api/tasks/${taskId}`, { method: 'DELETE' }).catch(() => {});

    get().triggerNotification('Task Deleted', 'Task permanently removed', 'system');
  },
  
  toggleSubtask: (taskId, subtaskId) => {
    const current = get().currentUser;
    if (current?.role === 'Viewer') return;
    
    let updatedSubtasks: any[] = [];

    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        updatedSubtasks = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return {
          ...t,
          subtasks: updatedSubtasks,
        };
      }),
    }));

    // Sync to MySQL
    if (updatedSubtasks.length > 0) {
      fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks }),
      }).catch(() => {});
    }
  },
  
  addComment: (taskId, text) => {
    const current = get().currentUser;
    if (!current || !text.trim()) return;
    
    const newComment = {
      id: 'c-' + Date.now(),
      authorId: current.id,
      text,
      createdAt: 'Just now',
    };
    
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t
      ),
    }));

    // Sync to MySQL
    fetch(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId: current.id, text }),
    }).catch(() => {});

    get().triggerNotification('New Task Comment', `${current.name}: "${text}"`, 'comment', taskId);
  },
  
  updateDocBlocks: (docId, blocks) => {
    const current = get().currentUser;
    if (current?.role === 'Viewer') return;
    
    set((state) => ({
      docs: state.docs.map((d) =>
        d.id === docId
          ? { ...d, blocks, updatedAt: new Date().toISOString().split('T')[0] }
          : d
      ),
    }));

    // Sync to MySQL
    fetch(`/api/docs/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    }).catch(() => {});
  },

  updateDocTitle: async (docId: string, title: string) => {
    const current = get().currentUser;
    if (current?.role === 'Viewer') return;

    set((state) => ({
      docs: state.docs.map((d) =>
        d.id === docId
          ? { ...d, title, updatedAt: new Date().toISOString().split('T')[0] }
          : d
      ),
    }));

    try {
      await fetch(`/api/docs/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
    } catch (err) {
      console.warn('Sync updateDocTitle error:', err);
    }
  },
  
  createDoc: async (title, projectId) => {
    const current = get().currentUser;
    if (current?.role === 'Viewer') return;
    
    let targetProjectId = projectId;
    if (!targetProjectId || targetProjectId === 'all') {
      targetProjectId = get().projects[0]?.id || '';
    }

    const tempId = 'doc-' + Date.now();
    const defaultBlocks = [
      { id: 'b1', type: 'h1' as const, content: title || 'Untitled Note' },
      { id: 'b2', type: 'paragraph' as const, content: 'Start typing notes or press / for slash menu...' }
    ];

    const newDoc: Document = {
      id: tempId,
      projectId: targetProjectId,
      title: title || 'Untitled Note',
      icon: '📄',
      updatedAt: new Date().toISOString().split('T')[0],
      authorId: current?.id || 'u1',
      blocks: defaultBlocks,
    };
    
    set((state) => ({
      docs: [newDoc, ...state.docs],
      activeDocId: newDoc.id,
      activeView: 'docs'
    }));

    get().triggerNotification('New Notion Document', `Created "${newDoc.title}"`, 'system');

    // Sync to MySQL
    try {
      const res = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled Note',
          projectId: targetProjectId,
          icon: '📄',
          authorId: current?.id || 'u1',
          blocks: defaultBlocks,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.doc) {
          set((state) => ({
            docs: state.docs.map((d) => (d.id === tempId ? data.doc : d)),
            activeDocId: state.activeDocId === tempId ? data.doc.id : state.activeDocId,
          }));
        }
      }
    } catch (err) {
      console.warn('Sync createDoc error:', err);
    }
  },

  deleteDoc: async (docId: string) => {
    const current = get().currentUser;
    if (current?.role === 'Viewer') return;

    const targetDoc = get().docs.find((d) => d.id === docId);
    const docTitle = targetDoc?.title || 'Document';
    const remainingDocs = get().docs.filter((d) => d.id !== docId);

    set((state) => ({
      docs: remainingDocs,
      activeDocId:
        state.activeDocId === docId
          ? (remainingDocs[0]?.id || null)
          : state.activeDocId,
    }));

    get().triggerNotification('Document Deleted', `Deleted "${docTitle}"`, 'system');

    try {
      await fetch(`/api/docs/${docId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Sync deleteDoc error:', err);
    }
  },
  };
});
