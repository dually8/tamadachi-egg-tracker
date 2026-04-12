import { desc, inArray } from 'drizzle-orm';
import { type AppDb } from './drizzle';
import { priceTable } from './schema';

export type DedupeDailyPricesResult = {
  deletedCount: number;
  keptCount: number;
  groupCount: number;
  message: string;
};

type DedupeDailyPricesOptions = {
  timeZone?: string;
};

function createDayKeyFormatter(timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (isoDate: string) => {
    const parts = formatter.formatToParts(new Date(isoDate));
    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = parts.find((part) => part.type === 'day')?.value;

    return `${year}-${month}-${day}`;
  };
}

function getDefaultTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function dedupeDailyPrices(
  db: AppDb,
  options: Readonly<DedupeDailyPricesOptions> = {},
): DedupeDailyPricesResult {
  const timeZone = options.timeZone ?? getDefaultTimeZone();
  const getDayKey = createDayKeyFormatter(timeZone);
  const rows = db
    .select({
      id: priceTable.id,
      date: priceTable.date,
      storeLocation: priceTable.storeLocation,
      storeName: priceTable.storeName,
    })
    .from(priceTable)
    .orderBy(desc(priceTable.date), desc(priceTable.id))
    .all();

  if (rows.length === 0) {
    return {
      deletedCount: 0,
      keptCount: 0,
      groupCount: 0,
      message: 'No duplicate day records found.',
    };
  }

  const seenGroups = new Set<string>();
  const duplicateIds: number[] = [];

  for (const row of rows) {
    const groupKey = [row.storeName, row.storeLocation, getDayKey(row.date)].join('::');
    if (seenGroups.has(groupKey)) {
      duplicateIds.push(row.id);
      continue;
    }

    seenGroups.add(groupKey);
  }

  const keptCount = rows.length - duplicateIds.length;
  const result: DedupeDailyPricesResult = {
    deletedCount: duplicateIds.length,
    keptCount,
    groupCount: seenGroups.size,
    message:
      duplicateIds.length > 0
        ? `Removed ${duplicateIds.length} duplicate day record${duplicateIds.length === 1 ? '' : 's'}.`
        : 'No duplicate day records found.',
  };

  return db.transaction((tx) => {
    if (duplicateIds.length > 0) {
      tx.delete(priceTable).where(inArray(priceTable.id, duplicateIds)).run();
    }

    return result;
  });
}
