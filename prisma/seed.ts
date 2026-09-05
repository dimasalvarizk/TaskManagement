import { PrismaClient } from '@prisma/client';

import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'ali@odst.id';
  const hashedPassword = await bcrypt.hash('password123', 10);
  const avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  // 1. Ensure default workspace exists
  let defaultWs = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!defaultWs) {
    defaultWs = await prisma.workspace.create({
      data: {
        name: 'ODST Group Indonesia',
      },
    });
    console.log('✅ Created default workspace:', defaultWs.name);
  }

  // 2. Ensure Admin user ali@odst.id exists
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'Admin',
      status: 'active',
    },
    create: {
      name: 'Ali',
      email: adminEmail,
      password: hashedPassword,
      avatar,
      role: 'Admin',
      status: 'active',
      workspaceId: defaultWs.id,
    },
  });

  // 3. Ensure membership in all workspaces
  const allWorkspaces = await prisma.workspace.findMany();
  for (const ws of allWorkspaces) {
    await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: adminUser.id,
          workspaceId: ws.id,
        },
      },
      update: {
        role: 'Admin',
        status: 'active',
      },
      create: {
        userId: adminUser.id,
        workspaceId: ws.id,
        role: 'Admin',
        status: 'active',
      },
    });
  }

  console.log(`🌱 TaskFlow database ready. Admin account: ${adminEmail} (password: password123)`);
}

main()
  .catch((e) => {
    console.error('❌ Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
