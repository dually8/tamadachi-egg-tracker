import { test, expect } from '@playwright/test';
import { db } from '../src/db/drizzle';
import { priceTable } from '../src/db/schema';
import { extractPrice } from './utils/extract-price';
import log from './utils/logger';

const URL = 'https://www.instacart.com/products/324877-publix-eggs-large-12-ct?retailerSlug=publix';
test('Publix', async ({ page }) => {
  await page.goto(URL);
  const priceElement = page
    .locator('#item_details [data-radium="true"]')
    .getByText(/\$\d+\.\d{2}/)
    .first();
  const price = await priceElement.textContent();
  log(`Publix price: ${price}`);
  const parsedPrice = extractPrice(price ?? '0');
  log(`Publix parsed price: ${parsedPrice}`);
  expect(parsedPrice).toBeGreaterThan(0);
  // Save to DB
  await db.insert(priceTable).values({
    price: parsedPrice,
    storeLocation: 'Hixson, TN',
    storeName: 'Publix',
    date: new Date().toISOString(),
  });
  log('Publix price saved to DB');
  await page.screenshot({ path: 'screenshots/publix_screenshot.png' });
  log('Publix screenshot taken');
});
