import PriceTable from '@/components/price-table';
import { db } from '@/db/drizzle';
import { priceTable } from '@/db/schema';
import { desc } from 'drizzle-orm';

export default async function Home() {
  // Fetch data from the database
  const prices = await db.select().from(priceTable).orderBy(desc(priceTable.date));
  console.log(prices);
  return (
    <main>
      <PriceTable prices={prices} />
    </main>
  );
}
