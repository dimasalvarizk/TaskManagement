import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET: Validate invite link or return workspace creation mode
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const inviteId = searchParams.get('invite');

    // Invite verification mode
    if (inviteId) {
      const invited = await prisma.user.findFirst({
        where: { id: inviteId, status: 'invited' },
        include: { workspace: true },
      });

      if (invited) {
        return NextResponse.json({
          success: true,
          isInvite: true,
          inviteValid: true,
          invite: {
            id: invited.id,
            name: invited.name,
            email: invited.email,
            role: invited.role,
            workspaceId: invited.workspaceId,
            workspaceName: invited.workspace?.name || 'TaskFlow Workspace',
          },
        });
      }

      return NextResponse.json({
        success: true,
        isInvite: true,
        inviteValid: false,
      });
    }

    // New Workspace Registration mode (open self-registration for new workspaces)
    return NextResponse.json({
      success: true,
      isInvite: false,
      allowNewWorkspace: true,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Register new isolated workspace (Option 2) or activate invited member (Option 3)
export async function POST(req: Request) {
  try {
    const { name, email, password, inviteId, workspaceName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

    // 1. Invite Acceptance Flow (Option 3)
    if (inviteId) {
      let invitedUser = await prisma.user.findFirst({
        where: { id: inviteId, status: 'invited' },
        include: { workspace: true },
      });

      if (!invitedUser) {
        invitedUser = await prisma.user.findFirst({
          where: { email: cleanEmail, status: 'invited' },
          include: { workspace: true },
        });
      }

      if (!invitedUser) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Invalid or expired invitation link. Please request a new invitation from your workspace Administrator.',
          },
          { status: 403 }
        );
      }

      const activatedUser = await prisma.user.update({
        where: { id: invitedUser.id },
        data: {
          name: name?.trim() || invitedUser.name,
          password: hashedPassword,
          status: 'active',
        },
        include: { workspace: true },
      });

      // Log activity
      if (activatedUser.workspaceId) {
        await prisma.activity.create({
          data: {
            userId: activatedUser.id,
            action: 'joined workspace',
            target: activatedUser.workspace?.name || 'Workspace',
            workspaceId: activatedUser.workspaceId,
          },
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        user: {
          id: activatedUser.id,
          name: activatedUser.name,
          email: activatedUser.email,
          avatar: activatedUser.avatar,
          role: activatedUser.role,
          status: activatedUser.status,
          workspaceId: activatedUser.workspaceId,
          workspaceName: activatedUser.workspace?.name || 'Workspace',
        },
      });
    }

    // 2. New Workspace Creation Flow (Option 2)
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email already exists. Please log in or use another email.',
        },
        { status: 409 }
      );
    }

    const companyName = workspaceName?.trim() || (name ? `${name.trim()}'s Workspace` : 'ODST Workspace');

    // Create isolated workspace
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: companyName,
      },
    });

    // Create user as Admin of new workspace
    const newUser = await prisma.user.create({
      data: {
        name: name?.trim() || 'Workspace Admin',
        email: cleanEmail,
        password: hashedPassword,
        avatar: defaultAvatar,
        role: 'Admin',
        status: 'active',
        workspaceId: newWorkspace.id,
      },
    });

    // Create starter project
    const starterProject = await prisma.project.create({
      data: {
        name: 'Core Operations',
        icon: '🚀',
        color: 'from-indigo-500 to-purple-600',
        description: `Main operations and task management for ${companyName}.`,
        workspaceId: newWorkspace.id,
      },
    });

    // Create starter task
    await prisma.task.create({
      data: {
        title: 'Welcome to TaskFlow Workspace!',
        description: 'Your isolated workspace is ready. You can now invite team members, create projects, and organize your tasks.',
        status: 'todo',
        priority: 'high',
        projectId: starterProject.id,
        assigneeIds: JSON.stringify([newUser.id]),
        tags: JSON.stringify(['Setup', 'Onboarding']),
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      },
    });

    // Log workspace creation activity
    await prisma.activity.create({
      data: {
        userId: newUser.id,
        action: 'created new workspace',
        target: companyName,
        workspaceId: newWorkspace.id,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
        status: newUser.status,
        workspaceId: newWorkspace.id,
        workspaceName: newWorkspace.name,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
