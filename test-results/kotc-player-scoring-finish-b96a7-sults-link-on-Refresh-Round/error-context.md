# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-player-scoring.spec.mjs >> finished KOTC: existing player scorer link becomes the final results link on Refresh Round
- Location: e2e/kotc-player-scoring.spec.mjs:150:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-final-round-results-help')
Expected substring: "This same player link will then open the final results"
Received string:    "Final roundWhen the host presses Finish King of the Court, tap Refresh / View Results — or simply refresh this page. This same player link will then open the final podium and saved round results."
Timeout: 3000ms

Call log:
  - Expect "toContainText" getByTestId('kotc-final-round-results-help') with timeout 3000ms
  - waiting for getByTestId('kotc-final-round-results-help')
    10 × locator resolved to <div data-dynamic-content="false" data-testid="kotc-final-round-results-help" data-source-location="src/pages/PublicKotcScorer.jsx:60:1311" class="mt-3 rounded-lg border border-primary/25 bg-primary/5 p-3 text-left">…</div>
       - unexpected value "Final roundWhen the host presses Finish King of the Court, tap Refresh / View Results — or simply refresh this page. This same player link will then open the final podium and saved round results."

```

```yaml
- paragraph: Final round
- paragraph: When the host presses Finish King of the Court, tap Refresh / View Results — or simply refresh this page. This same player link will then open the final podium and saved round results.
```

# Test source

```ts
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
  114 |   await expect(card).toContainText('Score saved: 12–8');
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
> 153 |   await expect(page.getByTestId('kotc-final-round-results-help')).toContainText('This same player link will then open the final results');
      |                                                                   ^ Error: expect(locator).toContainText(expected) failed
  154 |   await expect(page.getByTestId('scorer-refresh')).toContainText('Refresh / View Results');
  155 |   model.setFinished(true);
  156 |   await page.getByTestId('scorer-refresh').click();
  157 |   await expect(page.getByTestId('kotc-results-redirected')).toBeVisible({timeout:1600});
  158 |   await ctx.close();
  159 | });
  160 | 
  161 | test('scorer reconciles committed save when Base44 response is lost and ignores double tap',async({browser})=>{
  162 |   const model=createModel();model.setCommitThenFail(1);
  163 |   const ctx=await browser.newContext({viewport:{width:390,height:844}});await install(ctx,model);const page=await openScorer(ctx);
  164 |   const card=await fillCourt(page,1,11,4),save=card.getByRole('button',{name:'Save Result'});
  165 |   await save.evaluate(el=>{el.dispatchEvent(new MouseEvent('click',{bubbles:true}));el.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
  166 |   await expect(card).toContainText('Score saved: 11–4');await expect(card).not.toContainText(/Response lost|Save failed|rate limit/i);
  167 |   expect(model.matches[0].revision).toBe(1);expect(model.matches[0].team_a_score).toBe(11);expect(model.matches[0].team_b_score).toBe(4);
  168 |   expect(model.calls.filter(c=>c.action==='save').length).toBe(1);
  169 |   await ctx.close();
  170 | });
```