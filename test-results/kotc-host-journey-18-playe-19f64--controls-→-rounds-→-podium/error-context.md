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

Locator: getByTestId('kotc-save-round-status')
Expected substring: "Round setup saved"
Timeout: 1800ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByTestId('kotc-save-round-status') with timeout 1800ms
  - waiting for getByTestId('kotc-save-round-status')

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
  - button "Player 01"
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
  - button "Locked ✓ · Unlock":
    - img
    - text: Locked ✓ · Unlock
  - button "Player 17":
    - img
    - text: Player 17
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
  - text: Court 3
  - button "Move whole Court 3":
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
  - text: Court 4
  - button "Move whole Court 4":
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
- text: You have dropped the item. You have moved the item from position 4 to position 2
```

# Test source

```ts
  332 |       return json(route, payload);
  333 |     }
  334 |     return json(route, []);
  335 |   });
  336 | }
  337 | 
  338 | async function dismissTimerFullscreen(page) {
  339 |   // The normal host flow must never manufacture a full-screen timer state. If a prior
  340 |   // explicit test/user action left it full-screen, return it to the docked in-page state.
  341 |   const exit = page.getByTitle('Exit full screen timer');
  342 |   if (await exit.count()) await exit.first().click();
  343 |   const dock = page.getByTitle('Dock timer back in page');
  344 |   if (await dock.count()) await dock.first().click();
  345 | }
  346 | 
  347 | async function scoreCurrentRound(page, courtCount = 4, baseScore = 11) {
  348 |   const timings = [];
  349 |   for (let court = 1; court <= courtCount; court++) {
  350 |     await page.getByTestId(`kotc-score-${court}-a`).fill(String(baseScore));
  351 |     await page.getByTestId(`kotc-score-${court}-b`).fill(String(Math.max(0, baseScore - 4 - court)));
  352 |     const button = page.getByTestId(`kotc-complete-${court}`);
  353 |     const started = Date.now();
  354 |     await button.click();
  355 |     await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved', { timeout: 2000 });
  356 |     timings.push(Date.now() - started);
  357 |   }
  358 |   return timings;
  359 | }
  360 | 
  361 | function metric(report, name, value, max) {
  362 |   report[name] = value;
  363 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
  364 | }
  365 | 
  366 | test.use({ viewport: { width: 390, height: 844 } });
  367 | 
  368 | test('18-player mobile host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  369 |   const model = createModel();
  370 |   const report = {};
  371 |   await installMockBackend(page, model);
  372 |   page.on('dialog', dialog => dialog.accept());
  373 | 
  374 |   await page.goto('/e2e/kotcHarness.html');
  375 |   await expect(page.getByTestId('kotc-setup')).toBeVisible();
  376 |   await expect(page.getByTestId('kotc-setup')).toContainText('18 players');
  377 |   await expect(page.getByTestId('kotc-setup')).toContainText('4 courts');
  378 |   await expect(page.getByTestId('kotc-setup')).toContainText('2 bench');
  379 | 
  380 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  381 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  382 |   const create = page.getByTestId('kotc-create-session');
  383 |   const createAt = Date.now();
  384 |   await create.click();
  385 |   await expect(create).toContainText('Creating Round 1…');
  386 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  387 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  388 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  389 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  390 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  391 | 
  392 |   // The host must be able to get the scoring/public links from the live Round screen
  393 |   // without navigating backwards through the app.
  394 |   await page.getByTestId('kotc-quick-links').click();
  395 |   await expect(page.getByText('Session Links & Access')).toBeVisible();
  396 |   await page.getByTestId('kotc-session-menu').click();
  397 | 
  398 |   // Mobile back/forward-cache recovery: returning to the host page must force a fresh
  399 |   // authoritative state read and leave Start Round actionable rather than stuck disabled.
  400 |   const stateReadsBeforeReturn=model.calls.filter(c=>c.name==='getKotcV2State').length;
  401 |   await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  402 |   await expect.poll(()=>model.calls.filter(c=>c.name==='getKotcV2State').length).toBeGreaterThan(stateReadsBeforeReturn);
  403 |   await expect(page.getByTestId('kotc-start-round')).toBeEnabled();
  404 | 
  405 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  406 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  407 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  408 |   await firstSlot.click();
  409 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  410 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  411 | 
  412 |   // Lock one pair and make sure the editor reflects the saved lock. The lock action must
  413 |   // also persist the current proposed-round draft, so the court/bench swap is no longer
  414 |   // stranded only in the browser until START ROUND is pressed.
  415 |   const swappedSlotId='r1-c1-A-1';
  416 |   const swappedParticipantBeforeLock=model.slots.find(s=>s.id===swappedSlotId)?.participant_id;
  417 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  418 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  419 |   const pairLockCall=[...model.calls].reverse().find(c=>c.name==='setKotcPairLock');
  420 |   expect(pairLockCall?.body?.slotParticipantIds).toBeTruthy();
  421 |   expect(model.slots.find(s=>s.id===swappedSlotId)?.participant_id).not.toBe(swappedParticipantBeforeLock);
  422 |   expect(Number(model.rounds.find(r=>r.id==='round-1')?.proposal_revision||0)).toBeGreaterThan(1);
  423 | 
  424 |   // Busy-hall setup: move an entire four-player court as one unit, save it without
  425 |   // starting the round, then reload and prove that the saved court layout survives.
  426 |   const court4Before=model.slots.filter(s=>s.round_id==='round-1'&&Number(s.ladder_court_rank)===4).sort((a,b)=>String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number)).map(s=>s.participant_id);
  427 |   const courtMove=page.getByTestId('kotc-whole-court-drag-4');
  428 |   await courtMove.focus();await courtMove.press('Space');await courtMove.press('ArrowUp');await courtMove.press('ArrowUp');await courtMove.press('Space');
  429 |   const saveRound=page.getByTestId('kotc-save-round-setup');
  430 |   await expect(saveRound).toBeEnabled();
  431 |   const saveBefore=model.calls.filter(c=>c.name==='kotcCommand'&&c.body.commandType==='adjust_proposed_round').length;
