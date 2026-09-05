import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// If cached dev instance is outdated (missing models like workspace), discard it
if (globalForPrisma.prisma && !(globalForPrisma.prisma as any).workspace) {
  try {
    (globalForPrisma.prisma as any).$disconnect?.();
  } catch (_) {}
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
