# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:398:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('kotc-round-editor')
Expected: visible
Timeout: 2000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('kotc-round-editor') with timeout 2000ms
  - waiting for getByTestId('kotc-round-editor')

```

# Test source

```ts
  317 |           participant.status = 'present';
  318 |           participant.availability_effective_from_round = null;
  319 |           participant.available_again_from_round = null;
  320 |         }
  321 |         model.session.revision += 1;
  322 |         return { success: true, session: model.session, participant };
  323 |       }
  324 | 
  325 |       if (body.commandType === 'pause_session' || body.commandType === 'resume_session') {
  326 |         await sleep(200);
  327 |         model.session.status = body.commandType === 'pause_session' ? 'paused' : 'in_progress';
  328 |         model.session.revision += 1;
  329 |         return { success: true, session: model.session };
  330 |       }
  331 |       return { success: true, session: model.session };
  332 |     }
  333 | 
  334 |     if (name === 'endKotcSession') {
  335 |       await sleep(450);
  336 |       if (body.action === 'finish') model.session.status = 'completed';
  337 |       if (body.action === 'abandon') model.session.status = 'abandoned';
  338 |       model.session.actual_session_end = new Date().toISOString();
  339 |       return { success: true, session: model.session };
  340 |     }
  341 | 
  342 |     if (name === 'kotcResultsShare') return { success: true, token: 'e2e-results', sent: 18 };
  343 |     return { success: true };
  344 |   };
  345 | 
  346 |   return model;
  347 | }
  348 | 
  349 | async function installMockBackend(page, model) {
  350 |   await page.route('**/api/apps/**', async route => {
  351 |     const request = route.request();
  352 |     const url = new URL(request.url());
  353 |     const path = url.pathname;
  354 |     if (path.includes('/entities/KotcPlayerAggregate')) return json(route, []);
  355 |     const marker = `/api/apps/${APP_ID}/functions/`;
  356 |     const index = path.indexOf(marker);
  357 |     if (index >= 0) {
  358 |       const name = decodeURIComponent(path.slice(index + marker.length).split('/')[0]);
  359 |       let body = {};
  360 |       try { body = request.postDataJSON() || {}; } catch { body = {}; }
  361 |       const payload = await model.handleFunction(name, body);
  362 |       return json(route, payload);
  363 |     }
  364 |     return json(route, []);
  365 |   });
  366 | }
  367 | 
  368 | async function dismissTimerFullscreen(page) {
  369 |   // The normal host flow must never manufacture a full-screen timer state. If a prior
  370 |   // explicit test/user action left it full-screen, return it to the docked in-page state.
  371 |   const exit = page.getByTitle('Exit full screen timer');
  372 |   if (await exit.count()) await exit.first().click();
  373 |   const dock = page.getByTitle('Dock timer back in page');
  374 |   if (await dock.count()) await dock.first().click();
  375 | }
  376 | 
  377 | async function scoreCurrentRound(page, courtCount = 4, baseScore = 11) {
  378 |   const timings = [];
  379 |   for (let court = 1; court <= courtCount; court++) {
  380 |     await page.getByTestId(`kotc-score-${court}-a`).fill(String(baseScore));
  381 |     await page.getByTestId(`kotc-score-${court}-b`).fill(String(Math.max(0, baseScore - 4 - court)));
  382 |     const button = page.getByTestId(`kotc-complete-${court}`);
  383 |     const started = Date.now();
  384 |     await button.click();
  385 |     await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved', { timeout: 2000 });
  386 |     timings.push(Date.now() - started);
  387 |   }
  388 |   return timings;
  389 | }
  390 | 
  391 | function metric(report, name, value, max) {
  392 |   report[name] = value;
  393 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
  394 | }
  395 | 
  396 | test.use({ viewport: { width: 390, height: 844 } });
  397 | 
  398 | test('18-player mobile host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  399 |   const model = createModel();
  400 |   const report = {};
  401 |   await installMockBackend(page, model);
  402 |   page.on('dialog', dialog => dialog.accept());
  403 | 
  404 |   await page.goto('/e2e/kotcHarness.html');
  405 |   await expect(page.getByTestId('kotc-setup')).toBeVisible();
  406 |   await expect(page.getByTestId('kotc-setup')).toContainText('18 players');
  407 |   await expect(page.getByTestId('kotc-setup')).toContainText('4 courts');
  408 |   await expect(page.getByTestId('kotc-setup')).toContainText('2 bench');
  409 | 
  410 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  411 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  412 |   const create = page.getByTestId('kotc-create-session');
  413 |   const createAt = Date.now();
  414 |   await create.click();
  415 |   await expect(create).toContainText('Creating Round 1…');
  416 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
> 417 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
      |                                                       ^ Error: expect(locator).toBeVisible() failed
  418 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  419 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  420 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  421 | 
  422 |   // The host must be able to get the scoring/public links from the live Round screen
  423 |   // without navigating backwards through the app.
  424 |   await page.getByTestId('kotc-quick-links').click();
  425 |   await expect(page.getByTestId('kotc-session-menu-panel')).toBeVisible();
  426 |   await expect(page.getByRole('button', { name: /Player Link, Broadcasts & Access/ })).toBeVisible();
  427 |   await page.getByTestId('kotc-session-menu').click();
  428 | 
  429 |   // Mobile back/forward-cache recovery: returning to the host page must force a fresh
  430 |   // authoritative state read and leave Start Round actionable rather than stuck disabled.
  431 |   const stateReadsBeforeReturn=model.calls.filter(c=>c.name==='getKotcV2State').length;
  432 |   await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  433 |   await expect.poll(()=>model.calls.filter(c=>c.name==='getKotcV2State').length).toBeGreaterThan(stateReadsBeforeReturn);
  434 |   await expect(page.getByTestId('kotc-start-round')).toBeEnabled();
  435 | 
  436 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  437 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  438 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  439 |   await firstSlot.click();
  440 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  441 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  442 | 
  443 |   // Lock one pair and make sure the editor reflects the saved lock. The lock action must
  444 |   // also persist the current proposed-round draft, so the court/bench swap is no longer
  445 |   // stranded only in the browser until START ROUND is pressed.
  446 |   const swappedSlotId='r1-c1-A-1';
  447 |   const swappedParticipantBeforeLock=model.slots.find(s=>s.id===swappedSlotId)?.participant_id;
  448 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  449 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  450 |   const pairLockCall=[...model.calls].reverse().find(c=>c.name==='setKotcPairLock');
  451 |   expect(pairLockCall?.body?.slotParticipantIds).toBeTruthy();
  452 |   expect(model.slots.find(s=>s.id===swappedSlotId)?.participant_id).not.toBe(swappedParticipantBeforeLock);
  453 |   expect(Number(model.rounds.find(r=>r.id==='round-1')?.proposal_revision||0)).toBeGreaterThan(1);
  454 | 
  455 |   // Busy-hall setup: move an entire four-player court as one unit, save it without
  456 |   // starting the round, then reload and prove that the saved court layout survives.
  457 |   const court4Before=model.slots.filter(s=>s.round_id==='round-1'&&Number(s.ladder_court_rank)===4).sort((a,b)=>String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number)).map(s=>s.participant_id);
  458 |   const courtMove=page.getByTestId('kotc-whole-court-drag-4');
  459 |   await courtMove.focus();await courtMove.press('Space');await courtMove.press('ArrowUp');await courtMove.press('ArrowUp');await courtMove.press('Space');
  460 |   const saveRound=page.getByTestId('kotc-save-round-setup');
  461 |   await expect(saveRound).toBeEnabled();
  462 |   const saveBefore=model.calls.filter(c=>c.name==='kotcCommand'&&c.body.commandType==='adjust_proposed_round').length;
  463 |   const saveStarted=Date.now();await saveRound.click();await expect(page.getByText('Saving Round 1 setup… command sent')).toBeVisible({timeout:300});metric(report,'round_setup_save_ack_ms',Date.now()-saveStarted,300);await expect(page.getByTestId('kotc-save-round-status')).toContainText('Round setup saved',{timeout:1800});
  464 |   expect(model.calls.filter(c=>c.name==='kotcCommand'&&c.body.commandType==='adjust_proposed_round').length-saveBefore).toBe(1);
  465 |   const court2After=model.slots.filter(s=>s.round_id==='round-1'&&Number(s.ladder_court_rank)===2).sort((a,b)=>String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number)).map(s=>s.participant_id);
  466 |   expect(court2After).toEqual(court4Before);report.whole_court_drag_saved=true;
  467 |   const movedCourtName=model.participants.find(p=>p.id===court4Before[0])?.display_name;
  468 |   await page.reload();await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:1800});await expect(page.getByTestId('kotc-whole-court-2')).toContainText(movedCourtName);report.round_setup_survives_reload=true;
  469 | 
  470 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  471 |   let started = Date.now();
  472 |   const startRound = page.getByTestId('kotc-start-round');
  473 |   await startRound.click();
  474 |   await expect(startRound).toContainText('Starting…');
  475 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  476 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  477 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  478 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  479 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  480 | 
  481 |   // Timer controls: pause → reset → explicit Start Timer.
  482 |   await page.getByTestId('kotc-timer-pause').click();
  483 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  484 |   await page.getByTestId('kotc-timer-reset').click();
  485 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  486 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  487 |   await page.getByTestId('kotc-timer-start').click();
  488 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  489 |   await dismissTimerFullscreen(page);
  490 | 
  491 |   // Undo must keep accepted feedback visible for the entire backend delay.
  492 |   const undo = page.getByTestId('kotc-undo-start');
  493 |   await undo.scrollIntoViewIfNeeded();
  494 |   started = Date.now();
  495 |   await undo.evaluate(element => element.click());
  496 |   await expect(undo).toContainText('Returning to Round Setup…');
  497 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  498 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  499 |   await sleep(350);
  500 |   await expect(undo).toContainText('Returning to Round Setup…');
  501 |   await expect(undo).toBeDisabled();
  502 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  503 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  504 |   expect(model.timer?.running).toBe(false);
  505 |   expect(model.timer?.remainingSeconds).toBe(480);
  506 | 
  507 |   // Start again and complete Round 1.
  508 |   started = Date.now();
  509 |   await page.getByTestId('kotc-start-round').click();
  510 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  511 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  512 |   await dismissTimerFullscreen(page);
  513 |   // Host-only sessions remain fast: ordinary score entry does not create scorer-lease traffic.
  514 |   // Collaborative first-claim-wins locking is covered separately by the host + two scorer robot.
  515 |   const claimsBefore=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  516 |   await page.getByTestId('kotc-score-1-a').focus();
  517 |   expect(model.calls.filter(c=>c.body?.commandType==='host_claim_score').length).toBe(claimsBefore);
```