> 432 |   const saveStarted=Date.now();await saveRound.click();await expect(page.getByText('Saving Round 1 setup… command sent')).toBeVisible({timeout:300});metric(report,'round_setup_save_ack_ms',Date.now()-saveStarted,300);await expect(page.getByTestId('kotc-save-round-status')).toContainText('Round setup saved',{timeout:1800});
      |                                                                                                                                                                                                                                                                                   ^ Error: expect(locator).toContainText(expected) failed
  433 |   expect(model.calls.filter(c=>c.name==='kotcCommand'&&c.body.commandType==='adjust_proposed_round').length-saveBefore).toBe(1);
  434 |   const court2After=model.slots.filter(s=>s.round_id==='round-1'&&Number(s.ladder_court_rank)===2).sort((a,b)=>String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number)).map(s=>s.participant_id);
  435 |   expect(court2After).toEqual(court4Before);report.whole_court_drag_saved=true;
  436 |   const movedCourtName=model.participants.find(p=>p.id===court4Before[0])?.display_name;
  437 |   await page.reload();await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:1800});await expect(page.getByTestId('kotc-whole-court-2')).toContainText(movedCourtName);report.round_setup_survives_reload=true;
  438 | 
  439 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  440 |   let started = Date.now();
  441 |   const startRound = page.getByTestId('kotc-start-round');
  442 |   await startRound.click();
  443 |   await expect(startRound).toContainText('Starting…');
  444 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  445 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  446 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  447 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  448 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  449 | 
  450 |   // Timer controls: pause → reset → explicit Start Timer.
  451 |   await page.getByTestId('kotc-timer-pause').click();
  452 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  453 |   await page.getByTestId('kotc-timer-reset').click();
  454 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  455 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  456 |   await page.getByTestId('kotc-timer-start').click();
  457 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  458 |   await dismissTimerFullscreen(page);
  459 | 
  460 |   // Undo must keep accepted feedback visible for the entire backend delay.
  461 |   const undo = page.getByTestId('kotc-undo-start');
  462 |   await undo.scrollIntoViewIfNeeded();
  463 |   started = Date.now();
  464 |   await undo.evaluate(element => element.click());
  465 |   await expect(undo).toContainText('Returning to Round Setup…');
  466 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  467 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  468 |   await sleep(350);
  469 |   await expect(undo).toContainText('Returning to Round Setup…');
  470 |   await expect(undo).toBeDisabled();
  471 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  472 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  473 |   expect(model.timer?.running).toBe(false);
  474 |   expect(model.timer?.remainingSeconds).toBe(480);
  475 | 
  476 |   // Start again and complete Round 1.
  477 |   started = Date.now();
  478 |   await page.getByTestId('kotc-start-round').click();
  479 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  480 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  481 |   await dismissTimerFullscreen(page);
  482 |   // Host-only sessions remain fast: ordinary score entry does not create scorer-lease traffic.
  483 |   // Collaborative first-claim-wins locking is covered separately by the host + two scorer robot.
  484 |   const claimsBefore=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  485 |   await page.getByTestId('kotc-score-1-a').focus();
  486 |   expect(model.calls.filter(c=>c.body?.commandType==='host_claim_score').length).toBe(claimsBefore);
  487 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  488 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  489 | 
  490 |   await expect(page.getByText('All scores saved for Round 1')).toBeVisible({ timeout: 1800 });
  491 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('started');
  492 |   started = Date.now();
  493 |   await page.getByTestId('kotc-prepare-next-round').click();
  494 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2', { timeout: 2200 });
  495 |   metric(report, 'round1_review_to_round2_editor_ms', Date.now() - started, 2200);
  496 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  497 | 
  498 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  499 |   await page.getByTestId('kotc-start-round').click();
  500 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  501 |   await dismissTimerFullscreen(page);
  502 |   await page.getByTestId('kotc-session-menu').click();
  503 |   await page.getByTestId('kotc-players-menu').click();
  504 |   await page.getByTestId('kotc-player-participant-03').click();
  505 |   await page.getByTestId('kotc-player-sit-out').click();
  506 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('voluntary rest', { timeout: 1500 });
  507 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  508 | 
  509 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  510 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  511 |   await page.getByTestId('kotc-prepare-next-round').click();
  512 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3', { timeout: 2200 });
  513 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  514 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  515 | 
  516 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  517 |   await page.getByTestId('kotc-start-round').click();
  518 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  519 |   await dismissTimerFullscreen(page);
  520 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  521 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  522 |   await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });
  523 | 
  524 |   const finishButton = page.getByTestId('kotc-finish-session');
  525 |   if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  526 |   await expect(finishButton).toBeVisible();
  527 |   started = Date.now();
  528 |   await finishButton.click();
  529 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  530 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  531 |   await expect(page.getByText('Session complete')).toBeVisible();
  532 |   await expect(page.getByText('Gold')).toBeVisible();
```