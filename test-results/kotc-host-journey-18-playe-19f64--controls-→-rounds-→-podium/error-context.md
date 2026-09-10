# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:340:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('START ROUND 2')
Expected: visible
Error: strict mode violation: getByText('START ROUND 2') resolved to 2 elements:
    1) <p data-dynamic-content="true" data-collection-item-field="detail" class="text-xs text-muted-foreground mt-1" data-source-location="src/components/kotc/KotcV2SessionView.jsx:149:361">Next: check the 4 court assignments and bench, th…</p> aka getByText('Next: check the 4 court')
    2) <button data-dynamic-content="true" data-testid="kotc-start-round" data-source-location="src/components/kotc/KotcV2SessionView.jsx:76:4" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full min-h…>…</button> aka getByTestId('kotc-start-round')

Call log:
  - Expect "toBeVisible" getByText('START ROUND 2') with timeout 2200ms
  - waiting for getByText('START ROUND 2')

```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Round 2 — ROUND READY
        - paragraph [ref=e8]: 4 courts · 2 bench
      - button "Session Menu" [ref=e9] [cursor=pointer]
    - generic [ref=e10]:
      - paragraph [ref=e11]: What happens next
      - paragraph [ref=e12]: Round 2 ready
      - paragraph [ref=e13]: "Next: check the 4 court assignments and bench, then Start Round 2."
    - generic [ref=e14]:
      - generic [ref=e15]:
        - paragraph [ref=e16]: Bench This Round
        - generic [ref=e17]:
          - button "Player 03" [ref=e18] [cursor=pointer]
          - button "Player 18" [ref=e19] [cursor=pointer]
        - paragraph [ref=e20]: Tap a court player, then a bench player, to swap them.
      - generic [ref=e21]:
        - generic [ref=e22]:
          - heading "Host Round Editor" [level=4] [ref=e23]
          - paragraph [ref=e24]: Tap one player then another to swap. Only one pending selection is allowed.
        - generic [ref=e25]:
          - generic [ref=e26]:
            - generic [ref=e27]: Court 1
            - generic [ref=e31]:
              - generic [ref=e32]:
                - paragraph [ref=e33]: Team A
                - button "Unlock" [ref=e34] [cursor=pointer]
              - generic [ref=e35]:
                - button "Player 17" [ref=e36] [cursor=pointer]
                - button "Player 07" [ref=e45] [cursor=pointer]
            - generic [ref=e54]:
              - generic [ref=e55]:
                - paragraph [ref=e56]: Team B
                - button "Lock pair" [ref=e57] [cursor=pointer]
              - generic [ref=e58]:
                - button "Player 09" [ref=e59] [cursor=pointer]
                - button "Player 13" [ref=e68] [cursor=pointer]
          - generic [ref=e77]:
            - generic [ref=e78]: Court 2
            - generic [ref=e80]:
              - generic [ref=e81]:
                - paragraph [ref=e82]: Team A
                - button "Lock pair" [ref=e83] [cursor=pointer]
              - generic [ref=e84]:
                - button "Player 01" [ref=e85] [cursor=pointer]
                - button "Player 06" [ref=e94] [cursor=pointer]
            - generic [ref=e103]:
              - generic [ref=e104]:
                - paragraph [ref=e105]: Team B
                - button "Lock pair" [ref=e106] [cursor=pointer]
              - generic [ref=e107]:
                - button "Player 11" [ref=e108] [cursor=pointer]
                - button "Player 15" [ref=e117] [cursor=pointer]
          - generic [ref=e126]:
            - generic [ref=e127]: Court 3
            - generic [ref=e129]:
              - generic [ref=e130]:
                - paragraph [ref=e131]: Team A
                - button "Lock pair" [ref=e132] [cursor=pointer]
              - generic [ref=e133]:
                - button "Player 04" [ref=e134] [cursor=pointer]
                - button "Player 08" [ref=e143] [cursor=pointer]
            - generic [ref=e152]:
              - generic [ref=e153]:
                - paragraph [ref=e154]: Team B
                - button "Lock pair" [ref=e155] [cursor=pointer]
              - generic [ref=e156]:
                - button "Player 10" [ref=e157] [cursor=pointer]
                - button "Player 14" [ref=e166] [cursor=pointer]
          - generic [ref=e175]:
            - generic [ref=e176]: Court 4
            - generic [ref=e178]:
              - generic [ref=e179]:
                - paragraph [ref=e180]: Team A
                - button "Lock pair" [ref=e181] [cursor=pointer]
              - generic [ref=e182]:
                - button "Player 02" [ref=e183] [cursor=pointer]
                - button "Player 05" [ref=e192] [cursor=pointer]
            - generic [ref=e201]:
              - generic [ref=e202]:
                - paragraph [ref=e203]: Team B
                - button "Lock pair" [ref=e204] [cursor=pointer]
              - generic [ref=e205]:
                - button "Player 12" [ref=e206] [cursor=pointer]
                - button "Player 16" [ref=e215] [cursor=pointer]
      - button "START ROUND 2" [ref=e224] [cursor=pointer]
      - button "Restore Original Draw" [ref=e225] [cursor=pointer]
```

