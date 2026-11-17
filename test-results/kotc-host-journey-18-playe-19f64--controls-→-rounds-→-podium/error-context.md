# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:382:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-start-round')
Expected substring: "START ROUND 2"
Timeout: 2200ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByTestId('kotc-start-round') with timeout 2200ms
  - waiting for getByTestId('kotc-start-round')

```

```yaml
- main:
  - paragraph: Round 1 — LIVE
  - paragraph: 4 courts · 2 bench · 4/4 scores saved
  - button "Roster":
    - img
    - text: Roster
  - button "Leaderboard":
    - img
    - text: Leaderboard
  - button "Links":
    - img
    - text: Links
  - button "Menu":
    - img
    - text: Menu
  - paragraph: What happens next
  - paragraph: Round 1 scores complete
  - paragraph: "Next: RallyHub prepares the next courts. Review/correct anything now; once ready, call the new courts and press START ROUND."
  - paragraph: Preset Finish · Optional
  - paragraph: Save up to two timed court layouts. Normal King of the Court continues unless you activate one.
  - button "Configure"
  - paragraph: Host recovery · locked partnerships
  - paragraph: Unlock a pair here if you need to correct a lock. Scores and completed court results are preserved.
  - text: Player 17 + Player 08
  - button "Unlock":
    - img
    - text: Unlock
  - button "Change players / bench · Live round":
    - img
    - text: Change players / bench · Live round
  - paragraph: No need to restart or return to setup. Scored courts remain protected.
  - paragraph: Play Time
  - paragraph: 8 min round timer
  - button "Test speaker and spoken announcement":
    - img
  - button "Float and move timer":
    - img
  - button "Full screen timer":
    - img
  - text: 07:56
  - paragraph: Cue and announcements play at full RallyHub volume using this device’s default voice. Set the actual hall loudness with the device media-volume buttons before play.
  - button "Pause Timer":
    - img
    - text: Pause Timer
  - button "Reset":
    - img
    - text: Reset
  - paragraph: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
  - text: Undo Start unavailable. A score has already been entered or saved for this round. Correct the score if needed, or continue the round; RallyHub will not silently rewind scored play.
  - paragraph: Bench This Round
  - paragraph: Player 01 · Player 18
  - img
  - text: Court 1 SAVED
  - paragraph: Team A
  - paragraph:
    - img
    - text: Player 17 & Player 08
  - paragraph: WINNERS
  - textbox [disabled]: "11"
  - paragraph: Team B
  - paragraph: Player 09 & Player 16
  - textbox [disabled]: "6"
  - text: ✓ Saved 11–6 · Player 17 & Player 08 win 11–6
  - button "Edit result":
    - img
    - text: Edit result
  - text: Court 2 SAVED
  - paragraph: Team A
  - paragraph:
    - img
    - text: Player 04 & Player 05
  - paragraph: WINNERS
  - textbox [disabled]: "11"
  - paragraph: Team B
  - paragraph: Player 12 & Player 13
  - textbox [disabled]: "5"
  - text: ✓ Saved 11–5 · Player 04 & Player 05 win 11–5
  - button "Edit result":
    - img
    - text: Edit result
  - text: Court 3 SAVED
  - paragraph: Team A
  - paragraph:
    - img
    - text: Player 02 & Player 07
  - paragraph: WINNERS
  - textbox [disabled]: "11"
  - paragraph: Team B
  - paragraph: Player 10 & Player 15
  - textbox [disabled]: "4"
  - text: ✓ Saved 11–4 · Player 02 & Player 07 win 11–4
  - button "Edit result":
    - img
    - text: Edit result
  - text: Court 4 SAVED
  - paragraph: Team A
  - paragraph:
    - img
    - text: Player 03 & Player 06
  - paragraph: WINNERS
  - textbox [disabled]: "11"
  - paragraph: Team B
  - paragraph: Player 11 & Player 14
  - textbox [disabled]: "3"
  - text: ✓ Saved 11–3 · Player 03 & Player 06 win 11–3
  - button "Edit result":
    - img
    - text: Edit result
  - paragraph: ✓ All scores saved for Round 1
  - paragraph: Review the scores above. Make any corrections before preparing the next round.
  - text: "Could not prepare the next round: Converting circular structure to JSON --> starting at object with constructor 'HTMLButtonElement' | property '__reactFiber$ao7iwwj0d2d' -> object with constructor 'FiberNode' --- property 'stateNode' closes the circle"
  - button "Prepare Next Round":
    - img
    - text: Prepare Next Round
  - button "Finish Session":
    - img
    - text: Finish Session
  - paragraph: Player Device Verification
  - paragraph: Only check pending device requests when needed. Reduces background database traffic.
  - button "Check requests"
