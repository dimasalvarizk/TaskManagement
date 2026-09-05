import { Column, Project, Task, User, Document, Activity, NotificationItem, SentEmail } from '@/types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Morgan',
    email: 'admin@taskflow.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Admin',
    status: 'active',
  },
  {
    id: 'u2',
    name: 'David Chen',
    email: 'member@taskflow.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Member',
    status: 'active',
  },
  {
    id: 'u3',
    name: 'Sophia Patel',
    email: 'designer@taskflow.io',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Member',
    status: 'active',
  },
  {
    id: 'u4',
    name: 'Marcus Vance',
    email: 'viewer@taskflow.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Viewer',
    status: 'active',
  },
];

export const INITIAL_COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog', color: '#737373' },
  { id: 'todo', title: 'To Do', color: '#3b82f6' },
  { id: 'in_progress', title: 'In Progress', color: '#f59e0b' },
  { id: 'review', title: 'In Review', color: '#a855f7' },
  { id: 'done', title: 'Done', color: '#22c55e' },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Product Architecture',
    icon: '',
    color: '#6366f1',
    description: 'Core application engine & workspace task management workflow.',
  },
  {
    id: 'p2',
    name: 'Design System',
    icon: '',
    color: '#ec4899',
    description: 'Minimalist UI tokens, typography, and dark mode aesthetics.',
  },
  {
    id: 'p3',
    name: 'Authentication & Permissions',
    icon: '',
    color: '#10b981',
    description: 'Role-based access control, session management, and team settings.',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-101',
    title: 'Implement Role-Based Permission Guards (Admin, Member, Viewer)',
    description: 'Enforce access controls so Viewers are read-only, Members can edit tasks, and Admins manage workspace team roles.',
    status: 'in_progress',
    priority: 'urgent',
    projectId: 'p3',
    assigneeIds: ['u1', 'u2'],
    tags: ['Auth', 'Backend', 'Security'],
    dueDate: '2026-09-10',
    subtasks: [
      { id: 'st1', title: 'Define Role types in TypeScript', completed: true },
      { id: 'st2', title: 'Create Permission validation helpers', completed: true },
      { id: 'st3', title: 'Build Team & Settings user management panel', completed: false },
    ],
    comments: [
      { id: 'c1', authorId: 'u1', text: 'Admin accounts must be able to change user roles dynamically.', createdAt: '10 mins ago' }
    ],
    createdAt: '2026-09-01',
    updatedAt: '2026-09-04',
  },
  {
    id: 'task-102',
    title: 'Refactor UI to Minimal Linear/Notion Aesthetics',
    description: 'Clean dark theme with subtle borders (#262626), high contrast typography, and uncluttered navigation.',
    status: 'done',
    priority: 'high',
    projectId: 'p2',
    assigneeIds: ['u3'],
    tags: ['Design', 'Minimalist', 'UI'],
    dueDate: '2026-09-05',
    subtasks: [
      { id: 'st10', title: 'Replace glowing gradients with neutral slate styling', completed: true },
      { id: 'st11', title: 'Remove cluttered widgets from workspace area', completed: true },
    ],
    comments: [],
    createdAt: '2026-09-02',
    updatedAt: '2026-09-04',
  },
  {
    id: 'task-103',
    title: 'Notion-Style Block Notes Slash Commands',
    description: 'Interactive slash menu for inserting Headings, Checklists, Callouts, and Code snippets.',
    status: 'todo',
    priority: 'medium',
    projectId: 'p1',
    assigneeIds: ['u2'],
    tags: ['Notion', 'Editor', 'Feature'],
    dueDate: '2026-09-12',
    subtasks: [],
    comments: [],
    createdAt: '2026-09-03',
    updatedAt: '2026-09-04',
  }
];

export const INITIAL_DOCS: Document[] = [
  {
    id: 'doc-1',
    projectId: 'p1',
    title: 'Workspace Design & Security Specifications',
    icon: '',
    updatedAt: '2026-09-04',
    authorId: 'u1',
    blocks: [
      { id: 'b1', type: 'h1', content: 'TaskFlow Architecture & Principles' },
      { id: 'b2', type: 'callout', content: 'Designed for ultimate simplicity, speed, and privacy on your own server.' },
      { id: 'b3', type: 'paragraph', content: 'We prioritize clean minimalism, uncluttered workflows, and robust role permissions.' },
      { id: 'b4', type: 'h2', content: 'User Roles & Permissions Matrix' },
      { id: 'b5', type: 'todo', content: 'Admin: Full workspace control, team management, task deletion', checked: true },
      { id: 'b6', type: 'todo', content: 'Member: Task creation, status updates, doc editing', checked: true },
      { id: 'b7', type: 'todo', content: 'Viewer: Read-only access across boards and documents', checked: true },
    ]
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    userId: 'u1',
    action: 'updated permissions for',
    target: 'Role-Based Access Control',
    timestamp: '5 minutes ago'
  },
  {
    id: 'act-2',
    userId: 'u3',
    action: 'completed task',
    target: 'Refactor UI to Minimal Linear Aesthetics',
    timestamp: '1 hour ago'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    userId: 'u1',
    title: 'New Team Invitation Sent',
    message: 'Invitation email dispatched to david@company.io with Member role.',
    type: 'invite',
    read: false,
    createdAt: '5 minutes ago',
  },
  {
    id: 'n-2',
    userId: 'u1',
    title: 'Task Assigned',
    message: 'Alex assigned you to "Implement Role-Based Permission Guards".',
    type: 'task',
    read: false,
    createdAt: '15 minutes ago',
    linkTaskId: 'task-101',
  },
  {
    id: 'n-3',
    userId: 'u1',
    title: 'New Comment',
    message: 'David Chen commented on "TaskFlow Architecture & Principles".',
    type: 'comment',
    read: true,
    createdAt: '1 hour ago',
  }
];

export const INITIAL_SENT_EMAILS: SentEmail[] = [
  {
    id: 'em-1',
    to: 'david@company.io',
    subject: 'You have been invited to TaskFlow Workspace',
    html: '<h1>Welcome to TaskFlow</h1><p>You have been assigned Member role access.</p>',
    sentAt: '5 minutes ago',
    type: 'invitation',
  }
];
