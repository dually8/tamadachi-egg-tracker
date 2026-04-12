import { afterEach, describe, expect, it } from 'vitest';
import { asc } from 'drizzle-orm';
import { dedupeDailyPrices } from '@/db/dedupe-daily-prices';
import { priceTable } from '@/db/schema';
import { createTestDb, type TestDb } from './support/create-test-db';

const openDbs: TestDb[] = [];

function setupDb() {
  const testDb = createTestDb();
  openDbs.push(testDb);
  return testDb;
}

async function listPrices(testDb: TestDb) {
  return testDb.db.select().from(priceTable).orderBy(asc(priceTable.id)).all();
}

afterEach(() => {
  while (openDbs.length > 0) {
    openDbs.pop()?.close();
  }
});

describe('dedupeDailyPrices', () => {
  it('keeps only the latest record for the same store, location, and local day', async () => {
    const testDb = setupDb();

    testDb.db.insert(priceTable).values([
      {
        storeName: "Trader Joe's",
        storeLocation: 'Chattanooga, TN',
        price: 3.99,
        date: '2026-04-01T08:00:00.000Z',
      },
      {
        storeName: "Trader Joe's",
        storeLocation: 'Chattanooga, TN',
        price: 4.09,
        date: '2026-04-01T18:30:00.000Z',
      },
      {
        storeName: "Trader Joe's",
        storeLocation: 'Chattanooga, TN',
        price: 4.19,
        date: '2026-04-01T23:45:00.000Z',
      },
    ]).run();

    const result = dedupeDailyPrices(testDb.db, { timeZone: 'America/New_York' });
    const prices = await listPrices(testDb);

    expect(result).toMatchObject({
      deletedCount: 2,
      keptCount: 1,
      groupCount: 1,
    });
    expect(prices).toHaveLength(1);
    expect(prices[0]?.price).toBe(4.19);
    expect(prices[0]?.date).toBe('2026-04-01T23:45:00.000Z');
  });

  it('does not dedupe across different stores or locations', async () => {
    const testDb = setupDb();

    testDb.db.insert(priceTable).values([
      {
        storeName: "Trader Joe's",
        storeLocation: 'Chattanooga, TN',
        price: 3.99,
        date: '2026-04-01T08:00:00.000Z',
      },
      {
        storeName: "Trader Joe's",
        storeLocation: 'Hixson, TN',
        price: 4.09,
        date: '2026-04-01T18:30:00.000Z',
      },
      {
        storeName: 'Aldi',
        storeLocation: 'Chattanooga, TN',
        price: 2.19,
        date: '2026-04-01T23:45:00.000Z',
      },
    ]).run();

    const result = dedupeDailyPrices(testDb.db, { timeZone: 'America/New_York' });
    const prices = await listPrices(testDb);

    expect(result.deletedCount).toBe(0);
    expect(prices).toHaveLength(3);
  });

  it('does not dedupe rows that land on different local calendar days', async () => {
    const testDb = setupDb();

    testDb.db.insert(priceTable).values([
      {
        storeName: "Trader Joe's",
        storeLocation: 'Chattanooga, TN',
        price: 3.99,
        date: '2026-04-01T03:59:00.000Z',
      },
      {
        storeName: "Trader Joe's",
        storeLocation: 'Chattanooga, TN',
        price: 4.09,
        date: '2026-04-01T04:01:00.000Z',
      },
    ]).run();

    const result = dedupeDailyPrices(testDb.db, { timeZone: 'America/New_York' });
    const prices = await listPrices(testDb);

    expect(result.deletedCount).toBe(0);
    expect(prices).toHaveLength(2);
  });

  it('keeps the highest id when timestamps are identical', async () => {
    const testDb = setupDb();

    testDb.db.insert(priceTable).values([
      {
        storeName: "Trader Joe's",
        storeLocation: 'Chattanooga, TN',
        price: 3.99,
        date: '2026-04-01T12:00:00.000Z',
      },
      {
        storeName: "Trader Joe's",
        storeLocation: 'Chattanooga, TN',
        price: 4.09,
        date: '2026-04-01T12:00:00.000Z',
      },
    ]).run();

    const pricesBefore = await listPrices(testDb);
    const highestId = Math.max(...pricesBefore.map((price) => price.id));

    const result = dedupeDailyPrices(testDb.db, { timeZone: 'America/New_York' });
    const pricesAfter = await listPrices(testDb);

    expect(result.deletedCount).toBe(1);
    expect(pricesAfter).toHaveLength(1);
    expect(pricesAfter[0]?.id).toBe(highestId);
    expect(pricesAfter[0]?.price).toBe(4.09);
  });

  it('returns a no-op result for an empty table', () => {
    const testDb = setupDb();

    const result = dedupeDailyPrices(testDb.db, { timeZone: 'America/New_York' });

    expect(result).toEqual({
      deletedCount: 0,
      keptCount: 0,
      groupCount: 0,
      message: 'No duplicate day records found.',
    });
  });

  it('returns a no-op result when data is already deduped', async () => {
    const testDb = setupDb();

    testDb.db.insert(priceTable).values([
      {
        storeName: "Trader Joe's",
        storeLocation: 'Chattanooga, TN',
        price: 3.99,
        date: '2026-04-01T12:00:00.000Z',
      },
      {
        storeName: "Trader Joe's",
        storeLocation: 'Chattanooga, TN',
        price: 4.09,
        date: '2026-04-02T12:00:00.000Z',
      },
    ]).run();

    const result = dedupeDailyPrices(testDb.db, { timeZone: 'America/New_York' });
    const prices = await listPrices(testDb);

    expect(result).toEqual({
      deletedCount: 0,
      keptCount: 2,
      groupCount: 2,
      message: 'No duplicate day records found.',
    });
    expect(prices).toHaveLength(2);
  });
});
