import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    const users = await prisma.user.findMany({
      where: workspaceId ? { workspaceId } : undefined,
      orderBy: { createdAt: 'asc' },
    });

    const safeUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role,
      status: u.status,
      workspaceId: u.workspaceId,
    }));

    return NextResponse.json({ success: true, users: safeUsers });
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, role = 'Member', workspaceId } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Resolve workspace ID if not provided
    let resolvedWorkspaceId = workspaceId;
    if (!resolvedWorkspaceId) {
      const firstWorkspace = await prisma.workspace.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      resolvedWorkspaceId = firstWorkspace?.id;
    }

    const defaultPassword = await bcrypt.hash('password123', 10);
    const avatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password: defaultPassword,
        avatar,
        role,
        status: 'invited',
        workspaceId: resolvedWorkspaceId,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
        status: newUser.status,
        workspaceId: newUser.workspaceId,
      },
    });
  } catch (error: any) {
    console.error('Invite/Create user error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
