# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-directory-prelaunch.spec.mjs >> 25 clean-browser visitors can open the Directory concurrently
- Location: e2e/public-directory-prelaunch.spec.mjs:145:1

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 0
Received length: 12
Received array:  [{"errors": ["expect(locator).toBeVisible() failed·
Locator:  getByText(/club listings/i).first()
Expected: visible
Received: hidden
Timeout:  45000ms·
Call log:
  - Expect \"toBeVisible\" getByText(/club listings/i).first() with timeout 45000ms
  - waiting for getByText(/club listings/i).first()
    77 × locator resolved to <span data-dynamic-content=\"false\" class=\"text-[11px] text-[#67748a]\" data-source-location=\"src/pages/PublicDirectory.jsx:318:136\">club listings</span>
       - unexpected value \"hidden\"
"], "functionStatuses": [404], "ms": 95432, "ok": false}, {"errors": ["expect(locator).toBeVisible() failed·
Locator:  getByText(/club listings/i).first()
Expected: visible
Received: hidden
Timeout:  45000ms·
Call log:
  - Expect \"toBeVisible\" getByText(/club listings/i).first() with timeout 45000ms
  - waiting for getByText(/club listings/i).first()
    77 × locator resolved to <span data-dynamic-content=\"false\" class=\"text-[11px] text-[#67748a]\" data-source-location=\"src/pages/PublicDirectory.jsx:318:136\">club listings</span>
       - unexpected value \"hidden\"
"], "functionStatuses": [404], "ms": 95418, "ok": false}, {"errors": ["expect(locator).toBeVisible() failed·
Locator:  getByText(/club listings/i).first()
Expected: visible
Received: hidden
Timeout:  45000ms·
Call log:
  - Expect \"toBeVisible\" getByText(/club listings/i).first() with timeout 45000ms
  - waiting for getByText(/club listings/i).first()
    78 × locator resolved to <span data-dynamic-content=\"false\" class=\"text-[11px] text-[#67748a]\" data-source-location=\"src/pages/PublicDirectory.jsx:318:136\">club listings</span>
       - unexpected value \"hidden\"
"], "functionStatuses": [404], "ms": 95420, "ok": false}, {"errors": ["expect(locator).toBeVisible() failed·
Locator:  getByText(/club listings/i).first()
Expected: visible
Received: hidden
Timeout:  45000ms·
Call log:
  - Expect \"toBeVisible\" getByText(/club listings/i).first() with timeout 45000ms
  - waiting for getByText(/club listings/i).first()
    78 × locator resolved to <span data-dynamic-content=\"false\" class=\"text-[11px] text-[#67748a]\" data-source-location=\"src/pages/PublicDirectory.jsx:318:136\">club listings</span>
       - unexpected value \"hidden\"
"], "functionStatuses": [404], "ms": 95754, "ok": false}, {"errors": ["expect(locator).toBeVisible() failed·
Locator:  getByText(/club listings/i).first()
Expected: visible
Received: hidden
Timeout:  45000ms·
Call log:
  - Expect \"toBeVisible\" getByText(/club listings/i).first() with timeout 45000ms
  - waiting for getByText(/club listings/i).first()
    78 × locator resolved to <span data-dynamic-content=\"false\" class=\"text-[11px] text-[#67748a]\" data-source-location=\"src/pages/PublicDirectory.jsx:318:136\">club listings</span>
       - unexpected value \"hidden\"
"], "functionStatuses": [404], "ms": 95551, "ok": false}, {"errors": ["expect(locator).toBeVisible() failed·
Locator:  getByText(/club listings/i).first()
Expected: visible
Received: hidden
Timeout:  45000ms·
Call log:
  - Expect \"toBeVisible\" getByText(/club listings/i).first() with timeout 45000ms
  - waiting for getByText(/club listings/i).first()
    78 × locator resolved to <span data-dynamic-content=\"false\" class=\"text-[11px] text-[#67748a]\" data-source-location=\"src/pages/PublicDirectory.jsx:318:136\">club listings</span>
       - unexpected value \"hidden\"
"], "functionStatuses": [404], "ms": 95696, "ok": false}, {"errors": ["expect(locator).toBeVisible() failed·
Locator:  getByText(/club listings/i).first()
Expected: visible
Received: hidden
Timeout:  45000ms·
Call log:
  - Expect \"toBeVisible\" getByText(/club listings/i).first() with timeout 45000ms
  - waiting for getByText(/club listings/i).first()
    77 × locator resolved to <span data-dynamic-content=\"false\" class=\"text-[11px] text-[#67748a]\" data-source-location=\"src/pages/PublicDirectory.jsx:318:136\">club listings</span>
       - unexpected value \"hidden\"
"], "functionStatuses": [404], "ms": 95255, "ok": false}, {"errors": ["expect(locator).toBeVisible() failed·
Locator:  getByText(/club listings/i).first()
Expected: visible
Received: hidden
Timeout:  45000ms·
Call log:
  - Expect \"toBeVisible\" getByText(/club listings/i).first() with timeout 45000ms
  - waiting for getByText(/club listings/i).first()
    77 × locator resolved to <span data-dynamic-content=\"false\" class=\"text-[11px] text-[#67748a]\" data-source-location=\"src/pages/PublicDirectory.jsx:318:136\">club listings</span>
       - unexpected value \"hidden\"
"], "functionStatuses": [404], "ms": 95306, "ok": false}, {"errors": ["expect(locator).toBeVisible() failed·
Locator:  getByText(/club listings/i).first()
Expected: visible
Received: hidden
Timeout:  45000ms·
Call log:
  - Expect \"toBeVisible\" getByText(/club listings/i).first() with timeout 45000ms
  - waiting for getByText(/club listings/i).first()
    77 × locator resolved to <span data-dynamic-content=\"false\" class=\"text-[11px] text-[#67748a]\" data-source-location=\"src/pages/PublicDirectory.jsx:318:136\">club listings</span>
       - unexpected value \"hidden\"
"], "functionStatuses": [404], "ms": 95589, "ok": false}, {"errors": ["expect(locator).toBeVisible() failed·
Locator:  getByText(/club listings/i).first()
Expected: visible
Received: hidden
Timeout:  45000ms·
Call log:
  - Expect \"toBeVisible\" getByText(/club listings/i).first() with timeout 45000ms
  - waiting for getByText(/club listings/i).first()
    77 × locator resolved to <span data-dynamic-content=\"false\" class=\"text-[11px] text-[#67748a]\" data-source-location=\"src/pages/PublicDirectory.jsx:318:136\">club listings</span>
       - unexpected value \"hidden\"
"], "functionStatuses": [404], "ms": 95254, "ok": false}, …]
```

# Test source

```ts
  96  |   const search = page.getByRole('textbox', { name: 'Search club directory' });
  97  |   await search.fill('Clare Pickleball');
  98  |   const clareCard = page.locator('article').filter({ hasText: 'Clare Pickleball' }).first();
  99  |   await expect(clareCard).toBeVisible();
  100 |   await clareCard.getByRole('link', { name: /View club/i }).click();
  101 |   await expect(page).toHaveURL(/\/directory\/clare-pickleball$/);
  102 |   await page.reload();
  103 |   await expect(page.getByRole('heading', { name: 'Clare Pickleball', exact: true })).toBeVisible();
  104 |   await page.goBack();
  105 |   await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible();
  106 |   await page.goForward();
  107 |   await expect(page).toHaveURL(/\/directory\/clare-pickleball$/);
  108 | });
  109 | 
  110 | test('directory SEO uses canonical rallyhub.ie URLs', async ({ page }) => {
  111 |   await page.goto('/directory');
  112 |   await expect(page).toHaveTitle(/Pickleball Clubs in Ireland/i);
  113 |   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://rallyhub.ie/directory');
  114 |   await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /club listings/i);
  115 | 
  116 |   await page.goto('/directory/clare-pickleball');
  117 |   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://rallyhub.ie/directory/clare-pickleball');
  118 | });
  119 | 
  120 | test('directory public-list request is deduplicated during search/filter interaction', async ({ browser }) => {
  121 |   const context = await browser.newContext({ baseURL: BASE_URL });
  122 |   const page = await context.newPage();
  123 |   const directoryFunctionRequests = [];
  124 |   page.on('request', request => {
  125 |     if (/directoryListingProfile/i.test(request.url())) directoryFunctionRequests.push(request.url());
  126 |   });
  127 | 
  128 |   await page.goto('/directory');
  129 |   await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible();
  130 |   await page.waitForTimeout(1200);
  131 |   const initialCount = directoryFunctionRequests.length;
  132 | 
  133 |   await page.getByRole('textbox', { name: 'Search club directory' }).fill('Dublin 15');
  134 |   await page.getByRole('combobox', { name: 'Filter by county' }).selectOption({ label: 'Dublin' });
  135 |   await page.getByRole('combobox', { name: 'Filter by day' }).selectOption({ label: 'Wednesday' });
  136 |   await page.getByRole('button', { name: /sessions/i }).click();
  137 |   await page.getByRole('button', { name: /map/i }).click();
  138 |   await page.waitForTimeout(500);
  139 | 
  140 |   expect(initialCount).toBeLessThanOrEqual(1);
  141 |   expect(directoryFunctionRequests.length).toBe(initialCount);
  142 |   await context.close();
  143 | });
  144 | 
  145 | test('25 clean-browser visitors can open the Directory concurrently', async ({ browser }) => {
  146 |   test.setTimeout(120_000);
  147 |   const visitorCount = 25;
  148 |   const started = Date.now();
  149 | 
  150 |   const visitors = await Promise.all(Array.from({ length: visitorCount }, async (_, index) => {
  151 |     const context = await browser.newContext({
  152 |       baseURL: BASE_URL,
  153 |       viewport: { width: index % 2 ? 390 : 1366, height: index % 2 ? 844 : 768 },
  154 |       hasTouch: index % 2 === 1,
  155 |       isMobile: index % 2 === 1,
  156 |     });
  157 |     const page = await context.newPage();
  158 |     const functionStatuses = [];
  159 |     const errors = [];
  160 |     page.on('pageerror', error => errors.push(error.message));
  161 |     page.on('response', response => {
  162 |       if (/directoryListingProfile/i.test(response.url())) functionStatuses.push(response.status());
  163 |     });
  164 | 
  165 |     const t0 = Date.now();
  166 |     try {
  167 |       await page.goto('/directory', { waitUntil: 'domcontentloaded' });
  168 |       await expect(page.getByRole('textbox', { name: 'Search club directory' })).toBeVisible({ timeout: 45_000 });
  169 |       await expect(page.getByText(/club listings/i).first()).toBeVisible({ timeout: 45_000 });
  170 |       return { ok: true, ms: Date.now() - t0, functionStatuses, errors, context };
  171 |     } catch (error) {
  172 |       return { ok: false, ms: Date.now() - t0, functionStatuses, errors: [...errors, error.message], context };
  173 |     }
  174 |   }));
  175 | 
  176 |   const results = visitors.map(({ context, ...result }) => result);
  177 |   await Promise.all(visitors.map(visitor => visitor.context.close()));
  178 | 
  179 |   const failures = results.filter(result => !result.ok);
  180 |   const statuses = results.flatMap(result => result.functionStatuses);
  181 |   const durations = results.map(result => result.ms).sort((a, b) => a - b);
  182 |   const percentile = p => durations[Math.min(durations.length - 1, Math.floor((durations.length - 1) * p))];
  183 | 
  184 |   console.log(JSON.stringify({
  185 |     visitorCount,
  186 |     wallMs: Date.now() - started,
  187 |     successfulVisitors: results.length - failures.length,
  188 |     failedVisitors: failures.length,
  189 |     p50Ms: percentile(0.5),
  190 |     p95Ms: percentile(0.95),
  191 |     maxMs: Math.max(...durations),
  192 |     functionStatusCounts: statuses.reduce((acc, status) => ({ ...acc, [status]: (acc[status] || 0) + 1 }), {}),
  193 |     sampleFailure: failures[0]?.errors?.[0] || null,
  194 |   }));
  195 | 
> 196 |   expect(failures).toHaveLength(0);
      |                    ^ Error: expect(received).toHaveLength(expected)
  197 |   expect(statuses.filter(status => status === 429 || status >= 500)).toHaveLength(0);
  198 | });
  199 | 
```