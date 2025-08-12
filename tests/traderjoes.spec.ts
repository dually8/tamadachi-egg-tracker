import { test, expect } from '@playwright/test';
import { db } from '../src/db/drizzle';
import { priceTable } from '../src/db/schema';
import { extractPrice } from './utils/extract-price';
import log from './utils/logger';

const URL = 'https://www.traderjoes.com/home/products/pdp/pasture-raised-large-brown-eggs-062124';

test("Trader Joe's", async ({ page }) => {
  await page.goto(URL);
  const price = await page
    .locator('.aem-GridColumn')
    .getByText(/\$\d+\.\d{2}/)
    .textContent();
  log(`Trader Joe's price: ${price}`);
  const parsedPrice = extractPrice(price ?? '0');
  log(`Trader Joe's parsed price: ${parsedPrice}`);
  expect(parsedPrice).toBeGreaterThan(0);
  // Save to DB
  await db.insert(priceTable).values({
    price: parsedPrice,
    storeLocation: 'Chattanooga, TN',
    storeName: "Trader Joe's",
    date: new Date().toISOString(),
  });
  log(`Trader Joe's price saved to DB`);
  await page.screenshot({ path: 'screenshots/trader_joes_screenshot.png' });
  log(`Trader Joe's screenshot taken`);
});
