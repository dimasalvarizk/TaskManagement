import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (workspaceId) {
      const members = await prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      });

      const safeUsers = members.map((m) => ({
        id: m.userId,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        role: m.role,
        status: m.status,
        workspaceId: m.workspaceId,
        memberId: m.id,
      }));

      return NextResponse.json({ success: true, users: safeUsers });
    }

    const users = await prisma.user.findMany({
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

    // Resolve target workspace
    let targetWorkspaceId = workspaceId;
    if (!targetWorkspaceId) {
      const firstWs = await prisma.workspace.findFirst({ orderBy: { createdAt: 'asc' } });
      targetWorkspaceId = firstWs?.id;
    }

    if (!targetWorkspaceId) {
      return NextResponse.json(
        { success: false, error: 'Target workspace not found' },
        { status: 400 }
      );
    }

    // 1. Check if user already exists
    let existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        memberships: { where: { workspaceId: targetWorkspaceId } },
      },
    });

    if (existingUser) {
      // Check if already in this workspace
      const existingMembership = existingUser.memberships[0];
      if (existingMembership) {
        if (existingMembership.status === 'active') {
          return NextResponse.json(
            { success: false, error: 'User is already an active member of this workspace.' },
            { status: 409 }
          );
        }

        // Return existing pending invite
        return NextResponse.json({
          success: true,
          user: {
            id: existingMembership.id,
            userId: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            avatar: existingUser.avatar,
            role: existingMembership.role,
            status: existingMembership.status,
            workspaceId: targetWorkspaceId,
          },
        });
      }

      // Add existing user to this workspace as invited
      const newMembership = await prisma.workspaceMember.create({
        data: {
          userId: existingUser.id,
          workspaceId: targetWorkspaceId,
          role,
          status: 'invited',
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: newMembership.id,
          userId: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          avatar: existingUser.avatar,
          role: newMembership.role,
          status: newMembership.status,
          workspaceId: targetWorkspaceId,
        },
      });
    }

    // 2. User does not exist at all: create User + WorkspaceMember
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
        workspaceId: targetWorkspaceId,
      },
    });

    const newMembership = await prisma.workspaceMember.create({
      data: {
        userId: newUser.id,
        workspaceId: targetWorkspaceId,
        role,
        status: 'invited',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newMembership.id,
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newMembership.role,
        status: newMembership.status,
        workspaceId: targetWorkspaceId,
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
