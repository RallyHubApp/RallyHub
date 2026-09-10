# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> 18-player desktop Preview host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-desktop.spec.mjs:356:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Unlock' }).first()
Expected: visible
Timeout: 1500ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'Unlock' }).first() with timeout 1500ms
  - waiting for getByRole('button', { name: 'Unlock' }).first()

```

```yaml
- main:
  - paragraph: Round 1 — ROUND READY
  - paragraph: 4 courts · 2 bench
  - button "Session Menu":
    - img
    - text: Session Menu
  - paragraph: What happens next
  - paragraph: Round 1 ready
  - paragraph: "Next: check the 4 court assignments and bench, then Start Round 1."
  - paragraph: Bench This Round
  - button "Player 03"
  - button "Player 18"
  - paragraph: Tap a court player, then a bench player, to swap them.
  - heading "Host Round Editor" [level=4]
  - paragraph: Tap one player then another to swap. Only one pending selection is allowed.
  - img
  - text: Court 1
  - paragraph: Team A
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 17":
    - img
    - text: Player 17
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
  - button "Player 15":
    - img
    - text: Player 15
  - text: Court 2
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
  - button "Player 12":
    - img
    - text: Player 12
  - button "Player 14":
    - img
    - text: Player 14
  - text: Court 3
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
  - button "Player 09":
    - img
    - text: Player 09
  - button "Player 16":
    - img
    - text: Player 16
  - text: Court 4
  - paragraph: Team A
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 01":
    - img
    - text: Player 01
  - button "Player 08":
    - img
    - text: Player 08
  - paragraph: Team B
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 10":
    - img
    - text: Player 10
  - button "Player 13":
    - img
    - text: Player 13
  - button "START ROUND 1":
    - img
    - text: START ROUND 1
  - button "Back to Setup":
    - img
    - text: Back to Setup
  - button "Restore Original Draw":
    - img
    - text: Restore Original Draw
  - button "Scroll up":
    - img
  - button "Scroll down" [disabled]:
    - img
