import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from 'dotenv';
import type BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

config();

export type AppDb = ReturnType<typeof createDb>;

export function createDb(connection: string | BetterSqlite3.Database) {
  return drizzle(connection, { schema });
}

let dbInstance: AppDb | null = null;

function getDbFileName() {
  return process.env.DB_FILE_NAME || 'local.db';
}

function ensureDbDirectoryExists(connection: string) {
  if (connection === ':memory:' || connection.startsWith('file:')) {
    return;
  }

  mkdirSync(dirname(connection), { recursive: true });
}

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const connection = getDbFileName();
  ensureDbDirectoryExists(connection);
  dbInstance = createDb(connection);
  return dbInstance;
}
