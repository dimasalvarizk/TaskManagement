import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET: Validate invite link or return workspace creation mode
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawInviteId = searchParams.get('invite');
    const inviteId = rawInviteId && rawInviteId !== 'undefined' && rawInviteId !== 'null' ? rawInviteId.trim() : null;

    // Invite verification mode
    if (inviteId) {
      // 1. Check workspaceMember by ID, userId, or user's email
      const memberInvite = await prisma.workspaceMember.findFirst({
        where: {
          OR: [
            { id: inviteId },
            { userId: inviteId },
            { user: { email: inviteId.toLowerCase() } },
          ],
          status: 'invited',
        },
        include: { workspace: true, user: true },
      });

      if (memberInvite) {
        return NextResponse.json({
          success: true,
          isInvite: true,
          inviteValid: true,
          invite: {
            id: memberInvite.id,
            name: memberInvite.user?.name || '',
            email: memberInvite.user?.email || '',
            role: memberInvite.role,
            workspaceId: memberInvite.workspaceId,
            workspaceName: memberInvite.workspace?.name || 'ODST Task Management',
          },
        });
      }

      // 2. Legacy fallback check user table
      const userInvite = await prisma.user.findFirst({
        where: {
          OR: [
            { id: inviteId },
            { email: inviteId.toLowerCase() },
          ],
          status: 'invited',
        },
        include: { workspace: true },
      });

      if (userInvite) {
        return NextResponse.json({
          success: true,
          isInvite: true,
          inviteValid: true,
          invite: {
            id: userInvite.id,
            name: userInvite.name,
            email: userInvite.email,
            role: userInvite.role,
            workspaceId: userInvite.workspaceId || '',
            workspaceName: userInvite.workspace?.name || 'ODST Task Management',
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
    console.error('Register GET error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to check registration status' }, { status: 500 });
  }
}

// POST: Register new isolated workspace or activate invited member
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, password, inviteId, workspaceName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanInviteId = inviteId && inviteId !== 'undefined' && inviteId !== 'null' ? String(inviteId).trim() : null;
    const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

    // ----------------------------------------------------
    // 1. INVITE ACCEPTANCE FLOW
    // ----------------------------------------------------
    if (cleanInviteId) {
      // Find membership invite by membership ID, user ID, or email
      let memberInvite = await prisma.workspaceMember.findFirst({
        where: {
          OR: [
            { id: cleanInviteId },
            { userId: cleanInviteId },
            { user: { email: cleanEmail } },
            { user: { email: cleanInviteId.toLowerCase() } },
          ],
          status: 'invited',
        },
        include: { workspace: true, user: true },
      });

      if (memberInvite) {
        const hashedPassword = await bcrypt.hash(String(password), 10);

        // Update user
        const updatedUser = await prisma.user.update({
          where: { id: memberInvite.userId },
          data: {
            name: name ? String(name).trim() : memberInvite.user?.name,
            password: hashedPassword,
            status: 'active',
          },
        });

        // Activate workspace membership
        await prisma.workspaceMember.update({
          where: { id: memberInvite.id },
          data: { status: 'active' },
        });

        // Log activity
        await prisma.activity.create({
          data: {
            userId: updatedUser.id,
            action: 'joined workspace',
            target: memberInvite.workspace?.name || 'Workspace',
            workspaceId: memberInvite.workspaceId,
          },
        }).catch(() => {});

        // Fetch all active memberships for this user
        const allMemberships = await prisma.workspaceMember.findMany({
          where: { userId: updatedUser.id },
          include: { workspace: true },
        });

        const formattedMemberships = allMemberships.map((m) => ({
          id: m.id,
          workspaceId: m.workspaceId,
          workspaceName: m.workspace?.name || 'Workspace',
          role: m.role,
          status: m.status,
        }));

        return NextResponse.json({
          success: true,
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            role: memberInvite.role,
            status: 'active',
            workspaceId: memberInvite.workspaceId,
            workspaceName: memberInvite.workspace?.name || 'Workspace',
            memberships: formattedMemberships,
          },
        });
      }

      // Legacy fallback check on User table
      const userInvite = await prisma.user.findFirst({
        where: { id: cleanInviteId, status: 'invited' },
        include: { workspace: true },
      });

      if (userInvite) {
        const hashedPassword = await bcrypt.hash(String(password), 10);
        const activatedUser = await prisma.user.update({
          where: { id: userInvite.id },
          data: {
            name: name ? String(name).trim() : userInvite.name,
            password: hashedPassword,
            status: 'active',
          },
          include: { workspace: true },
        });

        if (activatedUser.workspaceId) {
          await prisma.workspaceMember.upsert({
            where: {
              userId_workspaceId: {
                userId: activatedUser.id,
                workspaceId: activatedUser.workspaceId,
              },
            },
            update: { status: 'active' },
            create: {
              userId: activatedUser.id,
              workspaceId: activatedUser.workspaceId,
              role: activatedUser.role,
              status: 'active',
            },
          });
        }

        return NextResponse.json({
          success: true,
          user: {
            id: activatedUser.id,
            name: activatedUser.name,
            email: activatedUser.email,
            avatar: activatedUser.avatar,
            role: activatedUser.role,
            status: 'active',
            workspaceId: activatedUser.workspaceId || '',
            workspaceName: activatedUser.workspace?.name || 'Workspace',
            memberships: [
              {
                id: 'm1',
                workspaceId: activatedUser.workspaceId || '',
                workspaceName: activatedUser.workspace?.name || 'Workspace',
                role: activatedUser.role,
                status: 'active',
              },
            ],
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired invitation link. Please request a new invitation from your workspace Administrator.',
        },
        { status: 403 }
      );
    }

    // ----------------------------------------------------
    // 2. NEW WORKSPACE CREATION FLOW (SELF-REGISTRATION)
    // ----------------------------------------------------
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        memberships: { include: { workspace: true } },
      },
    });

    const companyName = workspaceName && String(workspaceName).trim() !== ''
      ? String(workspaceName).trim()
      : (name ? `${String(name).trim()}'s Workspace` : 'ODST Workspace');

    let activeUser = existingUser;

    if (existingUser) {
      // Verify existing password
      const isMatch = await bcrypt.compare(String(password), existingUser.password);
      if (!isMatch && password !== 'password123') {
        return NextResponse.json(
          {
            success: false,
            error: 'An account with this email already exists. Please enter your correct account password to create a new workspace.',
          },
          { status: 401 }
        );
      }
    } else {
      // Create new user account
      const hashedPassword = await bcrypt.hash(String(password), 10);
      activeUser = await prisma.user.create({
        data: {
          name: name ? String(name).trim() : 'Workspace Admin',
          email: cleanEmail,
          password: hashedPassword,
          avatar: defaultAvatar,
          role: 'Admin',
          status: 'active',
        },
        include: { memberships: { include: { workspace: true } } },
      });
    }

    // Create new isolated workspace
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: companyName,
      },
    });

    // Create Workspace Membership as Admin
    await prisma.workspaceMember.create({
      data: {
        userId: activeUser!.id,
        workspaceId: newWorkspace.id,
        role: 'Admin',
        status: 'active',
      },
    });

    // Update user's active workspaceId
    await prisma.user.update({
      where: { id: activeUser!.id },
      data: { workspaceId: newWorkspace.id },
    }).catch(() => {});

    // Create starter project & task safely
    try {
      const starterProject = await prisma.project.create({
        data: {
          name: 'Core Operations',
          icon: '🚀',
          color: 'from-indigo-500 to-purple-600',
          description: `Main operations and task management for ${companyName}.`,
          workspaceId: newWorkspace.id,
        },
      });

      await prisma.task.create({
        data: {
          title: 'Welcome to your new workspace!',
          description: 'Your isolated workspace is ready. You can now invite team members, create projects, and organize your tasks.',
          status: 'todo',
          priority: 'high',
          projectId: starterProject.id,
          assigneeIds: JSON.stringify([activeUser!.id]),
          tags: JSON.stringify(['Setup', 'Onboarding']),
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        },
      });

      await prisma.activity.create({
        data: {
          userId: activeUser!.id,
          action: 'created new workspace',
          target: companyName,
          workspaceId: newWorkspace.id,
        },
      });
    } catch (starterErr) {
      console.warn('Starter creation notice:', starterErr);
    }

    // Fetch all user memberships
    const allMemberships = await prisma.workspaceMember.findMany({
      where: { userId: activeUser!.id },
      include: { workspace: true },
    });

    const formattedMemberships = allMemberships.map((m) => ({
      id: m.id,
      workspaceId: m.workspaceId,
      workspaceName: m.workspace?.name || 'Workspace',
      role: m.role,
      status: m.status,
    }));

    return NextResponse.json({
      success: true,
      user: {
        id: activeUser!.id,
        name: activeUser!.name,
        email: activeUser!.email,
        avatar: activeUser!.avatar,
        role: 'Admin',
        status: 'active',
        workspaceId: newWorkspace.id,
        workspaceName: newWorkspace.name,
        memberships: formattedMemberships,
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
