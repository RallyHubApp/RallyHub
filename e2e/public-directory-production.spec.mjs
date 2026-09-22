import { test, expect } from '@playwright/test';

const PROD = 'https://rallyhub.ie';
const enabled = process.env.RALLYHUB_PRODUCTION_TEST === 'YES';
test.skip(!enabled, 'Set RALLYHUB_PRODUCTION_TEST=YES to run controlled tests against live RallyHub.');

test.use({ baseURL: PROD });

test('production public Directory critical journey', async ({ page }) => {
  const pageErrors = [];
  const functionStatuses = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('response', response => {
    if (/directoryListingProfile/i.test(response.url())) functionStatuses.push(response.status());
  });

  const response = await page.goto('/directory', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBeLessThan(400);
  await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('heading', { name: 'Club directory' })).toBeVisible({ timeout: 30_000 });

  const search = page.getByRole('textbox', { name: 'Search club directory' });
  await search.fill('Clare Pickleball');
  const clareCard = page.locator('article').filter({ hasText: 'Clare Pickleball' }).first();
  await expect(clareCard).toBeVisible();
  await page.getByRole('combobox', { name: 'Filter by county' }).selectOption({ label: 'Clare' });
  await expect(clareCard).toBeVisible();

  await search.fill('definitely-no-such-rallyhub-club');
  await expect(page.getByRole('heading', { name: 'No matching clubs yet' })).toBeVisible();
  await search.fill('');
  await page.getByRole('combobox', { name: 'Filter by county' }).selectOption({ label: 'All counties' });

  await page.getByRole('button', { name: /map/i }).click();
  await expect(page.getByRole('heading', { name: 'Club map' })).toBeVisible();
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 20_000 });

  await page.getByRole('button', { name: /clubs/i }).click();
  await search.fill('Clare Pickleball');
  await clareCard.getByRole('link', { name: /View club/i }).click();
  await expect(page).toHaveURL(/\/directory\/clare-pickleball$/);
  await expect(page.getByRole('heading', { name: 'Clare Pickleball', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Clare Pickleball', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/directory\/clare-pickleball$/);

  expect(pageErrors).toEqual([]);
  expect(functionStatuses.some(status => status >= 500 || status === 429)).toBeFalsy();
});

test('production public route and SEO smoke', async ({ page }) => {
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
    '/robots.txt',
    '/directory-sitemap.xml',
  ];

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), route).toBeLessThan(400);
    if (!route.endsWith('.txt') && !route.endsWith('.xml')) {
      await expect(page.locator('body'), route).not.toContainText('Page Not Found');
      await expect(page.locator('body'), route).not.toContainText('Application error');
    }
  }

  await page.goto('/directory');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://rallyhub.ie/directory');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /club listings/i);
});

test('production mobile Directory menu and layout', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: PROD,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto('/directory', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible({ timeout: 30_000 });

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport + 2);

  await page.getByRole('button', { name: 'Menu' }).click();
  const header = page.getByRole('banner');
  for (const label of ['Home', 'Directory', 'Events', 'Club Guide', 'About']) {
    await expect(header.getByRole('link', { name: label, exact: true })).toBeVisible();
  }

  await context.close();
});

test('25 concurrent clean production visitors', async ({ browser }) => {
  test.setTimeout(150_000);
  const visitorCount = 25;
  const started = Date.now();

  const visitors = await Promise.all(Array.from({ length: visitorCount }, async (_, index) => {
    const context = await browser.newContext({
      baseURL: PROD,
      viewport: { width: index % 2 ? 390 : 1366, height: index % 2 ? 844 : 768 },
      hasTouch: index % 2 === 1,
      isMobile: index % 2 === 1,
    });
    const page = await context.newPage();
    const functionStatuses = [];
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('response', response => {
      if (/directoryListingProfile/i.test(response.url())) functionStatuses.push(response.status());
    });

    const t0 = Date.now();
    try {
      const response = await page.goto('/directory', { waitUntil: 'domcontentloaded', timeout: 45_000 });
      if (!response || response.status() >= 400) throw new Error(`HTTP ${response?.status() || 'no response'}`);
      await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible({ timeout: 45_000 });
      await expect(page.getByRole('heading', { name: 'Club directory' })).toBeVisible({ timeout: 45_000 });
      return { ok: true, ms: Date.now() - t0, functionStatuses, pageErrors, context };
    } catch (error) {
      return { ok: false, ms: Date.now() - t0, functionStatuses, pageErrors: [...pageErrors, error.message], context };
    }
  }));

  const results = visitors.map(({ context, ...result }) => result);
  await Promise.all(visitors.map(visitor => visitor.context.close()));

  const failures = results.filter(result => !result.ok);
  const statuses = results.flatMap(result => result.functionStatuses);
  const durations = results.map(result => result.ms).sort((a, b) => a - b);
  const percentile = fraction => durations[Math.min(durations.length - 1, Math.floor((durations.length - 1) * fraction))];
  const statusCounts = statuses.reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  console.log('PRODUCTION_LOAD_RESULT ' + JSON.stringify({
    visitorCount,
    wallMs: Date.now() - started,
    successfulVisitors: results.length - failures.length,
    failedVisitors: failures.length,
    p50Ms: percentile(0.5),
    p95Ms: percentile(0.95),
    maxMs: Math.max(...durations),
    functionStatusCounts: statusCounts,
    functionResponsesObserved: statuses.length,
    pageErrorCount: results.reduce((sum, result) => sum + result.pageErrors.length, 0),
    sampleFailure: failures[0]?.pageErrors?.[0] || null,
  }));

  expect(failures).toHaveLength(0);
  expect(statuses.filter(status => status === 429 || status >= 500)).toHaveLength(0);
  expect(statuses.filter(status => status >= 400 && status < 500)).toHaveLength(0);
  expect(statuses.length).toBeGreaterThanOrEqual(visitorCount);
});
