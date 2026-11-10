import { dedupeDailyPrices } from '../src/db/dedupe-daily-prices';
import { getDb } from '../src/db/drizzle';

const args = process.argv.slice(2);

if (args.length !== 1 || args[0] !== '--yes') {
  console.error('Usage: pnpm run db:dedupe --yes');
  console.error('Back up the database and confirm DB_FILE_NAME and TZ before running.');
  process.exitCode = 1;
} else {
  const db = getDb();
  try {
    const result = dedupeDailyPrices(db);
    console.log(result.message);
    console.log(`Kept ${result.keptCount} records in ${result.groupCount} daily groups.`);
  } finally {
    db.$client.close();
  }
}
