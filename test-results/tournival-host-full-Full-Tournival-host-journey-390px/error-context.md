# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tournival-host-full.spec.mjs >> Full Tournival host journey 390px
- Location: e2e/tournival-host-full.spec.mjs:3:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 3
Received:   3

Call Log:
- Timeout 7500ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main [ref=e3]:
  - heading "Full Tournival host journey — simulated backend" [level=1] [ref=e4]
  - generic [ref=e5]:
    - generic [ref=e6]:
      - button "Players (16)" [ref=e7] [cursor=pointer]
      - button "Setup" [ref=e13] [cursor=pointer]
      - button "Fixtures" [ref=e16] [cursor=pointer]
      - button "Scores" [ref=e18] [cursor=pointer]
      - button "Standings" [ref=e22] [cursor=pointer]
      - button "Cup" [ref=e24] [cursor=pointer]
      - button "Rehearsal" [ref=e31] [cursor=pointer]
      - button "Live Hall" [ref=e34] [cursor=pointer]
      - button "Print Pack" [ref=e41] [cursor=pointer]
      - button "Check-in" [ref=e43] [cursor=pointer]
      - button "DUPR" [ref=e49] [cursor=pointer]
      - button "Announcements" [ref=e56] [cursor=pointer]
      - button "Schedule" [ref=e59] [cursor=pointer]
      - button "Statistics" [ref=e62] [cursor=pointer]
    - generic [ref=e64]:
      - generic [ref=e65]:
        - heading "Continuous Tournival Court Control" [level=3] [ref=e66]
        - paragraph [ref=e67]: 0/8 qualification matches confirmed · 4 active · 4 waiting · 4 courts
      - generic [ref=e68]:
        - button "Allocate free courts" [ref=e69] [cursor=pointer]
        - button "Pause allocations" [ref=e70] [cursor=pointer]
      - alert [ref=e71]: First-to-11 (win by 1) must finish at 11 with the losing score 10 or lower.
      - generic [ref=e72]:
        - article [ref=e73]:
          - heading "Court 1 · Qualification 1" [level=4] [ref=e74]
          - paragraph [ref=e75]: Simulated Player 1 & Simulated Player 2
          - paragraph [ref=e76]: v
          - paragraph [ref=e77]: Simulated Player 15 & Simulated Player 16
          - generic [ref=e78]:
            - spinbutton "A score qualification:1:1" [ref=e79]: "8"
            - generic [ref=e80]: –
            - spinbutton "B score qualification:1:1" [ref=e81]: "4"
            - button "Save score" [active] [ref=e82] [cursor=pointer]
        - article [ref=e83]:
          - heading "Court 2 · Qualification 1" [level=4] [ref=e84]
          - paragraph [ref=e85]: Simulated Player 3 & Simulated Player 4
          - paragraph [ref=e86]: v
          - paragraph [ref=e87]: Simulated Player 13 & Simulated Player 14
          - generic [ref=e88]:
            - spinbutton "A score qualification:1:2" [ref=e89]
            - generic [ref=e90]: –
            - spinbutton "B score qualification:1:2" [ref=e91]
            - button "Save score" [ref=e92] [cursor=pointer]
        - article [ref=e93]:
          - heading "Court 3 · Qualification 1" [level=4] [ref=e94]
          - paragraph [ref=e95]: Simulated Player 5 & Simulated Player 6
          - paragraph [ref=e96]: v
          - paragraph [ref=e97]: Simulated Player 11 & Simulated Player 12
          - generic [ref=e98]:
            - spinbutton "A score qualification:1:3" [ref=e99]
            - generic [ref=e100]: –
            - spinbutton "B score qualification:1:3" [ref=e101]
            - button "Save score" [ref=e102] [cursor=pointer]
        - article [ref=e103]:
          - heading "Court 4 · Qualification 1" [level=4] [ref=e104]
          - paragraph [ref=e105]: Simulated Player 7 & Simulated Player 8
          - paragraph [ref=e106]: v
          - paragraph [ref=e107]: Simulated Player 9 & Simulated Player 10
          - generic [ref=e108]:
            - spinbutton "A score qualification:1:4" [ref=e109]
            - generic [ref=e110]: –
            - spinbutton "B score qualification:1:4" [ref=e111]
            - button "Save score" [ref=e112] [cursor=pointer]
      - paragraph [ref=e113]: 4 waiting fixtures are allocated as courts and eligible players become free.
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | for(const size of [{width:390,height:844},{width:1280,height:850}])
  3  | test(`Full Tournival host journey ${size.width}px`,async({page})=>{
  4  |  await page.setViewportSize(size);
  5  |  page.on('dialog',dialog=>dialog.accept('Host corrected paper score'));
  6  |  await page.goto('/e2e/tournivalHostHarness.html');
  7  |  await expect(page.getByText('Tournival Setup')).toBeVisible();
  8  |  // Select 2 qualification rounds from the real setup form.
  9  |  await page.getByRole('combobox').filter({hasText:'4 rounds'}).click();
  10 |  await page.getByRole('option',{name:'2 rounds'}).click();
  11 |  const revision=()=>page.getByTestId('server-revision').innerText().then(Number);
> 12 |  const changed=async(before)=>await expect.poll(revision,{timeout:7500}).toBeGreaterThan(before);
     |                                                                          ^ Error: expect(received).toBeGreaterThan(expected)
  13 |  let prior=await revision();
  14 |  await page.getByRole('button',{name:'Confirm seed order',exact:true}).click();
  15 |  await changed(prior);
  16 |  await expect(page.getByText('Generate Fixtures & Start')).toBeEnabled();
  17 |  prior=await revision();
  18 |  await page.getByText('Generate Fixtures & Start').click();
  19 |  await changed(prior);
  20 |  await page.getByRole('button',{name:'Scores',exact:true}).click();
  21 |  await expect(page.getByText('Continuous Tournival Court Control')).toBeVisible();
  22 |  let commits=0;
  23 |  while(commits<8) {
  24 |   const allocate=page.getByRole('button',{name:'Allocate free courts'});
  25 |   if(await allocate.isEnabled()){
  26 |    prior=await revision();await allocate.click();await changed(prior);
  27 |   }
  28 |   const active=page.locator('article').filter({has:page.getByText('Save score')}).first();
  29 |   await expect(active).toBeVisible();
  30 |   await active.getByRole('spinbutton',{name:/A score/}).fill('8');
  31 |   await active.getByRole('spinbutton',{name:/B score/}).fill('4');
  32 |   prior=await revision();
  33 |   await active.getByText('Save score').click();
  34 |   await changed(prior);
  35 |   commits++;
  36 |  }
  37 |  await page.getByRole('button',{name:'Scores',exact:true}).click();
  38 |  await expect(page.getByText(/Qualification complete/)).toBeVisible();
  39 |  await page.getByRole('button',{name:'Standings'}).click();
  40 |  await expect(page.getByRole('button',{name:/Create Cup|Create Knockout|Generate Cup|Cup Matches/i}).first()).toBeVisible();
  41 |  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  42 |  expect(overflow).toBeLessThanOrEqual(1);
  43 | });
  44 | 
```