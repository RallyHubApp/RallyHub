# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:354:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Round 1 — LIVE')
Expected: visible
Timeout: 2000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Round 1 — LIVE') with timeout 2000ms
  - waiting for getByText('Round 1 — LIVE')

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
  - button "Player 02"
  - button "Player 18"
  - paragraph: Tap a court player, then a bench player, to swap them.
  - heading "Host Round Editor" [level=4]
  - paragraph: Tap one player then another to swap. Only one pending selection is allowed.
  - img
  - text: Court 1
  - paragraph: Team A
  - button "Locked ✓ · Unlock" [disabled]:
    - img
    - text: Locked ✓ · Unlock
  - button "Player 17":
    - img
    - text: Player 17
  - button "Player 08":
    - img
    - text: Player 08
  - paragraph: Team B
  - button "Lock pair" [disabled]:
    - img
    - text: Lock pair
  - button "Player 09":
    - img
    - text: Player 09
  - button "Player 15":
    - img
    - text: Player 15
  - text: Court 2
  - paragraph: Team A
  - button "Lock pair" [disabled]:
    - img
    - text: Lock pair
  - button "Player 03":
    - img
    - text: Player 03
  - button "Player 07":
    - img
    - text: Player 07
  - paragraph: Team B
  - button "Lock pair" [disabled]:
    - img
    - text: Lock pair
  - button "Player 11":
    - img
    - text: Player 11
  - button "Player 14":
    - img
    - text: Player 14
  - text: Court 3
  - paragraph: Team A
  - button "Lock pair" [disabled]:
    - img
    - text: Lock pair
  - button "Player 01":
    - img
    - text: Player 01
  - button "Player 06":
    - img
    - text: Player 06
  - paragraph: Team B
  - button "Lock pair" [disabled]:
    - img
    - text: Lock pair
  - button "Player 10":
    - img
    - text: Player 10
  - button "Player 16":
    - img
    - text: Player 16
  - text: Court 4
  - paragraph: Team A
  - button "Lock pair" [disabled]:
    - img
    - text: Lock pair
  - button "Player 04":
    - img
    - text: Player 04
  - button "Player 05":
    - img
    - text: Player 05
  - paragraph: Team B
  - button "Lock pair" [disabled]:
    - img
    - text: Lock pair
  - button "Player 12":
    - img
    - text: Player 12
  - button "Player 13":
    - img
    - text: Player 13
  - paragraph: Pre-Round Check
  - paragraph: Confirm the round time and hall sound before players begin.
  - img
  - paragraph: Round timer
  - paragraph: Adjust now if tonight needs a shorter or longer round.
  - text: 08:00
  - button "− 1 min" [disabled]
  - button "+ 1 min" [disabled]
  - paragraph: Hall sound check
  - paragraph: Test the real cue and spoken voice before play. This uses your device/speaker only — no Base44 call.
  - button "Test Sound":
    - img
    - text: Test Sound
  - button "Starting…" [disabled]:
    - img
    - text: Starting…
  - button "Back to Setup" [disabled]:
    - img
    - text: Back to Setup
  - button "Restore Original Draw" [disabled]:
    - img
    - text: Restore Original Draw
