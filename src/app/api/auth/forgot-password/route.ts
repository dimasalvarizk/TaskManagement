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
        { success: false, error: 'Email is required.' },
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
        { success: false, error: 'No account found with that email address.' },
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
    const subject = 'Reset Your ODST Task Management Account Password';

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
        const errMsg = mailError?.message || 'SMTP Connection Error';
        let friendlyError = `SMTP Dispatch Notice: ${errMsg}`;
        if (errMsg.includes('535') || errMsg.includes('authentication failed')) {
          friendlyError = `SMTP Authentication Failed (535): The password for ${userSmtp} was rejected by ${hostSmtp}.`;
        }

        return NextResponse.json({
          success: true,
          emailSent: false,
          fallbackMode: true,
          resetUrl,
          warning: friendlyError,
          message: `${friendlyError} You can use the direct reset link below to complete your password reset.`,
        });
      }
    } else {
      console.warn(`[RESET PASSWORD] SMTP credentials missing. Reset link for testing: ${resetUrl}`);
      return NextResponse.json({
        success: true,
        emailSent: false,
        fallbackMode: true,
        resetUrl,
        warning: 'SMTP credentials are not configured.',
        message: 'SMTP credentials not configured. You can use the direct reset link below to complete your password reset.',
      });
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
      message: 'Password reset link has been successfully sent to your email. Please check your Inbox or Spam folder.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred while processing the password reset request.' },
      { status: 500 }
    );
  }
}
