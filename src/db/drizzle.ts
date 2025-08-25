import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/better-sqlite3';

config();

export const db = drizzle(process.env.DB_FILE_NAME as string);
