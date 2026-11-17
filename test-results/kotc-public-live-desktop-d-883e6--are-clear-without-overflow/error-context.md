# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-public-live-desktop.spec.mjs >> desktop public KOTC: live session and round history are clear without overflow
- Location: e2e/kotc-public-live-desktop.spec.mjs:25:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Leaderboard', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e6]:
      - heading "King of the Court" [level=1] [ref=e7]
      - paragraph [ref=e8]: E2E Live KOTC · Round 1
  - navigation "Player session navigation" [ref=e13]:
    - generic [ref=e14]:
      - button "My KOTC" [ref=e15] [cursor=pointer]
      - button "Live" [ref=e19] [cursor=pointer]
      - button "Players" [ref=e22] [cursor=pointer]
      - button "Rounds" [ref=e28] [cursor=pointer]
      - button "Event Info" [ref=e31] [cursor=pointer]
      - button "Help & Guide" [ref=e34] [cursor=pointer]
  - generic [ref=e38]:
    - generic [ref=e39]: Player View
    - generic [ref=e44]:
      - button "Auto" [pressed] [ref=e45] [cursor=pointer]
      - button "Light" [ref=e57] [cursor=pointer]
      - button "Hall" [ref=e64] [cursor=pointer]
      - button "Dark" [ref=e68] [cursor=pointer]
  - main [ref=e71]:
    - generic [ref=e72]:
      - generic [ref=e73]:
        - generic [ref=e74]:
          - generic [ref=e75]: Player view
          - generic [ref=e76]: Round 1
          - generic [ref=e77]: STARTED
          - generic [ref=e78]: 06:52
        - paragraph [ref=e79]: Live session · Follow your courts and scores
      - generic [ref=e80]:
        - generic [ref=e81]:
          - heading "On Court Now · Round 1" [level=2] [ref=e82]
          - generic [ref=e83]: STARTED
        - generic [ref=e84]:
          - paragraph [ref=e85]: Bench This Round
          - paragraph [ref=e86]: Player 17 · Guest One
        - generic [ref=e87]:
          - generic [ref=e88]:
            - generic [ref=e89]:
              - paragraph [ref=e93]: Court 1
              - generic [ref=e94]: SAVED
            - generic [ref=e95]:
              - generic [ref=e96]: Player 01 & Player 02
              - strong [ref=e97]: "11"
            - generic [ref=e98]: vs
            - generic [ref=e99]:
              - generic [ref=e100]: Player 03 & Player 04
              - strong [ref=e101]: "7"
          - generic [ref=e102]:
            - generic [ref=e103]:
              - paragraph [ref=e105]: Court 2
              - generic [ref=e106]: LIVE
            - generic [ref=e107]:
              - generic [ref=e108]: Player 05 & Player 06
              - strong [ref=e109]: "8"
            - generic [ref=e110]: vs
            - generic [ref=e111]:
              - generic [ref=e112]: Player 07 & Player 08
              - strong [ref=e113]: "8"
  - contentinfo [ref=e114]:
    - link "Powered by RallyHub" [ref=e115] [cursor=pointer]:
      - /url: https://rallyhub.ie/
      - generic [ref=e116]: Powered by
      - img "RallyHub" [ref=e117]
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
> 39 |   await page.getByRole('button',{name:'Leaderboard',exact:true}).click();
     |                                                                  ^ Error: locator.click: Test timeout of 45000ms exceeded.
  40 |   await expect(page.getByText('Live Standings')).toBeVisible();
  41 |   let layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth}));
  42 |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  43 | 
  44 |   await page.getByRole('button',{name:'Live',exact:true}).click();
  45 |   phase='finished';await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  46 |   await expect(page.getByTestId('public-kotc-podium')).toBeVisible({timeout:1800});
  47 |   await expect(page.getByText('King of the Court',{exact:true})).toBeVisible();
  48 |   await expect(page.getByText('Final Results',{exact:true})).toBeVisible();
  49 |   await page.getByRole('button',{name:'Rounds',exact:true}).click();
  50 |   await expect(page.getByTestId('public-kotc-round-history')).toBeVisible();
  51 |   await expect(page.getByTestId('public-kotc-round-history')).toContainText('Round 2');
  52 |   await page.getByTestId('public-kotc-round-history').getByRole('button',{name:'Round 1'}).click();
  53 |   await expect(page.getByTestId('public-kotc-round-history')).toContainText('Player 05');
  54 |   await expect(page.getByTestId('public-kotc-round-history')).toContainText('11');
  55 |   layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth}));
  56 |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  57 |   await expect(page.getByText(/Emergency contact|Member mobile/i)).toHaveCount(0);
  58 | });
  59 | 
```