import { test, expect } from '@playwright/test';

function rgbToLuminance(rgb) {
  const parts = rgb.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [0, 0, 0];
  const linear = parts.map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(fg, bg) {
  const a = rgbToLuminance(fg);
  const b = rgbToLuminance(bg);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

async function selectMode(page, label) {
  await page.getByRole('button', { name: `${label} appearance` }).click();
}

test('full appearance selector supports Auto, Light, Hall and Dark and persists explicit choice', async ({ page }) => {
  await page.goto('/e2e/appearanceHarness.html');
  await selectMode(page, 'Light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await selectMode(page, 'Hall');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'hall');
  await selectMode(page, 'Dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await selectMode(page, 'Hall');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'hall');
  expect(await page.evaluate(() => localStorage.getItem('rallyhub-appearance'))).toBe('hall');
});

test('Auto follows the device preference and updates when the preference changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/e2e/appearanceHarness.html');
  await selectMode(page, 'Auto');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'auto');
});

test('Hall mode visibly strengthens core controls including slider, number input, checkbox and outline button', async ({ page }) => {
  await page.goto('/e2e/appearanceHarness.html');
  await selectMode(page, 'Hall');

  const metrics = await page.evaluate(() => {
    const input = document.querySelector('#score');
    const checkbox = document.querySelector('[role="checkbox"]');
    const sliderThumb = document.querySelector('[data-rally-slider-thumb]');
    const sliderTrack = document.querySelector('[data-rally-slider-track]');
    const panel = document.querySelector('[data-testid="control-panel"]');
    const outlineButton = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Secondary action'));
    const css = el => getComputedStyle(el);
    const box = el => el.getBoundingClientRect();
    return {
      inputBorder: parseFloat(css(input).borderTopWidth),
      inputBackground: css(input).backgroundColor,
      checkboxWidth: box(checkbox).width,
      checkboxBorder: parseFloat(css(checkbox).borderTopWidth),
      sliderThumbWidth: box(sliderThumb).width,
      sliderThumbBorder: parseFloat(css(sliderThumb).borderTopWidth),
      sliderTrackHeight: box(sliderTrack).height,
      panelBackdrop: css(panel).backdropFilter,
      panelBorder: parseFloat(css(panel).borderTopWidth),
      outlineBorder: parseFloat(css(outlineButton).borderTopWidth),
    };
  });

  expect(metrics.inputBorder).toBeGreaterThanOrEqual(2);
  expect(metrics.checkboxWidth).toBeGreaterThanOrEqual(16);
  expect(metrics.checkboxBorder).toBeGreaterThanOrEqual(2);
  expect(metrics.sliderThumbWidth).toBeGreaterThanOrEqual(20);
  expect(metrics.sliderThumbBorder).toBeGreaterThanOrEqual(3);
  expect(metrics.sliderTrackHeight).toBeGreaterThanOrEqual(8);
  expect(metrics.panelBackdrop === 'none' || metrics.panelBackdrop === '').toBeTruthy();
  expect(metrics.panelBorder).toBeGreaterThanOrEqual(2);
  expect(metrics.outlineBorder).toBeGreaterThanOrEqual(2);
});

test('Light, Hall and Dark all maintain strong body text contrast', async ({ page }) => {
  await page.goto('/e2e/appearanceHarness.html');
  for (const mode of ['Light', 'Hall', 'Dark']) {
    await selectMode(page, mode);
    const colors = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return { fg: style.color, bg: style.backgroundColor };
    });
    expect(contrastRatio(colors.fg, colors.bg), `${mode} contrast`).toBeGreaterThanOrEqual(7);
  }
});

test('appearance controls and core fields remain usable without horizontal overflow on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/e2e/appearanceHarness.html');
  await selectMode(page, 'Hall');
  await expect(page.getByRole('button', { name: 'Hall appearance' })).toBeVisible();
  await expect(page.getByLabel('Score / number control')).toBeVisible();
  await expect(page.getByLabel('Test checkbox')).toBeVisible();
  await expect(page.getByLabel('Test slider')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('public directory actually inherits Hall mode and keeps search/map navigation usable on desktop and mobile', async ({ page }) => {
  await page.goto('/directory');
  const quick = page.getByRole('button', { name: /Current appearance .* Change appearance/i });
  while ((await page.locator('html').getAttribute('data-theme')) !== 'hall') await quick.click();
  await expect(page.getByLabel('Search club directory')).toBeVisible();
  await page.getByLabel('Search club directory').fill('dublin15');
  await expect(page.getByText('Dublin 15 Pickleball', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Map', exact: true }).click();
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/directory');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'hall');
  await expect(page.getByRole('button', { name: /Current appearance Hall/i })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('Add Club form uses stronger Hall inputs rather than falling back to the old dark-only styling', async ({ page }) => {
  await page.goto('/directory/add');
  const quick = page.getByRole('button', { name: /Current appearance .* Change appearance/i });
  while ((await page.locator('html').getAttribute('data-theme')) !== 'hall') await quick.click();
  const firstInput = page.locator('input').first();
  await expect(firstInput).toBeVisible();
  const border = await firstInput.evaluate(el => parseFloat(getComputedStyle(el).borderTopWidth));
  expect(border).toBeGreaterThanOrEqual(2);
});
