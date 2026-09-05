import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    const formatted = {
      id: doc.id,
      projectId: doc.projectId,
      title: doc.title,
      icon: doc.icon,
      authorId: doc.authorId,
      blocks: (() => {
        try {
          return JSON.parse(doc.blocks || '[]');
        } catch {
          return [];
        }
      })(),
      updatedAt: doc.updatedAt.toISOString(),
      createdAt: doc.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, doc: formatted });
  } catch (error: any) {
    console.error('Fetch doc error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch document' },
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
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.blocks !== undefined) {
      updateData.blocks = JSON.stringify(body.blocks);
    }

    const updated = await prisma.document.update({
      where: { id },
      data: updateData,
    });

    const formatted = {
      id: updated.id,
      projectId: updated.projectId,
      title: updated.title,
      icon: updated.icon,
      authorId: updated.authorId,
      blocks: (() => {
        try {
          return JSON.parse(updated.blocks || '[]');
        } catch {
          return [];
        }
      })(),
      updatedAt: updated.updatedAt.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, doc: formatted });
  } catch (error: any) {
    console.error('Update doc error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update document' },
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
    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Document deleted' });
  } catch (error: any) {
    console.error('Delete doc error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}
