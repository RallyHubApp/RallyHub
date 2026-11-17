# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:368:1

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
    4 × locator resolved to <button type="button" aria-pressed="true" data-dynamic-content="true" data-testid="kotc-player-participant-03" data-collection-item-id="participant-03" data-collection-item-field="scheduled_departure_at" data-source-location="src/components/kotc/KotcV2SessionView.jsx:158:77" class="rounded-lg border p-3 min-h-12 text-left touch-manipulation border-primary ring-2 ring-primary/30">…</button>
      - unexpected value "Player 03present"
    12 × locator resolved to <button type="button" aria-pressed="false" data-dynamic-content="true" data-testid="kotc-player-participant-03" data-collection-item-id="participant-03" data-collection-item-field="scheduled_departure_at" data-source-location="src/components/kotc/KotcV2SessionView.jsx:158:77" class="rounded-lg border p-3 min-h-12 text-left touch-manipulation border-border">…</button>
       - unexpected value "Player 03Bench · this round"

```

```yaml
- button "Player 03 Bench · this round"
```

# Test source

```ts
  411 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  412 | 
  413 |   // Lock one pair and make sure the editor reflects the saved lock. The lock action must
  414 |   // also persist the current proposed-round draft, so the court/bench swap is no longer
  415 |   // stranded only in the browser until START ROUND is pressed.
  416 |   const swappedSlotId='r1-c1-A-1';
  417 |   const swappedParticipantBeforeLock=model.slots.find(s=>s.id===swappedSlotId)?.participant_id;
  418 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  419 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  420 |   const pairLockCall=[...model.calls].reverse().find(c=>c.name==='setKotcPairLock');
  421 |   expect(pairLockCall?.body?.slotParticipantIds).toBeTruthy();
  422 |   expect(model.slots.find(s=>s.id===swappedSlotId)?.participant_id).not.toBe(swappedParticipantBeforeLock);
  423 |   expect(Number(model.rounds.find(r=>r.id==='round-1')?.proposal_revision||0)).toBeGreaterThan(1);
  424 | 
  425 |   // Busy-hall setup: move an entire four-player court as one unit, save it without
  426 |   // starting the round, then reload and prove that the saved court layout survives.
  427 |   const court4Before=model.slots.filter(s=>s.round_id==='round-1'&&Number(s.ladder_court_rank)===4).sort((a,b)=>String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number)).map(s=>s.participant_id);
  428 |   const courtMove=page.getByTestId('kotc-whole-court-drag-4');
  429 |   await courtMove.focus();await courtMove.press('Space');await courtMove.press('ArrowUp');await courtMove.press('ArrowUp');await courtMove.press('Space');
  430 |   const saveRound=page.getByTestId('kotc-save-round-setup');
  431 |   await expect(saveRound).toBeEnabled();
  432 |   const saveBefore=model.calls.filter(c=>c.name==='kotcCommand'&&c.body.commandType==='adjust_proposed_round').length;
  433 |   const saveStarted=Date.now();await saveRound.click();await expect(page.getByText('Saving Round 1 setup… command sent')).toBeVisible({timeout:300});metric(report,'round_setup_save_ack_ms',Date.now()-saveStarted,300);await expect(page.getByTestId('kotc-save-round-status')).toContainText('Round setup saved',{timeout:1800});
  434 |   expect(model.calls.filter(c=>c.name==='kotcCommand'&&c.body.commandType==='adjust_proposed_round').length-saveBefore).toBe(1);
  435 |   const court2After=model.slots.filter(s=>s.round_id==='round-1'&&Number(s.ladder_court_rank)===2).sort((a,b)=>String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number)).map(s=>s.participant_id);
  436 |   expect(court2After).toEqual(court4Before);report.whole_court_drag_saved=true;
  437 |   const movedCourtName=model.participants.find(p=>p.id===court4Before[0])?.display_name;
  438 |   await page.reload();await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:1800});await expect(page.getByTestId('kotc-whole-court-2')).toContainText(movedCourtName);report.round_setup_survives_reload=true;
  439 | 
  440 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  441 |   let started = Date.now();
  442 |   const startRound = page.getByTestId('kotc-start-round');
  443 |   await startRound.click();
  444 |   await expect(startRound).toContainText('Starting…');
  445 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  446 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  447 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  448 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  449 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  450 | 
  451 |   // Timer controls: pause → reset → explicit Start Timer.
  452 |   await page.getByTestId('kotc-timer-pause').click();
  453 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  454 |   await page.getByTestId('kotc-timer-reset').click();
  455 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  456 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  457 |   await page.getByTestId('kotc-timer-start').click();
  458 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  459 |   await dismissTimerFullscreen(page);
  460 | 
  461 |   // Undo must keep accepted feedback visible for the entire backend delay.
  462 |   const undo = page.getByTestId('kotc-undo-start');
  463 |   await undo.scrollIntoViewIfNeeded();
  464 |   started = Date.now();
  465 |   await undo.evaluate(element => element.click());
  466 |   await expect(undo).toContainText('Returning to Round Setup…');
  467 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  468 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  469 |   await sleep(350);
  470 |   await expect(undo).toContainText('Returning to Round Setup…');
  471 |   await expect(undo).toBeDisabled();
  472 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  473 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  474 |   expect(model.timer?.running).toBe(false);
  475 |   expect(model.timer?.remainingSeconds).toBe(480);
  476 | 
  477 |   // Start again and complete Round 1.
  478 |   started = Date.now();
  479 |   await page.getByTestId('kotc-start-round').click();
  480 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  481 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  482 |   await dismissTimerFullscreen(page);
  483 |   // Host-only sessions remain fast: ordinary score entry does not create scorer-lease traffic.
  484 |   // Collaborative first-claim-wins locking is covered separately by the host + two scorer robot.
  485 |   const claimsBefore=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  486 |   await page.getByTestId('kotc-score-1-a').focus();
  487 |   expect(model.calls.filter(c=>c.body?.commandType==='host_claim_score').length).toBe(claimsBefore);
  488 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  489 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  490 | 
  491 |   await expect(page.getByText('All scores saved for Round 1')).toBeVisible({ timeout: 1800 });
  492 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('started');
  493 |   started = Date.now();
  494 |   await page.getByTestId('kotc-prepare-next-round').click();
  495 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2', { timeout: 2200 });
  496 |   metric(report, 'round1_review_to_round2_editor_ms', Date.now() - started, 2200);
  497 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  498 | 
  499 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  500 |   await page.getByTestId('kotc-start-round').click();
  501 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  502 |   await dismissTimerFullscreen(page);
  503 |   await page.getByTestId('kotc-session-menu').click();
  504 |   await page.getByTestId('kotc-players-menu').click();
  505 |   await expect(page.getByTestId('kotc-add-player-visible')).toBeVisible();
  506 |   await page.getByTestId('kotc-add-player-visible').click();
  507 |   await expect(page.getByTestId('kotc-add-player-panel')).toBeVisible();
  508 |   await page.getByTestId('kotc-add-player-visible').click();
  509 |   await page.getByTestId('kotc-player-participant-03').click();
  510 |   await page.getByTestId('kotc-player-sit-out').click();
