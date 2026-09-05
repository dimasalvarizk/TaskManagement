import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET: Validate invite link or check if workspace is in initial setup mode
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const inviteId = searchParams.get('invite');

    const totalActive = await prisma.user.count({ where: { status: 'active' } });

    // Initial setup mode: if no active users exist yet
    if (totalActive === 0) {
      return NextResponse.json({
        success: true,
        isInitialSetup: true,
        isInviteOnly: false,
      });
    }

    // Invite verification mode
    if (inviteId) {
      const invited = await prisma.user.findFirst({
        where: { id: inviteId, status: 'invited' },
      });
      if (invited) {
        return NextResponse.json({
          success: true,
          isInitialSetup: false,
          isInviteOnly: true,
          inviteValid: true,
          invite: {
            id: invited.id,
            name: invited.name,
            email: invited.email,
            role: invited.role,
          },
        });
      }
    }

    // Public registration is closed
    return NextResponse.json({
      success: true,
      isInitialSetup: false,
      isInviteOnly: true,
      inviteValid: false,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Register initial owner or activate invited member
export async function POST(req: Request) {
  try {
    const { name, email, password, inviteId } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const totalActive = await prisma.user.count({ where: { status: 'active' } });
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

    // 1. Initial Setup: First User becomes Admin
    if (totalActive === 0) {
      const newUser = await prisma.user.create({
        data: {
          name: name || 'Workspace Admin',
          email: cleanEmail,
          password: hashedPassword,
          avatar: defaultAvatar,
          role: 'Admin',
          status: 'active',
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
        },
      });
    }

    // 2. Invite-Only Check: Find invited user
    let invitedUser = null;
    if (inviteId) {
      invitedUser = await prisma.user.findFirst({
        where: { id: inviteId, status: 'invited' },
      });
    }

    if (!invitedUser) {
      invitedUser = await prisma.user.findFirst({
        where: { email: cleanEmail, status: 'invited' },
      });
    }

    if (!invitedUser) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Public registration is closed. You must have an invitation link from an Administrator to join this workspace.',
        },
        { status: 403 }
      );
    }

    // Activate the invited user
    const activatedUser = await prisma.user.update({
      where: { id: invitedUser.id },
      data: {
        name: name || invitedUser.name,
        password: hashedPassword,
        status: 'active',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: activatedUser.id,
        name: activatedUser.name,
        email: activatedUser.email,
        avatar: activatedUser.avatar,
        role: activatedUser.role,
        status: activatedUser.status,
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