# Test source

```ts
  330 |   return timings;
  331 | }
  332 | 
  333 | function metric(report, name, value, max) {
  334 |   report[name] = value;
  335 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
  336 | }
  337 | 
  338 | test.use({ viewport: { width: 390, height: 844 } });
  339 | 
  340 | test('18-player mobile host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  341 |   const model = createModel();
  342 |   const report = {};
  343 |   await installMockBackend(page, model);
  344 |   page.on('dialog', dialog => dialog.accept());
  345 | 
  346 |   await page.goto('/e2e/kotcHarness.html');
  347 |   await expect(page.getByText('18 players · 4 active courts · 2 bench')).toBeVisible();
  348 | 
  349 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  350 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  351 |   const create = page.getByTestId('kotc-create-session');
  352 |   const createAt = Date.now();
  353 |   await create.click();
  354 |   await expect(create).toContainText('Creating…');
  355 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  356 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  357 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  358 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  359 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  360 | 
  361 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  362 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  363 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  364 |   await firstSlot.click();
  365 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  366 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  367 | 
  368 |   // Lock one pair and make sure the editor reflects the saved lock.
  369 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  370 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  371 | 
  372 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  373 |   let started = Date.now();
  374 |   const startRound = page.getByTestId('kotc-start-round');
  375 |   await startRound.click();
  376 |   await expect(startRound).toContainText('Starting…');
  377 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  378 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  379 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  380 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  381 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  382 | 
  383 |   // Timer controls: pause → reset → explicit Start Timer.
  384 |   await page.getByTestId('kotc-timer-pause').click();
  385 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  386 |   await page.getByTestId('kotc-timer-reset').click();
  387 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  388 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  389 |   await page.getByTestId('kotc-timer-start').click();
  390 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  391 |   await dismissTimerFullscreen(page);
  392 | 
  393 |   // Undo must keep accepted feedback visible for the entire backend delay.
  394 |   const undo = page.getByTestId('kotc-undo-start');
  395 |   await undo.scrollIntoViewIfNeeded();
  396 |   started = Date.now();
  397 |   await undo.evaluate(element => element.click());
  398 |   await expect(undo).toContainText('Returning to Round Setup…');
  399 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  400 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  401 |   await sleep(350);
  402 |   await expect(undo).toContainText('Returning to Round Setup…');
  403 |   await expect(undo).toBeDisabled();
  404 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  405 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  406 |   expect(model.timer?.running).toBe(false);
  407 |   expect(model.timer?.remainingSeconds).toBe(480);
  408 | 
  409 |   // Start again and complete Round 1.
  410 |   started = Date.now();
  411 |   await page.getByTestId('kotc-start-round').click();
  412 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  413 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  414 |   await dismissTimerFullscreen(page);
  415 |   // A player/scorer device has Court 1 locked. The host touching the score box must
  416 |   // take authority immediately without changing the match revision.
  417 |   const round1Court1=model.matches.find(m=>m.id==='match-r1-c1');
  418 |   round1Court1.scoring_lock_owner='player-device-1';
  419 |   round1Court1.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();
  420 |   await page.getByTestId('kotc-score-1-a').focus();
  421 |   await expect.poll(()=>round1Court1.scoring_lock_owner).toBe('host:e2e');
  422 |   report.host_displaced_player_scorer=true;
  423 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  424 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  425 | 
  426 |   await expect(page.getByText('All scores saved for Round 1')).toBeVisible({ timeout: 1800 });
  427 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('started');
  428 |   started = Date.now();
  429 |   await page.getByTestId('kotc-prepare-next-round').click();
> 430 |   await expect(page.getByText('START ROUND 2')).toBeVisible({ timeout: 2200 });
      |                                                 ^ Error: expect(locator).toBeVisible() failed
  431 |   metric(report, 'round1_review_to_round2_editor_ms', Date.now() - started, 2200);
  432 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  433 | 
  434 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  435 |   await page.getByTestId('kotc-start-round').click();
  436 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  437 |   await dismissTimerFullscreen(page);
  438 |   await page.getByTestId('kotc-session-menu').click();
  439 |   await page.getByTestId('kotc-players-menu').click();
  440 |   await page.getByTestId('kotc-player-participant-03').click();
  441 |   await page.getByTestId('kotc-player-sit-out').click();
  442 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('voluntary rest', { timeout: 1500 });
  443 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  444 | 
  445 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  446 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  447 |   await page.getByTestId('kotc-prepare-next-round').click();
  448 |   await expect(page.getByText('START ROUND 3')).toBeVisible({ timeout: 2200 });
  449 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  450 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  451 | 
  452 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  453 |   await page.getByTestId('kotc-start-round').click();
  454 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  455 |   await dismissTimerFullscreen(page);
  456 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  457 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  458 |   await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });
  459 | 
  460 |   const finishButton = page.getByTestId('kotc-finish-session');
  461 |   if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  462 |   await expect(finishButton).toBeVisible();
  463 |   started = Date.now();
  464 |   await finishButton.click();
  465 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  466 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  467 |   await expect(page.getByText('Session complete')).toBeVisible();
  468 |   await expect(page.getByText('Gold')).toBeVisible();
  469 |   await expect(page.getByText('Silver')).toBeVisible();
  470 |   await expect(page.getByText('Bronze')).toBeVisible();
  471 | 
  472 |   // Post-event audit correction: reopen Round 1 / Court 1, reverse the result and
  473 |   // confirm RallyHub stores it as a correction without rewriting later court assignments.
  474 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  475 |   await page.getByRole('button',{name:'Round 1',exact:true}).click();
  476 |   const preCorrectionRound2=JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'));
  477 |   const reviewCard=page.getByTestId('kotc-score-card-1').first();
  478 |   await reviewCard.getByRole('button',{name:'Edit result'}).click();
  479 |   await reviewCard.getByTestId('kotc-score-1-a').fill('2');
  480 |   await reviewCard.getByTestId('kotc-score-1-b').fill('12');
  481 |   await reviewCard.getByRole('button',{name:'Save Correction'}).click();
  482 |   await expect(reviewCard).toContainText('Saved 2–12',{timeout:1800});
  483 |   const corrected=model.matches.find(m=>m.id==='match-r1-c1');
  484 |   expect(corrected.correction_count).toBe(1);
  485 |   expect(corrected.winner_side).toBe('B');
  486 |   expect(JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'))).toBe(preCorrectionRound2);
  487 |   report.post_event_score_correction=true;
  488 | 
  489 |   report.rounds_created = model.rounds.length;
  490 |   report.function_calls = model.calls.length;
  491 |   console.log(`KOTC HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  492 |   await testInfo.attach('kotc-host-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  493 | });
  494 | 
```