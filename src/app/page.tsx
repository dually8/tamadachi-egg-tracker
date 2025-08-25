import PriceHistoryChart from '@/components/price-history-chart';
import PriceTableAgGrid from '@/components/price-table-ag-grid';
import { db } from '@/db/drizzle';
import { Price, priceTable } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch data from the database
  const prices = await db.select().from(priceTable).orderBy(desc(priceTable.date));
  const storeNames = Array.from(new Set(prices.map(price => price.storeName))).sort((a,b) => a.localeCompare(b));
  const priceMap = new Map<string, Price[]>();
  storeNames.forEach(storeName => {
    priceMap.set(storeName, prices.filter(price => price.storeName === storeName));
  });
  return (
    <main>
      <PriceTableAgGrid prices={prices} />
      {storeNames.map(storeName => (
        <PriceHistoryChart
          key={storeName}
          title={storeName}
          data={priceMap.get(storeName) || []}
        />
      ))}
    </main>
  );
}
