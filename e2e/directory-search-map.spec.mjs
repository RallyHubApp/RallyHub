import { test, expect } from '@playwright/test';

test('directory search tolerates missing spaces and ranks Dublin 15', async ({ page }) => {
  await page.goto('/directory');
  const search = page.getByLabel('Search club directory');
  await search.fill('dublin15');
  await expect(page.getByText('Dublin 15 Pickleball', { exact: true })).toBeVisible();
  await expect(page.getByText(/clubs? found for “dublin15”/i)).toBeVisible();
});

test('directory has an interactive all-Ireland map view linked to club profiles', async ({ page }) => {
  await page.goto('/directory');
  await page.getByRole('button', { name: 'Map', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Club map' })).toBeVisible();
  await expect(page.getByText('Explore clubs on the map')).toBeVisible();
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
});
