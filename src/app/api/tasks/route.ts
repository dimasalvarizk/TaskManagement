import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        subtasks: true,
        comments: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
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
      subtasks: t.subtasks,
      comments: t.comments.map((c) => ({
        id: c.id,
        authorId: c.authorId,
        text: c.text,
        createdAt: c.createdAt.toISOString(),
      })),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, tasks: formatted });
  } catch (error: any) {
    console.error('Fetch tasks error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      projectId,
      assigneeIds = [],
      tags = [],
      dueDate = '',
      subtasks = [],
    } = body;

    if (!title || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Title and projectId are required' },
        { status: 400 }
      );
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        projectId,
        assigneeIds: JSON.stringify(assigneeIds),
        tags: JSON.stringify(tags),
        dueDate,
        subtasks: {
          create: subtasks.map((st: any, idx: number) => ({
            id: st.id || `st_${Date.now()}_${idx}`,
            title: st.title || 'Untitled Subtask',
            completed: Boolean(st.completed),
          })),
        },
      },
      include: {
        subtasks: true,
        comments: true,
      },
    });

    const formatted = {
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      projectId: newTask.projectId,
      assigneeIds: (() => {
        try {
          return JSON.parse(newTask.assigneeIds || '[]');
        } catch {
          return [];
        }
      })(),
      tags: (() => {
        try {
          return JSON.parse(newTask.tags || '[]');
        } catch {
          return [];
        }
      })(),
      dueDate: newTask.dueDate,
      subtasks: newTask.subtasks,
      comments: [],
      createdAt: newTask.createdAt.toISOString(),
      updatedAt: newTask.updatedAt.toISOString(),
    };

    return NextResponse.json({ success: true, task: formatted });
  } catch (error: any) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}
