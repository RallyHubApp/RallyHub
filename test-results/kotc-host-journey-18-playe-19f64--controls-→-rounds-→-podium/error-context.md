# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:327:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByTestId('kotc-finish-session')

```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Round 4 — ROUND READY
        - paragraph [ref=e8]: 4 courts · 2 bench
      - button "Session Menu" [active] [ref=e9] [cursor=pointer]
    - generic [ref=e10]:
      - generic [ref=e11]:
        - paragraph [ref=e12]: Bench This Round
        - generic [ref=e13]:
          - button "Player 17" [ref=e14] [cursor=pointer]
          - button "Player 18" [ref=e15] [cursor=pointer]
        - paragraph [ref=e16]: Tap a court player, then a bench player, to swap them.
      - generic [ref=e17]:
        - generic [ref=e18]:
          - heading "Host Round Editor" [level=4] [ref=e19]
          - paragraph [ref=e20]: Tap one player then another to swap. Only one pending selection is allowed.
        - generic [ref=e21]:
          - generic [ref=e22]:
            - generic [ref=e23]: Court 1
            - generic [ref=e27]:
              - generic [ref=e28]:
                - paragraph [ref=e29]: Team A
                - button "Lock pair" [ref=e30] [cursor=pointer]
              - generic [ref=e31]:
                - button "Player 04" [ref=e32] [cursor=pointer]
                - button "Player 05" [ref=e41] [cursor=pointer]
            - generic [ref=e50]:
              - generic [ref=e51]:
                - paragraph [ref=e52]: Team B
                - button "Lock pair" [ref=e53] [cursor=pointer]
              - generic [ref=e54]:
                - button "Player 11" [ref=e55] [cursor=pointer]
                - button "Player 16" [ref=e64] [cursor=pointer]
          - generic [ref=e73]:
            - generic [ref=e74]: Court 2
            - generic [ref=e76]:
              - generic [ref=e77]:
                - paragraph [ref=e78]: Team A
                - button "Lock pair" [ref=e79] [cursor=pointer]
              - generic [ref=e80]:
                - button "Player 02" [ref=e81] [cursor=pointer]
                - button "Player 06" [ref=e90] [cursor=pointer]
            - generic [ref=e99]:
              - generic [ref=e100]:
                - paragraph [ref=e101]: Team B
                - button "Lock pair" [ref=e102] [cursor=pointer]
              - generic [ref=e103]:
                - button "Player 12" [ref=e104] [cursor=pointer]
                - button "Player 15" [ref=e113] [cursor=pointer]
          - generic [ref=e122]:
            - generic [ref=e123]: Court 3
            - generic [ref=e125]:
              - generic [ref=e126]:
                - paragraph [ref=e127]: Team A
                - button "Lock pair" [ref=e128] [cursor=pointer]
              - generic [ref=e129]:
                - button "Player 01" [ref=e130] [cursor=pointer]
                - button "Player 07" [ref=e139] [cursor=pointer]
            - generic [ref=e148]:
              - generic [ref=e149]:
                - paragraph [ref=e150]: Team B
                - button "Lock pair" [ref=e151] [cursor=pointer]
              - generic [ref=e152]:
                - button "Player 10" [ref=e153] [cursor=pointer]
                - button "Player 13" [ref=e162] [cursor=pointer]
          - generic [ref=e171]:
            - generic [ref=e172]: Court 4
            - generic [ref=e174]:
              - generic [ref=e175]:
                - paragraph [ref=e176]: Team A
                - button "Lock pair" [ref=e177] [cursor=pointer]
              - generic [ref=e178]:
                - button "Player 03" [ref=e179] [cursor=pointer]
                - button "Player 08" [ref=e188] [cursor=pointer]
            - generic [ref=e197]:
              - generic [ref=e198]:
                - paragraph [ref=e199]: Team B
                - button "Lock pair" [ref=e200] [cursor=pointer]
              - generic [ref=e201]:
                - button "Player 09" [ref=e202] [cursor=pointer]
                - button "Player 14" [ref=e211] [cursor=pointer]
      - button "START ROUND 4" [ref=e220] [cursor=pointer]
      - button "Restore Original Draw" [ref=e221] [cursor=pointer]
```

# Test source

```ts
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
  418 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('voluntary rest', { timeout: 1500 });
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
> 436 |   await page.getByTestId('kotc-finish-session').click();
      |                                                 ^ Error: locator.click: Test timeout of 45000ms exceeded.
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