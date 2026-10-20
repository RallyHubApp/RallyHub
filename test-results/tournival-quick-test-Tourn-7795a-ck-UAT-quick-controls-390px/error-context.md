# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tournival-quick-test.spec.mjs >> Tournival one-click UAT quick controls 390px
- Location: e2e/tournival-quick-test.spec.mjs:3:2

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('tournival-quick-test-centre').getByText('12/12')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('tournival-quick-test-centre').getByText('12/12') with timeout 3000ms
  - waiting for getByTestId('tournival-quick-test-centre').getByText('12/12')

```

```yaml
- heading "Isolated Tournival Rehearsal" [level=3]
- paragraph: All participants and results are synthetic. No live records, payments, communications, DUPR submissions or statistics.
- text: Players
- spinbutton "Rehearsal players": "16"
- text: Courts
- spinbutton "Rehearsal courts": "4"
- text: Rounds
- spinbutton "Rehearsal rounds": "4"
- heading "Tournival UAT · Quick Test Centre" [level=3]
- paragraph: Sandbox dummy players only. No Base44 writes, payments, messages, or DUPR submissions.
- button "1 · Create Test Event"
- button "2 · Run Qualification" [disabled]
- button "3 · Finish Knockout"
- button "Run Full Acceptance"
- strong: "16"
- text: Registered dummy players
- strong: 16/16
- text: Qualification scored
- strong: "0"
- text: Knockout scored
- strong: knockout
- text: Current stage
- heading "Acceptance checks" [level=4]
- paragraph: ✓ Synthetic registration and check-in passed
- paragraph: ✓ Rehearsal isolation verified
- paragraph: "✓ Qualification scored on actual scheduler: 16 matches"
- paragraph: ✓ Individual rankings and 8 seeded pairs calculated
- paragraph: IN PROGRESS · Continue stages
- paragraph: Payments, personal tokens and DUPR submissions require separate controlled integration tests. This rehearsal never sends data externally.
- heading "Personal player-link stages · dummy preview" [level=4]
- text: Choose test player
- combobox "Choose test player":
  - option "Rehearsal Player 1" [selected]
  - option "Rehearsal Player 2"
  - option "Rehearsal Player 3"
  - option "Rehearsal Player 4"
  - option "Rehearsal Player 5"
  - option "Rehearsal Player 6"
  - option "Rehearsal Player 7"
  - option "Rehearsal Player 8"
  - option "Rehearsal Player 9"
  - option "Rehearsal Player 10"
  - option "Rehearsal Player 11"
  - option "Rehearsal Player 12"
  - option "Rehearsal Player 13"
  - option "Rehearsal Player 14"
  - option "Rehearsal Player 15"
  - option "Rehearsal Player 16"
- button "registration"
- button "fixtures"
- button "live"
- button "knockout"
- button "results"
- paragraph: Rehearsal Player 1 · fixtures
- paragraph: 4 qualification match assignments · Round 1, Round 2, Round 3, Round 4
- paragraph: Isolated preview only; not a real personal link or registered account.
- button "Start / Reset Rehearsal"
- paragraph: "Quick test: knockout · synthetic records only"
- paragraph: "Quick test: qualification · synthetic records only"
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | for(const width of [390,1280]){
  3  |  test('Tournival one-click UAT quick controls '+width+'px',async({page})=>{
  4  |   await page.setViewportSize({width,height:844});
  5  |   await page.goto('/e2e/tournivalRehearsalHarness.html');
  6  |   const centre=page.getByTestId('tournival-quick-test-centre');
  7  |   await expect(centre).toBeVisible();
  8  |   await centre.getByRole('button',{name:/1 · Create Test Event/}).click();
  9  |   await expect(centre.getByText('IN PROGRESS', {exact:false})).toBeVisible();
  10 |   await centre.getByRole('button',{name:/2 · Run Qualification/}).click();
> 11 |   await expect(centre.getByText('12/12')).toBeVisible();
     |                                           ^ Error: expect(locator).toBeVisible() failed
  12 |   await centre.getByRole('button',{name:/3 · Finish Knockout/}).click();
  13 |   await expect(centre.getByText('PASS · Simulated sporting journey complete')).toBeVisible();
  14 |   await centre.getByRole('button',{name:'Run Full Acceptance'}).click();
  15 |   await expect(centre.getByText('PASS · Simulated sporting journey complete')).toBeVisible();
  16 |   const preview=page.getByTestId('tournival-quick-player-preview');
  17 |   await preview.getByRole('button',{name:'results'}).click();
  18 |   await expect(preview.getByText(/Final completed/)).toBeVisible();
  19 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  20 |  });
  21 | }
  22 | 
```