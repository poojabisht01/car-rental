import { createClient, type Client, type InValue } from '@libsql/client';

const globalForDb = globalThis as unknown as { db: Client };

function createDb(): Client {
  return createClient({
    url: process.env.TURSO_DATABASE_URL ?? 'file:./prisma/dev.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export const db: Client = globalForDb.db || createDb();
if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

type Args = InValue[];

export async function queryAll<T = Record<string, unknown>>(sql: string, args: Args = []): Promise<T[]> {
  const res = await db.execute({ sql, args });
  return res.rows as unknown as T[];
}

export async function queryOne<T = Record<string, unknown>>(sql: string, args: Args = []): Promise<T | null> {
  const res = await db.execute({ sql, args });
  return (res.rows[0] as unknown as T) ?? null;
}

export async function execute(sql: string, args: Args = []) {
  return db.execute({ sql, args });
}
