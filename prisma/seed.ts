import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Checking TaskFlow database for initial seed...');

  // Only seed if database is completely empty
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('ℹ️ Database already contains data. Skipping initial seeding.');
    return;
  }

  console.log('🌱 Seeding fresh database...');

  // Default hashed password: "password123"
  const defaultHashedPassword = await bcrypt.hash('password123', 10);

  // 2. Seed Users
  const users = [
    {
      id: 'u1',
      name: 'Alex Morgan',
      email: 'admin@taskflow.io',
      password: defaultHashedPassword,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Admin',
      status: 'active',
    },
    {
      id: 'u2',
      name: 'David Chen',
      email: 'member@taskflow.io',
      password: defaultHashedPassword,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Member',
      status: 'active',
    },
    {
      id: 'u3',
      name: 'Sophia Patel',
      email: 'designer@taskflow.io',
      password: defaultHashedPassword,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'Member',
      status: 'active',
    },
    {
      id: 'u4',
      name: 'Marcus Vance',
      email: 'viewer@taskflow.io',
      password: defaultHashedPassword,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Viewer',
      status: 'active',
    },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log('✅ Seeded 4 Users (Default password: password123)');

  // 3. Seed Projects
  const projects = [
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

  for (const p of projects) {
    await prisma.project.create({ data: p });
  }
  console.log('✅ Seeded 3 Projects');

  // 4. Seed Tasks with SubTasks and Comments
  const task1 = await prisma.task.create({
    data: {
      id: 'task-101',
      title: 'Implement Role-Based Permission Guards (Admin, Member, Viewer)',
      description: 'Enforce access controls so Viewers are read-only, Members can edit tasks, and Admins manage workspace team roles.',
      status: 'in_progress',
      priority: 'urgent',
      projectId: 'p3',
      assigneeIds: JSON.stringify(['u1', 'u2']),
      tags: JSON.stringify(['Auth', 'Backend', 'Security']),
      dueDate: '2026-09-10',
      subtasks: {
        create: [
          { id: 'st1', title: 'Define Role types in TypeScript', completed: true },
          { id: 'st2', title: 'Create Permission validation helpers', completed: true },
          { id: 'st3', title: 'Build Team & Settings user management panel', completed: false },
        ],
      },
      comments: {
        create: [
          { id: 'c1', authorId: 'u1', text: 'Admin accounts must be able to change user roles dynamically.' },
        ],
      },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      id: 'task-102',
      title: 'Refactor UI to Minimal Linear/Notion Aesthetics',
      description: 'Clean dark theme with subtle borders (#262626), high contrast typography, and uncluttered navigation.',
      status: 'done',
      priority: 'high',
      projectId: 'p2',
      assigneeIds: JSON.stringify(['u3']),
      tags: JSON.stringify(['Design', 'Minimalist', 'UI']),
      dueDate: '2026-09-05',
      subtasks: {
        create: [
          { id: 'st10', title: 'Replace glowing gradients with neutral slate styling', completed: true },
          { id: 'st11', title: 'Remove cluttered widgets from workspace area', completed: true },
        ],
      },
    },
  });

  const task3 = await prisma.task.create({
    data: {
      id: 'task-103',
      title: 'Notion-Style Block Notes Slash Commands',
      description: 'Interactive slash menu for inserting Headings, Checklists, Callouts, and Code snippets.',
      status: 'todo',
      priority: 'medium',
      projectId: 'p1',
      assigneeIds: JSON.stringify(['u2']),
      tags: JSON.stringify(['Notion', 'Editor', 'Feature']),
      dueDate: '2026-09-12',
    },
  });

  console.log('✅ Seeded Tasks with subtasks & comments');

  // 5. Seed Documents
  await prisma.document.create({
    data: {
      id: 'doc-1',
      projectId: 'p1',
      title: 'Workspace Design & Security Specifications',
      icon: '',
      authorId: 'u1',
      blocks: JSON.stringify([
        { id: 'b1', type: 'h1', content: 'TaskFlow Architecture & Principles' },
        { id: 'b2', type: 'callout', content: 'Designed for ultimate simplicity, speed, and privacy on your own server.' },
        { id: 'b3', type: 'paragraph', content: 'We prioritize clean minimalism, uncluttered workflows, and robust role permissions.' },
        { id: 'b4', type: 'h2', content: 'User Roles & Permissions Matrix' },
        { id: 'b5', type: 'todo', content: 'Admin: Full workspace control, team management, task deletion', checked: true },
        { id: 'b6', type: 'todo', content: 'Member: Task creation, status updates, doc editing', checked: true },
        { id: 'b7', type: 'todo', content: 'Viewer: Read-only access across boards and documents', checked: true },
      ]),
    },
  });
  console.log('✅ Seeded Documents');

  // 6. Seed Activities
  await prisma.activity.createMany({
    data: [
      {
        id: 'act-1',
        userId: 'u1',
        action: 'updated permissions for',
        target: 'Role-Based Access Control',
      },
      {
        id: 'act-2',
        userId: 'u3',
        action: 'completed task',
        target: 'Refactor UI to Minimal Linear Aesthetics',
      },
    ],
  });
  console.log('✅ Seeded Activities');

  // 7. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        id: 'n-1',
        userId: 'u1',
        title: 'New Team Invitation Sent',
        message: 'Invitation email dispatched to david@company.io with Member role.',
        type: 'invite',
        read: false,
      },
      {
        id: 'n-2',
        userId: 'u1',
        title: 'Task Assigned',
        message: 'Alex assigned you to "Implement Role-Based Permission Guards".',
        type: 'task',
        read: false,
        linkTaskId: 'task-101',
      },
      {
        id: 'n-3',
        userId: 'u1',
        title: 'New Comment',
        message: 'David Chen commented on "TaskFlow Architecture & Principles".',
        type: 'comment',
        read: true,
      },
    ],
  });
  console.log('✅ Seeded Notifications');

  console.log('🚀 TaskFlow database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
