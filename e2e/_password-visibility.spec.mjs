import { test, expect } from '@playwright/test';

async function checkToggle(page, selector) {
  const field = page.locator(selector);
  await expect(field).toHaveAttribute('type','password');
  const wrapper = field.locator('..');
  const show = wrapper.getByRole('button', { name:'Show password' });
  await expect(show).toBeVisible();
  await show.click();
  await expect(field).toHaveAttribute('type','text');
  const hide = wrapper.getByRole('button', { name:'Hide password' });
  await expect(hide).toBeVisible();
  await hide.click();
  await expect(field).toHaveAttribute('type','password');
}

test('login password can be shown and hidden', async ({page}) => {
  await page.goto('/login');
  await checkToggle(page, '#password');
});

test('register password fields can be shown and hidden independently', async ({page}) => {
  await page.goto('/register');
  await checkToggle(page, '#password');
  await checkToggle(page, '#confirm');
});

test('reset password fields can be shown and hidden independently', async ({page}) => {
  await page.goto('/reset-password?token=e2e');
  await checkToggle(page, '#password');
  await checkToggle(page, '#confirm');
});
