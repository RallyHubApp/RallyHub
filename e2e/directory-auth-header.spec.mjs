import { test, expect } from '@playwright/test';

test('logged-out directory header clearly shows both directory and club login routes', async ({ page }) => {
  await page.goto('/directory');
  await expect(page.getByRole('button', { name: 'Directory Login', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'RallyHub Club Login', exact: true })).toBeVisible();
});
