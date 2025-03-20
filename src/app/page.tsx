import PriceTableAgGrid from '@/components/price-table-ag-grid';
import { db } from '@/db/drizzle';
import { priceTable } from '@/db/schema';
import { desc } from 'drizzle-orm';

export default async function Home() {
  // Fetch data from the database
  const prices = await db.select().from(priceTable).orderBy(desc(priceTable.date));
  return (
    <main>
      <PriceTableAgGrid prices={prices} />
    </main>
  );
}
