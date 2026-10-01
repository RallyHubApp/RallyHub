# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-public-live-desktop.spec.mjs >> desktop public KOTC: live session and round history are clear without overflow
- Location: e2e/kotc-public-live-desktop.spec.mjs:25:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('King of the Court · Final Results')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('King of the Court · Final Results') with timeout 3000ms
  - waiting for getByText('King of the Court · Final Results')

```

```yaml
- main:
  - button "Current appearance Auto. Change appearance.":
    - img
    - text: Auto
  - button "Live Event View":
    - img
    - text: Live Event View
  - img "RallyHub"
  - text: RallyHub King of the Court
  - paragraph: Event Summary
  - img
  - heading "E2E Live KOTC" [level=1]
  - paragraph: Final Results
  - text: Round 2 COMPLETED 2 rounds completed
  - paragraph: Final podium and completed round results. Full individual rankings are not published here.
  - img
  - paragraph: Final Podium
  - list "Final podium":
    - 'listitem "1st place: Player 01"':
      - text: 🥇
      - paragraph: 1st
      - paragraph: Player 01
      - paragraph: 3W · 0L · +14
    - 'listitem "2nd place: Guest One"':
      - text: 🥈
      - paragraph: 2nd
      - paragraph: Guest One
      - paragraph: 3W · 0L · +10
    - 'listitem "3rd place: Player 03"':
      - text: 🥉
      - paragraph: 3rd
      - paragraph: Player 03
      - paragraph: 2W · 1L · +6
  - heading "Round Results" [level=2]
  - paragraph: Choose a completed round to see every court result.
  - text: Round 2
  - button "Round 1"
  - button "Round 2"
  - paragraph: Court 1
  - text: Player 01 & Player 05
  - strong: "11"
  - text: vs Player 03 & Player 07
  - strong: "8"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const APP_ID = process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
  4  | const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  5  | 
  6  | function makeState(phase){
  7  |   const standings=[
  8  |     {id:'p1',rank:1,name:'Player 01',wins:3,losses:0,differential:14},
  9  |     {id:'p2',rank:2,name:'Guest One',wins:3,losses:0,differential:10},
  10 |     {id:'p3',rank:3,name:'Player 03',wins:2,losses:1,differential:6},
  11 |   ];
  12 |   const history=[
  13 |     {round_number:1,court:1,team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:7},
  14 |     {round_number:1,court:2,team_a:['Player 05','Player 06'],team_b:['Player 07','Player 08'],team_a_score:9,team_b_score:11},
  15 |     {round_number:2,court:1,team_a:['Player 01','Player 05'],team_b:['Player 03','Player 07'],team_a_score:11,team_b_score:8},
  16 |   ];
  17 |   const common={completed_rounds:phase==='finished'?2:0,bench:['Player 17','Guest One'],matches:phase==='finished'?history:[],standings,timer:{remainingSeconds:420,running:phase==='live',deadlineAt:phase==='live'?new Date(Date.now()+420000).toISOString():null}};
  18 |   if(phase==='ready')return {...common,session:{name:'E2E Live KOTC',status:'ready',current_round_number:1,scoring_mode:'timed'},current_round:{round_number:1,status:'proposed'},current_matches:[{round_number:1,court:1,status:'scheduled',team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04']}],podium:[]};
  19 |   if(phase==='live')return {...common,session:{name:'E2E Live KOTC',status:'in_progress',current_round_number:1,scoring_mode:'timed'},current_round:{round_number:1,status:'started'},current_matches:[{round_number:1,court:1,status:'completed',team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:7},{round_number:1,court:2,status:'in_progress',team_a:['Player 05','Player 06'],team_b:['Player 07','Player 08'],team_a_score:8,team_b_score:8}],podium:[]};
  20 |   return {...common,session:{name:'E2E Live KOTC',status:'completed',current_round_number:2,scoring_mode:'timed'},current_round:{round_number:2,status:'completed'},current_matches:[{round_number:2,court:1,status:'completed',team_a:['Player 01','Player 05'],team_b:['Player 03','Player 07'],team_a_score:11,team_b_score:8}],podium:standings.slice(0,3)};
  21 | }
  22 | 
  23 | test.use({viewport:{width:1440,height:900}});
  24 | 
  25 | test('desktop public KOTC: live session and round history are clear without overflow',async({page})=>{
  26 |   let phase='ready';
  27 |   await page.route('**/api/apps/**',async route=>{
  28 |     const path=new URL(route.request().url()).pathname;
  29 |     const marker=`/api/apps/${APP_ID}/functions/`;
  30 |     const idx=path.indexOf(marker);
  31 |     if(idx>=0){const name=decodeURIComponent(path.slice(idx+marker.length).split('/')[0]);if(name==='kotcResultsShare')return json(route,makeState(phase));}
  32 |     return json(route,[]);
  33 |   });
  34 | 
  35 |   await page.goto('/e2e/kotcLiveHarness.html');
  36 |   await expect(page.getByText('Round Ready · Round 1')).toBeVisible();
  37 |   phase='live';await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  38 |   await expect(page.getByText('On Court Now · Round 1')).toBeVisible({timeout:1800});
  39 |   await expect(page.getByText('Live Standings')).toBeVisible();
  40 |   let layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth}));
  41 |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  42 | 
  43 |   phase='finished';await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  44 |   await expect(page.getByTestId('public-kotc-podium')).toBeVisible({timeout:1800});
> 45 |   await expect(page.getByText('King of the Court · Final Results')).toBeVisible();
     |                                                                     ^ Error: expect(locator).toBeVisible() failed
  46 |   await expect(page.getByTestId('public-kotc-round-history')).toBeVisible();
  47 |   await expect(page.getByTestId('public-kotc-round-history')).toContainText('Round 2');
  48 |   await page.getByTestId('public-kotc-round-history').getByRole('button',{name:'Round 1'}).click();
  49 |   await expect(page.getByTestId('public-kotc-round-history')).toContainText('Player 05');
  50 |   await expect(page.getByTestId('public-kotc-round-history')).toContainText('11');
  51 |   layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth}));
  52 |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  53 |   await expect(page.getByText(/Emergency contact|Member mobile/i)).toHaveCount(0);
  54 | });
  55 | 
```