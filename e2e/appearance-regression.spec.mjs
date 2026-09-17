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

async function setStoredMode(page, mode) {
  await page.evaluate(mode => localStorage.setItem('rallyhub-appearance', mode), mode);
  await page.reload();
}

test('quick control cycles Dark → Light → Hall → Dark and persists', async ({ page }) => {
  await page.goto('/directory');
  await page.evaluate(() => localStorage.removeItem('rallyhub-appearance'));
  await page.reload();
  const quick = page.getByRole('button', { name: /Current appearance .* Change appearance/i }).first();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await quick.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await quick.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'hall');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'hall');
  expect(await page.evaluate(() => localStorage.getItem('rallyhub-appearance'))).toBe('hall');
  await page.getByRole('button', { name: /Current appearance Hall/i }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('Auto follows device preference, including a live preference change', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/directory');
  await setStoredMode(page, 'auto');
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'auto');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('Light, Hall and Dark maintain strong body text contrast', async ({ page }) => {
  await page.goto('/directory');
  for (const mode of ['light', 'hall', 'dark']) {
    await setStoredMode(page, mode);
    const colors = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return { fg: style.color, bg: style.backgroundColor };
    });
    expect(contrastRatio(colors.fg, colors.bg), `${mode} contrast`).toBeGreaterThanOrEqual(7);
  }
});

test('Hall styling visibly strengthens input, button, checkbox and slider controls', async ({ page }) => {
  await page.goto('/login');
  await setStoredMode(page, 'hall');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'hall');
  await page.evaluate(() => {
    const mount = document.createElement('div');
    mount.id = 'appearance-probe';
    mount.innerHTML = `
      <button id="probe-button" style="border-style:solid">Button</button>
      <input id="probe-input" />
      <button id="probe-checkbox" data-rally-control="checkbox" data-state="unchecked" style="border-style:solid"></button>
      <div data-rally-control="slider"><div id="probe-track" data-rally-slider-track><span id="probe-thumb" data-rally-slider-thumb style="display:block;border-style:solid"></span></div></div>`;
    document.body.appendChild(mount);
  });
  const metrics = await page.evaluate(() => {
    const css = id => getComputedStyle(document.querySelector(id));
    const box = id => document.querySelector(id).getBoundingClientRect();
    return {
      buttonBorder: parseFloat(css('#probe-button').borderTopWidth),
      inputBorder: parseFloat(css('#probe-input').borderTopWidth),
      checkboxWidth: box('#probe-checkbox').width,
      checkboxBorder: parseFloat(css('#probe-checkbox').borderTopWidth),
      trackHeight: box('#probe-track').height,
      thumbWidth: box('#probe-thumb').width,
      thumbBorder: parseFloat(css('#probe-thumb').borderTopWidth),
    };
  });
  expect(metrics.buttonBorder).toBeGreaterThanOrEqual(2);
  expect(metrics.inputBorder).toBeGreaterThanOrEqual(2);
  expect(metrics.checkboxWidth).toBeGreaterThanOrEqual(20);
  expect(metrics.checkboxBorder).toBeGreaterThanOrEqual(2);
  expect(metrics.trackHeight).toBeGreaterThanOrEqual(8);
  expect(metrics.thumbWidth).toBeGreaterThanOrEqual(20);
  expect(metrics.thumbBorder).toBeGreaterThanOrEqual(3);
});

test('directory search and map still work in Hall mode on desktop', async ({ page }) => {
  await page.goto('/directory');
  await setStoredMode(page, 'hall');
  await page.getByLabel('Search club directory').fill('dublin15');
  await expect(page.getByText('Dublin 15 Pickleball', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Map', exact: true }).click();
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
});

test('directory Hall mode remains usable without horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/directory');
  await setStoredMode(page, 'hall');
  await expect(page.getByRole('button', { name: /Current appearance Hall/i }).first()).toBeVisible();
  await expect(page.getByLabel('Search club directory')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});

test('appearance persists across public RallyHub routes', async ({ page }) => {
  await page.goto('/directory');
  await setStoredMode(page, 'light');
  for (const path of ['/about', '/contact', '/directory']) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  }
});
