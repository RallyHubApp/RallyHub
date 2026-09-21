# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-two-scorers-sync.spec.mjs >> same-millisecond host/helper first digits leave exactly one court owner
- Location: e2e/kotc-host-two-scorers-sync.spec.mjs:203:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  getByTestId('kotc-score-1-a')
Expected: ""
Received: "8"
Timeout:  3000ms

Call log:
  - Expect "toHaveValue" getByTestId('kotc-score-1-a') with timeout 3000ms
  - waiting for getByTestId('kotc-score-1-a')
    10 × locator resolved to <input disabled value="8" type="text" maxlength="2" pattern="[0-9]*" inputmode="numeric" data-dynamic-content="true" data-testid="kotc-score-1-a" data-source-location="src/components/kotc/KotcV2SessionView.jsx:83:192" class="flex w-full rounded-md border-input bg-transparent px-3 py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring …/>
       - unexpected value "8"

```

```yaml
- textbox [disabled]: "8"
```

# Test source

```ts
  127 |   await a.getByTestId('scorer-court-1').locator('input').nth(0).fill('1');
  128 |   await b.getByTestId('scorer-court-2').locator('input').nth(0).fill('7');
  129 |   await expect(a.getByTestId('scorer-court-1')).toContainText('locked to you');
  130 |   await expect(b.getByTestId('scorer-court-2')).toContainText('locked to you');
  131 | 
  132 |   // Host learns ownership only when deliberately refreshing; claimed player courts become unavailable to host.
  133 |   await host.getByTestId('kotc-refresh-player-scores').click();
  134 |   await expect(host.getByTestId('kotc-score-card-1')).toContainText('Player entering this court');
  135 |   await expect(host.getByTestId('kotc-score-1-a')).toBeDisabled();
  136 |   await expect(host.getByTestId('kotc-score-card-2')).toContainText('Player entering this court');
  137 |   await expect(host.getByTestId('kotc-score-2-a')).toBeDisabled();
  138 | 
  139 |   // Host claims a different free court on the first actual digit. The scorer page does not poll;
  140 |   // one explicit scorer refresh reveals the host lock.
  141 |   await host.getByTestId('kotc-score-3-a').fill('6');
  142 |   await expect(host.getByTestId('kotc-score-card-3')).toContainText('HOST ENTERING');
  143 |   await a.getByTestId('scorer-refresh').click();
  144 |   await expect(a.getByTestId('scorer-court-3')).toContainText(/host or another scorer|LOCKED/);
  145 | 
  146 |   // All three can score in parallel on separate courts.
  147 |   const cardA=await fillCourt(a,1,11,1),cardB=await fillCourt(b,2,7,8);
  148 |   await host.getByTestId('kotc-score-3-b').fill('4');
  149 |   await Promise.all([
  150 |     cardA.getByRole('button',{name:'Save Result'}).click(),
  151 |     cardB.getByRole('button',{name:'Save Result'}).click(),
  152 |     host.getByTestId('kotc-complete-3').click(),
  153 |   ]);
  154 |   await expect(cardA).toContainText('Score saved: 11–1');await expect(cardB).toContainText('Score saved: 7–8');await expect(host.getByTestId('kotc-score-card-3')).toContainText('Saved 6–4');
  155 | 
  156 |   // Player saves do not magically appear on host: host has only its local Court 3 result until a deliberate action.
  157 |   await expect(host.getByTestId('kotc-next-action')).toContainText('1/4 scores saved');
  158 |   await expect(host.getByTestId('kotc-player-score-toolbar')).toBeVisible();
  159 |   await expect(host.getByTestId('kotc-player-score-toolbar')).toContainText('1/4 saved');
  160 |   const toolbarBeforeCourtOne=await host.evaluate(()=>{const toolbar=document.querySelector('[data-testid="kotc-player-score-toolbar"]'),court=document.querySelector('[data-testid="kotc-score-card-1"]');if(!toolbar||!court)return false;return !!(toolbar.compareDocumentPosition(court)&Node.DOCUMENT_POSITION_FOLLOWING);});
  161 |   expect(toolbarBeforeCourtOne,'Player Scores refresh toolbar should sit immediately before the court score grid').toBe(true);
  162 |   const refreshReadsBefore=model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length;
  163 |   await host.waitForTimeout(1500);
  164 |   expect(model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length).toBe(refreshReadsBefore);
  165 | 
  166 |   // Normal manual refresh pulls both player saves in and remains cheap.
  167 |   await host.getByTestId('kotc-refresh-player-scores').click();
  168 |   await expect(host.getByTestId('kotc-next-action')).toContainText('3/4 scores saved');
  169 |   await expect(host.getByTestId('kotc-score-card-1')).toContainText('Saved 11–1');
  170 |   await expect(host.getByTestId('kotc-score-card-2')).toContainText('Saved 7–8');
  171 | 
  172 |   // Host can take the remaining free court on first digit and finish the round locally.
  173 |   await host.getByTestId('kotc-score-4-a').fill('9');await host.getByTestId('kotc-score-4-b').fill('5');await host.getByTestId('kotc-complete-4').click();
  174 |   await expect(host.getByText('All scores saved for Round 1')).toBeVisible();
  175 | 
  176 |   await hostCtx.close();await aCtx.close();await bCtx.close();
  177 | });
  178 | 
  179 | test('stale host cannot type over a helper score that was already saved',async({browser})=>{
  180 |   const model=createModel();
  181 |   const hostCtx=await browser.newContext({viewport:{width:1280,height:900}}),scorerCtx=await browser.newContext({viewport:{width:390,height:844}});
  182 |   await install(hostCtx,model,'host');await install(scorerCtx,model,'scorer-a');
  183 |   const host=await hostCtx.newPage();await host.goto('/e2e/kotcHarness.html');await expect(host.getByText('Round 1 — LIVE')).toBeVisible();
  184 |   const scorer=await openScorer(scorerCtx);
  185 | 
  186 |   // Host deliberately never refreshes after the helper starts. From the host's stale local view Court 1 still looks free.
  187 |   const helperCard=await fillCourt(scorer,1,11,2);await helperCard.getByRole('button',{name:'Save Result'}).click();
  188 |   await expect(helperCard).toContainText('Score saved: 11–2');
  189 |   await expect(host.getByTestId('kotc-score-1-a')).toHaveValue('');
  190 |   await expect(host.getByTestId('kotc-score-1-a')).toBeEnabled();
  191 | 
  192 |   // First attempted host digit hits the authoritative claim endpoint. Because the helper already saved,
  193 |   // the digit must never appear; the UI performs one lightweight refresh and renders 11–2 instead.
  194 |   await host.getByTestId('kotc-score-1-a').fill('5');
  195 |   await expect(host.getByTestId('kotc-score-card-1')).toContainText('Saved 11–2');
  196 |   await expect(host.getByTestId('kotc-score-1-a')).toHaveValue('11');
  197 |   expect(model.matches[0].team_a_score).toBe(11);expect(model.matches[0].team_b_score).toBe(2);expect(model.matches[0].revision).toBe(1);
  198 |   expect(model.calls.some(c=>c.source==='host'&&c.name==='kotcCommand'&&c.body.commandType==='host_claim_score')).toBe(true);
  199 | 
  200 |   await hostCtx.close();await scorerCtx.close();
  201 | });
  202 | 
  203 | test('same-millisecond host/helper first digits leave exactly one court owner',async({browser})=>{
  204 |   const model=createModel();
  205 |   const hostCtx=await browser.newContext({viewport:{width:1280,height:900}}),scorerCtx=await browser.newContext({viewport:{width:390,height:844}});
  206 |   await install(hostCtx,model,'host');await install(scorerCtx,model,'scorer-a');
  207 |   const host=await hostCtx.newPage();await host.goto('/e2e/kotcHarness.html');await expect(host.getByText('Round 1 — LIVE')).toBeVisible();
  208 |   const scorer=await openScorer(scorerCtx);
  209 |   const hostInput=host.getByTestId('kotc-score-1-a'),scorerInput=scorer.getByTestId('scorer-court-1').locator('input').nth(0);
  210 | 
  211 |   await Promise.allSettled([hostInput.fill('8'),scorerInput.fill('9')]);
  212 |   await host.waitForTimeout(250);
  213 |   const scorerClaim=model.calls.find(c=>c.source==='scorer-a'&&c.name==='kotcScorer'&&c.body.action==='claim');
  214 |   const scorerClient=scorerClaim?.body.clientId;
  215 |   const owner=model.matches[0].scoring_lock_owner;
  216 |   expect(['host:host-e2e',scorerClient]).toContain(owner);
  217 |   expect(owner).toBeTruthy();
  218 | 
  219 |   if(owner==='host:host-e2e'){
  220 |     await expect(hostInput).toHaveValue('8');
  221 |     await expect(scorerInput).toHaveValue('');
  222 |     await host.getByTestId('kotc-score-card-1').getByRole('button',{name:'Cancel'}).click();
  223 |     await scorer.getByTestId('scorer-refresh').click();
  224 |     await scorerInput.fill('4');await expect(scorerInput).toHaveValue('4');
  225 |   }else{
  226 |     await expect(scorerInput).toHaveValue('9');
> 227 |     await expect(hostInput).toHaveValue('');
      |                             ^ Error: expect(locator).toHaveValue(expected) failed
  228 |     await scorer.getByTestId('scorer-court-1').getByRole('button',{name:'Cancel'}).click();
  229 |     await host.getByTestId('kotc-refresh-player-scores').click();
  230 |     await hostInput.fill('4');await expect(hostInput).toHaveValue('4');
  231 |   }
  232 |   expect(model.matches[0].scoring_lock_owner).toBeTruthy();
  233 |   await hostCtx.close();await scorerCtx.close();
  234 | });
  235 | 
  236 | test('host/helper simultaneous correction attempts use first-claim-wins correction lock',async({browser})=>{
  237 |   const model=createModel();
  238 |   const hostCtx=await browser.newContext({viewport:{width:1280,height:900}}),scorerCtx=await browser.newContext({viewport:{width:390,height:844}});
  239 |   await install(hostCtx,model,'host');await install(scorerCtx,model,'scorer-a');
  240 |   const host=await hostCtx.newPage();await host.goto('/e2e/kotcHarness.html');await expect(host.getByText('Round 1 — LIVE')).toBeVisible();
  241 |   const scorer=await openScorer(scorerCtx);
  242 | 
  243 |   const helperCard=await fillCourt(scorer,1,11,2);await helperCard.getByRole('button',{name:'Save Result'}).click();await expect(helperCard).toContainText('Score saved: 11–2');
  244 |   await host.getByTestId('kotc-refresh-player-scores').click();await expect(host.getByTestId('kotc-score-card-1')).toContainText('Saved 11–2');
  245 |   const hostEdit=host.getByTestId('kotc-score-card-1').getByRole('button',{name:'Edit result'}),helperEdit=helperCard.getByRole('button',{name:/Undo \/ Update Score/});
  246 |   await Promise.allSettled([hostEdit.click(),helperEdit.click()]);
  247 |   await host.waitForTimeout(250);
  248 | 
  249 |   const scorerClaim=[...model.calls].reverse().find(c=>c.source==='scorer-a'&&c.name==='kotcScorer'&&c.body.action==='claim');
  250 |   const scorerClient=scorerClaim?.body.clientId;const owner=model.matches[0].scoring_lock_owner;
  251 |   expect(['host:host-e2e',scorerClient]).toContain(owner);
  252 |   if(owner==='host:host-e2e'){
  253 |     await host.getByTestId('kotc-score-1-a').fill('12');await host.getByTestId('kotc-score-1-b').fill('3');
  254 |     await host.getByTestId('kotc-score-card-1').getByRole('button',{name:'Save Correction'}).click();
  255 |   }else{
  256 |     await helperCard.locator('input').nth(0).fill('12');await helperCard.locator('input').nth(1).fill('3');
  257 |     await helperCard.getByRole('button',{name:'Save Updated Score'}).click();
  258 |   }
  259 |   await expect.poll(()=>model.matches[0].revision).toBe(2);
  260 |   expect(model.matches[0].team_a_score).toBe(12);expect(model.matches[0].team_b_score).toBe(3);expect(model.matches[0].scoring_lock_owner).toBe(null);
  261 |   await hostCtx.close();await scorerCtx.close();
  262 | });
  263 | 
  264 | test('stale helper correction button cannot bypass the 90-second correction window',async({browser})=>{
  265 |   const model=createModel();
  266 |   const hostCtx=await browser.newContext({viewport:{width:1280,height:900}}),scorerCtx=await browser.newContext({viewport:{width:390,height:844}});
  267 |   await install(hostCtx,model,'host');await install(scorerCtx,model,'scorer-a');
  268 |   const host=await hostCtx.newPage();await host.goto('/e2e/kotcHarness.html');await expect(host.getByText('Round 1 — LIVE')).toBeVisible();
  269 |   const scorer=await openScorer(scorerCtx);const card=await fillCourt(scorer,1,11,2);await card.getByRole('button',{name:'Save Result'}).click();
  270 |   await expect(card).toContainText('Score saved: 11–2');await expect(card.getByRole('button',{name:/Undo \/ Update Score/})).toBeVisible();
  271 | 
  272 |   // Simulate the helper leaving this stale page open until the server-side 90-second window expires.
  273 |   model.matches[0].completed_at=new Date(Date.now()-91000).toISOString();
  274 |   await card.getByRole('button',{name:/Undo \/ Update Score/}).click();
  275 |   await expect(card.getByRole('button',{name:/Undo \/ Update Score/})).toHaveCount(0);
  276 |   await expect(card).toContainText('Result already entered');
  277 |   expect(model.matches[0].revision).toBe(1);expect(model.matches[0].team_a_score).toBe(11);expect(model.matches[0].team_b_score).toBe(2);
  278 | 
  279 |   // Host authority to correct remains available after the helper window closes.
  280 |   await host.getByTestId('kotc-refresh-player-scores').click();await expect(host.getByTestId('kotc-score-card-1')).toContainText('Saved 11–2');
  281 |   await host.getByTestId('kotc-score-card-1').getByRole('button',{name:'Edit result'}).click();await expect(host.getByTestId('kotc-score-card-1')).toContainText('HOST ENTERING');
  282 |   await host.getByTestId('kotc-score-card-1').getByRole('button',{name:'Cancel'}).click();
  283 |   await hostCtx.close();await scorerCtx.close();
  284 | });
  285 | 
  286 | test('Prepare Next Round immediately cuts off helper correction rights even on a stale scorer screen',async({browser})=>{
  287 |   const model=createModel();const scorerCtx=await browser.newContext({viewport:{width:390,height:844}});await install(scorerCtx,model,'scorer-a');
  288 |   const scorer=await openScorer(scorerCtx);const card=await fillCourt(scorer,1,11,3);await card.getByRole('button',{name:'Save Result'}).click();
  289 |   await expect(card).toContainText('Score saved: 11–3');await expect(card.getByRole('button',{name:/Undo \/ Update Score/})).toBeVisible();
  290 | 
  291 |   // Simulate host preparing/starting Round 2 while helper still has the old Round 1 screen open.
  292 |   const round2Matches=model.matches.slice(0,4).map((m,i)=>({...m,id:`match-r2-${i+1}`,round_id:'round-2',round_number:2,status:'scheduled',revision:0,team_a_score:null,team_b_score:null,winner_side:null,completed_at:null,scoring_lock_owner:null,scoring_lock_expires_at:null,scorer_correction_owner_client_id:null}));
  293 |   model.matches.push(...round2Matches);model.round={id:'round-2',session_id:model.session.id,round_number:2,status:'started',proposal_revision:1,active_court_count:4,bench_count:2};model.session.current_round_number=2;model.session.current_round_id='round-2';model.session.revision+=1;
  294 | 
  295 |   // Stale helper action must be rejected against the old match, then refresh to the new round.
  296 |   await card.getByRole('button',{name:/Undo \/ Update Score/}).click();
  297 |   await expect(scorer.getByText('Round 2')).toBeVisible();await expect(scorer.getByTestId('scorer-court-1')).not.toContainText('Score saved: 11–3');
  298 |   await expect(scorer.getByTestId('scorer-court-1').getByRole('button',{name:/Undo \/ Update Score/})).toHaveCount(0);
  299 |   expect(model.matches[0].revision).toBe(1);expect(model.matches[0].team_a_score).toBe(11);expect(model.matches[0].team_b_score).toBe(3);
  300 |   await scorerCtx.close();
  301 | });
  302 | 
  303 | test('four scorer phones recover from simultaneous 429 claim/save burst with bounded calls',async({browser})=>{
  304 |   test.setTimeout(60000);
  305 |   const model=createModel();
  306 |   const hostCtx=await browser.newContext({viewport:{width:1280,height:900}});await install(hostCtx,model,'host');
  307 |   const host=await hostCtx.newPage();await host.goto('/e2e/kotcHarness.html');await expect(host.getByText('Round 1 — LIVE')).toBeVisible();
  308 |   const contexts=[],pages=[];
  309 |   for(let i=1;i<=4;i++){
  310 |     const ctx=await browser.newContext({viewport:{width:390,height:844}});contexts.push(ctx);await install(ctx,model,`scorer-${i}`);pages.push(await openScorer(ctx));
  311 |     model.setRateLimit(`scorer-${i}`,'kotcScorer','claim',1);model.setRateLimit(`scorer-${i}`,'kotcScorer','save',1);
  312 |   }
  313 |   const stateBefore=model.calls.filter(c=>c.name==='kotcScorer'&&c.body.action==='state').length;
  314 |   await pages[0].waitForTimeout(5500);
  315 |   expect(model.calls.filter(c=>c.name==='kotcScorer'&&c.body.action==='state').length).toBe(stateBefore);
  316 | 
  317 |   await Promise.all(pages.map((p,i)=>p.getByTestId(`scorer-court-${i+1}`).locator('input').nth(0).fill(String(i+1))));
  318 |   for(let i=0;i<4;i++){
  319 |     const card=pages[i].getByTestId(`scorer-court-${i+1}`);await expect(card).toContainText('locked to you');await expect(card).not.toContainText(/rate limit/i);
  320 |     await card.locator('input').nth(0).fill('11');await card.locator('input').nth(1).fill(String(i+1));
  321 |   }
  322 | 
  323 |   await Promise.all(pages.map((p,i)=>p.getByTestId(`scorer-court-${i+1}`).getByRole('button',{name:'Save Result'}).click()));
  324 |   for(let i=0;i<4;i++){const card=pages[i].getByTestId(`scorer-court-${i+1}`);await expect(card).toContainText(`Score saved: 11–${i+1}`);await expect(card).not.toContainText(/rate limit/i);}
  325 |   expect(model.matches.every(m=>m.status==='completed'&&m.revision===1&&!m.scoring_lock_owner)).toBe(true);
  326 | 
  327 |   await expect(host.getByTestId('kotc-player-score-toolbar')).toContainText('0/4 saved');
```