```

# Test source

```ts
  409 |   await expect(page.getByTestId('kotc-session-menu-panel')).toBeVisible();
  410 |   await expect(page.getByRole('button', { name: /Player Link, Broadcasts & Access/ })).toBeVisible();
  411 |   await page.getByTestId('kotc-session-menu').click();
  412 | 
  413 |   // Mobile back/forward-cache recovery: returning to the host page must force a fresh
  414 |   // authoritative state read and leave Start Round actionable rather than stuck disabled.
  415 |   const stateReadsBeforeReturn=model.calls.filter(c=>c.name==='getKotcV2State').length;
  416 |   await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  417 |   await expect.poll(()=>model.calls.filter(c=>c.name==='getKotcV2State').length).toBeGreaterThan(stateReadsBeforeReturn);
  418 |   await expect(page.getByTestId('kotc-start-round')).toBeEnabled();
  419 | 
  420 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  421 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  422 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  423 |   await firstSlot.click();
  424 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  425 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  426 | 
  427 |   // Lock one pair and make sure the editor reflects the saved lock. The lock action must
  428 |   // also persist the current proposed-round draft, so the court/bench swap is no longer
  429 |   // stranded only in the browser until START ROUND is pressed.
  430 |   const swappedSlotId='r1-c1-A-1';
  431 |   const swappedParticipantBeforeLock=model.slots.find(s=>s.id===swappedSlotId)?.participant_id;
  432 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  433 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  434 |   const pairLockCall=[...model.calls].reverse().find(c=>c.name==='setKotcPairLock');
  435 |   expect(pairLockCall?.body?.slotParticipantIds).toBeTruthy();
  436 |   expect(model.slots.find(s=>s.id===swappedSlotId)?.participant_id).not.toBe(swappedParticipantBeforeLock);
  437 |   expect(Number(model.rounds.find(r=>r.id==='round-1')?.proposal_revision||0)).toBeGreaterThan(1);
  438 | 
  439 |   // Busy-hall setup: move an entire four-player court as one unit, save it without
  440 |   // starting the round, then reload and prove that the saved court layout survives.
  441 |   const court4Before=model.slots.filter(s=>s.round_id==='round-1'&&Number(s.ladder_court_rank)===4).sort((a,b)=>String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number)).map(s=>s.participant_id);
  442 |   const courtMove=page.getByTestId('kotc-whole-court-drag-4');
  443 |   await courtMove.focus();await courtMove.press('Space');await courtMove.press('ArrowUp');await courtMove.press('ArrowUp');await courtMove.press('Space');
  444 |   const saveRound=page.getByTestId('kotc-save-round-setup');
  445 |   await expect(saveRound).toBeEnabled();
  446 |   const saveBefore=model.calls.filter(c=>c.name==='kotcCommand'&&c.body.commandType==='adjust_proposed_round').length;
  447 |   const saveStarted=Date.now();await saveRound.click();await expect(page.getByText('Saving Round 1 setup… command sent')).toBeVisible({timeout:300});metric(report,'round_setup_save_ack_ms',Date.now()-saveStarted,300);await expect(page.getByTestId('kotc-save-round-status')).toContainText('Round setup saved',{timeout:1800});
  448 |   expect(model.calls.filter(c=>c.name==='kotcCommand'&&c.body.commandType==='adjust_proposed_round').length-saveBefore).toBe(1);
  449 |   const court2After=model.slots.filter(s=>s.round_id==='round-1'&&Number(s.ladder_court_rank)===2).sort((a,b)=>String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number)).map(s=>s.participant_id);
  450 |   expect(court2After).toEqual(court4Before);report.whole_court_drag_saved=true;
  451 |   const movedCourtName=model.participants.find(p=>p.id===court4Before[0])?.display_name;
  452 |   await page.reload();await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:1800});await expect(page.getByTestId('kotc-whole-court-2')).toContainText(movedCourtName);report.round_setup_survives_reload=true;
  453 | 
  454 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  455 |   let started = Date.now();
  456 |   const startRound = page.getByTestId('kotc-start-round');
  457 |   await startRound.click();
  458 |   await expect(startRound).toContainText('Starting…');
  459 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  460 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  461 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  462 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  463 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  464 | 
  465 |   // Timer controls: pause → reset → explicit Start Timer.
  466 |   await page.getByTestId('kotc-timer-pause').click();
  467 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  468 |   await page.getByTestId('kotc-timer-reset').click();
  469 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  470 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  471 |   await page.getByTestId('kotc-timer-start').click();
  472 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  473 |   await dismissTimerFullscreen(page);
  474 | 
  475 |   // Undo must keep accepted feedback visible for the entire backend delay.
  476 |   const undo = page.getByTestId('kotc-undo-start');
  477 |   await undo.scrollIntoViewIfNeeded();
  478 |   started = Date.now();
  479 |   await undo.evaluate(element => element.click());
  480 |   await expect(undo).toContainText('Returning to Round Setup…');
  481 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  482 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  483 |   await sleep(350);
  484 |   await expect(undo).toContainText('Returning to Round Setup…');
  485 |   await expect(undo).toBeDisabled();
  486 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  487 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  488 |   expect(model.timer?.running).toBe(false);
  489 |   expect(model.timer?.remainingSeconds).toBe(480);
  490 | 
  491 |   // Start again and complete Round 1.
  492 |   started = Date.now();
  493 |   await page.getByTestId('kotc-start-round').click();
  494 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  495 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  496 |   await dismissTimerFullscreen(page);
  497 |   // Host-only sessions remain fast: ordinary score entry does not create scorer-lease traffic.
  498 |   // Collaborative first-claim-wins locking is covered separately by the host + two scorer robot.
  499 |   const claimsBefore=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  500 |   await page.getByTestId('kotc-score-1-a').focus();
  501 |   expect(model.calls.filter(c=>c.body?.commandType==='host_claim_score').length).toBe(claimsBefore);
  502 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  503 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  504 | 
  505 |   await expect(page.getByText('All scores saved for Round 1')).toBeVisible({ timeout: 1800 });
  506 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('started');
  507 |   started = Date.now();
  508 |   await page.getByTestId('kotc-prepare-next-round').click();
