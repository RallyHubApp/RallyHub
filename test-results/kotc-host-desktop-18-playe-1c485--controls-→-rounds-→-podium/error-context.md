# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> 18-player desktop Preview host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-desktop.spec.mjs:375:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "host:e2e"
Received: "player-device-1"

Call Log:
- Timeout 3000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Round 1 — LIVE
        - paragraph [ref=e8]: 4 courts · 2 bench · 0/4 scores saved
      - generic [ref=e9]:
        - button "Links" [ref=e10] [cursor=pointer]
        - button "Menu" [ref=e11] [cursor=pointer]
    - generic [ref=e12]:
      - paragraph [ref=e13]: What happens next
      - paragraph [ref=e14]: Round 1 live · 0/4 scores saved
      - paragraph [ref=e15]: "Next: collect Court 1, Court 2, Court 3, Court 4 results. You can correct any saved score before advancing."
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - paragraph [ref=e19]: Play Time
          - paragraph [ref=e20]: 8 min round timer
        - generic [ref=e21]:
          - button "Test / enable speaker sound" [ref=e22] [cursor=pointer]
          - button "Float and move timer" [ref=e23] [cursor=pointer]
          - button "Full screen timer" [ref=e24] [cursor=pointer]
      - generic [ref=e25]: 07:57
      - generic [ref=e28]:
        - slider [ref=e33]: "1"
        - generic [ref=e34]: 100%
      - generic [ref=e35]:
        - button "Pause Timer" [ref=e36] [cursor=pointer]
        - button "Reset" [ref=e37] [cursor=pointer]
    - paragraph [ref=e38]: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
    - button "Undo Start / Back to Round Setup" [ref=e39] [cursor=pointer]
    - generic [ref=e40]:
      - paragraph [ref=e41]: Bench This Round
      - paragraph [ref=e42]: Player 17 · Player 18
    - generic [ref=e43]:
      - generic [ref=e44]:
        - generic [ref=e45]:
          - generic [ref=e46]: Court 1
          - generic [ref=e50]: LIVE
        - generic [ref=e51]:
          - generic [ref=e52]:
            - paragraph [ref=e53]: Team A
            - paragraph [ref=e54]: Player 03 & Player 05
          - textbox [active] [ref=e55]
        - generic [ref=e56]:
          - generic [ref=e57]:
            - paragraph [ref=e58]: Team B
            - paragraph [ref=e59]: Player 12 & Player 14
          - textbox [ref=e60]
        - button "Complete Match" [disabled]
      - generic [ref=e61]:
        - generic [ref=e62]:
          - generic [ref=e63]: Court 2
          - generic [ref=e65]: LIVE
        - generic [ref=e66]:
          - generic [ref=e67]:
            - paragraph [ref=e68]: Team A
            - paragraph [ref=e69]: Player 04 & Player 07
          - textbox [ref=e70]
        - generic [ref=e71]:
          - generic [ref=e72]:
            - paragraph [ref=e73]: Team B
            - paragraph [ref=e74]: Player 09 & Player 16
          - textbox [ref=e75]
        - button "Complete Match" [disabled]
      - generic [ref=e76]:
        - generic [ref=e77]:
          - generic [ref=e78]: Court 3
          - generic [ref=e80]: LIVE
        - generic [ref=e81]:
          - generic [ref=e82]:
            - paragraph [ref=e83]: Team A
            - paragraph [ref=e84]: Player 01 & Player 06
          - textbox [ref=e85]
        - generic [ref=e86]:
          - generic [ref=e87]:
            - paragraph [ref=e88]: Team B
            - paragraph [ref=e89]: Player 10 & Player 15
          - textbox [ref=e90]
        - button "Complete Match" [disabled]
      - generic [ref=e91]:
        - generic [ref=e92]:
          - generic [ref=e93]: Court 4
          - generic [ref=e95]: LIVE
        - generic [ref=e96]:
          - generic [ref=e97]:
            - paragraph [ref=e98]: Team A
            - paragraph [ref=e99]: Player 02 & Player 08
          - textbox [ref=e100]
        - generic [ref=e101]:
          - generic [ref=e102]:
            - paragraph [ref=e103]: Team B
            - paragraph [ref=e104]: Player 11 & Player 13
          - textbox [ref=e105]
        - button "Complete Match" [disabled]
  - generic [ref=e106]:
    - button "Scroll up" [ref=e107] [cursor=pointer]
    - button "Scroll down" [disabled]
