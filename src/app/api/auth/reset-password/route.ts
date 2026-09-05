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
        { valid: false, error: 'Token reset password tidak ditemukan.' },
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
        { valid: false, error: 'Tautan reset password tidak valid atau telah kadaluarsa.' },
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
      { valid: false, error: 'Gagal memvalidasi token reset password.' },
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
        { success: false, error: 'Token reset password tidak valid.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password baru minimal harus 6 karakter.' },
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
          error: 'Tautan reset password sudah kadaluarsa atau tidak valid. Silakan ajukan reset password baru di halaman login.',
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
        target: 'Akun Pengguna',
        workspaceId: user.workspaceId,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Password Anda berhasil diperbarui! Silakan masuk menggunakan password baru Anda.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan pada server saat memperbarui password.' },
      { status: 500 }
    );
  }
}
