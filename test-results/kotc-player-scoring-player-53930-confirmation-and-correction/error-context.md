# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-player-scoring.spec.mjs >> player scoring: per-court lock, parallel courts, saved confirmation and correction
- Location: e2e/kotc-player-scoring.spec.mjs:61:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('scorer-court-1')
Expected substring: "Score unlocked for correction"
Received string:    "Court 1SAVEDP1A1 & P1A2P1B1 & P1B2Court 1 ready for correctionSave Updated ScoreCancel"
Timeout: 3000ms

Call log:
  - Expect "toContainText" getByTestId('scorer-court-1') with timeout 3000ms
  - waiting for getByTestId('scorer-court-1')
    2 × locator resolved to <div data-dynamic-content="true" data-testid="scorer-court-1" data-collection-item-id="match-1" class="rounded-xl border bg-card p-4 space-y-3 " data-source-location="src/pages/PublicKotcScorer.jsx:30:8">…</div>
      - unexpected value "Court 1SAVEDP1A1 & P1A2P1B1 & P1B2✓ Score saved: 11–7Undo / Update Score"
    8 × locator resolved to <div data-dynamic-content="true" data-testid="scorer-court-1" data-collection-item-id="match-1" data-source-location="src/pages/PublicKotcScorer.jsx:30:8" class="rounded-xl border bg-card p-4 space-y-3 ring-2 ring-primary/30 border-primary/50">…</div>
      - unexpected value "Court 1SAVEDP1A1 & P1A2P1B1 & P1B2Court 1 ready for correctionSave Updated ScoreCancel"

