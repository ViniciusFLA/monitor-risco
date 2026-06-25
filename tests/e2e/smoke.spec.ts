import { test, expect } from '@playwright/test';
const URL = process.env.E2E_URL || 'http://localhost:3000';
test('home loads', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const res = await page.goto(URL, { waitUntil: 'domcontentloaded' });
  expect(res?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/.+/);
  expect(errors, `JS errors: ${errors.join(' | ')}`).toEqual([]);
});
