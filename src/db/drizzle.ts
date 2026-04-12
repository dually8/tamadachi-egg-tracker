import { config } from 'dotenv';
import type BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

config();

export type AppDb = ReturnType<typeof createDb>;

export function createDb(connection: string | BetterSqlite3.Database) {
  return drizzle(connection, { schema });
}

export const db = createDb(process.env.DB_FILE_NAME as string);
