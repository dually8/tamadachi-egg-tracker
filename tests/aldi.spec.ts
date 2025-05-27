import { test, expect } from '@playwright/test';
import { db } from '../src/db/drizzle';
import { priceTable } from '../src/db/schema';

const URL = 'https://shop.aldi.us/store/aldi/products/115095-goldhen-grade-a-large-eggs-12-ct';

test('Aldi', async ({ page }) => {
  await page.goto(URL);
  await page.getByRole('dialog').getByRole('button', { name: 'Pickup' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  const priceElement = page
    .locator('#item_details [data-radium="true"]')
    .getByText(/\$\d+\.\d{2}/)
    .first();
  const price = await priceElement.textContent();
  console.log(`Aldi price: ${price}`);
  const parsedPrice = parseFloat(price?.replace('$', '') ?? '0');
  console.log(`Aldi parsed price: ${parsedPrice}`);
  expect(parsedPrice).toBeGreaterThan(0);
  // Save to DB
  await db.insert(priceTable).values({
    price: parsedPrice,
    storeLocation: 'Hixson, TN',
    storeName: 'Aldi',
    date: new Date().toISOString(),
  });
  console.log('Price saved to DB');
  await page.screenshot({ path: 'screenshots/aldi_screenshot.png' });
  console.log('Screenshot taken');
});
