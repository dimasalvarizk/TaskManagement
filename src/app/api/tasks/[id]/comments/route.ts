import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { authorId, text } = await req.json();

    if (!authorId || !text) {
      return NextResponse.json(
        { success: false, error: 'AuthorId and text are required' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        taskId: id,
        authorId,
        text,
      },
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        authorId: comment.authorId,
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add comment' },
      { status: 500 }
    );
  }
}
