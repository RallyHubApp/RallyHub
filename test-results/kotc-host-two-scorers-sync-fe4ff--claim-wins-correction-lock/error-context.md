# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-two-scorers-sync.spec.mjs >> host/helper simultaneous correction attempts use first-claim-wins correction lock
- Location: e2e/kotc-host-two-scorers-sync.spec.mjs:238:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 12
Received: 11
```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Round 1 — LIVE
        - paragraph [ref=e8]: 4 courts · 2 bench · 1/4 scores saved
      - generic [ref=e9]:
        - button "Roster" [ref=e10] [cursor=pointer]
        - button "Leaderboard" [ref=e11] [cursor=pointer]
        - button "Links" [ref=e12] [cursor=pointer]
        - button "Menu" [ref=e13] [cursor=pointer]
    - generic [ref=e14]:
      - paragraph [ref=e15]: What happens next
      - paragraph [ref=e16]: Round 1 live · 1/4 scores saved
      - paragraph [ref=e17]: "Next: collect Court 2, Court 3, Court 4 results. You can correct any saved score before advancing."
    - generic [ref=e18]:
      - button "Change players / bench · Live round" [ref=e19] [cursor=pointer]
      - paragraph [ref=e20]: No need to restart or return to setup. Scored courts remain protected.
    - generic [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e23]:
          - paragraph [ref=e24]: Play Time
          - paragraph [ref=e25]: 8 min round timer
        - generic [ref=e26]:
          - button "Test speaker and spoken announcement" [ref=e27] [cursor=pointer]
          - button "Float and move timer" [ref=e28] [cursor=pointer]
          - button "Full screen timer" [ref=e29] [cursor=pointer]
      - generic [ref=e30]: 06:58
      - paragraph [ref=e34]: Cue and announcements play at full RallyHub volume using this device’s default voice. Set the actual hall loudness with the device media-volume buttons before play.
      - generic [ref=e35]:
        - button "Pause Timer" [ref=e36] [cursor=pointer]
        - button "Reset" [ref=e37] [cursor=pointer]
      - paragraph [ref=e38]: Tap the speaker once before play to enable sound. The timer itself starts automatically when the sporting round starts.
    - paragraph [ref=e39]: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
    - generic [ref=e40]: Undo Start unavailable. A score has already been entered or saved for this round. Correct the score if needed, or continue the round; RallyHub will not silently rewind scored play.
    - generic [ref=e41]:
      - paragraph [ref=e42]: Bench This Round
      - paragraph [ref=e43]: Player 17 · Player 18
    - generic [ref=e44]: 1 of 4 saved — Waiting for Court 2, Court 3, Court 4
    - generic [ref=e46]:
      - generic [ref=e47]:
        - paragraph [ref=e48]: Player Scores
        - paragraph [ref=e49]: 1/4 saved
        - paragraph [ref=e50]: When the courts give the thumbs-up, refresh once to pull in their latest scores.
      - button "Refresh Player Scores" [ref=e52] [cursor=pointer]
    - generic [ref=e53]:
      - generic [ref=e54]:
        - generic [ref=e55]:
          - generic [ref=e56]: Court 1
          - generic [ref=e60]: SAVED
        - generic [ref=e61]:
          - generic [ref=e62]:
            - paragraph [ref=e63]: Team A
            - paragraph [ref=e64]: Player 01 & Player 02
            - paragraph [ref=e71]: WINNERS
          - textbox [disabled] [ref=e72]: "11"
        - generic [ref=e73]:
          - generic [ref=e74]:
            - paragraph [ref=e75]: Team B
            - paragraph [ref=e76]: Player 03 & Player 04
          - textbox [disabled] [ref=e77]: "2"
        - generic [ref=e78]: ✓ Saved 11–2 · Player 01 & Player 02 win 11–2
        - button "Edit result" [ref=e79] [cursor=pointer]
      - generic [ref=e80]:
        - generic [ref=e81]:
          - generic [ref=e82]: Court 2
          - generic [ref=e84]: LIVE
        - generic [ref=e85]:
          - generic [ref=e86]:
            - paragraph [ref=e87]: Team A
            - paragraph [ref=e88]: Player 05 & Player 06
          - textbox [ref=e89]
        - generic [ref=e90]:
          - generic [ref=e91]:
            - paragraph [ref=e92]: Team B
            - paragraph [ref=e93]: Player 07 & Player 08
          - textbox [ref=e94]
        - generic [ref=e95]: Start typing in either score box to claim this court as host.
      - generic [ref=e96]:
        - generic [ref=e97]:
          - generic [ref=e98]: Court 3
          - generic [ref=e100]: LIVE
        - generic [ref=e101]:
          - generic [ref=e102]:
            - paragraph [ref=e103]: Team A
            - paragraph [ref=e104]: Player 09 & Player 10
          - textbox [ref=e105]
        - generic [ref=e106]:
          - generic [ref=e107]:
            - paragraph [ref=e108]: Team B
            - paragraph [ref=e109]: Player 11 & Player 12
          - textbox [ref=e110]
        - generic [ref=e111]: Start typing in either score box to claim this court as host.
      - generic [ref=e112]:
        - generic [ref=e113]:
          - generic [ref=e114]: Court 4
          - generic [ref=e116]: LIVE
        - generic [ref=e117]:
          - generic [ref=e118]:
            - paragraph [ref=e119]: Team A
            - paragraph [ref=e120]: Player 13 & Player 14
          - textbox [ref=e121]
        - generic [ref=e122]:
          - generic [ref=e123]:
            - paragraph [ref=e124]: Team B
            - paragraph [ref=e125]: Player 15 & Player 16
          - textbox [ref=e126]
        - generic [ref=e127]: Start typing in either score box to claim this court as host.
    - generic [ref=e128]:
      - generic [ref=e129]:
        - paragraph [ref=e130]: Round 1 · 1/4 scores showing on this device
        - paragraph [ref=e131]: If players used the court scoring link, press the button below. RallyHub will check the latest saved court scores before advancing.
      - button "Check Scores & Prepare Next Round" [ref=e133] [cursor=pointer]
  - generic [ref=e134]:
    - button "Scroll up" [ref=e135] [cursor=pointer]
    - button "Scroll down" [disabled]
```

