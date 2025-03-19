import { test, expect } from '@playwright/test';
import { db } from '../src/db/drizzle';
import { priceTable } from '../src/db/schema';

const sites = {
  traderJoes: 'https://www.traderjoes.com/home/products/pdp/pasture-raised-large-brown-eggs-062124',
  foodCity: 'https://www.foodcity.com/product/703/0003680017019',
  target:
    'https://www.target.com/p/grade-a-large-eggs-12ct-good-38-gather-8482-packaging-may-vary/-/A-14713534#lnk=sametab',
  aldi: 'https://shop.aldi.us/store/aldi/products/115095-goldhen-grade-a-large-eggs-12-ct',
  publix: 'https://www.instacart.com/products/324877-publix-eggs-large-12-ct?retailerSlug=publix',
} as const;

test("Trader Joe's", async ({ page }) => {
  await page.goto(sites.traderJoes);
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
  await page.screenshot({ path: 'playwright-report/trader_joes_screenshot.png' });
  console.log('Screenshot taken');
});

test('Food City', async ({ page }) => {
  await page.goto(sites.foodCity);
  await page.getByText('No Store Selected').click();
  await page.getByRole('textbox', { name: 'Address', exact: true }).click();
  await page.getByRole('textbox', { name: 'Address', exact: true }).fill('37343');
  await page.getByRole('button', { name: '' }).click();
  await page.locator('#set-store-703').click();
  await page.goto(sites.foodCity);
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
  await page.screenshot({ path: 'playwright-report/food_city_screenshot.png' });
  console.log('Screenshot taken');
});

test('Target', async ({ page }) => {
  await page.goto(sites.target);
  await expect(
    page
      .locator('[data-test="storeNameWithAddressPopover"]')
      .getByRole('button', { name: 'Chattanooga North' }),
  ).toBeVisible();
  const priceElement = page
    .getByRole('main', { name: 'Grade A Large Eggs - 12ct -' })
    .locator('[data-test="product-price"]');
  const price = await priceElement.textContent();
  console.log(`Target price: ${price}`);
  const parsedPrice = parseFloat(price?.replace('$', '') ?? '0');
  console.log(`Target parsed price: ${parsedPrice}`);
  expect(parsedPrice).toBeGreaterThan(0);
  // Save to DB
  await db.insert(priceTable).values({
    price: parsedPrice,
    storeLocation: 'Hixson, TN',
    storeName: 'Target',
    date: new Date().toISOString(),
  });
  console.log('Price saved to DB');
  await page.screenshot({ path: 'playwright-report/target_screenshot.png' });
  console.log('Screenshot taken');
});

test('Aldi', async ({ page }) => {
  await page.goto(sites.aldi);
  await page.getByRole('dialog').getByRole('button', { name: 'Pickup' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  const priceElement = page.locator('#item_details [data-radium="true"]').getByText(/\$\d+\.\d{2}/);
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
  await page.screenshot({ path: 'playwright-report/aldi_screenshot.png' });
  console.log('Screenshot taken');
  await page.screenshot({ path: 'playwright-report/aldi_screenshot.png' });
  console.log('Screenshot taken');
});

test('Publix', async ({ page }) => {
  await page.goto(sites.publix);
  const priceElement = page.locator('#item_details [data-radium="true"]').getByText(/\$\d+\.\d{2}/);
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
  await page.screenshot({ path: 'playwright-report/publix_screenshot.png' });
  console.log('Screenshot taken');
});
