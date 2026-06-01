import Database from 'better-sqlite3';
import path from 'path';

const globalForDb = globalThis as unknown as { db: Database.Database };

function getDb() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export const db: Database.Database = globalForDb.db || getDb();

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

export default db;
