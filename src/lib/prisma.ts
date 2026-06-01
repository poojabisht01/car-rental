/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path';

// Dynamically require to avoid TS type complaints with Prisma 7 adapter API
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const globalForPrisma = globalThis as unknown as { prisma: any };

function createPrismaClient() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

export const prisma: any = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
