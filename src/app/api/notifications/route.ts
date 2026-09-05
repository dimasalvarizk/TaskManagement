import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formatted = notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      linkTaskId: n.linkTaskId || undefined,
      linkDocId: n.linkDocId || undefined,
    }));

    return NextResponse.json({ success: true, notifications: formatted });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, readAll } = await req.json();

    if (readAll) {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: 'All marked as read' });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: 'Marked as read' });
    }

    return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.notification.deleteMany({});
    return NextResponse.json({ success: true, message: 'All notifications cleared' });
  } catch (error: any) {
    console.error('Clear notifications error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clear notifications' },
      { status: 500 }
    );
  }
}
