import { test, expect } from '@playwright/test';
import { db } from '../src/db/drizzle';
import { priceTable } from '../src/db/schema';
import { extractPrice } from './utils/extract-price';
import log from './utils/logger';

const URL =
  'https://www.target.com/p/grade-a-large-eggs-12ct-good-38-gather-8482-packaging-may-vary/-/A-14713534#lnk=sametab';

test('Target', async ({ page }) => {
  await page.goto(URL);
  await expect(
    page
      .locator('[data-test="storeNameWithAddressPopover"]')
      .getByRole('button', { name: 'Chattanooga North' }),
  ).toBeVisible();
  const priceElement = page
    .getByRole('main', { name: 'Grade A Large Eggs - 12ct -' })
    .locator('[data-test="product-price"]');
  const price = await priceElement.textContent();
  log(`Target price: ${price}`);
  const parsedPrice = extractPrice(price ?? '0');
  log(`Target parsed price: ${parsedPrice}`);
  expect(parsedPrice).toBeGreaterThan(0);
  // Save to DB
  await db.insert(priceTable).values({
    price: parsedPrice,
    storeLocation: 'Hixson, TN',
    storeName: 'Target',
    date: new Date().toISOString(),
  });
  log('Target price saved to DB');
  await page.screenshot({ path: 'screenshots/target_screenshot.png' });
  log('Target screenshot taken');
});