> 511 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('voluntary rest', { timeout: 1500 });
      |                                                                ^ Error: expect(locator).toContainText(expected) failed
  512 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  513 | 
  514 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  515 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  516 |   await page.getByTestId('kotc-prepare-next-round').click();
  517 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3', { timeout: 2200 });
  518 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  519 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  520 | 
  521 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  522 |   await page.getByTestId('kotc-start-round').click();
  523 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  524 |   await dismissTimerFullscreen(page);
  525 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  526 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  527 |   await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });
  528 | 
  529 |   const finishButton = page.getByTestId('kotc-finish-session');
  530 |   if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  531 |   await expect(finishButton).toBeVisible();
  532 |   started = Date.now();
  533 |   await finishButton.click();
  534 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  535 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  536 |   await expect(page.getByText('Session complete')).toBeVisible();
  537 |   await expect(page.getByText('Gold')).toBeVisible();
  538 |   await expect(page.getByText('Silver')).toBeVisible();
  539 |   await expect(page.getByText('Bronze')).toBeVisible();
  540 | 
  541 |   // Post-event audit correction: reopen Round 1 / Court 1, reverse the result and
  542 |   // confirm RallyHub stores it as a correction without rewriting later court assignments.
  543 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  544 |   await page.getByRole('button',{name:'Round 1',exact:true}).click();
  545 |   const preCorrectionRound2=JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'));
  546 |   const reviewCard=page.getByTestId('kotc-score-card-1').first();
  547 |   await reviewCard.getByRole('button',{name:'Edit result'}).click();
  548 |   await reviewCard.getByTestId('kotc-score-1-a').fill('2');
  549 |   await reviewCard.getByTestId('kotc-score-1-b').fill('12');
  550 |   await reviewCard.getByRole('button',{name:'Save Correction'}).click();
  551 |   await expect(reviewCard).toContainText('Saved 2–12',{timeout:1800});
  552 |   const corrected=model.matches.find(m=>m.id==='match-r1-c1');
  553 |   expect(corrected.correction_count).toBe(1);
  554 |   expect(corrected.winner_side).toBe('B');
  555 |   expect(JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'))).toBe(preCorrectionRound2);
  556 |   report.post_event_score_correction=true;
  557 | 
  558 |   report.rounds_created = model.rounds.length;
  559 |   report.function_calls = model.calls.length;
  560 |   console.log(`KOTC HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  561 |   await testInfo.attach('kotc-host-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  562 | });
  563 | 
```