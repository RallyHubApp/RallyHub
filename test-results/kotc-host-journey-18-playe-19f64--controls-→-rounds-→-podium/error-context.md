# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:354:1

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
      - paragraph [ref=e42]: Player 03 · Player 18
    - generic [ref=e43]:
      - generic [ref=e44]:
        - generic [ref=e45]:
          - generic [ref=e46]: Court 1
          - generic [ref=e50]: LIVE
        - generic [ref=e51]:
          - generic [ref=e52]:
            - paragraph [ref=e53]: Team A
            - paragraph [ref=e54]: Player 17 & Player 07
          - textbox [active] [ref=e55]
        - generic [ref=e56]:
          - generic [ref=e57]:
            - paragraph [ref=e58]: Team B
            - paragraph [ref=e59]: Player 11 & Player 14
          - textbox [ref=e60]
        - button "Complete Match" [disabled]
      - generic [ref=e61]:
        - generic [ref=e62]:
          - generic [ref=e63]: Court 2
          - generic [ref=e65]: LIVE
        - generic [ref=e66]:
          - generic [ref=e67]:
            - paragraph [ref=e68]: Team A
            - paragraph [ref=e69]: Player 02 & Player 08
          - textbox [ref=e70]
        - generic [ref=e71]:
          - generic [ref=e72]:
            - paragraph [ref=e73]: Team B
            - paragraph [ref=e74]: Player 10 & Player 13
          - textbox [ref=e75]
        - button "Complete Match" [disabled]
      - generic [ref=e76]:
        - generic [ref=e77]:
          - generic [ref=e78]: Court 3
          - generic [ref=e80]: LIVE
        - generic [ref=e81]:
          - generic [ref=e82]:
            - paragraph [ref=e83]: Team A
            - paragraph [ref=e84]: Player 04 & Player 05
          - textbox [ref=e85]
        - generic [ref=e86]:
          - generic [ref=e87]:
            - paragraph [ref=e88]: Team B
            - paragraph [ref=e89]: Player 09 & Player 15
          - textbox [ref=e90]
        - button "Complete Match" [disabled]
      - generic [ref=e91]:
        - generic [ref=e92]:
          - generic [ref=e93]: Court 4
          - generic [ref=e95]: LIVE
        - generic [ref=e96]:
          - generic [ref=e97]:
            - paragraph [ref=e98]: Team A
            - paragraph [ref=e99]: Player 01 & Player 06
          - textbox [ref=e100]
        - generic [ref=e101]:
          - generic [ref=e102]:
            - paragraph [ref=e103]: Team B
            - paragraph [ref=e104]: Player 12 & Player 16
          - textbox [ref=e105]
        - button "Complete Match" [disabled]
