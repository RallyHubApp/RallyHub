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

Expected: > 4
Received:   4

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
        - paragraph [ref=e67]: 1/8 qualification matches confirmed · 3 active · 4 waiting · 4 courts
      - generic [ref=e68]:
        - button "Allocate free courts" [active] [ref=e69] [cursor=pointer]
        - button "Pause allocations" [ref=e70] [cursor=pointer]
      - alert [ref=e71]: No eligible match can be assigned. Check holds, rest and player availability.
      - generic [ref=e72]:
        - article [ref=e73]:
          - heading "Court 2 · Qualification 1" [level=4] [ref=e74]
          - paragraph [ref=e75]: Simulated Player 3 & Simulated Player 4
          - paragraph [ref=e76]: v
          - paragraph [ref=e77]: Simulated Player 13 & Simulated Player 14
          - generic [ref=e78]:
            - spinbutton "A score qualification:1:2" [ref=e79]
            - generic [ref=e80]: –
            - spinbutton "B score qualification:1:2" [ref=e81]
            - button "Save score" [ref=e82] [cursor=pointer]
        - article [ref=e83]:
          - heading "Court 3 · Qualification 1" [level=4] [ref=e84]
          - paragraph [ref=e85]: Simulated Player 5 & Simulated Player 6
          - paragraph [ref=e86]: v
          - paragraph [ref=e87]: Simulated Player 11 & Simulated Player 12
          - generic [ref=e88]:
            - spinbutton "A score qualification:1:3" [ref=e89]
            - generic [ref=e90]: –
            - spinbutton "B score qualification:1:3" [ref=e91]
            - button "Save score" [ref=e92] [cursor=pointer]
        - article [ref=e93]:
          - heading "Court 4 · Qualification 1" [level=4] [ref=e94]
          - paragraph [ref=e95]: Simulated Player 7 & Simulated Player 8
          - paragraph [ref=e96]: v
          - paragraph [ref=e97]: Simulated Player 9 & Simulated Player 10
          - generic [ref=e98]:
            - spinbutton "A score qualification:1:4" [ref=e99]
            - generic [ref=e100]: –
            - spinbutton "B score qualification:1:4" [ref=e101]
            - button "Save score" [ref=e102] [cursor=pointer]
      - paragraph [ref=e103]: 4 waiting fixtures are allocated as courts and eligible players become free.
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
  11 |  await page.getByText('10-min timed').click();
  12 |  const revision=()=>page.getByTestId('server-revision').innerText().then(Number);
> 13 |  const changed=async(before)=>await expect.poll(revision,{timeout:7500}).toBeGreaterThan(before);
     |                                                                          ^ Error: expect(received).toBeGreaterThan(expected)
  14 |  let prior=await revision();
  15 |  await page.getByRole('button',{name:'Confirm seed order',exact:true}).click();
  16 |  await changed(prior);
  17 |  await expect(page.getByText('Generate Fixtures & Start')).toBeEnabled();
  18 |  prior=await revision();
  19 |  await page.getByText('Generate Fixtures & Start').click();
  20 |  await changed(prior);
  21 |  await page.getByRole('button',{name:'Scores',exact:true}).click();
  22 |  await expect(page.getByText('Continuous Tournival Court Control')).toBeVisible();
  23 |  let commits=0;
  24 |  while(commits<8) {
  25 |   const allocate=page.getByRole('button',{name:'Allocate free courts'});
  26 |   if(await allocate.isEnabled()){
  27 |    prior=await revision();await allocate.click();await changed(prior);
  28 |   }
  29 |   const active=page.locator('article').filter({has:page.getByText('Save score')}).first();
  30 |   await expect(active).toBeVisible();
  31 |   await active.getByRole('spinbutton',{name:/A score/}).fill('8');
  32 |   await active.getByRole('spinbutton',{name:/B score/}).fill('4');
  33 |   prior=await revision();
  34 |   await active.getByText('Save score').click();
  35 |   await changed(prior);
  36 |   commits++;
  37 |  }
  38 |  await page.getByRole('button',{name:'Scores',exact:true}).click();
  39 |  await expect(page.getByText(/Qualification complete/)).toBeVisible();
  40 |  await page.getByRole('button',{name:'Standings'}).click();
  41 |  await expect(page.getByRole('button',{name:/Create Cup|Create Knockout|Generate Cup|Cup Matches/i}).first()).toBeVisible();
  42 |  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  43 |  expect(overflow).toBeLessThanOrEqual(1);
  44 | });
  45 | 
```