import { test, expect } from '@playwright/test';

test('logged-out directory header uses one RallyHub login', async ({ page }) => {
  await page.goto('/directory');
  await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeVisible();
  await expect(page.getByText('Directory Login', { exact: true })).toHaveCount(0);
  await expect(page.getByText('RallyHub Club Login', { exact: true })).toHaveCount(0);
});
