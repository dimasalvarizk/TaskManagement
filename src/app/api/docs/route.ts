import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const docs = await prisma.document.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    const formatted = docs.map((d) => ({
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
      createdAt: d.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, docs: formatted });
  } catch (error: any) {
    console.error('Fetch docs error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { title, projectId, icon = '📄', authorId = 'u1', blocks = [] } = await req.json();

    if (!title || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Title and projectId are required' },
        { status: 400 }
      );
    }

    const defaultBlocks =
      blocks.length > 0
        ? blocks
        : [
            {
              id: `b_${Date.now()}_1`,
              type: 'h1',
              content: title,
            },
            {
              id: `b_${Date.now()}_2`,
              type: 'paragraph',
              content: 'Start writing notes, specs, or tasks here...',
            },
          ];

    const newDoc = await prisma.document.create({
      data: {
        title,
        projectId,
        icon,
        authorId,
        blocks: JSON.stringify(defaultBlocks),
      },
    });

    const formatted = {
      id: newDoc.id,
      projectId: newDoc.projectId,
      title: newDoc.title,
      icon: newDoc.icon,
      authorId: newDoc.authorId,
      blocks: defaultBlocks,
      updatedAt: newDoc.updatedAt.toISOString(),
      createdAt: newDoc.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, doc: formatted });
  } catch (error: any) {
    console.error('Create doc error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create document' },
      { status: 500 }
    );
  }
}
