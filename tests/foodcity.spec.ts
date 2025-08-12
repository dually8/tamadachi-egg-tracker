import { test, expect } from '@playwright/test';
import { db } from '../src/db/drizzle';
import { priceTable } from '../src/db/schema';
import log from './utils/logger';
import { extractPrice } from './utils/extract-price';

const URL = 'https://www.foodcity.com/product/703/0003680017019';

test('Food City', async ({ page }) => {
  await page.goto(URL);
  await page.getByText('No Store Selected').click();
  await page.getByRole('textbox', { name: 'Address', exact: true }).click();
  await page.getByRole('textbox', { name: 'Address', exact: true }).fill('37343');
  await page.getByRole('button', { name: '' }).click();
  await page.locator('#set-store-703').click();
  await page.goto(URL);
  const priceElement = page.locator('.item-detail__price');
  const price = await priceElement.textContent();
  log(`Food City price: ${price}`);
  const parsedPrice = extractPrice(price ?? '0');
  log(`Food City parsed price: ${parsedPrice}`);
  expect(parsedPrice).toBeGreaterThan(0);
  // Save to DB
  await db.insert(priceTable).values({
    price: parsedPrice,
    storeLocation: 'Hixson, TN',
    storeName: 'Food City',
    date: new Date().toISOString(),
  });
  log('Food City price saved to DB');
  await page.screenshot({ path: 'screenshots/food_city_screenshot.png' });
  log('Food City screenshot taken');
});
