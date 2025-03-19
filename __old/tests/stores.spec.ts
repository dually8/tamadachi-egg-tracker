import { test, expect } from '@playwright/test';

const sites = {
  traderJoes: 'https://www.traderjoes.com/home/products/pdp/pasture-raised-large-brown-eggs-062124',
  // foodCity: 'https://www.foodcity.com/product/703/0003680017019',
  // target: 'https://www.target.com/p/grade-a-large-eggs-12ct-good-38-gather-8482-packaging-may-vary/-/A-14713534#lnk=sametab',
  // aldi: 'https://shop.aldi.us/store/aldi/products/115095-goldhen-grade-a-large-eggs-12-ct',
  instacart: 'https://www.instacart.com/store',
} as const;

test('trader joes', async ({ page }) => {
  await page.goto(sites.traderJoes);
  const pageTitle = await page.title();
  expect(pageTitle).toBeTruthy();
});

test.skip('instacart', async ({ page }) => {
  await page.goto(sites.instacart);
  const pageTitle = await page.title();
  expect(pageTitle).toBeTruthy();
});
