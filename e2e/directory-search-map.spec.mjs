import { test, expect } from '@playwright/test';

test('directory search tolerates missing spaces and ranks Dublin 15', async ({ page }) => {
  await page.goto('/directory');
  const search = page.getByLabel('Search RallyHub directory');
  await search.fill('dublin15');
  await expect(page.getByText('Dublin 15 Pickleball', { exact: true })).toBeVisible();
  await expect(page.getByText(/listings? found for “dublin15”/i)).toBeVisible();
});

test('directory defaults to all pickleball and exposes provider categories', async ({ page }) => {
  await page.goto('/directory');
  await expect(page.getByLabel('What are you looking for?')).toHaveValue('all');
  await expect(page.getByTestId('directory-category-choices')).toContainText('Pickleball holidays');
  await expect(page.getByTestId('directory-category-choices')).toContainText('Equipment & suppliers');
  await expect(page.getByLabel('Search RallyHub directory')).toBeVisible();
});

test('directory category deep-link opens holiday providers directly', async ({ page }) => {
  await page.goto('/directory?category=holidays');
  await expect(page.getByLabel('What are you looking for?')).toHaveValue('holidays');
  await expect(page.getByRole('heading',{name:'Pickleball holidays & experiences',exact:true})).toBeVisible();
});

test('directory has an interactive all-Ireland map view linked to club profiles', async ({ page }) => {
  await page.goto('/directory');
  await page.getByLabel('What are you looking for?').selectOption('club');
  await page.getByRole('button', { name: /map/i }).click();
  await expect(page.getByRole('heading', { name: 'Club map' })).toBeVisible();
  await expect(page.getByText('Explore clubs on the map')).toBeVisible();
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
});
