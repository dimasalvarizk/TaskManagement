export type Role = 'Admin' | 'Member' | 'Viewer';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export type NotificationType = 'task' | 'invite' | 'comment' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  status: 'active' | 'invited' | 'offline';
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  assigneeIds: string[];
  tags: string[];
  dueDate: string;
  subtasks: SubTask[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface DocBlock {
  id: string;
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet' | 'todo' | 'code' | 'callout';
  content: string;
  checked?: boolean;
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  icon: string;
  blocks: DocBlock[];
  updatedAt: string;
  authorId: string;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  linkTaskId?: string;
  linkDocId?: string;
}

export interface SentEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  sentAt: string;
  type: 'invitation' | 'task_update' | 'comment';
}
