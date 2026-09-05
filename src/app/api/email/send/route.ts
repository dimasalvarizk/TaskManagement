import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, html, type, smtpConfig } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required parameters: to, subject, or html' },
        { status: 400 }
      );
    }

    // Resolve SMTP Configuration (from env or custom request config)
    const host = smtpConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(smtpConfig?.port || process.env.SMTP_PORT || '587', 10);
    const secure = smtpConfig?.secure ?? (process.env.SMTP_SECURE === 'true');
    const user = smtpConfig?.user || process.env.SMTP_USER;
    const pass = smtpConfig?.pass || process.env.SMTP_PASS;
    const from = smtpConfig?.from || process.env.SMTP_FROM || `"TaskFlow Workspace" <${user || 'noreply@taskflow.io'}>`;

    console.log(`[EMAIL API] Dispatch request to: ${to} | Subject: "${subject}"`);

    // Check if real SMTP credentials exist
    if (user && pass && user.trim() !== '' && pass.trim() !== '') {
      // Create Nodemailer Transporter
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });

      // Send real email via SMTP
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      console.log(`[REAL EMAIL SENT] Message ID: ${info.messageId} to ${to}`);

      return NextResponse.json({
        success: true,
        realEmailSent: true,
        messageId: info.messageId,
        message: `Real email successfully dispatched to ${to}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Fallback: Return simulated dispatch notice if SMTP credentials are not yet set
    return NextResponse.json({
      success: true,
      realEmailSent: false,
      note: 'SMTP credentials missing in .env.local. Add SMTP_USER & SMTP_PASS to send real emails to inbox.',
      message: `Simulated email logged for ${to}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'SMTP dispatch failed';
    console.error('[EMAIL ERROR]', errMessage);
    return NextResponse.json(
      { error: errMessage || 'Failed to send email via SMTP' },
      { status: 500 }
    );
  }
}
