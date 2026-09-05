import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let workspaceId = searchParams.get('workspaceId');
    const email = searchParams.get('email');

    // If no workspaceId is explicitly provided, look up by email
    if (!workspaceId && email) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (user?.workspaceId) {
        workspaceId = user.workspaceId;
      }
    }

    // If still no workspaceId, resolve to the first available workspace
    if (!workspaceId) {
      const firstWorkspace = await prisma.workspace.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (firstWorkspace) {
        workspaceId = firstWorkspace.id;
      }
    }

    // Clean any legacy demo data from database
    const demoEmails = ['admin@taskflow.io', 'member@taskflow.io', 'designer@taskflow.io', 'viewer@taskflow.io'];
    await prisma.user.deleteMany({
      where: { email: { in: demoEmails } },
    }).catch(() => {});
    await prisma.project.deleteMany({
      where: { id: { in: ['p1', 'p2', 'p3'] } },
    }).catch(() => {});

    // If no workspace exists yet in database
    if (!workspaceId) {
      return NextResponse.json({
        success: true,
        users: [],
        projects: [],
        tasks: [],
        docs: [],
        activities: [],
        notifications: [],
        sentEmails: [],
      });
    }

    // Fetch projects scoped to this workspace
    const dbProjects = await prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });

    const projectIds = dbProjects.map((p) => p.id);

    // Fetch all related entities scoped to this workspace
    const [dbUsers, dbTasks, dbDocs, dbActivities, dbNotifications, dbSentEmails] =
      await Promise.all([
        prisma.user.findMany({
          where: { workspaceId },
          orderBy: { createdAt: 'asc' },
        }),
        prisma.task.findMany({
          where: {
            projectId: { in: projectIds },
          },
          include: {
            subtasks: { orderBy: { id: 'asc' } },
            comments: { orderBy: { createdAt: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.document.findMany({
          where: {
            projectId: { in: projectIds },
          },
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.activity.findMany({
          where: { workspaceId },
          orderBy: { timestamp: 'desc' },
          take: 30,
        }),
        prisma.notification.findMany({
          where: { workspaceId },
          orderBy: { createdAt: 'desc' },
          take: 40,
        }),
        prisma.sentEmail.findMany({
          where: { workspaceId },
          orderBy: { sentAt: 'desc' },
          take: 30,
        }),
      ]);

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
      workspaceId: u.workspaceId,
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
      workspaceId,
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
