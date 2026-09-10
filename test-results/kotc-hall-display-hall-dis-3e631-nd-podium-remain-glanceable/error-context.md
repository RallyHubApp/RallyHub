# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-hall-display.spec.mjs >> hall display: current round, big timer, four courts and podium remain glanceable
- Location: e2e/kotc-hall-display.spec.mjs:39:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('public-kotc-podium')
Expected: visible
Timeout: 1800ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('public-kotc-podium') with timeout 1800ms
  - waiting for getByTestId('public-kotc-podium')

```

```yaml
- main:
  - paragraph: King of the Court · Hall Display
  - heading "Thursday Improver KOTC" [level=1]
  - button "Exit Display":
    - img
    - text: Exit Display
  - text: Round 4 STARTED
  - paragraph: 05:25
  - paragraph: Time remaining in this round
  - paragraph: Bench This Round
  - paragraph: Player 17 · Guest One
  - heading "On Court Now" [level=2]
  - paragraph: Scores appear as they are saved
  - img
  - paragraph: Court 1
  - text: SAVED Player 01 & Player 02
  - strong: "11"
  - text: vs Player 03 & Player 04
  - strong: "7"
  - paragraph: Court 2
  - text: SAVED Player 05 & Player 06
  - strong: "11"
  - text: vs Player 07 & Player 08
  - strong: "8"
  - paragraph: Court 3
  - text: LIVE Player 09 & Player 10 vs Player 11 & Player 12
  - paragraph: Awaiting result
  - paragraph: Court 4
  - text: LIVE Player 13 & Player 14 vs Player 15 & Player 16
  - paragraph: Awaiting result
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const APP_ID = process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
  4  | const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  5  | 
  6  | function makeState(phase='live'){
  7  |   const names=n=>[`Player ${String(n).padStart(2,'0')}`,`Player ${String(n+1).padStart(2,'0')}`];
  8  |   const matches=[1,2,3,4].map((court,i)=>({
  9  |     round_number:4,
  10 |     court,
  11 |     status:i<2?'completed':'in_progress',
  12 |     team_a:names(i*4+1),
  13 |     team_b:names(i*4+3),
  14 |     team_a_score:i<2?11:null,
  15 |     team_b_score:i<2?7+i:null,
  16 |   }));
  17 |   const standings=Array.from({length:18},(_,i)=>({id:`p${i+1}`,rank:i+1,name:i===1?'Guest One':`Player ${String(i+1).padStart(2,'0')}`,wins:Math.max(0,5-Math.floor(i/4)),losses:Math.floor(i/4),differential:18-i}));
  18 |   if(phase==='finished')return {
  19 |     session:{name:'Thursday Improver KOTC',status:'completed',current_round_number:8,scoring_mode:'timed'},
  20 |     completed_rounds:8,current_round:{round_number:8,status:'completed'},current_matches:matches.map(m=>({...m,round_number:8,status:'completed',team_a_score:11,team_b_score:8})),bench:[],timer:{running:false,remainingSeconds:0},standings,matches:[],podium:standings.slice(0,3),
  21 |   };
  22 |   return {
  23 |     session:{name:'Thursday Improver KOTC',status:'in_progress',current_round_number:4,scoring_mode:'timed'},
  24 |     completed_rounds:3,current_round:{round_number:4,status:'started'},current_matches:matches,bench:['Player 17','Guest One'],timer:{running:true,remainingSeconds:326,deadlineAt:new Date(Date.now()+326000).toISOString()},standings,matches:[],podium:[],
  25 |   };
  26 | }
  27 | 
  28 | async function install(page,getPhase){
  29 |   await page.route('**/api/apps/**',async route=>{
  30 |     const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
  31 |     if(url.pathname.includes(marker)){
  32 |       const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
  33 |       if(name==='kotcResultsShare')return json(route,makeState(getPhase()));
  34 |     }
  35 |     return json(route,[]);
  36 |   });
  37 | }
  38 | 
  39 | test('hall display: current round, big timer, four courts and podium remain glanceable',async({browser})=>{
  40 |   let phase='live';
  41 |   const context=await browser.newContext({viewport:{width:1366,height:768}});
  42 |   const page=await context.newPage();
  43 |   await install(page,()=>phase);
  44 |   await page.goto('/e2e/kotcLiveHarness.html');
  45 |   await page.getByTestId('enter-hall-display').click();
  46 |   await expect(page.getByTestId('public-kotc-hall-display')).toBeVisible();
  47 |   await expect(page.getByTestId('hall-round-timer')).toContainText('Round 4');
  48 |   await expect(page.getByTestId('hall-round-timer')).toContainText(/05:2\d|05:3\d/);
  49 |   await expect(page.getByTestId('hall-bench')).toContainText('Guest One');
  50 |   for(let court=1;court<=4;court++)await expect(page.getByTestId(`public-kotc-court-${court}`)).toBeVisible();
  51 | 
  52 |   const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth,innerHeight:window.innerHeight}));
  53 |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth+1);
  54 |   const boxes=[];for(let court=1;court<=4;court++)boxes.push(await page.getByTestId(`public-kotc-court-${court}`).boundingBox());
  55 |   for(const box of boxes)expect((box?.y||0)+(box?.height||0)).toBeLessThanOrEqual(layout.innerHeight+2);
  56 | 
  57 |   phase='finished';
  58 |   await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
> 59 |   await expect(page.getByTestId('public-kotc-podium')).toBeVisible({timeout:1800});
     |                                                        ^ Error: expect(locator).toBeVisible() failed
  60 |   await expect(page.getByTestId('public-kotc-podium')).toContainText('Guest One');
  61 |   const podiumBox=await page.getByTestId('public-kotc-podium').boundingBox();
  62 |   expect((podiumBox?.y||0)+(podiumBox?.height||0)).toBeLessThanOrEqual(768+5);
  63 |   await context.close();
  64 | });
  65 | 
```