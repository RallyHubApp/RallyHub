# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:327:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Player 03 updated')
Expected: visible
Timeout: 1200ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Player 03 updated') with timeout 1200ms
  - waiting for getByText('Player 03 updated')

```

```yaml
- main:
  - paragraph: Round 2 — LIVE
  - paragraph: 4 courts · 2 bench
  - button "Session Menu":
    - img
    - text: Session Menu
  - button "Round History":
    - img
    - text: Round History
  - button "Players":
    - img
    - text: Players
  - button "Timer":
    - img
    - text: Timer
  - button "Contacts":
    - img
    - text: Contacts
  - button "Copy Player Link":
    - img
    - text: Copy Player Link
  - button "Email Players":
    - img
    - text: Email Players
  - button "Resend Results":
    - img
    - text: Resend Results
  - button "Player 02 present"
  - button "Player 07 present"
  - button "Player 09 present"
  - button "Player 15 present"
  - button "Player 01 present"
  - button "Player 08 present"
  - button "Player 10 present"
  - button "Player 13 present"
  - button "Player 04 present"
  - button "Player 06 present"
  - button "Player 11 present"
  - button "Player 14 present"
  - button "Player 03 voluntary rest"
  - button "Player 05 present"
  - button "Player 12 present"
  - button "Player 16 present"
  - button "Player 17 present"
  - button "Player 18 present"
  - button "Session Host Access Give a host full control of this KOTC session only, without wider RallyHub access.":
    - img
    - paragraph: Session Host Access
    - paragraph: Give a host full control of this KOTC session only, without wider RallyHub access.
    - img
  - button "Pause Session":
    - img
    - text: Pause Session
  - button "Finish Session Now":
    - img
    - text: Finish Session Now
  - button "Abandon / Cancel"
  - paragraph: Play Time
  - img
  - button "Test / enable speaker sound":
    - img
  - button "Dock timer back in page":
    - img
  - button "Full screen timer":
    - img
  - text: 07:59
  - button "Pause Timer":
    - img
    - text: Pause Timer
  - button "Reset":
    - img
    - text: Reset
  - paragraph: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
  - button "Undo Start / Back to Round Setup":
    - img
    - text: Undo Start / Back to Round Setup
  - paragraph: Bench This Round
  - paragraph: Player 02 · Player 18
  - img
  - text: Court 1 LIVE
  - paragraph: Team A
  - paragraph: Player 17 & Player 07
  - spinbutton
  - paragraph: Team B
  - paragraph: Player 09 & Player 15
  - spinbutton
  - button "Complete Match" [disabled]
  - text: Court 2 LIVE
  - paragraph: Team A
  - paragraph: Player 01 & Player 08
  - spinbutton
  - paragraph: Team B
  - paragraph: Player 10 & Player 13
  - spinbutton
  - button "Complete Match" [disabled]
  - text: Court 3 LIVE
  - paragraph: Team A
  - paragraph: Player 04 & Player 06
  - spinbutton
  - paragraph: Team B
  - paragraph: Player 11 & Player 14
  - spinbutton
  - button "Complete Match" [disabled]
  - text: Court 4 LIVE
  - paragraph: Team A
  - paragraph: Player 03 & Player 05
  - spinbutton
  - paragraph: Team B
  - paragraph: Player 12 & Player 16
  - spinbutton
  - button "Complete Match" [disabled]
