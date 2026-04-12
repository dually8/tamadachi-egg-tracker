'use server';

import { revalidatePath } from 'next/cache';
import { dedupeDailyPrices } from '@/db/dedupe-daily-prices';
import { db } from '@/db/drizzle';

export async function removeDuplicateDaysAction() {
  const result = dedupeDailyPrices(db);
  revalidatePath('/');
  return result;
}
