import { test, expect } from '@playwright/test';
import { db } from '../src/db/drizzle';
import { priceTable } from '../src/db/schema';

const URL = 'https://www.instacart.com/products/324877-publix-eggs-large-12-ct?retailerSlug=publix';
test('Publix', async ({ page }) => {
  await page.goto(URL);
  const priceElement = page
    .locator('#item_details [data-radium="true"]')
    .getByText(/\$\d+\.\d{2}/)
    .first();
  const price = await priceElement.textContent();
  console.log(`Publix price: ${price}`);
  const parsedPrice = parseFloat(price?.replace('$', '') ?? '0');
  console.log(`Publix parsed price: ${parsedPrice}`);
  expect(parsedPrice).toBeGreaterThan(0);
  // Save to DB
  await db.insert(priceTable).values({
    price: parsedPrice,
    storeLocation: 'Hixson, TN',
    storeName: 'Publix',
    date: new Date().toISOString(),
  });
  console.log('Price saved to DB');
  await page.screenshot({ path: 'screenshots/publix_screenshot.png' });
  console.log('Screenshot taken');
});
