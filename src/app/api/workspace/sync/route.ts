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

    // Clean any legacy demo data from database
    const demoEmails = ['admin@taskflow.io', 'member@taskflow.io', 'designer@taskflow.io', 'viewer@taskflow.io'];
    const hasDemoUsers = dbUsers.some((u) => demoEmails.includes(u.email.toLowerCase()));
    if (hasDemoUsers) {
      try {
        await prisma.user.deleteMany({
          where: { email: { in: demoEmails } },
        });
        await prisma.project.deleteMany({
          where: { id: { in: ['p1', 'p2', 'p3'] } },
        });
        // Refetch clean data
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
      } catch (cleanErr) {
        console.warn('Clean demo data warning:', cleanErr);
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
