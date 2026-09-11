# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-player-scoring.spec.mjs >> player scoring: per-court lock, parallel courts, saved confirmation and correction
- Location: e2e/kotc-player-scoring.spec.mjs:65:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('scorer-court-1')
Expected substring: "Score saved: 12–8"
Received string:    "Court 1SAVEDP1A1 & P1A2P1B1 & P1B2Updated score saved✓ Score saved: 11–7Undo / Update Score · 84s"
Timeout: 3000ms

Call log:
  - Expect "toContainText" getByTestId('scorer-court-1') with timeout 3000ms
  - waiting for getByTestId('scorer-court-1')
    - locator resolved to <div data-dynamic-content="true" data-testid="scorer-court-1" data-collection-item-id="match-1" data-source-location="src/pages/PublicKotcScorer.jsx:32:8" class="rounded-xl border bg-card p-4 space-y-3 ring-2 ring-primary/30 border-primary/50">…</div>
    - unexpected value "Court 1SAVEDP1A1 & P1A2P1B1 & P1B2Saving…Cancel"
    9 × locator resolved to <div data-dynamic-content="true" data-testid="scorer-court-1" data-collection-item-id="match-1" class="rounded-xl border bg-card p-4 space-y-3 " data-source-location="src/pages/PublicKotcScorer.jsx:32:8">…</div>
      - unexpected value "Court 1SAVEDP1A1 & P1A2P1B1 & P1B2Updated score saved✓ Score saved: 11–7Undo / Update Score · 84s"

```

```yaml
- img
- text: Court 1 SAVED P1A1 & P1A2
- textbox [disabled]: "11"
- text: P1B1 & P1B2
- textbox [disabled]: "7"
- img
- text: "Updated score saved ✓ Score saved: 11–7"
- button "Undo / Update Score · 84s":
  - img
  - text: Undo / Update Score · 84s
