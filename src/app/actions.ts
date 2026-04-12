'use server';

import { revalidatePath } from 'next/cache';
import { dedupeDailyPrices } from '@/db/dedupe-daily-prices';
import { getDb } from '@/db/drizzle';

export async function removeDuplicateDaysAction() {
  const db = getDb();
  const result = dedupeDailyPrices(db);
  revalidatePath('/');
  return result;
}
