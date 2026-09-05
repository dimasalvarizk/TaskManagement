import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        subtasks: true,
        comments: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const formatted = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      assigneeIds: (() => {
        try {
          return JSON.parse(task.assigneeIds || '[]');
        } catch {
          return [];
        }
      })(),
      tags: (() => {
        try {
          return JSON.parse(task.tags || '[]');
        } catch {
          return [];
        }
      })(),
      dueDate: task.dueDate,
      subtasks: task.subtasks,
      comments: task.comments.map((c) => ({
        id: c.id,
        authorId: c.authorId,
        text: c.text,
        createdAt: c.createdAt.toISOString(),
      })),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };

    return NextResponse.json({ success: true, task: formatted });
  } catch (error: any) {
    console.error('Fetch single task error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.projectId !== undefined) updateData.projectId = body.projectId;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;
    if (body.assigneeIds !== undefined) {
      updateData.assigneeIds = JSON.stringify(body.assigneeIds);
    }
    if (body.tags !== undefined) {
      updateData.tags = JSON.stringify(body.tags);
    }

    // Handle subtasks update if provided
    if (body.subtasks && Array.isArray(body.subtasks)) {
      // Re-create subtasks for clean synchronization
      await prisma.subTask.deleteMany({ where: { taskId: id } });
      await prisma.subTask.createMany({
        data: body.subtasks.map((st: any, idx: number) => ({
          id: st.id || `st_${Date.now()}_${idx}`,
          title: st.title || 'Untitled Subtask',
          completed: Boolean(st.completed),
          taskId: id,
        })),
      });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        subtasks: true,
        comments: { orderBy: { createdAt: 'asc' } },
      },
    });

    const formatted = {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      status: updated.status,
      priority: updated.priority,
      projectId: updated.projectId,
      assigneeIds: (() => {
        try {
          return JSON.parse(updated.assigneeIds || '[]');
        } catch {
          return [];
        }
      })(),
      tags: (() => {
        try {
          return JSON.parse(updated.tags || '[]');
        } catch {
          return [];
        }
      })(),
      dueDate: updated.dueDate,
      subtasks: updated.subtasks,
      comments: updated.comments.map((c) => ({
        id: c.id,
        authorId: c.authorId,
        text: c.text,
        createdAt: c.createdAt.toISOString(),
      })),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };

    return NextResponse.json({ success: true, task: formatted });
  } catch (error: any) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}
