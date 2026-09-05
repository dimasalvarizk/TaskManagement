import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let [dbUsers, dbProjects, dbTasks, dbDocs, dbActivities, dbNotifications, dbSentEmails] =
      await Promise.all([
        prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
        prisma.project.findMany({ orderBy: { createdAt: 'asc' } }),
        prisma.task.findMany({
          include: {
            subtasks: { orderBy: { id: 'asc' } },
            comments: { orderBy: { createdAt: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.document.findMany({ orderBy: { updatedAt: 'desc' } }),
        prisma.activity.findMany({ orderBy: { timestamp: 'desc' }, take: 20 }),
        prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }),
        prisma.sentEmail.findMany({ orderBy: { sentAt: 'desc' }, take: 20 }),
      ]);

    // Auto-seed if database is freshly deployed and completely empty
    if (dbUsers.length === 0) {
      try {
        const bcrypt = await import('bcryptjs');
        const defaultHash = await bcrypt.default.hash('password123', 10);
        
        await prisma.user.createMany({
          data: [
            {
              id: 'u1',
              name: 'Alex Morgan',
              email: 'admin@taskflow.io',
              password: defaultHash,
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              role: 'Admin',
              status: 'active',
            },
            {
              id: 'u2',
              name: 'David Chen',
              email: 'member@taskflow.io',
              password: defaultHash,
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              role: 'Member',
              status: 'active',
            },
            {
              id: 'u3',
              name: 'Sophia Patel',
              email: 'designer@taskflow.io',
              password: defaultHash,
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
              role: 'Member',
              status: 'active',
            },
            {
              id: 'u4',
              name: 'Marcus Vance',
              email: 'viewer@taskflow.io',
              password: defaultHash,
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
              role: 'Viewer',
              status: 'active',
            },
          ],
        });

        await prisma.project.createMany({
          data: [
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
          ],
        });

        await prisma.task.create({
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
          },
        });

        await prisma.task.create({
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
          },
        });

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

        // Refetch after seeding
        [dbUsers, dbProjects, dbTasks, dbDocs, dbActivities, dbNotifications, dbSentEmails] =
          await Promise.all([
            prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
            prisma.project.findMany({ orderBy: { createdAt: 'asc' } }),
            prisma.task.findMany({
              include: {
                subtasks: { orderBy: { id: 'asc' } },
                comments: { orderBy: { createdAt: 'asc' } },
              },
              orderBy: { createdAt: 'desc' },
            }),
            prisma.document.findMany({ orderBy: { updatedAt: 'desc' } }),
            prisma.activity.findMany({ orderBy: { timestamp: 'desc' }, take: 20 }),
            prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }),
            prisma.sentEmail.findMany({ orderBy: { sentAt: 'desc' }, take: 20 }),
          ]);
      } catch (seedErr) {
        console.error('Auto-seed warning:', seedErr);
      }
    }

    // Format tasks to parse JSON fields
    const formattedTasks = dbTasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status as any,
      priority: t.priority as any,
      projectId: t.projectId,
      assigneeIds: (() => {
        try {
          return JSON.parse(t.assigneeIds || '[]');
        } catch {
          return [];
        }
      })(),
      tags: (() => {
        try {
          return JSON.parse(t.tags || '[]');
        } catch {
          return [];
        }
      })(),
      dueDate: t.dueDate,
      subtasks: t.subtasks.map((st) => ({
        id: st.id,
        title: st.title,
        completed: st.completed,
      })),
      comments: t.comments.map((c) => ({
        id: c.id,
        authorId: c.authorId,
        text: c.text,
        createdAt: c.createdAt.toISOString(),
      })),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    // Format documents to parse JSON blocks
    const formattedDocs = dbDocs.map((d) => ({
      id: d.id,
      projectId: d.projectId,
      title: d.title,
      icon: d.icon,
      authorId: d.authorId,
      blocks: (() => {
        try {
          return JSON.parse(d.blocks || '[]');
        } catch {
          return [];
        }
      })(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    // Format users (omit password)
    const formattedUsers = dbUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role as any,
      status: u.status as any,
    }));

    // Format notifications
    const formattedNotifications = dbNotifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type as any,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      linkTaskId: n.linkTaskId || undefined,
      linkDocId: n.linkDocId || undefined,
    }));

    // Format activities
    const formattedActivities = dbActivities.map((a) => ({
      id: a.id,
      userId: a.userId,
      action: a.action,
      target: a.target,
      timestamp: a.timestamp.toISOString(),
    }));

    // Format sent emails
    const formattedSentEmails = dbSentEmails.map((e) => ({
      id: e.id,
      to: e.to,
      subject: e.subject,
      html: e.html,
      sentAt: e.sentAt.toISOString(),
      type: e.type as any,
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      projects: dbProjects,
      tasks: formattedTasks,
      docs: formattedDocs,
      activities: formattedActivities,
      notifications: formattedNotifications,
      sentEmails: formattedSentEmails,
    });
  } catch (error: any) {
    console.error('Workspace sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync workspace from MySQL',
      },
      { status: 500 }
    );
  }
}
