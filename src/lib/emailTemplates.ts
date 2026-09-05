import { Role } from '@/types';

export function getInvitationEmailTemplate(name: string, email: string, role: Role, inviteUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0d0d0d; color: #f5f5f5; margin: 0; padding: 20px; }
    .card { max-width: 540px; margin: 0 auto; background: #121212; border: 1px solid #262626; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .logo { width: 40px; height: 40px; background: #4f46e5; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 20px; }
    h2 { margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #ffffff; }
    p { margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #a3a3a3; }
    .badge { display: inline-block; padding: 4px 10px; background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); border-radius: 6px; font-size: 12px; font-weight: bold; font-family: monospace; }
    .btn { display: inline-block; padding: 12px 24px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; margin-top: 10px; }
    .footer { margin-top: 30px; border-top: 1px solid #262626; padding-top: 16px; font-size: 11px; color: #737373; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">⚡</div>
    <h2>You've been invited to ODST Task Management</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>An administrator has invited you to join the <strong>ODST Task Management</strong> team workspace with the following role access:</p>
    <p><span class="badge">${role} Access</span></p>
    <p>Accept your invitation to start collaborating on team tasks, Kanban boards, and Notion documents:</p>
    <a href="${inviteUrl}" class="btn">Join Workspace &rarr;</a>
    <div class="footer">
      Sent to ${email} • ODST Task Management
    </div>
  </div>
</body>
</html>
  `;
}

export function getTaskAssignmentEmailTemplate(taskTitle: string, assigneeName: string, assignedBy: string, taskUrl?: string): string {
  const finalUrl = taskUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://taskflow.187.52.126.215.sslip.io');
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0d0d0d; color: #f5f5f5; margin: 0; padding: 20px; }
    .card { max-width: 540px; margin: 0 auto; background: #121212; border: 1px solid #262626; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .logo { width: 40px; height: 40px; background: #4f46e5; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 20px; }
    h2 { margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #ffffff; }
    p { margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #a3a3a3; }
    .task-title { padding: 14px; background: #171717; border: 1px solid #262626; border-radius: 10px; font-weight: 600; color: #818cf8; margin-bottom: 20px; }
    .btn { display: inline-block; padding: 12px 24px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; margin-top: 10px; }
    .footer { margin-top: 30px; border-top: 1px solid #262626; padding-top: 16px; font-size: 11px; color: #737373; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">📋</div>
    <h2>New Task Assigned to You</h2>
    <p>Hi <strong>${assigneeName}</strong>,</p>
    <p><strong>${assignedBy}</strong> has assigned you a new task in <strong>ODST Task Management</strong>:</p>
    <div class="task-title">${taskTitle}</div>
    <p>Click below to open and view the task details in your workspace:</p>
    <a href="${finalUrl}" class="btn">View Task in Workspace &rarr;</a>
    <div class="footer">
      ODST Task Management • Team Notification
    </div>
  </div>
</body>
</html>
  `;
}
