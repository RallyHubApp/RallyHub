# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: appearance-regression.spec.mjs >> full appearance selector supports Auto, Light, Hall and Dark and persists explicit choice
- Location: e2e/appearance-regression.spec.mjs:24:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Light appearance' })

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | function rgbToLuminance(rgb) {
  4   |   const parts = rgb.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [0, 0, 0];
  5   |   const linear = parts.map(v => {
  6   |     const s = v / 255;
  7   |     return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  8   |   });
  9   |   return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  10  | }
  11  | 
  12  | function contrastRatio(fg, bg) {
  13  |   const a = rgbToLuminance(fg);
  14  |   const b = rgbToLuminance(bg);
  15  |   const lighter = Math.max(a, b);
  16  |   const darker = Math.min(a, b);
  17  |   return (lighter + 0.05) / (darker + 0.05);
  18  | }
  19  | 
  20  | async function selectMode(page, label) {
> 21  |   await page.getByRole('button', { name: `${label} appearance` }).click();
      |                                                                   ^ Error: locator.click: Test timeout of 45000ms exceeded.
  22  | }
  23  | 
  24  | test('full appearance selector supports Auto, Light, Hall and Dark and persists explicit choice', async ({ page }) => {
  25  |   await page.goto('/e2e/appearanceHarness.html');
  26  |   await selectMode(page, 'Light');
  27  |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  28  |   await selectMode(page, 'Hall');
  29  |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'hall');
  30  |   await selectMode(page, 'Dark');
  31  |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  32  |   await selectMode(page, 'Hall');
  33  |   await page.reload();
  34  |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'hall');
  35  |   expect(await page.evaluate(() => localStorage.getItem('rallyhub-appearance'))).toBe('hall');
  36  | });
  37  | 
  38  | test('Auto follows the device preference and updates when the preference changes', async ({ page }) => {
  39  |   await page.emulateMedia({ colorScheme: 'light' });
  40  |   await page.goto('/e2e/appearanceHarness.html');
  41  |   await selectMode(page, 'Auto');
  42  |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  43  |   await page.emulateMedia({ colorScheme: 'dark' });
  44  |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  45  |   await expect(page.locator('html')).toHaveAttribute('data-appearance', 'auto');
  46  | });
  47  | 
  48  | test('Hall mode visibly strengthens core controls including slider, number input, checkbox and outline button', async ({ page }) => {
  49  |   await page.goto('/e2e/appearanceHarness.html');
  50  |   await selectMode(page, 'Hall');
  51  | 
  52  |   const metrics = await page.evaluate(() => {
  53  |     const input = document.querySelector('#score');
  54  |     const checkbox = document.querySelector('[role="checkbox"]');
  55  |     const sliderThumb = document.querySelector('[data-rally-slider-thumb]');
  56  |     const sliderTrack = document.querySelector('[data-rally-slider-track]');
  57  |     const panel = document.querySelector('[data-testid="control-panel"]');
  58  |     const outlineButton = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Secondary action'));
  59  |     const css = el => getComputedStyle(el);
  60  |     const box = el => el.getBoundingClientRect();
  61  |     return {
  62  |       inputBorder: parseFloat(css(input).borderTopWidth),
  63  |       inputBackground: css(input).backgroundColor,
  64  |       checkboxWidth: box(checkbox).width,
  65  |       checkboxBorder: parseFloat(css(checkbox).borderTopWidth),
  66  |       sliderThumbWidth: box(sliderThumb).width,
  67  |       sliderThumbBorder: parseFloat(css(sliderThumb).borderTopWidth),
  68  |       sliderTrackHeight: box(sliderTrack).height,
  69  |       panelBackdrop: css(panel).backdropFilter,
  70  |       panelBorder: parseFloat(css(panel).borderTopWidth),
  71  |       outlineBorder: parseFloat(css(outlineButton).borderTopWidth),
  72  |     };
  73  |   });
  74  | 
  75  |   expect(metrics.inputBorder).toBeGreaterThanOrEqual(2);
  76  |   expect(metrics.checkboxWidth).toBeGreaterThanOrEqual(16);
  77  |   expect(metrics.checkboxBorder).toBeGreaterThanOrEqual(2);
  78  |   expect(metrics.sliderThumbWidth).toBeGreaterThanOrEqual(20);
  79  |   expect(metrics.sliderThumbBorder).toBeGreaterThanOrEqual(3);
  80  |   expect(metrics.sliderTrackHeight).toBeGreaterThanOrEqual(8);
  81  |   expect(metrics.panelBackdrop === 'none' || metrics.panelBackdrop === '').toBeTruthy();
  82  |   expect(metrics.panelBorder).toBeGreaterThanOrEqual(2);
  83  |   expect(metrics.outlineBorder).toBeGreaterThanOrEqual(2);
  84  | });
  85  | 
  86  | test('Light, Hall and Dark all maintain strong body text contrast', async ({ page }) => {
  87  |   await page.goto('/e2e/appearanceHarness.html');
  88  |   for (const mode of ['Light', 'Hall', 'Dark']) {
  89  |     await selectMode(page, mode);
  90  |     const colors = await page.evaluate(() => {
  91  |       const style = getComputedStyle(document.body);
  92  |       return { fg: style.color, bg: style.backgroundColor };
  93  |     });
  94  |     expect(contrastRatio(colors.fg, colors.bg), `${mode} contrast`).toBeGreaterThanOrEqual(7);
  95  |   }
  96  | });
  97  | 
  98  | test('appearance controls and core fields remain usable without horizontal overflow on a phone viewport', async ({ page }) => {
  99  |   await page.setViewportSize({ width: 390, height: 844 });
  100 |   await page.goto('/e2e/appearanceHarness.html');
  101 |   await selectMode(page, 'Hall');
  102 |   await expect(page.getByRole('button', { name: 'Hall appearance' })).toBeVisible();
  103 |   await expect(page.getByLabel('Score / number control')).toBeVisible();
  104 |   await expect(page.getByLabel('Test checkbox')).toBeVisible();
  105 |   await expect(page.getByLabel('Test slider')).toBeVisible();
  106 |   const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  107 |   expect(overflow).toBeLessThanOrEqual(1);
  108 | });
  109 | 
  110 | test('public directory actually inherits Hall mode and keeps search/map navigation usable on desktop and mobile', async ({ page }) => {
  111 |   await page.goto('/directory');
  112 |   const quick = page.getByRole('button', { name: /Current appearance .* Change appearance/i });
  113 |   while ((await page.locator('html').getAttribute('data-theme')) !== 'hall') await quick.click();
  114 |   await expect(page.getByLabel('Search club directory')).toBeVisible();
  115 |   await page.getByLabel('Search club directory').fill('dublin15');
  116 |   await expect(page.getByText('Dublin 15 Pickleball', { exact: true })).toBeVisible();
  117 |   await page.getByRole('button', { name: 'Map', exact: true }).click();
  118 |   await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
  119 | 
  120 |   await page.setViewportSize({ width: 390, height: 844 });
  121 |   await page.goto('/directory');
```