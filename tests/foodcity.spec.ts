import { test, expect } from '@playwright/test';
import { db } from '../src/db/drizzle';
import { priceTable } from '../src/db/schema';

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
  console.log(`Food City price: ${price}`);
  const parsedPrice = parseFloat(price?.replace('$', '') ?? '0');
  console.log(`Food City parsed price: ${parsedPrice}`);
  expect(parsedPrice).toBeGreaterThan(0);
  // Save to DB
  await db.insert(priceTable).values({
    price: parsedPrice,
    storeLocation: 'Hixson, TN',
    storeName: 'Food City',
    date: new Date().toISOString(),
  });
  console.log('Price saved to DB');
  await page.screenshot({ path: 'screenshots/food_city_screenshot.png' });
  console.log('Screenshot taken');
});
