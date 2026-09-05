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
    <h2>You've been invited to TaskFlow Workspace</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>An administrator has invited you to join the <strong>TaskFlow</strong> team workspace with the following role access:</p>
    <p><span class="badge">${role} Access</span></p>
    <p>Accept your invitation to start collaborating on team tasks, Kanban boards, and Notion documents:</p>
    <a href="${inviteUrl}" class="btn">Join Workspace &rarr;</a>
    <div class="footer">
      Sent to ${email} • TaskFlow Secure Team Manager
    </div>
  </div>
</body>
</html>
  `;
}

export function getTaskAssignmentEmailTemplate(taskTitle: string, assigneeName: string, assignedBy: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0d0d0d; color: #f5f5f5; margin: 0; padding: 20px; }
    .card { max-width: 540px; margin: 0 auto; background: #121212; border: 1px solid #262626; border-radius: 16px; padding: 32px; }
    h2 { margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #ffffff; }
    p { margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #a3a3a3; }
    .task-title { padding: 14px; background: #171717; border: 1px solid #262626; border-radius: 10px; font-weight: 600; color: #818cf8; margin-bottom: 20px; }
    .btn { display: inline-block; padding: 10px 20px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h2>📋 New Task Assigned to You</h2>
    <p>Hi <strong>${assigneeName}</strong>,</p>
    <p><strong>${assignedBy}</strong> assigned you a new task in TaskFlow:</p>
    <div class="task-title">${taskTitle}</div>
    <a href="http://localhost:3000" class="btn">View Task &rarr;</a>
  </div>
</body>
</html>
  `;
}