> 509 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2', { timeout: 2200 });
      |                                                      ^ Error: expect(locator).toContainText(expected) failed
  510 |   metric(report, 'round1_review_to_round2_editor_ms', Date.now() - started, 2200);
  511 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  512 | 
  513 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  514 |   await page.getByTestId('kotc-start-round').click();
  515 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  516 |   await dismissTimerFullscreen(page);
  517 |   await page.getByTestId('kotc-session-menu').click();
  518 |   await page.getByTestId('kotc-players-menu').click();
  519 |   await expect(page.getByTestId('kotc-add-player-visible')).toBeVisible();
  520 |   await page.getByTestId('kotc-add-player-visible').click();
  521 |   await expect(page.getByTestId('kotc-add-player-panel')).toBeVisible();
  522 |   await page.getByTestId('kotc-add-player-visible').click();
  523 |   await page.getByTestId('kotc-player-participant-03').click();
  524 |   await page.getByTestId('kotc-player-sit-out').click();
  525 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('Bench · this round', { timeout: 1500 });
  526 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  527 | 
  528 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  529 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  530 |   await page.getByTestId('kotc-prepare-next-round').click();
  531 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3', { timeout: 2200 });
  532 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  533 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  534 | 
  535 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  536 |   await page.getByTestId('kotc-start-round').click();
  537 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  538 |   await dismissTimerFullscreen(page);
  539 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  540 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  541 |   await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });
  542 | 
  543 |   const finishButton = page.getByTestId('kotc-finish-session');
  544 |   if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  545 |   await expect(finishButton).toBeVisible();
  546 |   started = Date.now();
  547 |   await finishButton.click();
  548 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  549 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  550 |   await expect(page.getByText('Session complete')).toBeVisible();
  551 |   await expect(page.getByText('Gold')).toBeVisible();
  552 |   await expect(page.getByText('Silver')).toBeVisible();
  553 |   await expect(page.getByText('Bronze')).toBeVisible();
  554 | 
  555 |   // Post-event audit correction: reopen Round 1 / Court 1, reverse the result and
  556 |   // confirm RallyHub stores it as a correction without rewriting later court assignments.
  557 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  558 |   await page.getByRole('button',{name:'Round 1',exact:true}).click();
  559 |   const preCorrectionRound2=JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'));
  560 |   const reviewCard=page.getByTestId('kotc-score-card-1').first();
  561 |   await reviewCard.getByRole('button',{name:'Edit result'}).click();
  562 |   await reviewCard.getByTestId('kotc-score-1-a').fill('2');
  563 |   await reviewCard.getByTestId('kotc-score-1-b').fill('12');
  564 |   await reviewCard.getByRole('button',{name:'Save Correction'}).click();
  565 |   await expect(reviewCard).toContainText('Saved 2–12',{timeout:1800});
  566 |   const corrected=model.matches.find(m=>m.id==='match-r1-c1');
  567 |   expect(corrected.correction_count).toBe(1);
  568 |   expect(corrected.winner_side).toBe('B');
  569 |   expect(JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'))).toBe(preCorrectionRound2);
  570 |   report.post_event_score_correction=true;
  571 | 
  572 |   report.rounds_created = model.rounds.length;
  573 |   report.function_calls = model.calls.length;
  574 |   console.log(`KOTC HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  575 |   await testInfo.attach('kotc-host-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  576 | });
  577 | 
  578 | 
  579 | test('First court to 11: whistle, partial scores, serving tie, 18-player bench and round transition',async({page})=>{
  580 |  const model=createModel();await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  581 |  await page.goto('/e2e/kotcHarness.html');
  582 |  await expect(page.getByTestId('kotc-setup')).toBeVisible();
  583 |  await page.getByRole('combobox').first().click();
  584 |  await page.getByRole('option',{name:/First court to 11/}).click();
  585 |  await page.getByRole('button',{name:'Player 17',exact:true}).click();
  586 |  await page.getByRole('button',{name:'Player 18',exact:true}).click();
  587 |  await page.getByTestId('kotc-create-session').click();
  588 |  await expect(page.getByTestId('kotc-round-editor')).toBeVisible();
  589 |  expect(model.session.scoring_mode).toBe('first_court_to_target');
  590 |  expect(model.session.score_target).toBe(11);
  591 |  await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  592 |  await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  593 |  await page.getByTestId('kotc-start-round').click();
  594 |  await expect(page.getByText('Round 1 — LIVE')).toBeVisible();
  595 |  const scores=[[11,7],[8,6],[5,5],[9,4]];
  596 |  for(let c=1;c<=4;c++){
  597 |   await page.getByTestId(`kotc-score-${c}-a`).fill(String(scores[c-1][0]));
  598 |   await page.getByTestId(`kotc-score-${c}-b`).fill(String(scores[c-1][1]));
  599 |   if(c===3){await page.getByTestId('kotc-serving-3-b').click();}
  600 |   await page.getByTestId(`kotc-complete-${c}`).click();
  601 |   await expect(page.getByTestId(`kotc-score-card-${c}`)).toContainText('Saved');
  602 |  }
  603 |  expect(model.matches.find(m=>m.ladder_court_rank===3).winner_side).toBe('B');
  604 |  await expect(page.getByRole('button',{name:'End Round — First Court Reached 11'})).toBeVisible();
  605 |  await page.getByRole('button',{name:'End Round — First Court Reached 11'}).click();
  606 |  await expect(page.getByText(/Whistle called · Collect scores/)).toBeVisible();
  607 |  expect(JSON.parse(model.session.timer_state_json).firstCourtCalledRoundId).toBe('round-1');
  608 |  await page.getByTestId('kotc-prepare-next-round').click();
  609 |  await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2');
```