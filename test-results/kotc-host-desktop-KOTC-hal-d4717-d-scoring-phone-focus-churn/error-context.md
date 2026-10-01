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
Expected substring: "Preparing Round 2"
Received string:    "Checking Round 1 scores…RallyHub has accepted your tap. Keep this screen open; the button will stay locked until the action resolves."
Timeout: 300ms

Call log:
  - Expect "toContainText" getByTestId('kotc-host-action-status') with timeout 300ms
  - waiting for getByTestId('kotc-host-action-status')
    7 × locator resolved to <div data-dynamic-content="true" data-testid="kotc-host-action-status" data-source-location="src/components/kotc/KotcV2SessionView.jsx:308:15" class="sticky top-2 z-30 rounded-xl border-2 border-primary/40 bg-background/95 p-3 shadow-lg">…</div>
      - unexpected value "Checking Round 1 scores…RallyHub has accepted your tap. Keep this screen open; the button will stay locked until the action resolves."

```

```yaml
- paragraph: Checking Round 1 scores…
- paragraph: RallyHub has accepted your tap. Keep this screen open; the button will stay locked until the action resolves.
```

# Test source

```ts
  549 | });
  550 | 
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
  617 |     await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Starting Round ${round}`);
  618 |     await expect(start).toBeDisabled();
  619 |     await expect(page.getByText(`Round ${round} — LIVE`)).toBeVisible({timeout:3500});
  620 |     report.start_confirm_ms.push(Date.now()-startAt);
  621 | 
  622 |     const hostClaimsBefore=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  623 |     for(let court=1;court<=4;court++){
  624 |       await page.getByTestId(`kotc-score-${court}-a`).fill(String(8+((round+court)%6)));
  625 |       await page.getByTestId(`kotc-score-${court}-b`).fill(String(2+((round*2+court)%5)));
  626 |     }
  627 |     const burstAt=Date.now();
  628 |     for(let court=1;court<=4;court++){
  629 |       const button=page.getByTestId(`kotc-complete-${court}`);
  630 |       const ackAt=Date.now();
  631 |       await button.click();
  632 |       await expect(button).toContainText('Saving…',{timeout:250});
  633 |       report.score_ack_ms.push(Date.now()-ackAt);
  634 |     }
  635 |     await sleep(220);
  636 |     await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});
  637 |     for(let court=1;court<=4;court++)await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved',{timeout:3000});
  638 |     report.score_burst_confirm_ms.push(Date.now()-burstAt);
  639 |     const hostClaimsAfter=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  640 |     expect(hostClaimsAfter,`Round ${round} must not claim scorer leases when no player scorer owns a court`).toBe(hostClaimsBefore);
  641 |     await expect(page.getByText(`All scores saved for Round ${round}`)).toBeVisible();
  642 | 
  643 |     if(round<12){
  644 |       const prepare=page.getByTestId('kotc-prepare-next-round');
  645 |       const prepAt=Date.now();
  646 |       await prepare.click();
  647 |       await expect(prepare).toContainText('Preparing Round…',{timeout:250});
  648 |       report.prepare_ack_ms.push(Date.now()-prepAt);
> 649 |       await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Preparing Round ${round+1}`,{timeout:300});
      |                                                                 ^ Error: expect(locator).toContainText(expected) failed
  650 |       await sleep(300);
  651 |       await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});
  652 |       await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Preparing Round ${round+1}`);
  653 |       await expect(prepare).toBeDisabled();
  654 |       await expect(page.getByTestId('kotc-start-round')).toContainText(`START ROUND ${round+1}`,{timeout:4000});
  655 |       report.prepare_confirm_ms.push(Date.now()-prepAt);
  656 |     }
  657 |   }
  658 | 
  659 |   const roundsBeforeFinish=model.rounds.length;
  660 |   const finish=page.getByTestId('kotc-finish-after-scores');
  661 |   await expect(finish).toBeVisible();
  662 |   const finishAt=Date.now();
  663 |   await finish.click();
  664 |   await expect(page.getByTestId('kotc-host-action-status')).toContainText('Finishing session',{timeout:300});
  665 |   await sleep(250);
  666 |   await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  667 |   await expect(page.getByTestId('kotc-host-action-status')).toContainText('Finishing session');
  668 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({timeout:3500});
  669 |   report.finish_to_podium_ms=Date.now()-finishAt;
  670 |   expect(model.rounds.length,'Finish after scores must not manufacture an unused next round').toBe(roundsBeforeFinish);
  671 |   expect(model.rounds.length).toBe(12);
  672 | 
  673 |   const callsByName=Object.fromEntries([...new Set(model.calls.map(c=>c.name))].map(name=>[name,model.calls.filter(c=>c.name===name).length]));
  674 |   report.calls_by_name=callsByName;
  675 |   report.total_function_calls=model.calls.length;
  676 |   report.full_state_reads=callsByName.getKotcV2State||0;
  677 |   report.host_claim_score_calls=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  678 |   report.max_start_ack_ms=Math.max(...report.start_ack_ms);
  679 |   report.max_start_confirm_ms=Math.max(...report.start_confirm_ms);
  680 |   report.max_score_ack_ms=Math.max(...report.score_ack_ms);
  681 |   report.max_score_burst_confirm_ms=Math.max(...report.score_burst_confirm_ms);
  682 |   report.max_prepare_ack_ms=Math.max(...report.prepare_ack_ms);
  683 |   report.max_prepare_confirm_ms=Math.max(...report.prepare_confirm_ms);
  684 | 
  685 |   expect(report.max_start_ack_ms).toBeLessThanOrEqual(250);
  686 |   expect(report.max_score_ack_ms).toBeLessThanOrEqual(250);
  687 |   expect(report.max_prepare_ack_ms).toBeLessThanOrEqual(250);
  688 |   expect(report.max_start_confirm_ms).toBeLessThanOrEqual(2300);
  689 |   expect(report.max_score_burst_confirm_ms).toBeLessThanOrEqual(2300);
  690 |   expect(report.max_prepare_confirm_ms).toBeLessThanOrEqual(3500);
  691 |   expect(report.full_state_reads,'Normal live play must not poll/reload heavyweight state after successful actions').toBeLessThanOrEqual(3);
  692 |   expect(report.host_claim_score_calls,'Typing host scores must not create empty scorer-takeover traffic').toBe(0);
  693 |   expect(callsByName.startKotcRound).toBe(12);
  694 |   expect(callsByName.saveKotcScore).toBe(48);
  695 |   expect(callsByName.prepareKotcNextRound).toBe(11);
  696 |   expect(callsByName.endKotcSession).toBe(1);
  697 |   expect(report.total_function_calls,'12-round host journey should remain inside a compact API-call budget').toBeLessThanOrEqual(95);
  698 | 
  699 |   console.log(`KOTC HALL-PRESSURE SIMULATOR REPORT\n${JSON.stringify(report,null,2)}`);
  700 |   await testInfo.attach('kotc-hall-pressure-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  701 | });
  702 | 
```