```

```yaml
- img
- text: Court 1 SAVED P1A1 & P1A2
- textbox: "11"
- text: P1B1 & P1B2
- textbox: "7"
- img
- text: Court 1 ready for correction
- button "Save Updated Score"
- button "Cancel":
  - img
  - text: Cancel
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const APP_ID = process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
  4   | const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  5   | const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  6   | 
  7   | function createModel(){
  8   |   const now=()=>Date.now();
  9   |   const matches=[1,2].map(c=>({id:`match-${c}`,court:c,status:'scheduled',revision:0,team_a:[`P${c}A1`,`P${c}A2`],team_b:[`P${c}B1`,`P${c}B2`],team_a_score:null,team_b_score:null,lockOwner:'',lockExpires:0,correctionOwner:'',correction_count:0}));
  10  |   const calls=[];let transientSaveRateLimits=0;
  11  |   const state=(clientId)=>({success:true,session:{name:'E2E Player Scoring',status:'in_progress',current_round_number:1,scoring_mode:'timed'},round:{id:'round-1',round_number:1,status:'started'},bench:[],timer:{running:true,remainingSeconds:300,deadlineAt:new Date(Date.now()+300000).toISOString()},matches:matches.map(m=>({id:m.id,court:m.court,status:m.status,revision:m.revision,team_a:m.team_a,team_b:m.team_b,team_a_score:m.team_a_score,team_b_score:m.team_b_score,winner_side:m.winner_side,lock_status:m.lockOwner&&m.lockExpires>now()?(m.lockOwner===clientId?'mine':'other'):'free',lock_seconds:m.lockExpires>now()?Math.ceil((m.lockExpires-now())/1000):0,can_correct:m.status==='completed'&&m.correctionOwner===clientId}))});
  12  |   const handle=async(body)=>{
  13  |     calls.push({...body,at:Date.now()});
  14  |     const action=body.action||'state',clientId=body.clientId||'';
  15  |     if(action==='state') return state(clientId);
  16  |     const m=matches.find(x=>x.id===body.matchId); if(!m) return {status:404,body:{error:'Current-round match not found'}};
  17  |     if(action==='claim'){
  18  |       if(m.status==='completed'&&m.correctionOwner!==clientId)return {status:423,body:{error:`Court ${m.court} is already saved. Only the scorer device that saved it, or the host, can update this result.`,saved:true,read_only:true}};
  19  |       const mine=matches.find(x=>x.id!==m.id&&x.lockOwner===clientId&&x.lockExpires>now());
  20  |       if(mine)return {status:423,body:{error:`This device is already scoring Court ${mine.court}. Save or cancel that court first.`,locked:true}};
  21  |       if(m.lockOwner&&m.lockExpires>now()&&m.lockOwner!==clientId)return {status:423,body:{error:`Court ${m.court} is being scored on another device.`,locked:true}};
  22  |       await sleep(35);m.lockOwner=clientId;m.lockExpires=now()+90000;return {status:200,body:{success:true,claimed:true,lease_seconds:90}};
  23  |     }
  24  |     if(action==='heartbeat'){
  25  |       if(m.lockOwner!==clientId||m.lockExpires<=now())return {status:423,body:{error:'Your scoring lock is no longer active.'}};
  26  |       m.lockExpires=now()+90000;return {status:200,body:{success:true}};
  27  |     }
  28  |     if(action==='release'){
  29  |       if(m.lockOwner===clientId){m.lockOwner='';m.lockExpires=0;}return {status:200,body:{success:true,released:true}};
  30  |     }
  31  |     if(action==='save'||action==='correct'){
  32  |       if(transientSaveRateLimits>0){transientSaveRateLimits--;return {status:429,body:{error:'Rate limit exceeded'}};}
  33  |       if(m.lockOwner!==clientId||m.lockExpires<=now())return {status:423,body:{error:`Court ${m.court} is not locked to this scorer.`}};
  34  |       if(Number(body.expectedRevision)!==m.revision)return {status:409,body:{error:'This score changed since you opened it.',conflict:true,currentRevision:m.revision}};
  35  |       const correcting=action==='correct';
  36  |       if(correcting&&m.status!=='completed')return {status:409,body:{error:'This score has not been saved yet.'}};
  37  |       if(!correcting&&m.status==='completed')return {status:409,body:{error:'This result is already saved. Use Undo / Update on the scorer screen.'}};
  38  |       m.team_a_score=Number(body.teamAScore);m.team_b_score=Number(body.teamBScore);m.winner_side=m.team_a_score>=m.team_b_score?'A':'B';m.status='completed';m.revision++;if(correcting)m.correction_count++;m.lockOwner='';m.lockExpires=0;m.correctionOwner=clientId;
  39  |       return {status:200,body:{success:true,corrected:correcting,message:correcting?'Updated score saved':'Score saved',match:{...m,can_correct:true,lock_status:'free'}}};
  40  |     }
  41  |     return {status:400,body:{error:'Unsupported'}};
  42  |   };
  43  |   return {matches,calls,handle,setTransientSaveRateLimits:n=>{transientSaveRateLimits=n;}};
  44  | }
  45  | 
  46  | async function install(context,model){
  47  |   await context.route('**/api/apps/**', async route=>{
  48  |     const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
  49  |     if(!url.pathname.includes(marker)) return json(route,[]);
  50  |     const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
  51  |     if(name!=='kotcScorer') return json(route,{success:true});
  52  |     let body={};try{body=req.postDataJSON()||{};}catch{}
  53  |     const out=await model.handle(body);if(out?.status)return json(route,out.body,out.status);return json(route,out);
  54  |   });
  55  | }
  56  | 
  57  | async function openScorer(context){const page=await context.newPage();await page.goto('/e2e/kotcScorerHarness.html');await expect(page.getByText('E2E Player Scoring')).toBeVisible();return page;}
  58  | 
  59  | async function fillCourt(page,court,a,b){const card=page.getByTestId(`scorer-court-${court}`);await card.locator('input').nth(0).fill(String(a));await card.locator('input').nth(1).fill(String(b));return card;}
  60  | 
  61  | test('player scoring: per-court lock, parallel courts, saved confirmation and correction',async({browser})=>{
  62  |   const model=createModel();
  63  |   const aCtx=await browser.newContext({viewport:{width:390,height:844}}),bCtx=await browser.newContext({viewport:{width:390,height:844}});
  64  |   await install(aCtx,model);await install(bCtx,model);
  65  |   const [a,b]=await Promise.all([openScorer(aCtx),openScorer(bCtx)]);
  66  | 
  67  |   // Phone A claims Court 1.
  68  |   await a.getByTestId('scorer-court-1').getByRole('button',{name:'Score This Court'}).click();
  69  |   await expect(a.getByTestId('scorer-court-1')).toContainText('Court 1 ready — enter the score');
  70  | 
  71  |   // Same phone cannot hoard a second court while holding Court 1.
  72  |   await a.getByTestId('scorer-court-2').getByRole('button',{name:'Score This Court'}).click();
  73  |   await expect(a.getByTestId('scorer-court-2')).toContainText('already scoring Court 1');
  74  | 
  75  |   // Phone B cannot take Court 1, but can score Court 2 independently.
  76  |   await b.getByTestId('scorer-court-1').getByRole('button',{name:'Score This Court'}).click();
  77  |   await expect(b.getByTestId('scorer-court-1')).toContainText(/another device|LOCKED/);
  78  |   await b.getByTestId('scorer-court-2').getByRole('button',{name:'Score This Court'}).click();
  79  |   await expect(b.getByTestId('scorer-court-2')).toContainText('Court 2 ready — enter the score');
  80  |   const bCourt2First=b.getByTestId('scorer-court-2').locator('input').nth(0);
  81  |   await bCourt2First.focus();await b.keyboard.type('123');await expect(bCourt2First).toHaveValue('12');await bCourt2First.fill('');
  82  | 
  83  |   // Court 1 saves and gives explicit confirmation even if Base44 transiently rate-limits
  84  |   // the first save attempt. The scorer page must retry instead of exposing a raw 429.
  85  |   model.setTransientSaveRateLimits(1);
  86  |   let card=await fillCourt(a,1,11,7);await card.getByRole('button',{name:'Save Result'}).click();
  87  |   await expect(card).toContainText('Score saved: 11–7');
  88  |   expect(model.matches[0].revision).toBe(1);
  89  | 
  90  |   // Other players on Court 1 can see the saved result but cannot reopen it.
  91  |   await expect(b.getByTestId('scorer-court-1')).toContainText('Score saved: 11–7',{timeout:6500});
  92  |   await expect(b.getByTestId('scorer-court-1').getByRole('button',{name:'Undo / Update Score'})).toHaveCount(0);
  93  |   await expect(b.getByTestId('scorer-court-1')).toContainText('Only the scorer device that saved it, or the host');
  94  | 
  95  |   // The scorer device that saved it can reopen and correct while the host has not advanced the round.
  96  |   await card.getByRole('button',{name:'Undo / Update Score'}).click();
> 97  |   await expect(card).toContainText('Score unlocked for correction');
      |                      ^ Error: expect(locator).toContainText(expected) failed
  98  |   card=await fillCourt(a,1,12,8);await card.getByRole('button',{name:'Save Updated Score'}).click();
  99  |   await expect(card).toContainText('Score saved: 12–8');
  100 |   expect(model.matches[0].revision).toBe(2);expect(model.matches[0].correction_count).toBe(1);
  101 | 
  102 |   // Sporting-integrity guard: a tied timed game cannot be saved until the scorer
  103 |   // explicitly confirms which team was serving at the horn. There is no Team A default.
  104 |   let card2=await fillCourt(b,2,8,8);
  105 |   await expect(card2.getByText('Tie at the horn — who was serving?')).toBeVisible();
  106 |   await expect(card2.getByRole('button',{name:'Save Result'})).toBeDisabled();
  107 |   await card2.getByRole('combobox').click();
  108 |   await b.getByRole('option',{name:'Team B serving at horn'}).click();
  109 |   await expect(card2.getByRole('button',{name:'Save Result'})).toBeEnabled();
  110 | 
  111 |   // Court 2 can then save in parallel and the player page waits for the host rather than advancing.
  112 |   card2=await fillCourt(b,2,9,6);await card2.getByRole('button',{name:'Save Result'}).click();
  113 |   await expect(card2).toContainText('Score saved: 9–6');
  114 |   await expect(b.getByText('All court scores saved')).toBeVisible({timeout:2500});
  115 |   await expect(b.getByText(/waiting for the host/i)).toBeVisible();
  116 |   expect(model.calls.some(c=>c.commandType==='generate_next_round'||c.action==='generate_next_round')).toBe(false);
  117 | 
  118 |   // Busy-hall phone checks: no sideways scrolling and primary score controls are
  119 |   // comfortably tappable rather than tiny desktop targets.
  120 |   const mobileLayout=await b.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  121 |   expect(mobileLayout.scrollWidth).toBeLessThanOrEqual(mobileLayout.innerWidth+1);
  122 |   const updateBox=await card2.getByRole('button',{name:'Undo / Update Score'}).boundingBox();
  123 |   expect(updateBox?.height||0).toBeGreaterThanOrEqual(44);
  124 | 
  125 |   await aCtx.close();await bCtx.close();
  126 | });
```