```

# Test source

```ts
  13  |   const handle=async(body)=>{
  14  |     calls.push({...body,at:Date.now()});
  15  |     const action=body.action||'state',clientId=body.clientId||'';
  16  |     if(action==='state') return state(clientId);
  17  |     const m=matches.find(x=>x.id===body.matchId); if(!m) return {status:404,body:{error:'Current-round match not found'}};
  18  |     if(action==='claim'){
  19  |       if(m.status==='completed'&&!correctionOpen(m,clientId))return {status:423,body:{error:`Court ${m.court} is already saved. The scorer correction window has closed; the host can still correct this result.`,saved:true,read_only:true}};
  20  |       const mine=matches.find(x=>x.id!==m.id&&x.lockOwner===clientId&&x.lockExpires>now());
  21  |       if(mine)return {status:423,body:{error:`This device is already scoring Court ${mine.court}. Save or cancel that court first.`,locked:true}};
  22  |       if(m.lockOwner&&m.lockExpires>now()&&m.lockOwner!==clientId)return {status:423,body:{error:`Court ${m.court} is being scored on another device.`,locked:true}};
  23  |       await sleep(10);m.lockOwner=clientId;m.lockExpires=now()+90000;await sleep(35);
  24  |       if(m.lockOwner!==clientId||m.lockExpires<=now())return {status:423,body:{error:`Court ${m.court} was claimed by another scorer.`,locked:true}};
  25  |       return {status:200,body:{success:true,claimed:true,lease_seconds:90}};
  26  |     }
  27  |     if(action==='heartbeat'){
  28  |       if(m.lockOwner!==clientId||m.lockExpires<=now())return {status:423,body:{error:'Your scoring lock is no longer active.'}};
  29  |       m.lockExpires=now()+90000;return {status:200,body:{success:true}};
  30  |     }
  31  |     if(action==='release'){
  32  |       if(m.lockOwner===clientId){m.lockOwner='';m.lockExpires=0;}return {status:200,body:{success:true,released:true}};
  33  |     }
  34  |     if(action==='save'||action==='correct'){
  35  |       if(transientSaveRateLimits>0){transientSaveRateLimits--;return {status:429,body:{error:'Rate limit exceeded'}};}
  36  |       if(m.lockOwner!==clientId||m.lockExpires<=now())return {status:423,body:{error:`Court ${m.court} is not locked to this scorer.`}};
  37  |       if(Number(body.expectedRevision)!==m.revision)return {status:409,body:{error:'This score changed since you opened it.',conflict:true,currentRevision:m.revision}};
  38  |       const correcting=action==='correct';
  39  |       if(correcting&&m.status!=='completed')return {status:409,body:{error:'This score has not been saved yet.'}};
  40  |       if(correcting&&!correctionOpen(m,clientId))return {status:423,body:{error:'The 90-second scorer correction window has closed. Ask the host to correct this result.',read_only:true}};
  41  |       if(!correcting&&m.status==='completed')return {status:409,body:{error:'This result is already saved. Use Undo / Update on the scorer screen.'}};
  42  |       m.team_a_score=Number(body.teamAScore);m.team_b_score=Number(body.teamBScore);m.winner_side=m.team_a_score>=m.team_b_score?'A':'B';m.status='completed';m.revision++;if(correcting)m.correction_count++;else m.completedAt=now();m.lockOwner='';m.lockExpires=0;m.correctionOwner=clientId;
  43  |       return {status:200,body:{success:true,corrected:correcting,message:correcting?'Updated score saved':'Score saved',match:{...m,completed_at:new Date(m.completedAt).toISOString(),can_correct:correctionOpen(m,clientId),correction_seconds_remaining:correctionOpen(m,clientId)?Math.max(0,Math.ceil((m.completedAt+90000-now())/1000)):0,lock_status:'free'}}};
  44  |     }
  45  |     return {status:400,body:{error:'Unsupported'}};
  46  |   };
  47  |   return {matches,calls,handle,setTransientSaveRateLimits:n=>{transientSaveRateLimits=n;}};
  48  | }
  49  | 
  50  | async function install(context,model){
  51  |   await context.route('**/api/apps/**', async route=>{
  52  |     const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
  53  |     if(!url.pathname.includes(marker)) return json(route,[]);
  54  |     const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
  55  |     if(name!=='kotcScorer') return json(route,{success:true});
  56  |     let body={};try{body=req.postDataJSON()||{};}catch{}
  57  |     const out=await model.handle(body);if(out?.status)return json(route,out.body,out.status);return json(route,out);
  58  |   });
  59  | }
  60  | 
  61  | async function openScorer(context){const page=await context.newPage();await page.goto('/e2e/kotcScorerHarness.html');await expect(page.getByText('E2E Player Scoring')).toBeVisible();return page;}
  62  | 
  63  | async function fillCourt(page,court,a,b){const card=page.getByTestId(`scorer-court-${court}`);await card.locator('input').nth(0).fill(String(a));await card.locator('input').nth(1).fill(String(b));return card;}
  64  | 
  65  | test('player scoring: per-court lock, parallel courts, saved confirmation and correction',async({browser})=>{
  66  |   const model=createModel();
  67  |   const aCtx=await browser.newContext({viewport:{width:390,height:844}}),bCtx=await browser.newContext({viewport:{width:390,height:844}});
  68  |   await install(aCtx,model);await install(bCtx,model);
  69  |   const [a,b]=await Promise.all([openScorer(aCtx),openScorer(bCtx)]);
  70  | 
  71  |   // First actual digit claims Court 1 for Phone A. No separate claim button is needed.
  72  |   const aCourt1First=a.getByTestId('scorer-court-1').locator('input').nth(0);
  73  |   await aCourt1First.fill('1');
  74  |   await expect(a.getByTestId('scorer-court-1')).toContainText('locked to you');
  75  |   await expect(aCourt1First).toHaveValue('1');
  76  | 
  77  |   // Same phone cannot hoard a second court while holding Court 1; the attempted digit never appears.
  78  |   const aCourt2First=a.getByTestId('scorer-court-2').locator('input').nth(0);
  79  |   await aCourt2First.fill('2');
  80  |   await expect(a.getByTestId('scorer-court-2')).toContainText('already scoring Court 1');
  81  |   await expect(aCourt2First).toHaveValue('');
  82  | 
  83  |   // Phone B cannot take Court 1, but its first digit can claim Court 2 independently.
  84  |   const bCourt1First=b.getByTestId('scorer-court-1').locator('input').nth(0);
  85  |   await bCourt1First.fill('9');
  86  |   await expect(b.getByTestId('scorer-court-1')).toContainText(/another device|LOCKED|being scored/);
  87  |   await expect(bCourt1First).toHaveValue('');
  88  |   const bCourt2First=b.getByTestId('scorer-court-2').locator('input').nth(0);
  89  |   await bCourt2First.fill('7');
  90  |   await expect(b.getByTestId('scorer-court-2')).toContainText('locked to you');
  91  |   await bCourt2First.fill('123');await expect(bCourt2First).toHaveValue('12');await bCourt2First.fill('');
  92  | 
  93  |   // Court 1 saves and gives explicit confirmation even if Base44 transiently rate-limits
  94  |   // the first save attempt. The scorer page must retry instead of exposing a raw 429.
  95  |   model.setTransientSaveRateLimits(1);
  96  |   let card=await fillCourt(a,1,11,7);await card.getByRole('button',{name:'Save Result'}).click();
  97  |   await expect(card).toContainText('Score saved: 11–7');
  98  |   expect(model.matches[0].revision).toBe(1);
  99  | 
  100 |   // Other players pull the saved result only when they explicitly refresh; there is no hidden scorer polling.
  101 |   const bStateBefore=model.calls.filter(c=>c.action==='state').length;
  102 |   await b.waitForTimeout(5500);
  103 |   expect(model.calls.filter(c=>c.action==='state').length).toBe(bStateBefore);
  104 |   await b.getByTestId('scorer-refresh').click();
  105 |   await expect(b.getByTestId('scorer-court-1')).toContainText('Score saved: 11–7');
  106 |   await expect(b.getByTestId('scorer-court-1').getByRole('button',{name:'Undo / Update Score'})).toHaveCount(0);
  107 |   await expect(b.getByTestId('scorer-court-1')).toContainText(/Result already entered|host can update/i);
  108 | 
  109 |   // The scorer device that saved it can reopen and correct while the host has not advanced the round.
  110 |   await card.getByRole('button',{name:'Undo / Update Score'}).click();
  111 |   await expect(card).toContainText('Court 1 ready for correction');
  112 |   card=await fillCourt(a,1,12,8);await card.getByRole('button',{name:'Save Updated Score'}).click();
> 113 |   await expect(card).toContainText('Score saved: 12–8');
      |                      ^ Error: expect(locator).toContainText(expected) failed
  114 |   expect(model.matches[0].revision).toBe(2);expect(model.matches[0].correction_count).toBe(1);
  115 | 
  116 |   // Sporting-integrity guard: a tied timed game cannot be saved until the scorer
  117 |   // explicitly confirms which team was serving at the horn. There is no Team A default.
  118 |   let card2=await fillCourt(b,2,8,8);
  119 |   await expect(card2.getByText('Tie at the horn — who was serving?')).toBeVisible();
  120 |   await expect(card2.getByRole('button',{name:'Save Result'})).toBeDisabled();
  121 |   await card2.getByRole('combobox').click();
  122 |   await b.getByRole('option',{name:'Team B serving at horn'}).click();
  123 |   await expect(card2.getByRole('button',{name:'Save Result'})).toBeEnabled();
  124 | 
  125 |   // Court 2 can then save in parallel and the player page waits for the host rather than advancing.
  126 |   card2=await fillCourt(b,2,9,6);await card2.getByRole('button',{name:'Save Result'}).click();
  127 |   await expect(card2).toContainText('Score saved: 9–6');
  128 |   await expect(b.getByText('All court scores saved')).toBeVisible({timeout:2500});
  129 |   await expect(b.getByText(/waiting for the host/i)).toBeVisible();
  130 |   expect(model.calls.some(c=>c.commandType==='generate_next_round'||c.action==='generate_next_round')).toBe(false);
  131 | 
  132 |   // Busy-hall phone checks: no sideways scrolling and primary score controls are
  133 |   // comfortably tappable rather than tiny desktop targets.
  134 |   const mobileLayout=await b.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  135 |   expect(mobileLayout.scrollWidth).toBeLessThanOrEqual(mobileLayout.innerWidth+1);
  136 |   const updateBox=await card2.getByRole('button',{name:'Undo / Update Score'}).boundingBox();
  137 |   expect(updateBox?.height||0).toBeGreaterThanOrEqual(44);
  138 | 
  139 |   // The helper correction privilege is deliberately short-lived. Simulate expiry and
  140 |   // force a state refresh: the helper must lose Undo / Update while the host remains authoritative.
  141 |   model.matches[0].completedAt=Date.now()-91000;model.matches[0].lockOwner='';model.matches[0].lockExpires=0;
  142 |   await a.reload();await expect(a.getByText('E2E Player Scoring')).toBeVisible();
  143 |   await expect(a.getByTestId('scorer-court-1').getByRole('button',{name:/Undo \/ Update Score/})).toHaveCount(0);
  144 |   await expect(a.getByTestId('scorer-court-1')).toContainText(/host/i);
  145 | 
  146 |   await aCtx.close();await bCtx.close();
  147 | });
```