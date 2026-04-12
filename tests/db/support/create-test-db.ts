import Database from 'better-sqlite3';
import { createDb, type AppDb } from '@/db/drizzle';

const createEggPriceTableSql = `
  CREATE TABLE EggPrice (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    date text NOT NULL,
    price real NOT NULL,
    storeLocation text NOT NULL,
    storeName text NOT NULL
  );
`;

export type TestDb = {
  client: Database.Database;
  db: AppDb;
  close: () => void;
};

export function createTestDb(): TestDb {
  const client = new Database(':memory:');
  client.exec(createEggPriceTableSql);

  return {
    client,
    db: createDb(client),
    close: () => client.close(),
  };
}
