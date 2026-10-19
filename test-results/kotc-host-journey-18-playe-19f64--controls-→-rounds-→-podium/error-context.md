# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:368:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByTestId('kotc-player-participant-03')

```

# Page snapshot

```yaml
- main [ref=f1e3]:
  - generic [ref=f1e4]:
    - generic [ref=f1e5]:
      - generic [ref=f1e6]:
        - paragraph [ref=f1e7]: Round 2 — LIVE
        - paragraph [ref=f1e8]: 4 courts · 2 bench · 0/4 scores saved
      - generic [ref=f1e9]:
        - button "Roster" [ref=f1e10] [cursor=pointer]
        - button "Leaderboard" [ref=f1e11] [cursor=pointer]
        - button "Links" [ref=f1e12] [cursor=pointer]
        - button "Menu" [ref=f1e13] [cursor=pointer]
    - generic [ref=f1e14]:
      - paragraph [ref=f1e15]: What happens next
      - paragraph [ref=f1e16]: Round 2 live · 0/4 scores saved
      - paragraph [ref=f1e17]: "Next: collect Court 1, Court 2, Court 3, Court 4 results. You can correct any saved score before advancing."
    - generic [ref=f1e18]:
      - generic [ref=f1e19]:
        - generic [ref=f1e20]:
          - paragraph [ref=f1e21]: Session tools
          - paragraph [ref=f1e22]: Use these only when something changes during play.
        - generic [ref=f1e23]:
          - button "Round History" [ref=f1e24] [cursor=pointer]
          - button "Roster" [active] [ref=f1e25] [cursor=pointer]
          - button "Timer" [ref=f1e26] [cursor=pointer]
          - button "Contacts" [ref=f1e27] [cursor=pointer]
      - generic [ref=f1e28]:
        - generic [ref=f1e29]:
          - paragraph [ref=f1e30]: Sharing & access
          - paragraph [ref=f1e31]: Live view, player scoring and delegated host access all stay session-specific.
        - button [ref=f1e33] [cursor=pointer]:
          - generic [ref=f1e38]:
            - paragraph [ref=f1e39]: Player Link, Broadcasts & Access
            - paragraph [ref=f1e40]: One KOTC Player Link evolves from sign-up through live rounds, scoring and final results.
      - generic [ref=f1e43]:
        - generic [ref=f1e44]:
          - paragraph [ref=f1e45]: Session control
          - paragraph [ref=f1e46]: Pause if play stops. Finish only when tonight’s session is over.
        - generic [ref=f1e47]:
          - button "Pause Session" [ref=f1e48] [cursor=pointer]
          - button "Finish Session" [ref=f1e49] [cursor=pointer]
        - group [ref=f1e50]:
          - generic "Emergency / cancel session" [ref=f1e51] [cursor=pointer]
    - generic [ref=f1e52]:
      - paragraph [ref=f1e53]: Host recovery · locked partnerships
      - paragraph [ref=f1e54]: Unlock a pair here if you need to correct a lock. Scores and completed court results are preserved.
      - generic [ref=f1e55]:
        - generic [ref=f1e56]: Player 17 + Player 08
        - button "Unlock" [ref=f1e57] [cursor=pointer]
    - generic [ref=f1e58]:
      - generic [ref=f1e59]:
        - generic [ref=f1e60]:
          - paragraph [ref=f1e61]: Play Time
          - paragraph [ref=f1e62]: 8 min round timer
        - generic [ref=f1e63]:
          - button "Test speaker and spoken announcement" [ref=f1e64] [cursor=pointer]
          - button "Float and move timer" [ref=f1e65] [cursor=pointer]
          - button "Full screen timer" [ref=f1e66] [cursor=pointer]
      - generic [ref=f1e67]: 07:25
      - paragraph [ref=f1e71]: Cue and announcements play at full RallyHub volume using this device’s default voice. Set the actual hall loudness with the device media-volume buttons before play.
      - generic [ref=f1e72]:
        - button "Pause Timer" [ref=f1e73] [cursor=pointer]
        - button "Reset" [ref=f1e74] [cursor=pointer]
    - paragraph [ref=f1e75]: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
    - button "← Back one step · Round Setup" [ref=f1e76] [cursor=pointer]
    - generic [ref=f1e77]:
      - paragraph [ref=f1e78]: Bench This Round
      - paragraph [ref=f1e79]: Player 01 · Player 18
    - generic [ref=f1e80]:
      - generic [ref=f1e81]:
        - generic [ref=f1e82]:
          - generic [ref=f1e83]: Court 1
          - generic [ref=f1e87]: LIVE
        - generic [ref=f1e88]:
          - generic [ref=f1e89]:
            - paragraph [ref=f1e90]: Team A
            - paragraph [ref=f1e91]: Player 17 & Player 08
          - textbox [ref=f1e92]
        - generic [ref=f1e93]:
          - generic [ref=f1e94]:
            - paragraph [ref=f1e95]: Team B
            - paragraph [ref=f1e96]: Player 09 & Player 16
          - textbox [ref=f1e97]
        - generic [ref=f1e98]:
          - button "Complete Match" [disabled]
      - generic [ref=f1e99]:
        - generic [ref=f1e100]:
          - generic [ref=f1e101]: Court 2
          - generic [ref=f1e103]: LIVE
        - generic [ref=f1e104]:
          - generic [ref=f1e105]:
            - paragraph [ref=f1e106]: Team A
            - paragraph [ref=f1e107]: Player 02 & Player 07
          - textbox [ref=f1e108]
        - generic [ref=f1e109]:
          - generic [ref=f1e110]:
            - paragraph [ref=f1e111]: Team B
            - paragraph [ref=f1e112]: Player 10 & Player 15
          - textbox [ref=f1e113]
        - generic [ref=f1e114]:
          - button "Complete Match" [disabled]
      - generic [ref=f1e115]:
        - generic [ref=f1e116]:
          - generic [ref=f1e117]: Court 3
          - generic [ref=f1e119]: LIVE
        - generic [ref=f1e120]:
          - generic [ref=f1e121]:
            - paragraph [ref=f1e122]: Team A
            - paragraph [ref=f1e123]: Player 03 & Player 06
          - textbox [ref=f1e124]
        - generic [ref=f1e125]:
          - generic [ref=f1e126]:
            - paragraph [ref=f1e127]: Team B
            - paragraph [ref=f1e128]: Player 11 & Player 14
          - textbox [ref=f1e129]
        - generic [ref=f1e130]:
          - button "Complete Match" [disabled]
      - generic [ref=f1e131]:
        - generic [ref=f1e132]:
          - generic [ref=f1e133]: Court 4
          - generic [ref=f1e135]: LIVE
        - generic [ref=f1e136]:
          - generic [ref=f1e137]:
            - paragraph [ref=f1e138]: Team A
            - paragraph [ref=f1e139]: Player 04 & Player 05
          - textbox [ref=f1e140]
        - generic [ref=f1e141]:
          - generic [ref=f1e142]:
            - paragraph [ref=f1e143]: Team B
            - paragraph [ref=f1e144]: Player 12 & Player 13
          - textbox [ref=f1e145]
        - generic [ref=f1e146]:
          - button "Complete Match" [disabled]
    - generic [ref=f1e147]:
      - generic [ref=f1e148]:
        - paragraph [ref=f1e149]: Round 2 · 0/4 scores showing on this device
        - paragraph [ref=f1e150]: If players used the court scoring link, press the button below. RallyHub will check the latest saved court scores before advancing.
      - button "Check Scores & Prepare Next Round" [ref=f1e152] [cursor=pointer]
