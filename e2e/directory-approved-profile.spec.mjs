import { test, expect } from '@playwright/test';

test('approved submitted club carries public contact details into the public profile', async ({ page }) => {
  await page.goto('/directory/roisin-s-pickleball-club?refresh=1');
  await expect(page.getByRole('heading', { name: "Roisin's Pickleball Club" })).toBeVisible();
  await expect(page.getByText('roisintennis@gmail.com', { exact: true })).toBeVisible();
  await expect(page.getByText('0852445929', { exact: true })).toBeVisible();
  await expect(page.getByText('Town / area', { exact: true })).toBeVisible();
  await expect(page.getByText('Ennis', { exact: true })).toBeVisible();
  await expect(page.getByText('Source checked', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Submitted to RallyHub Directory', { exact: true })).toHaveCount(0);
});