# Test source

```ts
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
  225 |     await expect(scorer.getByTestId('scorer-court-1')).toContainText('locked to you');
  226 |   }else{
  227 |     await expect(scorerInput).toHaveValue('9');
  228 |     await expect(hostInput).toHaveValue('');
  229 |     await scorer.getByTestId('scorer-court-1').getByRole('button',{name:'Cancel'}).click();
  230 |     await host.getByTestId('kotc-refresh-player-scores').click();
  231 |     await hostInput.fill('4');await expect(hostInput).toHaveValue('4');
  232 |     await expect(host.getByTestId('kotc-score-card-1')).toContainText('HOST ENTERING');
  233 |   }
  234 |   expect(model.matches[0].scoring_lock_owner).toBeTruthy();
  235 |   await hostCtx.close();await scorerCtx.close();
  236 | });
  237 | 
  238 | test('host/helper simultaneous correction attempts use first-claim-wins correction lock',async({browser})=>{
  239 |   const model=createModel();
  240 |   const hostCtx=await browser.newContext({viewport:{width:1280,height:900}}),scorerCtx=await browser.newContext({viewport:{width:390,height:844}});
  241 |   await install(hostCtx,model,'host');await install(scorerCtx,model,'scorer-a');
  242 |   const host=await hostCtx.newPage();await host.goto('/e2e/kotcHarness.html');await expect(host.getByText('Round 1 — LIVE')).toBeVisible();
  243 |   const scorer=await openScorer(scorerCtx);
  244 | 
  245 |   const helperCard=await fillCourt(scorer,1,11,2);await helperCard.getByRole('button',{name:'Save Result'}).click();await expect(helperCard).toContainText('Score saved: 11–2');
  246 |   await host.getByTestId('kotc-refresh-player-scores').click();await expect(host.getByTestId('kotc-score-card-1')).toContainText('Saved 11–2');
  247 |   const hostEdit=host.getByTestId('kotc-score-card-1').getByRole('button',{name:'Edit result'}),helperEdit=helperCard.getByRole('button',{name:/Undo \/ Update Score/});
  248 |   await Promise.allSettled([hostEdit.click(),helperEdit.click()]);
  249 |   await host.waitForTimeout(250);
  250 | 
  251 |   const scorerClaim=[...model.calls].reverse().find(c=>c.source==='scorer-a'&&c.name==='kotcScorer'&&c.body.action==='claim');
  252 |   const scorerClient=scorerClaim?.body.clientId;const owner=model.matches[0].scoring_lock_owner;
  253 |   expect(['host:host-e2e',scorerClient]).toContain(owner);
  254 |   if(owner==='host:host-e2e'){
  255 |     await host.getByTestId('kotc-score-1-a').fill('12');await host.getByTestId('kotc-score-1-b').fill('3');
  256 |     await host.getByTestId('kotc-score-card-1').getByRole('button',{name:'Save Correction'}).click();
  257 |   }else{
  258 |     await helperCard.locator('input').nth(0).fill('12');await helperCard.locator('input').nth(1).fill('3');
  259 |     await helperCard.getByRole('button',{name:'Save Updated Score'}).click();
  260 |   }
  261 |   await expect.poll(()=>model.matches[0].revision).toBe(2);
> 262 |   expect(model.matches[0].team_a_score).toBe(12);expect(model.matches[0].team_b_score).toBe(3);expect(model.matches[0].scoring_lock_owner).toBe(null);
      |                                         ^ Error: expect(received).toBe(expected) // Object.is equality
  263 |   await hostCtx.close();await scorerCtx.close();
  264 | });
  265 | 
  266 | test('stale helper correction button cannot bypass the 90-second correction window',async({browser})=>{
  267 |   const model=createModel();
  268 |   const hostCtx=await browser.newContext({viewport:{width:1280,height:900}}),scorerCtx=await browser.newContext({viewport:{width:390,height:844}});
  269 |   await install(hostCtx,model,'host');await install(scorerCtx,model,'scorer-a');
  270 |   const host=await hostCtx.newPage();await host.goto('/e2e/kotcHarness.html');await expect(host.getByText('Round 1 — LIVE')).toBeVisible();
  271 |   const scorer=await openScorer(scorerCtx);const card=await fillCourt(scorer,1,11,2);await card.getByRole('button',{name:'Save Result'}).click();
  272 |   await expect(card).toContainText('Score saved: 11–2');await expect(card.getByRole('button',{name:/Undo \/ Update Score/})).toBeVisible();
  273 | 
  274 |   // Simulate the helper leaving this stale page open until the server-side 90-second window expires.
  275 |   model.matches[0].completed_at=new Date(Date.now()-91000).toISOString();
  276 |   await card.getByRole('button',{name:/Undo \/ Update Score/}).click();
  277 |   await expect(card.getByRole('button',{name:/Undo \/ Update Score/})).toHaveCount(0);
  278 |   await expect(card).toContainText('Result already entered');
  279 |   expect(model.matches[0].revision).toBe(1);expect(model.matches[0].team_a_score).toBe(11);expect(model.matches[0].team_b_score).toBe(2);
  280 | 
  281 |   // Host authority to correct remains available after the helper window closes.
  282 |   await host.getByTestId('kotc-refresh-player-scores').click();await expect(host.getByTestId('kotc-score-card-1')).toContainText('Saved 11–2');
  283 |   await host.getByTestId('kotc-score-card-1').getByRole('button',{name:'Edit result'}).click();await expect(host.getByTestId('kotc-score-card-1')).toContainText('HOST ENTERING');
  284 |   await host.getByTestId('kotc-score-card-1').getByRole('button',{name:'Cancel'}).click();
  285 |   await hostCtx.close();await scorerCtx.close();
  286 | });
  287 | 
  288 | test('Prepare Next Round immediately cuts off helper correction rights even on a stale scorer screen',async({browser})=>{
  289 |   const model=createModel();const scorerCtx=await browser.newContext({viewport:{width:390,height:844}});await install(scorerCtx,model,'scorer-a');
  290 |   const scorer=await openScorer(scorerCtx);const card=await fillCourt(scorer,1,11,3);await card.getByRole('button',{name:'Save Result'}).click();
  291 |   await expect(card).toContainText('Score saved: 11–3');await expect(card.getByRole('button',{name:/Undo \/ Update Score/})).toBeVisible();
  292 | 
  293 |   // Simulate host preparing/starting Round 2 while helper still has the old Round 1 screen open.
  294 |   const round2Matches=model.matches.slice(0,4).map((m,i)=>({...m,id:`match-r2-${i+1}`,round_id:'round-2',round_number:2,status:'scheduled',revision:0,team_a_score:null,team_b_score:null,winner_side:null,completed_at:null,scoring_lock_owner:null,scoring_lock_expires_at:null,scorer_correction_owner_client_id:null}));
  295 |   model.matches.push(...round2Matches);model.round={id:'round-2',session_id:model.session.id,round_number:2,status:'started',proposal_revision:1,active_court_count:4,bench_count:2};model.session.current_round_number=2;model.session.current_round_id='round-2';model.session.revision+=1;
  296 | 
  297 |   // Stale helper action must be rejected against the old match, then refresh to the new round.
  298 |   await card.getByRole('button',{name:/Undo \/ Update Score/}).click();
  299 |   await expect(scorer.getByText('Round 2')).toBeVisible();await expect(scorer.getByTestId('scorer-court-1')).not.toContainText('Score saved: 11–3');
  300 |   await expect(scorer.getByTestId('scorer-court-1').getByRole('button',{name:/Undo \/ Update Score/})).toHaveCount(0);
  301 |   expect(model.matches[0].revision).toBe(1);expect(model.matches[0].team_a_score).toBe(11);expect(model.matches[0].team_b_score).toBe(3);
  302 |   await scorerCtx.close();
  303 | });
  304 | 
  305 | test('four scorer phones recover from simultaneous 429 claim/save burst with bounded calls',async({browser})=>{
  306 |   test.setTimeout(60000);
  307 |   const model=createModel();
  308 |   const hostCtx=await browser.newContext({viewport:{width:1280,height:900}});await install(hostCtx,model,'host');
  309 |   const host=await hostCtx.newPage();await host.goto('/e2e/kotcHarness.html');await expect(host.getByText('Round 1 — LIVE')).toBeVisible();
  310 |   const contexts=[],pages=[];
  311 |   for(let i=1;i<=4;i++){
  312 |     const ctx=await browser.newContext({viewport:{width:390,height:844}});contexts.push(ctx);await install(ctx,model,`scorer-${i}`);pages.push(await openScorer(ctx));
  313 |     model.setRateLimit(`scorer-${i}`,'kotcScorer','claim',1);model.setRateLimit(`scorer-${i}`,'kotcScorer','save',1);
  314 |   }
  315 |   const stateBefore=model.calls.filter(c=>c.name==='kotcScorer'&&c.body.action==='state').length;
  316 |   await pages[0].waitForTimeout(5500);
  317 |   expect(model.calls.filter(c=>c.name==='kotcScorer'&&c.body.action==='state').length).toBe(stateBefore);
  318 | 
  319 |   await Promise.all(pages.map((p,i)=>p.getByTestId(`scorer-court-${i+1}`).locator('input').nth(0).fill(String(i+1))));
  320 |   for(let i=0;i<4;i++){
  321 |     const card=pages[i].getByTestId(`scorer-court-${i+1}`);await expect(card).toContainText('locked to you');await expect(card).not.toContainText(/rate limit/i);
  322 |     await card.locator('input').nth(0).fill('11');await card.locator('input').nth(1).fill(String(i+1));
  323 |   }
  324 | 
  325 |   await Promise.all(pages.map((p,i)=>p.getByTestId(`scorer-court-${i+1}`).getByRole('button',{name:'Save Result'}).click()));
  326 |   for(let i=0;i<4;i++){const card=pages[i].getByTestId(`scorer-court-${i+1}`);await expect(card).toContainText(`Score saved: 11–${i+1}`);await expect(card).not.toContainText(/rate limit/i);}
  327 |   expect(model.matches.every(m=>m.status==='completed'&&m.revision===1&&!m.scoring_lock_owner)).toBe(true);
  328 | 
  329 |   await expect(host.getByTestId('kotc-player-score-toolbar')).toContainText('0/4 saved');
  330 |   await host.getByTestId('kotc-refresh-player-scores').click();await expect(host.getByText('All scores saved for Round 1')).toBeVisible();
  331 |   await expect(host.getByTestId('kotc-player-score-toolbar')).toContainText('4/4 saved');
  332 | 
  333 |   const scorerCalls=model.calls.filter(c=>c.name==='kotcScorer');
  334 |   const claimCalls=scorerCalls.filter(c=>c.body.action==='claim').length,saveCalls=scorerCalls.filter(c=>c.body.action==='save').length,stateCalls=scorerCalls.filter(c=>c.body.action==='state').length,heartbeatCalls=scorerCalls.filter(c=>c.body.action==='heartbeat').length;
  335 |   expect(claimCalls).toBe(8);expect(saveCalls).toBe(8);expect(stateCalls).toBeLessThanOrEqual(8);expect(heartbeatCalls).toBe(0);
  336 |   console.log('KOTC COLLABORATIVE SCORING PRESSURE',JSON.stringify({claimCalls,saveCalls,stateCalls,heartbeatCalls,totalScorerCalls:scorerCalls.length,hostLiveRefreshes:model.calls.filter(c=>c.source==='host'&&c.name==='getKotcV2State'&&c.body.liveScoresOnly).length},null,2));
  337 | 
  338 |   for(const ctx of contexts)await ctx.close();await hostCtx.close();
  339 | });
  340 | 
```