```

# Test source

```ts
  316 |       try { body = request.postDataJSON() || {}; } catch { body = {}; }
  317 |       const payload = await model.handleFunction(name, body);
  318 |       return json(route, payload);
  319 |     }
  320 |     return json(route, []);
  321 |   });
  322 | }
  323 | 
  324 | async function dismissTimerFullscreen(page) {
  325 |   // The normal host flow must never manufacture a full-screen timer state. If a prior
  326 |   // explicit test/user action left it full-screen, return it to the docked in-page state.
  327 |   const exit = page.getByTitle('Exit full screen timer');
  328 |   if (await exit.count()) await exit.first().click();
  329 |   const dock = page.getByTitle('Dock timer back in page');
  330 |   if (await dock.count()) await dock.first().click();
  331 | }
  332 | 
  333 | async function scoreCurrentRound(page, courtCount = 4, baseScore = 11) {
  334 |   const timings = [];
  335 |   for (let court = 1; court <= courtCount; court++) {
  336 |     await page.getByTestId(`kotc-score-${court}-a`).fill(String(baseScore));
  337 |     await page.getByTestId(`kotc-score-${court}-b`).fill(String(Math.max(0, baseScore - 4 - court)));
  338 |     const button = page.getByTestId(`kotc-complete-${court}`);
  339 |     const started = Date.now();
  340 |     await button.click();
  341 |     await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved', { timeout: 2000 });
  342 |     timings.push(Date.now() - started);
  343 |   }
  344 |   return timings;
  345 | }
  346 | 
  347 | function metric(report, name, value, max) {
  348 |   report[name] = value;
  349 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
  350 | }
  351 | 
  352 | test.use({ viewport: { width: 390, height: 844 } });
  353 | 
  354 | test('18-player mobile host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  355 |   const model = createModel();
  356 |   const report = {};
  357 |   await installMockBackend(page, model);
  358 |   page.on('dialog', dialog => dialog.accept());
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
> 416 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
      |                                                  ^ Error: expect(locator).toBeVisible() failed
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
  453 |   // Host-only sessions remain fast: ordinary score entry does not create scorer-lease traffic.
  454 |   // Collaborative first-claim-wins locking is covered separately by the host + two scorer robot.
  455 |   const claimsBefore=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  456 |   await page.getByTestId('kotc-score-1-a').focus();
  457 |   expect(model.calls.filter(c=>c.body?.commandType==='host_claim_score').length).toBe(claimsBefore);
  458 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  459 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  460 | 
  461 |   await expect(page.getByText('All scores saved for Round 1')).toBeVisible({ timeout: 1800 });
  462 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('started');
  463 |   started = Date.now();
  464 |   await page.getByTestId('kotc-prepare-next-round').click();
  465 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2', { timeout: 2200 });
  466 |   metric(report, 'round1_review_to_round2_editor_ms', Date.now() - started, 2200);
  467 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  468 | 
  469 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  470 |   await page.getByTestId('kotc-start-round').click();
  471 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  472 |   await dismissTimerFullscreen(page);
  473 |   await page.getByTestId('kotc-session-menu').click();
  474 |   await page.getByTestId('kotc-players-menu').click();
  475 |   await page.getByTestId('kotc-player-participant-03').click();
  476 |   await page.getByTestId('kotc-player-sit-out').click();
  477 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('voluntary rest', { timeout: 1500 });
  478 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  479 | 
  480 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  481 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  482 |   await page.getByTestId('kotc-prepare-next-round').click();
  483 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3', { timeout: 2200 });
  484 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  485 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  486 | 
  487 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  488 |   await page.getByTestId('kotc-start-round').click();
  489 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  490 |   await dismissTimerFullscreen(page);
  491 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  492 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  493 |   await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });
  494 | 
  495 |   const finishButton = page.getByTestId('kotc-finish-session');
  496 |   if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  497 |   await expect(finishButton).toBeVisible();
  498 |   started = Date.now();
  499 |   await finishButton.click();
  500 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  501 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  502 |   await expect(page.getByText('Session complete')).toBeVisible();
  503 |   await expect(page.getByText('Gold')).toBeVisible();
  504 |   await expect(page.getByText('Silver')).toBeVisible();
  505 |   await expect(page.getByText('Bronze')).toBeVisible();
  506 | 
  507 |   // Post-event audit correction: reopen Round 1 / Court 1, reverse the result and
  508 |   // confirm RallyHub stores it as a correction without rewriting later court assignments.
  509 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  510 |   await page.getByRole('button',{name:'Round 1',exact:true}).click();
  511 |   const preCorrectionRound2=JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'));
  512 |   const reviewCard=page.getByTestId('kotc-score-card-1').first();
  513 |   await reviewCard.getByRole('button',{name:'Edit result'}).click();
  514 |   await reviewCard.getByTestId('kotc-score-1-a').fill('2');
  515 |   await reviewCard.getByTestId('kotc-score-1-b').fill('12');
  516 |   await reviewCard.getByRole('button',{name:'Save Correction'}).click();
```