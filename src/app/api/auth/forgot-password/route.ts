import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getResetPasswordEmailTemplate } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, smtpConfig } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Akun dengan email tersebut tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Generate secure random reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // Determine Base URL
    const origin = req.headers.get('origin');
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = origin || (host ? `${proto}://${host}` : 'https://taskflow.187.52.126.215.sslip.io');

    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    const html = getResetPasswordEmailTemplate(user.name || 'User', user.email, resetUrl);
    const subject = 'Reset Password Akun ODST Task Management';

    // Resolve SMTP settings
    const hostSmtp = smtpConfig?.host || process.env.SMTP_HOST || 'smtp.titan.email';
    const portSmtp = parseInt(smtpConfig?.port || process.env.SMTP_PORT || '587', 10);
    const secureSmtp = smtpConfig?.secure ?? (portSmtp === 465 || process.env.SMTP_SECURE === 'true');
    const userSmtp = (smtpConfig?.user || process.env.SMTP_USER || '').trim();
    const passSmtp = (smtpConfig?.pass || process.env.SMTP_PASS || '').trim();

    const fromHeader = userSmtp
      ? `"ODST Task Management" <${userSmtp}>`
      : (smtpConfig?.from || process.env.SMTP_FROM || `"ODST Task Management" <info@odst.id>`);

    let emailSent = false;

    if (userSmtp && passSmtp) {
      try {
        const transporter = nodemailer.createTransport({
          host: hostSmtp,
          port: portSmtp,
          secure: secureSmtp,
          auth: { user: userSmtp, pass: passSmtp },
          tls: {
            rejectUnauthorized: false,
          },
        });

        await transporter.sendMail({
          from: fromHeader,
          to: user.email,
          subject,
          html,
        });
        emailSent = true;
        console.log(`[RESET PASSWORD] Real reset email dispatched to ${user.email}`);
      } catch (mailError: any) {
        console.error('[RESET PASSWORD EMAIL ERROR]', mailError?.message || mailError);
        return NextResponse.json(
          {
            success: false,
            error: `Gagal mengirim email reset password via SMTP: ${mailError?.message || 'Koneksi mail server error'}. Pastikan konfigurasi SMTP aktif.`,
          },
          { status: 500 }
        );
      }
    } else {
      console.warn(`[RESET PASSWORD] SMTP credentials missing. Reset link for testing: ${resetUrl}`);
    }

    // Record to sent emails table
    await prisma.sentEmail.create({
      data: {
        to: user.email,
        subject,
        html,
        workspaceId: user.workspaceId,
        type: 'password_reset',
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      emailSent,
      message: 'Tautan reset password telah berhasil dikirim ke email Anda. Silakan periksa folder Inbox atau Spam.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan pada server saat memproses permintaan reset password.' },
      { status: 500 }
    );
  }
}
