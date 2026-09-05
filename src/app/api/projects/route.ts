import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
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
    const { name, icon = '', color = '#6366f1', description = '' } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        icon,
        color,
        description,
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
