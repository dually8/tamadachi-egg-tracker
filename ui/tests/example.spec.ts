import { test, expect } from '@playwright/test';

test('shows data', async ({ page }) => {
  await page.goto('/');
  const isTableShown = await page.getByTestId('egg-table').isVisible();
  expect(isTableShown).toBe(true);
});