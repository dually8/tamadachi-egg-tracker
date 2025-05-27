import { test, expect } from '@playwright/test';
import { db } from '../src/db/drizzle';
import { priceTable } from '../src/db/schema';

const URL = 'https://www.traderjoes.com/home/products/pdp/pasture-raised-large-brown-eggs-062124';

test("Trader Joe's", async ({ page }) => {
  await page.goto(URL);
  const price = await page
    .locator('.aem-GridColumn')
    .getByText(/\$\d+\.\d{2}/)
    .textContent();
  console.log(`Trader Joe's price: ${price}`);
  const parsedPrice = parseFloat(price?.replace('$', '') ?? '0');
  console.log(`Trader Joe's parsed price: ${parsedPrice}`);
  expect(parsedPrice).toBeGreaterThan(0);
  // Save to DB
  await db.insert(priceTable).values({
    price: parsedPrice,
    storeLocation: 'Chattanooga, TN',
    storeName: "Trader Joe's",
    date: new Date().toISOString(),
  });
  console.log('Price saved to DB');
  await page.screenshot({ path: 'screenshots/trader_joes_screenshot.png' });
  console.log('Screenshot taken');
});
