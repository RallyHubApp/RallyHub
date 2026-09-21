# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-player-scoring.spec.mjs >> player scoring: per-court lock, parallel courts, saved confirmation and correction
- Location: e2e/kotc-player-scoring.spec.mjs:66:1

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
    10 × locator resolved to <div data-dynamic-content="true" data-testid="scorer-court-1" data-collection-item-id="match-1" class="rounded-xl border bg-card p-4 space-y-3 " data-source-location="src/pages/PublicKotcScorer.jsx:32:8">…</div>
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
  43  |       if(commitThenFail>0){commitThenFail--;return {status:503,body:{error:'Response lost after committed sporting write'}};}
  44  |       return {status:200,body:{success:true,corrected:correcting,message:correcting?'Updated score saved':'Score saved',match:{...m,completed_at:new Date(m.completedAt).toISOString(),can_correct:correctionOpen(m,clientId),correction_seconds_remaining:correctionOpen(m,clientId)?Math.max(0,Math.ceil((m.completedAt+90000-now())/1000)):0,lock_status:'free'}}};
  45  |     }
  46  |     return {status:400,body:{error:'Unsupported'}};
  47  |   };
  48  |   return {matches,calls,handle,setTransientSaveRateLimits:n=>{transientSaveRateLimits=n;},setCommitThenFail:n=>{commitThenFail=n;},setFinished:v=>{finished=Boolean(v);}};
  49  | }
  50  | 
  51  | async function install(context,model){
  52  |   await context.route('**/api/apps/**', async route=>{
  53  |     const req=route.request(),url=new URL(req.url()),marker=`/api/apps/${APP_ID}/functions/`;
  54  |     if(!url.pathname.includes(marker)) return json(route,[]);
  55  |     const name=decodeURIComponent(url.pathname.split(marker)[1]?.split('/')[0]||'');
  56  |     if(name!=='kotcScorer') return json(route,{success:true});
  57  |     let body={};try{body=req.postDataJSON()||{};}catch{}
  58  |     const out=await model.handle(body);if(out?.status)return json(route,out.body,out.status);return json(route,out);
  59  |   });
  60  | }
  61  | 
  62  | async function openScorer(context){const page=await context.newPage();await page.goto('/e2e/kotcScorerHarness.html');await expect(page.getByText('E2E Player Scoring')).toBeVisible();return page;}
  63  | 
  64  | async function fillCourt(page,court,a,b){const card=page.getByTestId(`scorer-court-${court}`);await card.locator('input').nth(0).fill(String(a));await card.locator('input').nth(1).fill(String(b));return card;}
  65  | 
  66  | test('player scoring: per-court lock, parallel courts, saved confirmation and correction',async({browser})=>{
  67  |   const model=createModel();
  68  |   const aCtx=await browser.newContext({viewport:{width:390,height:844}}),bCtx=await browser.newContext({viewport:{width:390,height:844}});
  69  |   await install(aCtx,model);await install(bCtx,model);
  70  |   const [a,b]=await Promise.all([openScorer(aCtx),openScorer(bCtx)]);
  71  | 
  72  |   // First actual digit claims Court 1 for Phone A. No separate claim button is needed.
  73  |   const aCourt1First=a.getByTestId('scorer-court-1').locator('input').nth(0);
  74  |   await aCourt1First.fill('1');
  75  |   await expect(a.getByTestId('scorer-court-1')).toContainText('locked to you');
  76  |   await expect(aCourt1First).toHaveValue('1');
  77  | 
  78  |   // Same phone cannot hoard a second court while holding Court 1; the attempted digit never appears.
  79  |   const aCourt2First=a.getByTestId('scorer-court-2').locator('input').nth(0);
  80  |   await aCourt2First.fill('2');
  81  |   await expect(a.getByTestId('scorer-court-2')).toContainText('already scoring Court 1');
  82  |   await expect(aCourt2First).toHaveValue('');
  83  | 
  84  |   // Phone B cannot take Court 1, but its first digit can claim Court 2 independently.
  85  |   const bCourt1First=b.getByTestId('scorer-court-1').locator('input').nth(0);
  86  |   await bCourt1First.fill('9');
  87  |   await expect(b.getByTestId('scorer-court-1')).toContainText(/another device|LOCKED|being scored/);
  88  |   await expect(bCourt1First).toHaveValue('');
  89  |   const bCourt2First=b.getByTestId('scorer-court-2').locator('input').nth(0);
  90  |   await bCourt2First.fill('7');
  91  |   await expect(b.getByTestId('scorer-court-2')).toContainText('locked to you');
  92  |   await bCourt2First.fill('123');await expect(bCourt2First).toHaveValue('12');await bCourt2First.fill('');
  93  | 
  94  |   // Court 1 saves and gives explicit confirmation even if Base44 transiently rate-limits
  95  |   // the first save attempt. The scorer page must retry instead of exposing a raw 429.
  96  |   model.setTransientSaveRateLimits(1);
  97  |   let card=await fillCourt(a,1,11,7);await card.getByRole('button',{name:'Save Result'}).click();
  98  |   await expect(card).toContainText('Score saved: 11–7');
  99  |   expect(model.matches[0].revision).toBe(1);
  100 | 
  101 |   // Other players pull the saved result only when they explicitly refresh; there is no hidden scorer polling.
  102 |   const bStateBefore=model.calls.filter(c=>c.action==='state').length;
  103 |   await b.waitForTimeout(5500);
  104 |   expect(model.calls.filter(c=>c.action==='state').length).toBe(bStateBefore);
  105 |   await b.getByTestId('scorer-refresh').click();
  106 |   await expect(b.getByTestId('scorer-court-1')).toContainText('Score saved: 11–7');
  107 |   await expect(b.getByTestId('scorer-court-1').getByRole('button',{name:'Undo / Update Score'})).toHaveCount(0);
  108 |   await expect(b.getByTestId('scorer-court-1')).toContainText(/Result already entered|host can update/i);
  109 | 
  110 |   // The scorer device that saved it can reopen and correct while the host has not advanced the round.
  111 |   await card.getByRole('button',{name:'Undo / Update Score'}).click();
  112 |   await expect(card).toContainText('Court 1 ready for correction');
  113 |   card=await fillCourt(a,1,12,8);await card.getByRole('button',{name:'Save Updated Score'}).click();
> 114 |   await expect(card).toContainText('Score saved: 12–8');
      |                      ^ Error: expect(locator).toContainText(expected) failed
  115 |   expect(model.matches[0].revision).toBe(2);expect(model.matches[0].correction_count).toBe(1);
  116 | 
  117 |   // Sporting-integrity guard: a tied timed game cannot be saved until the scorer
  118 |   // explicitly confirms which team was serving at the horn. There is no Team A default.
  119 |   let card2=await fillCourt(b,2,8,8);
  120 |   await expect(card2.getByText('Tie at the horn — who was serving?')).toBeVisible();
  121 |   await expect(card2.getByRole('button',{name:'Save Result'})).toBeDisabled();
  122 |   await card2.getByRole('combobox').click();
  123 |   await b.getByRole('option',{name:'Team B serving at horn'}).click();
  124 |   await expect(card2.getByRole('button',{name:'Save Result'})).toBeEnabled();
  125 | 
  126 |   // Court 2 can then save in parallel and the player page waits for the host rather than advancing.
  127 |   card2=await fillCourt(b,2,9,6);await card2.getByRole('button',{name:'Save Result'}).click();
  128 |   await expect(card2).toContainText('Score saved: 9–6');
  129 |   await expect(b.getByText('All court scores saved')).toBeVisible({timeout:2500});
  130 |   await expect(b.getByText(/waiting for the host/i)).toBeVisible();
  131 |   expect(model.calls.some(c=>c.commandType==='generate_next_round'||c.action==='generate_next_round')).toBe(false);
  132 | 
  133 |   // Busy-hall phone checks: no sideways scrolling and primary score controls are
  134 |   // comfortably tappable rather than tiny desktop targets.
  135 |   const mobileLayout=await b.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  136 |   expect(mobileLayout.scrollWidth).toBeLessThanOrEqual(mobileLayout.innerWidth+1);
  137 |   const updateBox=await card2.getByRole('button',{name:'Undo / Update Score'}).boundingBox();
  138 |   expect(updateBox?.height||0).toBeGreaterThanOrEqual(44);
  139 | 
  140 |   // The helper correction privilege is deliberately short-lived. Simulate expiry and
  141 |   // force a state refresh: the helper must lose Undo / Update while the host remains authoritative.
  142 |   model.matches[0].completedAt=Date.now()-91000;model.matches[0].lockOwner='';model.matches[0].lockExpires=0;
  143 |   await a.reload();await expect(a.getByText('E2E Player Scoring')).toBeVisible();
  144 |   await expect(a.getByTestId('scorer-court-1').getByRole('button',{name:/Undo \/ Update Score/})).toHaveCount(0);
  145 |   await expect(a.getByTestId('scorer-court-1')).toContainText(/host/i);
  146 | 
  147 |   await aCtx.close();await bCtx.close();
  148 | });
  149 | 
  150 | test('finished KOTC: existing player scorer link becomes the final results link on Refresh Round',async({browser})=>{
  151 |   const model=createModel();
  152 |   const ctx=await browser.newContext({viewport:{width:390,height:844}});await install(ctx,model);const page=await openScorer(ctx);
  153 |   model.setFinished(true);
  154 |   await page.getByTestId('scorer-refresh').click();
  155 |   await expect(page.getByTestId('kotc-results-redirected')).toBeVisible({timeout:1600});
  156 |   await ctx.close();
  157 | });
  158 | 
  159 | test('scorer reconciles committed save when Base44 response is lost and ignores double tap',async({browser})=>{
  160 |   const model=createModel();model.setCommitThenFail(1);
  161 |   const ctx=await browser.newContext({viewport:{width:390,height:844}});await install(ctx,model);const page=await openScorer(ctx);
  162 |   const card=await fillCourt(page,1,11,4),save=card.getByRole('button',{name:'Save Result'});
  163 |   await save.evaluate(el=>{el.dispatchEvent(new MouseEvent('click',{bubbles:true}));el.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
  164 |   await expect(card).toContainText('Score saved: 11–4');await expect(card).not.toContainText(/Response lost|Save failed|rate limit/i);
  165 |   expect(model.matches[0].revision).toBe(1);expect(model.matches[0].team_a_score).toBe(11);expect(model.matches[0].team_b_score).toBe(4);
  166 |   expect(model.calls.filter(c=>c.action==='save').length).toBe(1);
  167 |   await ctx.close();
  168 | });
```