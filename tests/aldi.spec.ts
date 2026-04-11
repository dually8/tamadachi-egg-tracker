import { test, expect, type Page } from '@playwright/test';
import { db } from '../src/db/drizzle';
import { priceTable } from '../src/db/schema';
import { extractPrice } from './utils/extract-price';
import log from './utils/logger';

const URL = 'https://shop.aldi.us/store/aldi/products/115095-goldhen-grade-a-large-eggs-12-ct';

async function dismissCookieBanner(page: Page) {
  const rejectButton = page.getByRole('button', { name: 'Reject All Non-Essential' });
  const bannerAppeared = await rejectButton
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (bannerAppeared) {
    await rejectButton.click();
    await expect(rejectButton).toBeHidden();
  }
}

test('Aldi', async ({ page }) => {
  await page.goto(URL);
  await dismissCookieBanner(page);

  const shoppingDialog = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('button', { name: 'Pickup' }) })
    .first();

  await shoppingDialog.getByRole('button', { name: 'Pickup' }).click();
  const confirmButton = shoppingDialog.getByRole('button', { name: 'Confirm' });

  try {
    await confirmButton.click({ timeout: 5_000 });
  } catch {
    await dismissCookieBanner(page);
    await confirmButton.click();
  }

  const priceElement = page
    .locator('#item_details')
    .getByText('Current price')
    .getByText(/\$\d+\.\d{2}/)
    .first();
  const price = await priceElement.textContent();
  log(`Aldi price: ${price}`);
  const parsedPrice = extractPrice(price ?? '0');
  log(`Aldi parsed price: ${parsedPrice}`);
  expect(parsedPrice).toBeGreaterThan(0);
  // Save to DB
  await db.insert(priceTable).values({
    price: parsedPrice,
    storeLocation: 'Hixson, TN',
    storeName: 'Aldi',
    date: new Date().toISOString(),
  });
  log('Aldi price saved to DB');
  await page.screenshot({ path: 'screenshots/aldi_screenshot.png' });
  log('Aldi screenshot taken');
});