```

# Test source

```ts
  290 | 
  291 |     if (name === 'kotcResultsShare') return { success: true, token: 'e2e-results', sent: 18 };
  292 |     return { success: true };
  293 |   };
  294 | 
  295 |   return model;
  296 | }
  297 | 
  298 | async function installMockBackend(page, model) {
  299 |   await page.route('**/api/apps/**', async route => {
  300 |     const request = route.request();
  301 |     const url = new URL(request.url());
  302 |     const path = url.pathname;
  303 |     if (path.includes('/entities/KotcPlayerAggregate')) return json(route, []);
  304 |     const marker = `/api/apps/${APP_ID}/functions/`;
  305 |     const index = path.indexOf(marker);
  306 |     if (index >= 0) {
  307 |       const name = decodeURIComponent(path.slice(index + marker.length).split('/')[0]);
  308 |       let body = {};
  309 |       try { body = request.postDataJSON() || {}; } catch { body = {}; }
  310 |       const payload = await model.handleFunction(name, body);
  311 |       if(payload?.__status)return json(route,{error:payload.error},payload.__status);
  312 |       return json(route, payload);
  313 |     }
  314 |     return json(route, []);
  315 |   });
  316 | }
  317 | 
  318 | async function dismissTimerFullscreen(page) {
  319 |   const exit = page.getByTitle('Exit full screen timer');
  320 |   if (await exit.count()) await exit.first().click();
  321 |   const dock = page.getByTitle('Dock timer back in page');
  322 |   if (await dock.count()) await dock.first().click();
  323 | }
  324 | 
  325 | async function scoreCurrentRound(page, courtCount = 4, baseScore = 11) {
  326 |   const timings = [];
  327 |   for (let court = 1; court <= courtCount; court++) {
  328 |     await page.getByTestId(`kotc-score-${court}-a`).fill(String(baseScore));
  329 |     await page.getByTestId(`kotc-score-${court}-b`).fill(String(Math.max(0, baseScore - 4 - court)));
  330 |     const button = page.getByTestId(`kotc-complete-${court}`);
  331 |     const started = Date.now();
  332 |     await button.click();
  333 |     await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved', { timeout: 2000 });
  334 |     timings.push(Date.now() - started);
  335 |   }
  336 |   return timings;
  337 | }
  338 | 
  339 | function metric(report, name, value, max) {
  340 |   report[name] = value;
  341 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
  342 | }
  343 | 
  344 | async function createAndStartRoundOne(page){
  345 |   await page.goto('/e2e/kotcHarness.html');
  346 |   await page.getByRole('button',{name:'Player 17',exact:true}).click();
  347 |   await page.getByRole('button',{name:'Player 18',exact:true}).click();
  348 |   await page.getByTestId('kotc-create-session').click();
  349 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:2000});
  350 |   await page.getByTestId('kotc-start-round').click();
  351 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({timeout:2000});
  352 | }
  353 | 
  354 | test.use({ viewport: { width: 1440, height: 900 } });
  355 | 
  356 | test('18-player desktop Preview host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  357 |   const model = createModel();
  358 |   const report = {};
  359 |   await installMockBackend(page, model);
  360 |   page.on('dialog', dialog => dialog.accept());
  361 | 
  362 |   await page.goto('/e2e/kotcHarness.html');
  363 |   await expect(page.getByTestId('kotc-setup')).toBeVisible();
  364 |   await expect(page.getByTestId('kotc-setup')).toContainText('18 players');
  365 |   await expect(page.getByTestId('kotc-setup')).toContainText('4 courts');
  366 |   await expect(page.getByTestId('kotc-setup')).toContainText('2 bench');
  367 |   await expect(page.getByTestId('kotc-setup-summary')).toContainText('Create Round 1');
  368 | 
  369 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  370 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  371 |   const create = page.getByTestId('kotc-create-session');
  372 |   const createAt = Date.now();
  373 |   await create.click();
  374 |   await expect(create).toContainText('Creating Round 1…');
  375 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  376 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  377 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  378 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  379 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  380 | 
  381 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  382 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  383 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  384 |   await firstSlot.click();
  385 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  386 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  387 | 
  388 |   // Lock one pair and make sure the editor reflects the saved lock.
  389 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
> 390 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
  391 | 
  392 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  393 |   let started = Date.now();
  394 |   const startRound = page.getByTestId('kotc-start-round');
  395 |   await startRound.click();
  396 |   await expect(startRound).toContainText('Starting…');
  397 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  398 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  399 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  400 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  401 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  402 | 
  403 |   // Timer controls: pause → reset → explicit Start Timer.
  404 |   await page.getByTestId('kotc-timer-pause').click();
  405 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  406 |   await page.getByTestId('kotc-timer-reset').click();
  407 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  408 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  409 |   await page.getByTestId('kotc-timer-start').click();
  410 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  411 |   await dismissTimerFullscreen(page);
  412 | 
  413 |   // Undo must keep accepted feedback visible for the entire backend delay.
  414 |   const undo = page.getByTestId('kotc-undo-start');
  415 |   await undo.scrollIntoViewIfNeeded();
  416 |   started = Date.now();
  417 |   await undo.evaluate(element => element.click());
  418 |   await expect(undo).toContainText('Returning to Round Setup…');
  419 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  420 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  421 |   await sleep(350);
  422 |   await expect(undo).toContainText('Returning to Round Setup…');
  423 |   await expect(undo).toBeDisabled();
  424 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  425 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  426 |   expect(model.timer?.running).toBe(false);
  427 |   expect(model.timer?.remainingSeconds).toBe(480);
  428 | 
  429 |   // Start again and complete Round 1.
  430 |   started = Date.now();
  431 |   await page.getByTestId('kotc-start-round').click();
  432 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  433 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  434 |   await dismissTimerFullscreen(page);
  435 |   // A player/scorer device has Court 1 locked. The host touching the score box must
  436 |   // take authority immediately without changing the match revision.
  437 |   const round1Court1=model.matches.find(m=>m.id==='match-r1-c1');
  438 |   round1Court1.scoring_lock_owner='player-device-1';
  439 |   round1Court1.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();
  440 |   await page.getByTestId('kotc-score-1-a').focus();
  441 |   await expect.poll(()=>round1Court1.scoring_lock_owner).toBe('host:e2e');
  442 |   report.host_displaced_player_scorer=true;
  443 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  444 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  445 | 
  446 |   await expect(page.getByText('All scores saved for Round 1')).toBeVisible({ timeout: 1800 });
  447 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('started');
  448 |   started = Date.now();
  449 |   await page.getByTestId('kotc-prepare-next-round').click();
  450 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2', { timeout: 2200 });
  451 |   metric(report, 'round1_review_to_round2_editor_ms', Date.now() - started, 2200);
  452 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  453 | 
  454 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  455 |   await page.getByTestId('kotc-start-round').click();
  456 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  457 |   await dismissTimerFullscreen(page);
  458 |   await page.getByTestId('kotc-session-menu').click();
  459 |   await page.getByTestId('kotc-players-menu').click();
  460 |   await page.getByTestId('kotc-player-participant-03').click();
  461 |   await page.getByTestId('kotc-player-sit-out').click();
  462 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('voluntary rest', { timeout: 1500 });
  463 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  464 | 
  465 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  466 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  467 |   await page.getByTestId('kotc-prepare-next-round').click();
  468 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3', { timeout: 2200 });
  469 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  470 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  471 | 
  472 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  473 |   await page.getByTestId('kotc-start-round').click();
  474 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  475 |   await dismissTimerFullscreen(page);
  476 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  477 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  478 |   await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });
  479 | 
  480 |   const finishButton = page.getByTestId('kotc-finish-session');
  481 |   if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  482 |   await expect(finishButton).toBeVisible();
  483 |   started = Date.now();
  484 |   await finishButton.click();
  485 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  486 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  487 |   await expect(page.getByText('Session complete')).toBeVisible();
  488 |   await expect(page.getByText('Gold')).toBeVisible();
  489 |   await expect(page.getByText('Silver')).toBeVisible();
  490 |   await expect(page.getByText('Bronze')).toBeVisible();
```