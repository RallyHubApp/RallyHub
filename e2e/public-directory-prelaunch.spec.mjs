import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5173';

const viewports = [
  { name: 'desktop-1366', width: 1366, height: 768, touch: false },
  { name: 'desktop-1920', width: 1920, height: 1080, touch: false },
  { name: 'iphone-small', width: 375, height: 667, touch: true },
  { name: 'iphone-standard', width: 390, height: 844, touch: true },
  { name: 'android-large', width: 430, height: 932, touch: true },
  { name: 'ipad-portrait', width: 768, height: 1024, touch: true },
  { name: 'phone-landscape', width: 844, height: 390, touch: true },
];

async function assertNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(metrics.scrollWidth, `scrollWidth ${metrics.scrollWidth} exceeds viewport ${metrics.viewport}`).toBeLessThanOrEqual(metrics.viewport + 2);
}

for (const config of viewports) {
  test(`directory responsive journey - ${config.name}`, async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: BASE_URL,
      viewport: { width: config.width, height: config.height },
      hasTouch: config.touch,
      isMobile: config.touch && config.width < 600,
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto('/directory');
    await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Filter by county' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Filter by day' })).toBeVisible();
    await assertNoHorizontalOverflow(page);

    if (config.width < 1024) {
      await page.getByRole('button', { name: 'Menu' }).click();
      const mobileHeader = page.getByRole('banner');
      for (const label of ['Home', 'Directory', 'Events', 'Club Guide', 'About']) {
        await expect(mobileHeader.getByRole('link', { name: label, exact: true })).toBeVisible();
      }
      await page.getByRole('button', { name: 'Menu' }).click();
    }

    const search = page.getByRole('textbox', { name: 'Search club directory' });
    await search.fill('Clare Pickleball');
    await expect(page.getByRole('heading', { name: 'Clare Pickleball', exact: true })).toBeVisible();

    await page.getByRole('combobox', { name: 'Filter by county' }).selectOption({ label: 'Clare' });
    await page.getByRole('combobox', { name: 'Filter by day' }).selectOption({ label: 'Monday' });
    await expect(page.getByRole('heading', { name: 'Clare Pickleball', exact: true })).toBeVisible();

    await search.fill('definitely-no-such-rallyhub-club');
    await expect(page.getByRole('heading', { name: 'No matching clubs yet' })).toBeVisible();

    await search.fill('');
    await page.getByRole('combobox', { name: 'Filter by county' }).selectOption({ label: 'All counties' });
    await page.getByRole('combobox', { name: 'Filter by day' }).selectOption({ label: 'Any day' });
    await page.getByRole('button', { name: /map/i }).click();
    await expect(page.getByRole('heading', { name: 'Club map' })).toBeVisible();
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
    await assertNoHorizontalOverflow(page);

    expect(pageErrors).toEqual([]);
    await context.close();
  });
}

test('public routes, deep links, refresh, back and forward remain usable', async ({ page }) => {
  const routes = [
    '/',
    '/about',
    '/contact',
    '/events',
    '/directory',
    '/directory/help',
    '/directory/quick-start',
    '/directory/story',
    '/directory/add',
    '/pickleball-clubs/clare',
    '/directory/clare-pickleball',
    '/directory/clare-pickleball/claim',
  ];

  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('body')).not.toContainText('Page Not Found');
    await expect(page.locator('body')).not.toContainText('Application error');
  }

  await page.goto('/directory');
  const search = page.getByRole('textbox', { name: 'Search club directory' });
  await search.fill('Clare Pickleball');
  const clareCard = page.locator('article').filter({ hasText: 'Clare Pickleball' }).first();
  await expect(clareCard).toBeVisible();
  await clareCard.getByRole('link', { name: /View club/i }).click();
  await expect(page).toHaveURL(/\/directory\/clare-pickleball$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Clare Pickleball', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/directory\/clare-pickleball$/);
});

test('directory SEO uses canonical rallyhub.ie URLs', async ({ page }) => {
  await page.goto('/directory');
  await expect(page).toHaveTitle(/Pickleball Clubs in Ireland/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://rallyhub.ie/directory');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /club listings/i);

  await page.goto('/directory/clare-pickleball');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://rallyhub.ie/directory/clare-pickleball');
});

test('directory public-list request is deduplicated during search/filter interaction', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();
  const directoryFunctionRequests = [];
  page.on('request', request => {
    if (/directoryListingProfile/i.test(request.url())) directoryFunctionRequests.push(request.url());
  });

  await page.goto('/directory');
  await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible();
  await page.waitForTimeout(1200);
  const initialCount = directoryFunctionRequests.length;

  await page.getByRole('textbox', { name: 'Search club directory' }).fill('Dublin 15');
  await page.getByRole('combobox', { name: 'Filter by county' }).selectOption({ label: 'Dublin' });
  await page.getByRole('combobox', { name: 'Filter by day' }).selectOption({ label: 'Wednesday' });
  await page.getByRole('button', { name: /sessions/i }).click();
  await page.getByRole('button', { name: /map/i }).click();
  await page.waitForTimeout(500);

  expect(initialCount).toBeLessThanOrEqual(1);
  expect(directoryFunctionRequests.length).toBe(initialCount);
  await context.close();
});

test('local Directory remains usable when the Base44 function proxy is unavailable', async ({ page }) => {
  const statuses = [];
  page.on('response', response => {
    if (/directoryListingProfile/i.test(response.url())) statuses.push(response.status());
  });

  await page.goto('/directory');
  await expect(page.getByRole('heading', { name: 'Club directory' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible();

  // Local Vite intentionally does not proxy Base44 function URLs. The public seed must
  // still render rather than leaving a blank page; production load is covered separately.
  if (statuses.includes(404)) {
    await expect(page.getByRole('heading', { name: 'Club directory' })).toBeVisible();
  }
});
