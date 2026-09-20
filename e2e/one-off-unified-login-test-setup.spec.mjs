import { test, expect } from '@playwright/test';

test('temporary Brian test-club route uses unified login and preserves return target', async ({ page }) => {
  await page.goto('/test-club-entry');
  await expect(page).toHaveURL(/\/login\?returnTo=%2Ftest-club-entry$/);
  await expect(page.getByRole('heading', { name: 'Sign in to RallyHub' })).toBeVisible();
});

test('temporary Marie directory listing is unclaimed and enters unified claim flow', async ({ page }) => {
  await page.goto('/directory/rallyhub-directory-test-club-marie-20260920');
  await expect(page.getByRole('heading', { name: 'RallyHub Directory Test Club' })).toBeVisible();
  const claim = page.getByRole('link', { name: /Claim this listing/i }).first();
  await expect(claim).toBeVisible();
  await claim.click();
  await expect(page).toHaveURL(/\/directory\/rallyhub-directory-test-club-marie-20260920\/claim/);
  await expect(page.getByRole('heading', { name: 'Sign in or create your RallyHub account' })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Create directory account', { exact: true })).toHaveCount(0);
});
