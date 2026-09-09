# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-public-live.spec.mjs >> public KOTC live link: assignments → live scores → podium
- Location: e2e/kotc-public-live.spec.mjs:25:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Guest One')
Expected: visible
Error: strict mode violation: getByText('Guest One') resolved to 3 elements:
    1) <p data-dynamic-content="true" data-collection-item-id="p2" class="font-bold text-sm mt-1" data-collection-item-field="name" data-source-location="src/pages/PublicKotcResults.jsx:36:512">Guest One</p> aka getByTestId('public-kotc-podium').getByText('Guest One')
    2) <p data-dynamic-content="true" class="text-sm font-semibold mt-1" data-collection-item-field="bench" data-source-location="src/pages/PublicKotcResults.jsx:38:570">Player 17 · Guest One</p> aka getByText('Player 17 · Guest One')
    3) <span class="font-medium" data-dynamic-content="true" data-collection-item-id="p2" data-collection-item-field="name" data-source-location="src/pages/PublicKotcResults.jsx:40:615">Guest One</span> aka locator('span').filter({ hasText: 'Guest One' })

Call log:
  - Expect "toBeVisible" getByText('Guest One') with timeout 3000ms
  - waiting for getByText('Guest One')

```

# Page snapshot

```yaml
- main [ref=e4]:
  - generic [ref=e5]:
    - paragraph [ref=e6]: King of the Court · Live
    - heading "E2E Live KOTC" [level=1] [ref=e9]
    - generic [ref=e10]:
      - generic [ref=e11]: Round 3
      - generic [ref=e12]: COMPLETED
      - generic [ref=e13]: 3 rounds completed
    - paragraph [ref=e14]: This page updates automatically as the host starts rounds and scores are saved.
  - generic [ref=e15]:
    - heading "Podium" [level=2] [ref=e23]
    - generic [ref=e24]:
      - generic [ref=e25]:
        - generic [ref=e26]: 🥇
        - paragraph [ref=e27]: Player 01
        - paragraph [ref=e28]: 3W · 0L · +14
      - generic [ref=e29]:
        - generic [ref=e30]: 🥈
        - paragraph [ref=e31]: Guest One
        - paragraph [ref=e32]: 3W · 0L · +10
      - generic [ref=e33]:
        - generic [ref=e34]: 🥉
        - paragraph [ref=e35]: Player 03
        - paragraph [ref=e36]: 2W · 1L · +6
  - generic [ref=e37]:
    - generic [ref=e38]:
      - heading "Final Round · Round 3" [level=2] [ref=e39]
      - generic [ref=e40]: COMPLETED
    - generic [ref=e41]:
      - paragraph [ref=e42]: Bench This Round
      - paragraph [ref=e43]: Player 17 · Guest One
    - generic [ref=e45]:
      - generic [ref=e46]:
        - paragraph [ref=e47]: Court 1
        - generic [ref=e48]: SAVED
      - generic [ref=e49]:
        - generic [ref=e50]: Player 01 & Player 02
        - strong [ref=e51]: "11"
      - generic [ref=e52]: vs
      - generic [ref=e53]:
        - generic [ref=e54]: Player 03 & Player 04
        - strong [ref=e55]: "9"
  - generic [ref=e56]:
    - heading "Final Standings" [level=2] [ref=e64]
    - generic [ref=e65]:
      - generic [ref=e66]: "#"
      - generic [ref=e67]: Player
      - generic [ref=e68]: W
      - generic [ref=e69]: L
      - generic [ref=e70]: Diff
    - generic [ref=e72]:
      - generic [ref=e73]: "1"
      - generic [ref=e74]: Player 01
      - generic [ref=e75]: "3"
      - generic [ref=e76]: "0"
      - generic [ref=e77]: "+14"
    - generic [ref=e79]:
      - generic [ref=e80]: "2"
      - generic [ref=e81]: Guest One
      - generic [ref=e82]: "3"
      - generic [ref=e83]: "0"
      - generic [ref=e84]: "+10"
    - generic [ref=e86]:
      - generic [ref=e87]: "3"
      - generic [ref=e88]: Player 03
      - generic [ref=e89]: "2"
      - generic [ref=e90]: "1"
      - generic [ref=e91]: "+6"
  - generic [ref=e92]:
    - heading "Completed Round History" [level=2] [ref=e93]
    - generic [ref=e94]:
      - paragraph [ref=e95]: Round 1 · Court 1
      - generic [ref=e96]:
        - generic [ref=e97]: Player 01 & Player 02
        - strong [ref=e98]: "11"
      - generic [ref=e99]:
        - generic [ref=e100]: Player 03 & Player 04
        - strong [ref=e101]: "7"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const APP_ID = process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
  4  | const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  5  | 
  6  | function makeState(phase){
  7  |   const common={
  8  |     completed_rounds: phase==='ready'?0:phase==='live'?0:3,
  9  |     bench:['Player 17','Guest One'],
  10 |     matches: phase==='finished'?[{round_number:1,court:1,team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:7}]:[],
  11 |     standings:[
  12 |       {id:'p1',rank:1,name:'Player 01',wins:3,losses:0,differential:14},
  13 |       {id:'p2',rank:2,name:'Guest One',wins:3,losses:0,differential:10},
  14 |       {id:'p3',rank:3,name:'Player 03',wins:2,losses:1,differential:6},
  15 |     ],
  16 |     timer:{remainingSeconds:420,running:phase==='live',deadlineAt:phase==='live'?new Date(Date.now()+420000).toISOString():null},
  17 |   };
  18 |   if(phase==='ready')return {...common,session:{name:'E2E Live KOTC',status:'ready',current_round_number:1,scoring_mode:'timed'},current_round:{round_number:1,status:'proposed'},current_matches:[{round_number:1,court:1,status:'scheduled',team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'] }],podium:[]};
  19 |   if(phase==='live')return {...common,session:{name:'E2E Live KOTC',status:'in_progress',current_round_number:1,scoring_mode:'timed'},current_round:{round_number:1,status:'started'},current_matches:[{round_number:1,court:1,status:'completed',team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:7},{round_number:1,court:2,status:'in_progress',team_a:['Player 05','Player 06'],team_b:['Player 07','Player 08'],team_a_score:8,team_b_score:8}],podium:[]};
  20 |   return {...common,session:{name:'E2E Live KOTC',status:'completed',current_round_number:3,scoring_mode:'timed'},current_round:{round_number:3,status:'completed'},current_matches:[{round_number:3,court:1,status:'completed',team_a:['Player 01','Player 02'],team_b:['Player 03','Player 04'],team_a_score:11,team_b_score:9}],podium:common.standings.slice(0,3)};
  21 | }
  22 | 
  23 | test.use({ viewport:{width:390,height:844} });
  24 | 
  25 | test('public KOTC live link: assignments → live scores → podium', async ({page})=>{
  26 |   let phase='ready';
  27 |   await page.route('**/api/apps/**', async route=>{
  28 |     const request=route.request();
  29 |     const path=new URL(request.url()).pathname;
  30 |     const marker=`/api/apps/${APP_ID}/functions/`;
  31 |     const idx=path.indexOf(marker);
  32 |     if(idx>=0){
  33 |       const name=decodeURIComponent(path.slice(idx+marker.length).split('/')[0]);
  34 |       if(name==='kotcResultsShare')return json(route,makeState(phase));
  35 |     }
  36 |     return json(route,[]);
  37 |   });
  38 | 
  39 |   await page.goto('/e2e/kotcLiveHarness.html');
  40 |   await expect(page.getByText('Round Ready · Round 1')).toBeVisible({timeout:1800});
  41 |   await expect(page.getByTestId('public-kotc-court-1')).toContainText('Players assigned');
  42 | 
  43 |   phase='live';
  44 |   await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  45 |   await expect(page.getByText('On Court Now · Round 1')).toBeVisible({timeout:1800});
  46 |   await expect(page.getByTestId('public-kotc-court-1')).toContainText('11');
  47 |   await expect(page.getByTestId('public-kotc-court-2')).toContainText('8');
  48 |   await expect(page.getByText('Live Standings')).toBeVisible();
  49 | 
  50 |   phase='finished';
  51 |   await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  52 |   await expect(page.getByTestId('public-kotc-podium')).toBeVisible({timeout:1800});
  53 |   await expect(page.getByText('Final Standings')).toBeVisible();
> 54 |   await expect(page.getByText('Guest One')).toBeVisible();
     |                                             ^ Error: expect(locator).toBeVisible() failed
  55 | });
  56 | 
```