import { test, expect } from '@playwright/test';
import { getDb } from '../src/db/drizzle';
import { priceTable } from '../src/db/schema';
import { extractPrice } from './utils/extract-price';
import log from './utils/logger';

const URL = 'https://www.traderjoes.com/home/products/pdp/pasture-raised-large-brown-eggs-062124';

const isLinuxArm64 = process.platform === 'linux' && process.arch === 'arm64';

test("Trader Joe's", async ({ page, browserName }) => {
  test.skip(
    isLinuxArm64 && browserName === 'chromium',
    "Trader Joe's is being blocked by Akamai on Chromium from this Pi. Try the firefox project instead.",
  );

  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  const accessDenied = page.getByRole('heading', { name: 'Access Denied' });
  if (await accessDenied.isVisible().catch(() => false)) {
    test.skip(
      true,
      `Trader Joe's is blocking automated browser traffic from this ${browserName} run, so this scraper cannot reliably reach the product page.`,
    );
  }

  const price = await page
    .locator('.aem-GridColumn')
    .getByText(/\$\d+\.\d{2}/)
    .textContent();
  log(`Trader Joe's price: ${price}`);
  const parsedPrice = extractPrice(price ?? '0');
  log(`Trader Joe's parsed price: ${parsedPrice}`);
  expect(parsedPrice).toBeGreaterThan(0);
  // Save to DB
  await getDb().insert(priceTable).values({
    price: parsedPrice,
    storeLocation: 'Chattanooga, TN',
    storeName: "Trader Joe's",
    date: new Date().toISOString(),
  });
  log(`Trader Joe's price saved to DB`);
  await page.screenshot({ path: 'screenshots/trader_joes_screenshot.png' });
  log(`Trader Joe's screenshot taken`);
});
