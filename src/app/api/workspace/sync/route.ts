import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let workspaceId = searchParams.get('workspaceId');
    const email = searchParams.get('email');

    let requestingUser: any = null;
    if (email) {
      requestingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: {
          memberships: {
            include: { workspace: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    // If no workspaceId is explicitly provided, look up by requestingUser
    if (!workspaceId && requestingUser) {
      if (requestingUser.workspaceId) {
        workspaceId = requestingUser.workspaceId;
      } else if (requestingUser.memberships && requestingUser.memberships.length > 0) {
        workspaceId = requestingUser.memberships[0].workspaceId;
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

    // If no workspace exists yet in database
    if (!workspaceId) {
      return NextResponse.json({
        success: true,
        workspaceId: null,
        workspaceName: 'Workspace',
        memberships: [],
        users: [],
        projects: [],
        tasks: [],
        docs: [],
        activities: [],
        notifications: [],
        sentEmails: [],
      });
    }

    // Fetch active workspace metadata
    const currentWorkspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    // If user switched active workspace, persist to User.workspaceId in DB
    if (requestingUser && workspaceId && requestingUser.workspaceId !== workspaceId) {
      await prisma.user.update({
        where: { id: requestingUser.id },
        data: { workspaceId },
      }).catch(() => {});
    }

    // Format all memberships of requestingUser
    const formattedUserMemberships = (requestingUser?.memberships || []).map((m: any) => ({
      id: m.id,
      workspaceId: m.workspaceId,
      workspaceName: m.workspace?.name || 'Workspace',
      role: m.role,
      status: m.status,
    }));

    // Fetch projects scoped to this workspace
    const dbProjects = await prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });

    const projectIds = dbProjects.map((p) => p.id);

    // Fetch members of this workspace (via WorkspaceMember relation)
    const [dbMembers, dbLegacyUsers, dbTasks, dbDocs, dbActivities, dbNotifications, dbSentEmails] =
      await Promise.all([
        prisma.workspaceMember.findMany({
          where: { workspaceId },
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        }),
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
          where: {
            OR: [
              { workspaceId },
              { workspaceId: null },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.sentEmail.findMany({
          where: { workspaceId },
          orderBy: { sentAt: 'desc' },
          take: 30,
        }),
      ]);

    // Consolidate members into a formatted user list
    const userMap = new Map<string, any>();

    // Add members from WorkspaceMember
    for (const m of dbMembers) {
      userMap.set(m.userId, {
        id: m.userId,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        role: m.role as any,
        status: m.status as any,
        workspaceId: m.workspaceId,
        memberId: m.id,
      });
    }

    // Add legacy users if not already present
    for (const u of dbLegacyUsers) {
      if (!userMap.has(u.id)) {
        userMap.set(u.id, {
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar,
          role: u.role as any,
          status: u.status as any,
          workspaceId: u.workspaceId || workspaceId,
        });
      }
    }

    const formattedUsers = Array.from(userMap.values());

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
      workspaceName: currentWorkspace?.name || 'Workspace',
      memberships: formattedUserMemberships,
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
