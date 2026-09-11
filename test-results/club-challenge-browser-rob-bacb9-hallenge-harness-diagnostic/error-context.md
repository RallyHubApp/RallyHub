# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-challenge-browser-robot.spec.mjs >> club challenge harness diagnostic
- Location: e2e/club-challenge-browser-robot.spec.mjs:8:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Club Challenge v1.0')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Club Challenge v1.0') with timeout 5000ms
  - waiting for getByText('Club Challenge v1.0')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const APP_ID = process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
  4  | const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  5  | 
  6  | test.use({ viewport: { width: 390, height: 844 } });
  7  | 
  8  | test('club challenge harness diagnostic', async ({ page }) => {
  9  |   await page.route('**/api/apps/**', async route => {
  10 |     const req = route.request();
  11 |     const url = new URL(req.url());
  12 |     console.log('CC API', req.method(), url.pathname, req.postData() || '');
  13 |     if (/auth|me/i.test(url.pathname)) return json(route, { id:'e2e-admin', email:'admin@example.test', role:'admin', active_tenant_id:'tenant-clare-e2e', active_club_id:'club-clare-e2e' });
  14 |     if (url.pathname.includes('/entities/Club')) return json(route, [{ id:'club-clare-e2e', name:'Clare Pickleball Club' }]);
  15 |     if (url.pathname.includes('/entities/ClubChallengeEvent')) return json(route, []);
  16 |     if (url.pathname.includes('/entities/ClubChallengeParticipant')) return json(route, []);
  17 |     if (url.pathname.includes('/entities/ClubChallengeMatch')) return json(route, []);
  18 |     if (url.pathname.includes('/entities/ClubChallengeVote')) return json(route, []);
  19 |     return json(route, []);
  20 |   });
  21 |   await page.goto('/e2e/clubChallengeHarness.html');
> 22 |   await expect(page.getByText('Club Challenge v1.0')).toBeVisible({ timeout: 5000 });
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  23 |   await expect(page.getByText('Estimated event duration')).toBeVisible();
  24 | });
```