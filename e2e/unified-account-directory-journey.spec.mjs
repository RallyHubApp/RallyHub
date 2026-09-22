import { test, expect } from '@playwright/test';

test('directory claim journey stays on one RallyHub account flow', async ({ page }) => {
  await page.goto('/directory?manage=1');

  await expect(page.getByText('Manage an existing club listing', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeVisible();

  await page.goto('/directory/clare-pickleball');
  const claim = page.getByRole('link', { name: /Claim this listing/i }).first();
  await expect(claim).toBeVisible();
  await claim.click();

  await expect(page).toHaveURL(/\/directory\/clare-pickleball\/claim/);
  await expect(page.getByRole('heading', { name: /Sign in or create your RallyHub account|First time on RallyHub\?/ })).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?mode=directory&returnTo=/);
  await expect(page.getByRole('heading', { name: 'Sign in to RallyHub' })).toBeVisible();
  await expect(page.getByText('One RallyHub account is used everywhere.', { exact: false })).toBeVisible();
  await expect(page.getByText('Create directory account', { exact: true })).toHaveCount(0);
});

test('quick start guide exposes the approved guide and printable PDF', async ({ page }) => {
  await page.goto('/directory/quick-start');

  await expect(page.getByText('Approved RallyHub Directory Quick Start Guide', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Open \/ print PDF/i })).toHaveAttribute('href', '/downloads/RallyHub_Directory_Quick_Start_Guide.pdf');
  await expect(page.locator('object[aria-label="RallyHub Directory Quick Start Guide"]')).toHaveAttribute('data', '/downloads/RallyHub_Directory_Quick_Start_Guide.pdf');
});

test('directory help explains one account with separate permissions', async ({ page }) => {
  await page.goto('/directory/help');

  await page.locator('summary').filter({ hasText: 'Does claiming my listing give me RallyHub Club access?' }).click();
  await expect(page.getByText('RallyHub uses one account, but permissions are separate.', { exact: false })).toBeVisible();
});
