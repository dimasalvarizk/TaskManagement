import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, userId } = await req.json();

    if (!name || !userId) {
      return NextResponse.json(
        { success: false, error: 'Workspace name and userId are required' },
        { status: 400 }
      );
    }

    const companyName = String(name).trim();

    // 1. Create Workspace
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: companyName,
      },
    });

    // 2. Add creator as Admin
    const membership = await prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId: newWorkspace.id,
        role: 'Admin',
        status: 'active',
      },
    });

    // 3. Create starter project
    try {
      const starterProject = await prisma.project.create({
        data: {
          name: 'Core Operations',
          icon: '🚀',
          color: 'from-indigo-500 to-purple-600',
          description: `Main operations and task management for ${companyName}.`,
          workspaceId: newWorkspace.id,
        },
      });

      await prisma.task.create({
        data: {
          title: 'Welcome to your new workspace!',
          description: 'Your new workspace is created and ready. Invite your team members and start collaborating.',
          status: 'todo',
          priority: 'high',
          projectId: starterProject.id,
          assigneeIds: JSON.stringify([userId]),
          tags: JSON.stringify(['Setup']),
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        },
      });

      await prisma.activity.create({
        data: {
          userId,
          action: 'created new workspace',
          target: companyName,
          workspaceId: newWorkspace.id,
        },
      });
    } catch (err) {
      console.warn('Starter creation notice:', err);
    }

    return NextResponse.json({
      success: true,
      workspace: newWorkspace,
      membership: {
        id: membership.id,
        workspaceId: newWorkspace.id,
        workspaceName: newWorkspace.name,
        role: 'Admin',
        status: 'active',
      },
    });
  } catch (error: any) {
    console.error('Create workspace error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
