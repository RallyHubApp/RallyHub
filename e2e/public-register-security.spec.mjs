import { test, expect } from '@playwright/test';

test('legacy tournament registration requires a RallyHub identity before any registration details are accepted', async ({ page }) => {
  await page.goto('/register/security-test-event');
  await expect(page.getByText('Sign in to register', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in or create an account', exact: true })).toBeVisible();
  await expect(page.getByPlaceholder('Your full name')).toHaveCount(0);
  await expect(page.getByPlaceholder('your@email.com')).toHaveCount(0);

  await page.getByRole('button', { name: 'Sign in or create an account', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fregister%2Fsecurity-test-event$/);
});
