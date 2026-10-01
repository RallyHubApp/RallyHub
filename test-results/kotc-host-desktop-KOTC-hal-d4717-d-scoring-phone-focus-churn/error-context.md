# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> KOTC hall-pressure simulator: 18 players, 12 rounds, slow provider, rapid scoring, phone focus churn
- Location: e2e/kotc-host-desktop.spec.mjs:586:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('kotc-round-editor')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('kotc-round-editor') with timeout 3000ms
  - waiting for getByTestId('kotc-round-editor')

```

```yaml
- main:
  - paragraph: Round 1 — ROUND READY
  - paragraph: 4 courts · 2 bench
  - button "Roster":
    - img
    - text: Roster
  - button "Links":
    - img
    - text: Links
  - button "Menu":
    - img
    - text: Menu
  - paragraph: What happens next
  - paragraph: Round 1 ready
  - paragraph: "Next: check the 4 court assignments and bench, then Start Round 1."
  - paragraph: Bench This Round
  - button "Player 17"
  - button "Player 18"
  - paragraph: Tap a court player, then a bench player, to swap them.
  - heading "Host Round Editor" [level=4]
  - paragraph: Tap two players to swap them, or drag a whole court by its handle to move that four-player group to another court rank.
  - img
  - text: Court 1
  - button "Move whole Court 1":
    - img
    - text: Move court
  - paragraph: Team A
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 01":
    - img
    - text: Player 01
  - button "Player 08":
    - img
    - text: Player 08
  - paragraph: Team B
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 09":
    - img
    - text: Player 09
  - button "Player 16":
    - img
    - text: Player 16
  - text: Court 2
  - button "Move whole Court 2":
    - img
    - text: Move court
  - paragraph: Team A
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 02":
    - img
    - text: Player 02
  - button "Player 07":
    - img
    - text: Player 07
  - paragraph: Team B
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 10":
    - img
    - text: Player 10
  - button "Player 15":
    - img
    - text: Player 15
  - text: Court 3
  - button "Move whole Court 3":
    - img
    - text: Move court
  - paragraph: Team A
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 03":
    - img
    - text: Player 03
  - button "Player 06":
    - img
    - text: Player 06
  - paragraph: Team B
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 11":
    - img
    - text: Player 11
  - button "Player 14":
    - img
    - text: Player 14
  - text: Court 4
  - button "Move whole Court 4":
    - img
    - text: Move court
  - paragraph: Team A
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 04":
    - img
    - text: Player 04
  - button "Player 05":
    - img
    - text: Player 05
  - paragraph: Team B
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 12":
    - img
    - text: Player 12
  - button "Player 13":
    - img
    - text: Player 13
  - paragraph: Round setup is saved
  - paragraph: You can leave this screen and return without losing the court layout.
  - button "Saved ✓" [disabled]
  - paragraph: Pre-Round Check
  - paragraph: Confirm the round time and hall sound before players begin.
  - img
  - paragraph: Round timer
  - paragraph: Adjust now if tonight needs a shorter or longer round.
  - text: 08:00
  - button "− 1 min"
  - button "+ 1 min"
  - paragraph: Hall sound check
  - paragraph: Test the real cue and spoken voice before play. This uses your device/speaker only — no Base44 call.
  - button "Test Sound":
    - img
    - text: Test Sound
  - button "START ROUND 1":
    - img
    - text: START ROUND 1
  - button "Back to Setup":
    - img
    - text: Back to Setup
  - button "Restore Original Draw":
    - img
    - text: Restore Original Draw
```

# Test source

```ts
  505 |   await expect(page.getByText('Session complete')).toBeVisible();
  506 |   await expect(page.getByText('Gold')).toBeVisible();
  507 |   await expect(page.getByText('Silver')).toBeVisible();
  508 |   await expect(page.getByText('Bronze')).toBeVisible();
  509 | 
  510 |   // Post-event audit correction: reopen Round 1 / Court 1, reverse the result and
  511 |   // confirm RallyHub stores it as a correction without rewriting later court assignments.
  512 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  513 |   await page.getByRole('button',{name:'Round 1',exact:true}).click();
  514 |   const preCorrectionRound2=JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'));
  515 |   const reviewCard=page.getByTestId('kotc-score-card-1').first();
  516 |   await reviewCard.getByRole('button',{name:'Edit result'}).click();
  517 |   await reviewCard.getByTestId('kotc-score-1-a').fill('2');
  518 |   await reviewCard.getByTestId('kotc-score-1-b').fill('12');
  519 |   await reviewCard.getByRole('button',{name:'Save Correction'}).click();
  520 |   await expect(reviewCard).toContainText('Saved 2–12',{timeout:1800});
  521 |   const corrected=model.matches.find(m=>m.id==='match-r1-c1');
  522 |   expect(corrected.correction_count).toBe(1);
  523 |   expect(corrected.winner_side).toBe('B');
  524 |   expect(JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'))).toBe(preCorrectionRound2);
  525 |   report.post_event_score_correction=true;
  526 | 
  527 |   report.rounds_created = model.rounds.length;
  528 |   report.function_calls = model.calls.length;
  529 |   console.log(`KOTC DESKTOP HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  530 |   await testInfo.attach('kotc-host-desktop-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  531 | });
  532 | 
  533 | test('Base44 resilience: score committed but response fails is reconciled as Saved',async({page})=>{
  534 |   const model=createModel({commitThenFailScore:true});await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  535 |   await createAndStartRoundOne(page);
  536 |   await page.getByTestId('kotc-score-1-a').fill('11');await page.getByTestId('kotc-score-1-b').fill('7');
  537 |   await page.getByTestId('kotc-complete-1').click();
  538 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 11–7',{timeout:2200});
  539 |   await expect(page.getByTestId('kotc-score-card-1')).not.toContainText('Retry Save');
  540 |   expect(model.scoreFailureInjected).toBe(true);expect(model.matches.find(m=>m.id==='match-r1-c1').revision).toBe(1);
  541 | });
  542 | 
  543 | test('Base44 resilience: next round committed but response fails is reconciled without duplicate generation',async({page})=>{
  544 |   const model=createModel({commitThenFailPrepare:true});await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  545 |   await createAndStartRoundOne(page);await scoreCurrentRound(page,4,11);
  546 |   await page.getByTestId('kotc-prepare-next-round').click();
  547 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2',{timeout:2500});
  548 |   expect(model.prepareFailureInjected).toBe(true);expect(model.rounds.filter(r=>r.round_number===2)).toHaveLength(1);
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
> 605 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:3000});
      |                                                       ^ Error: expect(locator).toBeVisible() failed
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
  651 |       await expect(page.getByTestId('kotc-host-action-status')).toContainText(new RegExp(`Checking Round ${round} scores|Preparing Round ${round+1}`),{timeout:300});
  652 |       await sleep(300);
  653 |       await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});
  654 |       if(await page.getByTestId('kotc-host-action-status').isVisible().catch(()=>false)){
  655 |         await expect(page.getByTestId('kotc-host-action-status')).toContainText(new RegExp(`Checking Round ${round} scores|Preparing Round ${round+1}`));
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
```