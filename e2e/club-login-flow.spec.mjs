import { test, expect } from '@playwright/test';

test('landing uses the single RallyHub login and preserves /app return target', async ({ page }) => {
  await page.goto('/');
  const login = page.getByRole('button', { name: 'Log in', exact: true }).first();
  await expect(login).toBeVisible();
  await login.click();
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fapp$/);
  await expect(page.getByRole('heading', { name: 'Sign in to RallyHub' })).toBeVisible();
});

test('opening a protected app URL while signed out preserves the destination through login', async ({ page }) => {
  await page.goto('/app/admin?tab=directory');
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fapp%2Fadmin%3Ftab%3Ddirectory$/);
  await expect(page.getByRole('heading', { name: 'Sign in to RallyHub' })).toBeVisible();
});
