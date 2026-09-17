# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: appearance-regression.spec.mjs >> Add Club form uses stronger Hall inputs rather than falling back to the old dark-only styling
- Location: e2e/appearance-regression.spec.mjs:128:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input').first()
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('input').first() with timeout 3000ms
  - waiting for locator('input').first()

```

```yaml
- banner:
  - link "RallyHub RallyHub":
    - /url: /
    - img "RallyHub"
    - text: RallyHub
  - navigation:
    - link "Club Directory":
      - /url: /directory
    - link "Manage listing":
      - /url: /directory?manage=1
      - img
      - text: Manage listing
    - link "Add club":
      - /url: /directory/add
      - img
      - text: Add club
  - button "Current appearance Hall. Change appearance.":
    - img
  - link "Directory Login":
    - /url: /login?mode=directory&returnTo=%2Fdirectory%2Fadd
    - button "Directory Login"
  - link "RallyHub Club Login":
    - /url: /login?returnTo=%2Fapp
    - button "RallyHub Club Login"
- main:
  - link "Back to club directory":
    - /url: /directory
    - img
    - text: Back to club directory
  - img
  - paragraph: RallyHub Directory
  - heading "Add your club" [level=1]
  - paragraph: Can't find your club in the directory? Send us the basic details and RallyHub will review the listing before it is added.
  - text: Checking your sign-in…
  - complementary:
    - img
    - heading "Directory only" [level=2]
    - paragraph: Adding a club here creates a request for a public directory listing. It does not create a RallyHub tenant, RallyHub Club or player account.
    - img
    - heading "Already listed?" [level=2]
    - paragraph:
      - text: If you find your club in the directory, open the existing profile and choose
      - strong: Claim this listing
      - text: instead.
    - link "Find and claim your club":
      - /url: /directory?manage=1
```

# Test source

```ts
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
  122 |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'hall');
  123 |   await expect(page.getByRole('button', { name: /Current appearance Hall/i })).toBeVisible();
  124 |   const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  125 |   expect(overflow).toBeLessThanOrEqual(1);
  126 | });
  127 | 
  128 | test('Add Club form uses stronger Hall inputs rather than falling back to the old dark-only styling', async ({ page }) => {
  129 |   await page.goto('/directory/add');
  130 |   const quick = page.getByRole('button', { name: /Current appearance .* Change appearance/i });
  131 |   while ((await page.locator('html').getAttribute('data-theme')) !== 'hall') await quick.click();
  132 |   const firstInput = page.locator('input').first();
> 133 |   await expect(firstInput).toBeVisible();
      |                            ^ Error: expect(locator).toBeVisible() failed
  134 |   const border = await firstInput.evaluate(el => parseFloat(getComputedStyle(el).borderTopWidth));
  135 |   expect(border).toBeGreaterThanOrEqual(2);
  136 | });
  137 | 
```