```

# Test source

```ts
  359 | 
  360 |   await page.goto('/e2e/kotcHarness.html');
  361 |   await expect(page.getByTestId('kotc-setup')).toBeVisible();
  362 |   await expect(page.getByTestId('kotc-setup')).toContainText('18 players');
  363 |   await expect(page.getByTestId('kotc-setup')).toContainText('4 courts');
  364 |   await expect(page.getByTestId('kotc-setup')).toContainText('2 bench');
  365 | 
  366 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  367 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  368 |   const create = page.getByTestId('kotc-create-session');
  369 |   const createAt = Date.now();
  370 |   await create.click();
  371 |   await expect(create).toContainText('Creating Round 1…');
  372 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  373 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  374 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  375 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  376 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  377 | 
  378 |   // The host must be able to get the scoring/public links from the live Round screen
  379 |   // without navigating backwards through the app.
  380 |   await page.getByTestId('kotc-quick-links').click();
  381 |   await expect(page.getByText('Session Links & Access')).toBeVisible();
  382 |   await page.getByTestId('kotc-session-menu').click();
  383 | 
  384 |   // Mobile back/forward-cache recovery: returning to the host page must force a fresh
  385 |   // authoritative state read and leave Start Round actionable rather than stuck disabled.
  386 |   const stateReadsBeforeReturn=model.calls.filter(c=>c.name==='getKotcV2State').length;
  387 |   await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  388 |   await expect.poll(()=>model.calls.filter(c=>c.name==='getKotcV2State').length).toBeGreaterThan(stateReadsBeforeReturn);
  389 |   await expect(page.getByTestId('kotc-start-round')).toBeEnabled();
  390 | 
  391 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  392 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  393 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  394 |   await firstSlot.click();
  395 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  396 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  397 | 
  398 |   // Lock one pair and make sure the editor reflects the saved lock. The lock action must
  399 |   // also persist the current proposed-round draft, so the court/bench swap is no longer
  400 |   // stranded only in the browser until START ROUND is pressed.
  401 |   const swappedSlotId='r1-c1-A-1';
  402 |   const swappedParticipantBeforeLock=model.slots.find(s=>s.id===swappedSlotId)?.participant_id;
  403 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  404 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  405 |   const pairLockCall=[...model.calls].reverse().find(c=>c.name==='setKotcPairLock');
  406 |   expect(pairLockCall?.body?.slotParticipantIds).toBeTruthy();
  407 |   expect(model.slots.find(s=>s.id===swappedSlotId)?.participant_id).not.toBe(swappedParticipantBeforeLock);
  408 |   expect(Number(model.rounds.find(r=>r.id==='round-1')?.proposal_revision||0)).toBeGreaterThan(1);
  409 | 
  410 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  411 |   let started = Date.now();
  412 |   const startRound = page.getByTestId('kotc-start-round');
  413 |   await startRound.click();
  414 |   await expect(startRound).toContainText('Starting…');
  415 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  416 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  417 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  418 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  419 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  420 | 
  421 |   // Timer controls: pause → reset → explicit Start Timer.
  422 |   await page.getByTestId('kotc-timer-pause').click();
  423 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  424 |   await page.getByTestId('kotc-timer-reset').click();
  425 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  426 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  427 |   await page.getByTestId('kotc-timer-start').click();
  428 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  429 |   await dismissTimerFullscreen(page);
  430 | 
  431 |   // Undo must keep accepted feedback visible for the entire backend delay.
  432 |   const undo = page.getByTestId('kotc-undo-start');
  433 |   await undo.scrollIntoViewIfNeeded();
  434 |   started = Date.now();
  435 |   await undo.evaluate(element => element.click());
  436 |   await expect(undo).toContainText('Returning to Round Setup…');
  437 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  438 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  439 |   await sleep(350);
  440 |   await expect(undo).toContainText('Returning to Round Setup…');
  441 |   await expect(undo).toBeDisabled();
  442 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  443 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  444 |   expect(model.timer?.running).toBe(false);
  445 |   expect(model.timer?.remainingSeconds).toBe(480);
  446 | 
  447 |   // Start again and complete Round 1.
  448 |   started = Date.now();
  449 |   await page.getByTestId('kotc-start-round').click();
  450 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  451 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  452 |   await dismissTimerFullscreen(page);
  453 |   // A player/scorer device has Court 1 locked. The host touching the score box must
  454 |   // take authority immediately without changing the match revision.
  455 |   const round1Court1=model.matches.find(m=>m.id==='match-r1-c1');
  456 |   round1Court1.scoring_lock_owner='player-device-1';
  457 |   round1Court1.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();
  458 |   await page.getByTestId('kotc-score-1-a').focus();
> 459 |   await expect.poll(()=>round1Court1.scoring_lock_owner).toBe('host:e2e');
      |                                                          ^ Error: expect(received).toBe(expected) // Object.is equality
  460 |   report.host_displaced_player_scorer=true;
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
  480 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('voluntary rest', { timeout: 1500 });
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
  529 |   console.log(`KOTC HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  530 |   await testInfo.attach('kotc-host-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  531 | });
  532 | 
```