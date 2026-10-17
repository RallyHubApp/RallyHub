# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tournival-host-full.spec.mjs >> Full Tournival host journey 390px
- Location: e2e/tournival-host-full.spec.mjs:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Qualification complete/)
Expected: visible
Timeout: 6000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/Qualification complete/) with timeout 6000ms
  - waiting for getByText(/Qualification complete/)

```

```yaml
- main:
  - heading "Full Tournival host journey — simulated backend" [level=1]
  - button "Players (16)":
    - img
    - text: Players (16)
  - button "Setup":
    - img
    - text: Setup
  - button "Fixtures":
    - img
    - text: Fixtures
  - button "Scores":
    - img
    - text: Scores
  - button "Standings":
    - img
    - text: Standings
  - button "Cup":
    - img
    - text: Cup
  - button "Rehearsal":
    - img
    - text: Rehearsal
  - button "Live Hall":
    - img
    - text: Live Hall
  - button "Print Pack":
    - img
    - text: Print Pack
  - button "Check-in":
    - img
    - text: Check-in
  - button "DUPR":
    - img
    - text: DUPR
  - button "Announcements":
    - img
    - text: Announcements
  - button "Schedule":
    - img
    - text: Schedule
  - button "Statistics":
    - img
    - text: Statistics
  - heading "Continuous Tournival Court Control" [level=3]
  - paragraph: 0/16 qualification matches confirmed · 4 active · 12 waiting · 4 courts
  - button "Allocate free courts"
  - button "Pause allocations"
  - alert: First-to-11 (win by 1) must finish at 11 with the losing score 10 or lower.
  - article:
    - heading "Court 1 · Qualification 1" [level=4]
    - paragraph: Simulated Player 1 & Simulated Player 2
    - paragraph: v
    - paragraph: Simulated Player 15 & Simulated Player 16
    - spinbutton "A score qualification:1:1": "8"
    - text: –
    - spinbutton "B score qualification:1:1": "4"
    - button "Save score"
  - article:
    - heading "Court 2 · Qualification 1" [level=4]
    - paragraph: Simulated Player 3 & Simulated Player 4
    - paragraph: v
    - paragraph: Simulated Player 13 & Simulated Player 14
    - spinbutton "A score qualification:1:2"
    - text: –
    - spinbutton "B score qualification:1:2"
    - button "Save score"
  - article:
    - heading "Court 3 · Qualification 1" [level=4]
    - paragraph: Simulated Player 5 & Simulated Player 6
    - paragraph: v
    - paragraph: Simulated Player 11 & Simulated Player 12
    - spinbutton "A score qualification:1:3"
    - text: –
    - spinbutton "B score qualification:1:3"
    - button "Save score"
  - article:
    - heading "Court 4 · Qualification 1" [level=4]
    - paragraph: Simulated Player 7 & Simulated Player 8
    - paragraph: v
    - paragraph: Simulated Player 9 & Simulated Player 10
    - spinbutton "A score qualification:1:4"
    - text: –
    - spinbutton "B score qualification:1:4"
    - button "Save score"
  - paragraph: 12 waiting fixtures are allocated as courts and eligible players become free.
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | for(const size of [{width:390,height:844},{width:1280,height:850}])
  3  | test(`Full Tournival host journey ${size.width}px`,async({page})=>{
  4  |  await page.setViewportSize(size);
  5  |  page.on('dialog',dialog=>dialog.accept('Host corrected paper score'));
  6  |  page.on('pageerror',e=>console.log('PAGE ERROR:',e.message));
  7  |  page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE ERROR:',m.text())});
  8  |  await page.goto('/e2e/tournivalHostHarness.html');
  9  |  console.log('BODY:',(await page.locator('body').innerText()).slice(0,350));
  10 |  await expect(page.getByText('Tournival Setup')).toBeVisible();
  11 |  await page.getByRole('button',{name:'Confirm seed order',exact:true}).click();
  12 |  await expect(page.getByText('Generate Fixtures & Start')).toBeEnabled();
  13 |  await page.getByText('Generate Fixtures & Start').click();
  14 |  await page.getByRole('button',{name:'Scores',exact:true}).click();
  15 |  await expect(page.getByText('Continuous Tournival Court Control')).toBeVisible();
  16 |  const allocate=page.getByRole('button',{name:'Allocate free courts'});
  17 |  for(let i=0;i<8;i++){
  18 |   if(await allocate.isEnabled())await allocate.click();
  19 |   const active=page.locator('article').filter({has:page.getByText('Save score')}).first();
  20 |   await expect(active).toBeVisible();
  21 |   await active.getByRole('spinbutton',{name:/A score/}).fill('8');
  22 |   await active.getByRole('spinbutton',{name:/B score/}).fill('4');
  23 |   await active.getByText('Save score').click();
  24 |  }
> 25 |  await expect(page.getByText(/Qualification complete/)).toBeVisible();
     |                                                         ^ Error: expect(locator).toBeVisible() failed
  26 |  await page.getByRole('button',{name:'Standings'}).click();
  27 |  await expect(page.getByRole('button',{name:/Create Cup|Create Knockout|Generate Cup|Cup Matches/i}).first()).toBeVisible();
  28 |  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  29 |  expect(overflow).toBeLessThanOrEqual(1);
  30 | });
  31 | 
```