```

# Test source

```ts
  318 | }
  319 | 
  320 | function metric(report, name, value, max) {
  321 |   report[name] = value;
  322 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
  323 | }
  324 | 
  325 | test.use({ viewport: { width: 390, height: 844 } });
  326 | 
  327 | test('18-player mobile host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  328 |   const model = createModel();
  329 |   const report = {};
  330 |   await installMockBackend(page, model);
  331 |   page.on('dialog', dialog => dialog.accept());
  332 | 
  333 |   await page.goto('/e2e/kotcHarness.html');
  334 |   await expect(page.getByText('18 players · 4 active courts · 2 bench')).toBeVisible();
  335 | 
  336 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  337 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  338 |   const create = page.getByTestId('kotc-create-session');
  339 |   const createAt = Date.now();
  340 |   await create.click();
  341 |   await expect(create).toContainText('Creating…');
  342 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  343 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  344 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  345 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  346 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  347 | 
  348 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  349 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  350 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  351 |   await firstSlot.click();
  352 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  353 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  354 | 
  355 |   // Lock one pair and make sure the editor reflects the saved lock.
  356 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  357 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  358 | 
  359 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  360 |   let started = Date.now();
  361 |   const startRound = page.getByTestId('kotc-start-round');
  362 |   await startRound.click();
  363 |   await expect(startRound).toContainText('Starting…');
  364 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  365 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  366 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  367 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  368 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  369 | 
  370 |   // Timer controls: pause → reset → explicit Start Timer.
  371 |   await page.getByTestId('kotc-timer-pause').click();
  372 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  373 |   await page.getByTestId('kotc-timer-reset').click();
  374 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  375 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  376 |   await page.getByTestId('kotc-timer-start').click();
  377 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  378 |   await dismissTimerFullscreen(page);
  379 | 
  380 |   // Undo must keep accepted feedback visible for the entire backend delay.
  381 |   const undo = page.getByTestId('kotc-undo-start');
  382 |   await undo.scrollIntoViewIfNeeded();
  383 |   started = Date.now();
  384 |   await undo.evaluate(element => element.click());
  385 |   await expect(undo).toContainText('Returning to Round Setup…');
  386 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  387 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  388 |   await sleep(350);
  389 |   await expect(undo).toContainText('Returning to Round Setup…');
  390 |   await expect(undo).toBeDisabled();
  391 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  392 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  393 |   expect(model.timer?.running).toBe(false);
  394 |   expect(model.timer?.remainingSeconds).toBe(480);
  395 | 
  396 |   // Start again and complete Round 1.
  397 |   started = Date.now();
  398 |   await page.getByTestId('kotc-start-round').click();
  399 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  400 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  401 |   await dismissTimerFullscreen(page);
  402 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  403 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  404 | 
  405 |   started = Date.now();
  406 |   await expect(page.getByText('START ROUND 2')).toBeVisible({ timeout: 2200 });
  407 |   metric(report, 'round1_to_round2_editor_ms', Date.now() - started, 2200);
  408 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  409 | 
  410 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  411 |   await page.getByTestId('kotc-start-round').click();
  412 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  413 |   await dismissTimerFullscreen(page);
  414 |   await page.getByTestId('kotc-session-menu').click();
  415 |   await page.getByTestId('kotc-players-menu').click();
  416 |   await page.getByTestId('kotc-player-participant-03').click();
  417 |   await page.getByTestId('kotc-player-sit-out').click();
> 418 |   await expect(page.getByText('Player 03 updated')).toBeVisible({ timeout: 1200 });
      |                                                     ^ Error: expect(locator).toBeVisible() failed
  419 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  420 | 
  421 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  422 |   await expect(page.getByText('START ROUND 3')).toBeVisible({ timeout: 2200 });
  423 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  424 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  425 | 
  426 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  427 |   await page.getByTestId('kotc-start-round').click();
  428 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  429 |   await dismissTimerFullscreen(page);
  430 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  431 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  432 |   await expect(page.getByText('START ROUND 4')).toBeVisible({ timeout: 2200 });
  433 | 
  434 |   await page.getByTestId('kotc-session-menu').click();
  435 |   started = Date.now();
  436 |   await page.getByTestId('kotc-finish-session').click();
  437 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  438 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  439 |   await expect(page.getByText('Session complete')).toBeVisible();
  440 |   await expect(page.getByText('Gold')).toBeVisible();
  441 |   await expect(page.getByText('Silver')).toBeVisible();
  442 |   await expect(page.getByText('Bronze')).toBeVisible();
  443 | 
  444 |   report.rounds_created = model.rounds.length;
  445 |   report.function_calls = model.calls.length;
  446 |   console.log(`KOTC HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  447 |   await testInfo.attach('kotc-host-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  448 | });
  449 | 
```