```

# Test source

```ts
  362 | 
  363 | async function createAndStartRoundOne(page){
  364 |   await page.goto('/e2e/kotcHarness.html');
  365 |   await page.getByRole('button',{name:'Player 17',exact:true}).click();
  366 |   await page.getByRole('button',{name:'Player 18',exact:true}).click();
  367 |   await page.getByTestId('kotc-create-session').click();
  368 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:2000});
  369 |   await page.getByTestId('kotc-start-round').click();
  370 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({timeout:2000});
  371 | }
  372 | 
  373 | test.use({ viewport: { width: 1440, height: 900 } });
  374 | 
  375 | test('18-player desktop Preview host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  376 |   const model = createModel();
  377 |   const report = {};
  378 |   await installMockBackend(page, model);
  379 |   page.on('dialog', dialog => dialog.accept());
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
  456 |   // A player/scorer device has Court 1 locked. The host touching the score box must
  457 |   // take authority immediately without changing the match revision.
  458 |   const round1Court1=model.matches.find(m=>m.id==='match-r1-c1');
  459 |   round1Court1.scoring_lock_owner='player-device-1';
  460 |   round1Court1.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();
  461 |   await page.getByTestId('kotc-score-1-a').focus();
> 462 |   await expect.poll(()=>round1Court1.scoring_lock_owner).toBe('host:e2e');
      |                                                          ^ Error: expect(received).toBe(expected) // Object.is equality
  463 |   report.host_displaced_player_scorer=true;
  464 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  465 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  466 | 
  467 |   await expect(page.getByText('All scores saved for Round 1')).toBeVisible({ timeout: 1800 });
  468 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('started');
  469 |   started = Date.now();
  470 |   await page.getByTestId('kotc-prepare-next-round').click();
  471 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2', { timeout: 2200 });
  472 |   metric(report, 'round1_review_to_round2_editor_ms', Date.now() - started, 2200);
  473 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  474 | 
  475 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  476 |   await page.getByTestId('kotc-start-round').click();
  477 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  478 |   await dismissTimerFullscreen(page);
  479 |   await page.getByTestId('kotc-session-menu').click();
  480 |   await page.getByTestId('kotc-players-menu').click();
  481 |   await page.getByTestId('kotc-player-participant-03').click();
  482 |   await page.getByTestId('kotc-player-sit-out').click();
  483 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('voluntary rest', { timeout: 1500 });
  484 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  485 | 
  486 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  487 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  488 |   await page.getByTestId('kotc-prepare-next-round').click();
  489 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3', { timeout: 2200 });
  490 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  491 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  492 | 
  493 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  494 |   await page.getByTestId('kotc-start-round').click();
  495 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  496 |   await dismissTimerFullscreen(page);
  497 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  498 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  499 |   await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });
  500 | 
  501 |   const finishButton = page.getByTestId('kotc-finish-session');
  502 |   if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  503 |   await expect(finishButton).toBeVisible();
  504 |   started = Date.now();
  505 |   await finishButton.click();
  506 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  507 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  508 |   await expect(page.getByText('Session complete')).toBeVisible();
  509 |   await expect(page.getByText('Gold')).toBeVisible();
  510 |   await expect(page.getByText('Silver')).toBeVisible();
  511 |   await expect(page.getByText('Bronze')).toBeVisible();
  512 | 
  513 |   // Post-event audit correction: reopen Round 1 / Court 1, reverse the result and
  514 |   // confirm RallyHub stores it as a correction without rewriting later court assignments.
  515 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  516 |   await page.getByRole('button',{name:'Round 1',exact:true}).click();
  517 |   const preCorrectionRound2=JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'));
  518 |   const reviewCard=page.getByTestId('kotc-score-card-1').first();
  519 |   await reviewCard.getByRole('button',{name:'Edit result'}).click();
  520 |   await reviewCard.getByTestId('kotc-score-1-a').fill('2');
  521 |   await reviewCard.getByTestId('kotc-score-1-b').fill('12');
  522 |   await reviewCard.getByRole('button',{name:'Save Correction'}).click();
  523 |   await expect(reviewCard).toContainText('Saved 2–12',{timeout:1800});
  524 |   const corrected=model.matches.find(m=>m.id==='match-r1-c1');
  525 |   expect(corrected.correction_count).toBe(1);
  526 |   expect(corrected.winner_side).toBe('B');
  527 |   expect(JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'))).toBe(preCorrectionRound2);
  528 |   report.post_event_score_correction=true;
  529 | 
  530 |   report.rounds_created = model.rounds.length;
  531 |   report.function_calls = model.calls.length;
  532 |   console.log(`KOTC DESKTOP HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  533 |   await testInfo.attach('kotc-host-desktop-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  534 | });
  535 | 
  536 | test('Base44 resilience: score committed but response fails is reconciled as Saved',async({page})=>{
  537 |   const model=createModel({commitThenFailScore:true});await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  538 |   await createAndStartRoundOne(page);
  539 |   await page.getByTestId('kotc-score-1-a').fill('11');await page.getByTestId('kotc-score-1-b').fill('7');
  540 |   await page.getByTestId('kotc-complete-1').click();
  541 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 11–7',{timeout:2200});
  542 |   await expect(page.getByTestId('kotc-score-card-1')).not.toContainText('Retry Save');
  543 |   expect(model.scoreFailureInjected).toBe(true);expect(model.matches.find(m=>m.id==='match-r1-c1').revision).toBe(1);
  544 | });
  545 | 
  546 | test('Base44 resilience: next round committed but response fails is reconciled without duplicate generation',async({page})=>{
  547 |   const model=createModel({commitThenFailPrepare:true});await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  548 |   await createAndStartRoundOne(page);await scoreCurrentRound(page,4,11);
  549 |   await page.getByTestId('kotc-prepare-next-round').click();
  550 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2',{timeout:2500});
  551 |   expect(model.prepareFailureInjected).toBe(true);expect(model.rounds.filter(r=>r.round_number===2)).toHaveLength(1);
  552 | });
  553 | 
  554 | test('Base44 resilience: genuine prepare failure stays explicit and safely retryable',async({page})=>{
  555 |   const model=createModel({failPrepareBeforeCommit:true});await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  556 |   await createAndStartRoundOne(page);await scoreCurrentRound(page,4,11);
  557 |   await page.getByTestId('kotc-prepare-next-round').click();
  558 |   await expect(page.getByTestId('kotc-prepare-status')).toContainText('Could not prepare the next round',{timeout:2200});
  559 |   expect(model.rounds.filter(r=>r.round_number===2)).toHaveLength(0);
  560 |   await expect(page.getByTestId('kotc-prepare-next-round')).toBeEnabled();
  561 | });
  562 | 
```