```

# Test source

```ts
  405 | 
  406 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  407 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  408 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  409 |   await firstSlot.click();
  410 |   await page.getByTestId('kotc-bench-player-participant-17').click();
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
> 505 |   await page.getByTestId('kotc-player-participant-03').click();
      |                                                        ^ Error: locator.click: Test timeout of 45000ms exceeded.
  506 |   await page.getByTestId('kotc-player-sit-out').click();
  507 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('voluntary rest', { timeout: 1500 });
  508 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  509 | 
  510 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  511 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  512 |   await page.getByTestId('kotc-prepare-next-round').click();
  513 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3', { timeout: 2200 });
  514 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  515 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  516 | 
  517 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  518 |   await page.getByTestId('kotc-start-round').click();
  519 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  520 |   await dismissTimerFullscreen(page);
  521 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  522 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  523 |   await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });
  524 | 
  525 |   const finishButton = page.getByTestId('kotc-finish-session');
  526 |   if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  527 |   await expect(finishButton).toBeVisible();
  528 |   started = Date.now();
  529 |   await finishButton.click();
  530 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  531 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  532 |   await expect(page.getByText('Session complete')).toBeVisible();
  533 |   await expect(page.getByText('Gold')).toBeVisible();
  534 |   await expect(page.getByText('Silver')).toBeVisible();
  535 |   await expect(page.getByText('Bronze')).toBeVisible();
  536 | 
  537 |   // Post-event audit correction: reopen Round 1 / Court 1, reverse the result and
  538 |   // confirm RallyHub stores it as a correction without rewriting later court assignments.
  539 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  540 |   await page.getByRole('button',{name:'Round 1',exact:true}).click();
  541 |   const preCorrectionRound2=JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'));
  542 |   const reviewCard=page.getByTestId('kotc-score-card-1').first();
  543 |   await reviewCard.getByRole('button',{name:'Edit result'}).click();
  544 |   await reviewCard.getByTestId('kotc-score-1-a').fill('2');
  545 |   await reviewCard.getByTestId('kotc-score-1-b').fill('12');
  546 |   await reviewCard.getByRole('button',{name:'Save Correction'}).click();
  547 |   await expect(reviewCard).toContainText('Saved 2–12',{timeout:1800});
  548 |   const corrected=model.matches.find(m=>m.id==='match-r1-c1');
  549 |   expect(corrected.correction_count).toBe(1);
  550 |   expect(corrected.winner_side).toBe('B');
  551 |   expect(JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'))).toBe(preCorrectionRound2);
  552 |   report.post_event_score_correction=true;
  553 | 
  554 |   report.rounds_created = model.rounds.length;
  555 |   report.function_calls = model.calls.length;
  556 |   console.log(`KOTC HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  557 |   await testInfo.attach('kotc-host-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  558 | });
  559 | 
```