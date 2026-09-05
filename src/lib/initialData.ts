import { Column, Project, Task, User, Document, Activity, NotificationItem, SentEmail } from '@/types';

export const INITIAL_USERS: User[] = [];

export const INITIAL_COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog', color: '#737373' },
  { id: 'todo', title: 'To Do', color: '#3b82f6' },
  { id: 'in_progress', title: 'In Progress', color: '#f59e0b' },
  { id: 'review', title: 'In Review', color: '#a855f7' },
  { id: 'done', title: 'Done', color: '#22c55e' },
];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_DOCS: Document[] = [];

export const INITIAL_ACTIVITIES: Activity[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_SENT_EMAILS: SentEmail[] = [];
