# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> KOTC hall-pressure simulator: 18 players, 12 rounds, slow provider, rapid scoring, phone focus churn
- Location: e2e/kotc-host-desktop.spec.mjs:586:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-host-action-status')
Expected substring: "Checking Round 2 scores"
Received string:    "Preparing Round 3… command sentRallyHub has accepted your tap. Keep this screen open; the button will stay locked until the action resolves."
Timeout: 300ms

Call log:
  - Expect "toContainText" getByTestId('kotc-host-action-status') with timeout 300ms
  - waiting for getByTestId('kotc-host-action-status')
    - locator resolved to <div data-dynamic-content="true" data-testid="kotc-host-action-status" data-source-location="src/components/kotc/KotcV2SessionView.jsx:308:15" class="sticky top-2 z-30 rounded-xl border-2 border-primary/40 bg-background/95 p-3 shadow-lg">…</div>
    - unexpected value "Preparing Round 3… command sentRallyHub has accepted your tap. Keep this screen open; the button will stay locked until the action resolves."

```

```yaml
- paragraph: Preparing Round 3… command sent
- paragraph: RallyHub has accepted your tap. Keep this screen open; the button will stay locked until the action resolves.
```

# Test source

```ts
  551 | test('Base44 resilience: genuine prepare failure stays explicit and safely retryable',async({page})=>{
  552 |   const model=createModel({failPrepareBeforeCommit:true});await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  553 |   await createAndStartRoundOne(page);await scoreCurrentRound(page,4,11);
  554 |   await page.getByTestId('kotc-prepare-next-round').click();
  555 |   await expect(page.getByTestId('kotc-prepare-status')).toContainText('Could not prepare the next round',{timeout:2200});
  556 |   expect(model.rounds.filter(r=>r.round_number===2)).toHaveLength(0);
  557 |   await expect(page.getByTestId('kotc-prepare-next-round')).toBeEnabled();
  558 | });
  559 | 
  560 | test('desktop usability: long host screens expose mouse-click up/down navigation',async({page})=>{
  561 |   const model=createModel();await installMockBackend(page,model);
  562 |   await page.goto('/e2e/kotcHarness.html');
  563 |   await expect(page.getByTestId('kotc-scroll-controls')).toBeVisible({timeout:1800});
  564 |   const before=await page.evaluate(()=>window.scrollY);
  565 |   await page.getByRole('button',{name:'Scroll down'}).click();
  566 |   await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(before+100);
  567 |   await expect(page.getByRole('button',{name:'Scroll up'})).toBeEnabled();
  568 |   await page.getByRole('button',{name:'Scroll up'}).click();
  569 |   await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeLessThan(120);
  570 | });
  571 | 
  572 | test('desktop timer: full screen centres a dominant clock and exits back into the page',async({page})=>{
  573 |   const model=createModel();await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  574 |   await createAndStartRoundOne(page);
  575 |   await page.getByTitle('Full screen timer').click();
  576 |   await expect(page.getByTitle('Exit full screen timer')).toBeVisible({timeout:1500});
  577 |   const metrics=await page.evaluate(()=>{const timer=document.querySelector('[data-testid="kotc-timer"]')?.getBoundingClientRect();const value=document.querySelector('[data-testid="kotc-timer-value"]')?.getBoundingClientRect();const style=getComputedStyle(document.querySelector('[data-testid="kotc-timer-value"]'));return{timer,value,fontSize:parseFloat(style.fontSize),w:innerWidth,h:innerHeight};});
  578 |   expect(metrics.timer.width).toBeGreaterThan(metrics.w*0.9);expect(metrics.timer.height).toBeGreaterThan(metrics.h*0.9);expect(metrics.fontSize).toBeGreaterThan(140);
  579 |   const valueCenterY=metrics.value.y+metrics.value.height/2;expect(Math.abs(valueCenterY-metrics.h/2)).toBeLessThan(metrics.h*0.22);
  580 |   await page.getByTitle('Exit full screen timer').click();
  581 |   await expect.poll(()=>page.evaluate(()=>document.fullscreenElement===null),{timeout:2000}).toBe(true);
  582 |   await expect(page.getByTitle('Full screen timer')).toBeVisible({timeout:1500});
  583 |   await expect.poll(async()=>Math.round((await page.getByTestId('kotc-timer').boundingBox())?.height||9999),{timeout:2000}).toBeLessThan(520);
  584 | });
  585 | 
  586 | test('KOTC hall-pressure simulator: 18 players, 12 rounds, slow provider, rapid scoring, phone focus churn',async({page},testInfo)=>{
  587 |   test.setTimeout(120000);
  588 |   await page.setViewportSize({width:390,height:844});
  589 |   const stressProfile={
  590 |     getKotcV2State:[220,900,350],
  591 |     createKotcV2Session:[850],
  592 |     startKotcRound:[1250,420,1750,680,1100,510,1500,760],
  593 |     saveKotcScore:[900,1650,520,1250,700,1450,430,1050],
  594 |     prepareKotcNextRound:[1850,620,2250,880,1600,700],
  595 |     kotcTimer:[70,110,60],
  596 |     endKotcSession:[1450],
  597 |   };
  598 |   const model=createModel({stressProfile});
  599 |   const report={rounds:12,start_ack_ms:[],start_confirm_ms:[],score_ack_ms:[],score_burst_confirm_ms:[],prepare_ack_ms:[],prepare_confirm_ms:[]};
  600 |   await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  601 |   await page.goto('/e2e/kotcHarness.html');
  602 |   await page.getByRole('button',{name:'Player 17',exact:true}).click();
  603 |   await page.getByRole('button',{name:'Player 18',exact:true}).click();
  604 |   await page.getByTestId('kotc-create-session').click();
  605 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:3000});
  606 | 
  607 |   for(let round=1;round<=12;round++){
  608 |     const start=page.getByTestId('kotc-start-round');
  609 |     await expect(start).toContainText(`START ROUND ${round}`);
  610 |     const startAt=Date.now();
  611 |     await start.click();
  612 |     await expect(start).toContainText('Starting…',{timeout:250});
  613 |     report.start_ack_ms.push(Date.now()-startAt);
  614 |     await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Starting Round ${round}`,{timeout:300});
  615 |     await sleep(180);
  616 |     await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:false}));});
  617 |     if(await page.getByTestId('kotc-host-action-status').isVisible().catch(()=>false)){
  618 |       await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Starting Round ${round}`);
  619 |       await expect(start).toBeDisabled();
  620 |     }
  621 |     await expect(page.getByText(`Round ${round} — LIVE`)).toBeVisible({timeout:3500});
  622 |     report.start_confirm_ms.push(Date.now()-startAt);
  623 | 
  624 |     const hostClaimsBefore=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  625 |     for(let court=1;court<=4;court++){
  626 |       await page.getByTestId(`kotc-score-${court}-a`).fill(String(8+((round+court)%6)));
  627 |       await page.getByTestId(`kotc-score-${court}-b`).fill(String(2+((round*2+court)%5)));
  628 |     }
  629 |     const burstAt=Date.now();
  630 |     for(let court=1;court<=4;court++){
  631 |       const button=page.getByTestId(`kotc-complete-${court}`);
  632 |       const ackAt=Date.now();
  633 |       await button.click();
  634 |       await expect(button).toContainText('Saving…',{timeout:250});
  635 |       report.score_ack_ms.push(Date.now()-ackAt);
  636 |     }
  637 |     await sleep(220);
  638 |     await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});
  639 |     for(let court=1;court<=4;court++)await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved',{timeout:3000});
  640 |     report.score_burst_confirm_ms.push(Date.now()-burstAt);
  641 |     const hostClaimsAfter=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  642 |     expect(hostClaimsAfter,`Round ${round} must not claim scorer leases when no player scorer owns a court`).toBe(hostClaimsBefore);
  643 |     await expect(page.getByText(`All scores saved for Round ${round}`)).toBeVisible();
  644 | 
  645 |     if(round<12){
  646 |       const prepare=page.getByTestId('kotc-prepare-next-round');
  647 |       const prepAt=Date.now();
  648 |       await prepare.click();
  649 |       await expect(prepare).toContainText('Preparing Round…',{timeout:250});
  650 |       report.prepare_ack_ms.push(Date.now()-prepAt);
> 651 |       await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Checking Round ${round} scores`,{timeout:300});
      |                                                                 ^ Error: expect(locator).toContainText(expected) failed
  652 |       await sleep(300);
  653 |       await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});
  654 |       if(await page.getByTestId('kotc-host-action-status').isVisible().catch(()=>false)){
  655 |         await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Preparing Round ${round+1}`);
  656 |         await expect(prepare).toBeDisabled();
  657 |       }
  658 |       await expect(page.getByTestId('kotc-start-round')).toContainText(`START ROUND ${round+1}`,{timeout:4000});
  659 |       report.prepare_confirm_ms.push(Date.now()-prepAt);
  660 |     }
  661 |   }
  662 | 
  663 |   const roundsBeforeFinish=model.rounds.length;
  664 |   const finish=page.getByTestId('kotc-finish-after-scores');
  665 |   await expect(finish).toBeVisible();
  666 |   const finishAt=Date.now();
  667 |   await finish.click();
  668 |   await expect(page.getByTestId('kotc-host-action-status')).toContainText('Finishing session',{timeout:300});
  669 |   await sleep(250);
  670 |   await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  671 |   await expect(page.getByTestId('kotc-host-action-status')).toContainText('Finishing session');
  672 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({timeout:3500});
  673 |   report.finish_to_podium_ms=Date.now()-finishAt;
  674 |   expect(model.rounds.length,'Finish after scores must not manufacture an unused next round').toBe(roundsBeforeFinish);
  675 |   expect(model.rounds.length).toBe(12);
  676 | 
  677 |   const callsByName=Object.fromEntries([...new Set(model.calls.map(c=>c.name))].map(name=>[name,model.calls.filter(c=>c.name===name).length]));
  678 |   report.calls_by_name=callsByName;
  679 |   report.total_function_calls=model.calls.length;
  680 |   report.full_state_reads=callsByName.getKotcV2State||0;
  681 |   report.host_claim_score_calls=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  682 |   report.max_start_ack_ms=Math.max(...report.start_ack_ms);
  683 |   report.max_start_confirm_ms=Math.max(...report.start_confirm_ms);
  684 |   report.max_score_ack_ms=Math.max(...report.score_ack_ms);
  685 |   report.max_score_burst_confirm_ms=Math.max(...report.score_burst_confirm_ms);
  686 |   report.max_prepare_ack_ms=Math.max(...report.prepare_ack_ms);
  687 |   report.max_prepare_confirm_ms=Math.max(...report.prepare_confirm_ms);
  688 | 
  689 |   expect(report.max_start_ack_ms).toBeLessThanOrEqual(250);
  690 |   expect(report.max_score_ack_ms).toBeLessThanOrEqual(250);
  691 |   expect(report.max_prepare_ack_ms).toBeLessThanOrEqual(250);
  692 |   expect(report.max_start_confirm_ms).toBeLessThanOrEqual(2300);
  693 |   expect(report.max_score_burst_confirm_ms).toBeLessThanOrEqual(2300);
  694 |   expect(report.max_prepare_confirm_ms).toBeLessThanOrEqual(3500);
  695 |   expect(report.full_state_reads,'Normal live play must not poll/reload heavyweight state after successful actions').toBeLessThanOrEqual(3);
  696 |   expect(report.host_claim_score_calls,'Typing host scores must not create empty scorer-takeover traffic').toBe(0);
  697 |   expect(callsByName.startKotcRound).toBe(12);
  698 |   expect(callsByName.saveKotcScore).toBe(48);
  699 |   expect(callsByName.prepareKotcNextRound).toBe(11);
  700 |   expect(callsByName.endKotcSession).toBe(1);
  701 |   expect(report.total_function_calls,'12-round host journey should remain inside a compact API-call budget').toBeLessThanOrEqual(95);
  702 | 
  703 |   console.log(`KOTC HALL-PRESSURE SIMULATOR REPORT\n${JSON.stringify(report,null,2)}`);
  704 |   await testInfo.attach('kotc-hall-pressure-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  705 | });
  706 | 
```