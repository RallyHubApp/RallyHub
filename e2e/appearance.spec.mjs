import { test, expect } from '@playwright/test';

test('directory appearance control cycles Light, Hall and Dark and persists the choice', async ({ page }) => {
  await page.goto('/directory');
  const control = page.getByRole('button', { name: /Current appearance .* Change appearance/i });
  await expect(control).toBeVisible();

  // Existing users default to Dark until they choose another mode.
  await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|light/);
  await control.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await control.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'hall');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'hall');
  await expect(page.evaluate(() => localStorage.getItem('rallyhub-appearance'))).resolves.toBe('hall');
});
