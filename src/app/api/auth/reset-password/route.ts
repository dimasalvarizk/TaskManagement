import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET: Validate token before displaying reset form
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Password reset token not found in link.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'This password reset link is invalid or has expired.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Validate reset token error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate password reset token.' },
      { status: 500 }
    );
  }
}

// POST: Execute password reset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, newPassword } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Password reset token is missing.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Find user with matching unexpired token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'This password reset link is expired or invalid. Please request a new link on the login page.',
        },
        { status: 400 }
      );
    }

    // Hash new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Record activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: 'reset password',
        target: 'User Account',
        workspaceId: user.workspaceId,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully updated! You can now sign in with your new password.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred while updating the password.' },
      { status: 500 }
    );
  }
}
