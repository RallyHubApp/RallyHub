import { test, expect } from '@playwright/test';

const APP_ID = process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

test.use({ viewport: { width: 390, height: 844 } });

test('club challenge harness diagnostic', async ({ page }) => {
  await page.route('**/api/apps/**', async route => {
    const req = route.request();
    const url = new URL(req.url());
    console.log('CC API', req.method(), url.pathname, req.postData() || '');
    if (/auth|me/i.test(url.pathname)) return json(route, { id:'e2e-admin', email:'admin@example.test', role:'admin', active_tenant_id:'tenant-clare-e2e', active_club_id:'club-clare-e2e' });
    if (url.pathname.includes('/entities/Club')) return json(route, [{ id:'club-clare-e2e', name:'Clare Pickleball Club' }]);
    if (url.pathname.includes('/entities/ClubChallengeEvent')) return json(route, []);
    if (url.pathname.includes('/entities/ClubChallengeParticipant')) return json(route, []);
    if (url.pathname.includes('/entities/ClubChallengeMatch')) return json(route, []);
    if (url.pathname.includes('/entities/ClubChallengeVote')) return json(route, []);
    return json(route, []);
  });
  await page.goto('/e2e/clubChallengeHarness.html');
  await expect(page.getByText('Club Challenge v1.0')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Estimated event duration')).toBeVisible();
});