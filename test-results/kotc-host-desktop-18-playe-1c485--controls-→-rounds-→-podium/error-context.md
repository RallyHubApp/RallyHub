# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> 18-player desktop Preview host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-desktop.spec.mjs:375:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-player-participant-03')
Expected substring: "voluntary rest"
Received string:    "Player 03Bench · this round"
Timeout: 1500ms

Call log:
  - Expect "toContainText" getByTestId('kotc-player-participant-03') with timeout 1500ms
  - waiting for getByTestId('kotc-player-participant-03')
    5 × locator resolved to <button type="button" aria-pressed="true" data-dynamic-content="true" data-testid="kotc-player-participant-03" data-collection-item-id="participant-03" data-collection-item-field="scheduled_departure_at" data-source-location="src/components/kotc/KotcV2SessionView.jsx:159:77" class="rounded-lg border p-3 min-h-12 text-left touch-manipulation border-primary ring-2 ring-primary/30">…</button>
      - unexpected value "Player 03present"
    11 × locator resolved to <button type="button" aria-pressed="false" data-dynamic-content="true" data-testid="kotc-player-participant-03" data-collection-item-id="participant-03" data-collection-item-field="scheduled_departure_at" data-source-location="src/components/kotc/KotcV2SessionView.jsx:159:77" class="rounded-lg border p-3 min-h-12 text-left touch-manipulation border-border">…</button>
       - unexpected value "Player 03Bench · this round"

```

```yaml
- button "Player 03 Bench · this round"
```

# Test source

```ts
  380 | 
  381 |   await page.goto('/e2e/kotcHarness.html');
  382 |   await expect(page.getByTestId('kotc-setup')).toBeVisible();
  383 |   await expect(page.getByTestId('kotc-setup')).toContainText('18 players');
  384 |   await expect(page.getByTestId('kotc-setup')).toContainText('4 courts');
  385 |   await expect(page.getByTestId('kotc-setup')).toContainText('2 bench');
  386 |   await expect(page.getByTestId('kotc-setup-summary')).toContainText('Create Round 1');
  387 | 
  388 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  389 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  390 |   const create = page.getByTestId('kotc-create-session');
  391 |   const createAt = Date.now();
  392 |   await create.click();
  393 |   await expect(create).toContainText('Creating Round 1…');
  394 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  395 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  396 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  397 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  398 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  399 | 
  400 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  401 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  402 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  403 |   await firstSlot.click();
  404 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  405 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  406 | 
  407 |   // Lock one pair. The host must get immediate acknowledgement, then a persistent locked state.
  408 |   const lockButton=page.getByRole('button', { name: 'Lock pair' }).first();
  409 |   await lockButton.click();
  410 |   await expect(page.getByRole('button', { name: 'Saving…' }).first()).toBeVisible({ timeout: 250 });
  411 |   await expect(page.getByRole('button', { name: /Locked ✓ · Unlock/ }).first()).toBeVisible({ timeout: 1500 });
  412 | 
  413 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  414 |   let started = Date.now();
  415 |   const startRound = page.getByTestId('kotc-start-round');
  416 |   await startRound.click();
  417 |   await expect(startRound).toContainText('Starting…');
  418 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  419 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  420 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  421 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  422 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  423 | 
  424 |   // Timer controls: pause → reset → explicit Start Timer.
  425 |   await page.getByTestId('kotc-timer-pause').click();
  426 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  427 |   await page.getByTestId('kotc-timer-reset').click();
  428 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  429 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  430 |   await page.getByTestId('kotc-timer-start').click();
  431 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  432 |   await dismissTimerFullscreen(page);
  433 | 
  434 |   // Undo must keep accepted feedback visible for the entire backend delay.
  435 |   const undo = page.getByTestId('kotc-undo-start');
  436 |   await undo.scrollIntoViewIfNeeded();
  437 |   started = Date.now();
  438 |   await undo.evaluate(element => element.click());
  439 |   await expect(undo).toContainText('Returning to Round Setup…');
  440 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  441 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  442 |   await sleep(350);
  443 |   await expect(undo).toContainText('Returning to Round Setup…');
  444 |   await expect(undo).toBeDisabled();
  445 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  446 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  447 |   expect(model.timer?.running).toBe(false);
  448 |   expect(model.timer?.remainingSeconds).toBe(480);
  449 | 
  450 |   // Start again and complete Round 1.
  451 |   started = Date.now();
  452 |   await page.getByTestId('kotc-start-round').click();
  453 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  454 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  455 |   await dismissTimerFullscreen(page);
  456 |   // Host-only sessions remain fast: ordinary score entry does not create scorer-lease traffic.
  457 |   // Collaborative first-claim-wins locking is covered separately by the host + two scorer robot.
  458 |   const claimsBefore=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  459 |   await page.getByTestId('kotc-score-1-a').focus();
  460 |   expect(model.calls.filter(c=>c.body?.commandType==='host_claim_score').length).toBe(claimsBefore);
  461 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  462 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  463 | 
  464 |   await expect(page.getByText('All scores saved for Round 1')).toBeVisible({ timeout: 1800 });
  465 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('started');
  466 |   started = Date.now();
  467 |   await page.getByTestId('kotc-prepare-next-round').click();
  468 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2', { timeout: 2200 });
  469 |   metric(report, 'round1_review_to_round2_editor_ms', Date.now() - started, 2200);
  470 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  471 | 
  472 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  473 |   await page.getByTestId('kotc-start-round').click();
  474 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  475 |   await dismissTimerFullscreen(page);
  476 |   await page.getByTestId('kotc-session-menu').click();
  477 |   await page.getByTestId('kotc-players-menu').click();
  478 |   await page.getByTestId('kotc-player-participant-03').click();
  479 |   await page.getByTestId('kotc-player-sit-out').click();
> 480 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('voluntary rest', { timeout: 1500 });
      |                                                                ^ Error: expect(locator).toContainText(expected) failed
  481 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  482 | 
  483 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  484 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  485 |   await page.getByTestId('kotc-prepare-next-round').click();
  486 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3', { timeout: 2200 });
  487 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  488 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  489 | 
  490 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  491 |   await page.getByTestId('kotc-start-round').click();
  492 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  493 |   await dismissTimerFullscreen(page);
  494 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  495 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  496 |   await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });
  497 | 
  498 |   const finishButton = page.getByTestId('kotc-finish-session');
  499 |   if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  500 |   await expect(finishButton).toBeVisible();
  501 |   started = Date.now();
  502 |   await finishButton.click();
  503 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  504 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
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
```