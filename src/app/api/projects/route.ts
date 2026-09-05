import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    const projects = await prisma.project.findMany({
      where: workspaceId ? { workspaceId } : undefined,
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    console.error('Fetch projects error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, icon = '🚀', color = '#6366f1', description = '', workspaceId } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    let resolvedWorkspaceId = workspaceId;
    if (!resolvedWorkspaceId) {
      const firstWorkspace = await prisma.workspace.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      resolvedWorkspaceId = firstWorkspace?.id;
    }

    const project = await prisma.project.create({
      data: {
        name,
        icon,
        color,
        description,
        workspaceId: resolvedWorkspaceId,
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}
