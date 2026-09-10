# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> 18-player desktop Preview host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-desktop.spec.mjs:337:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-create-session')
Expected substring: "Creating…"
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByTestId('kotc-create-session') with timeout 3000ms
  - waiting for getByTestId('kotc-create-session')
    5 × locator resolved to <button disabled data-dynamic-content="true" data-testid="kotc-create-session" data-source-location="src/components/kotc/KotcSetupPanel.jsx:73:10" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 …>…</button>
      - unexpected value "Creating Round 1…"

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
  - button "Player 17"
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
  - button "Player 02":
    - img
    - text: Player 02
  - button "Player 05":
    - img
    - text: Player 05
  - paragraph: Team B
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 11":
    - img
    - text: Player 11
  - button "Player 16":
    - img
    - text: Player 16
  - text: Court 2
  - paragraph: Team A
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 01":
    - img
    - text: Player 01
  - button "Player 07":
    - img
    - text: Player 07
  - paragraph: Team B
  - button "Lock pair":
    - img
    - text: Lock pair
  - button "Player 09":
    - img
    - text: Player 09
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
  - button "Player 15":
    - img
    - text: Player 15
  - text: Court 4
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
  - button "Player 12":
    - img
    - text: Player 12
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
```

# Test source

```ts
  255 |           participant.availability_effective_from_round = Number(model.session.current_round_number) + 1;
  256 |           participant.available_again_from_round = Number(model.session.current_round_number) + 2;
  257 |         } else if (body.statusAction === 'back_available') {
  258 |           participant.status = 'present';
  259 |           participant.availability_effective_from_round = null;
  260 |           participant.available_again_from_round = null;
  261 |         }
  262 |         model.session.revision += 1;
  263 |         return { success: true, session: model.session, participant };
  264 |       }
  265 | 
  266 |       if (body.commandType === 'pause_session' || body.commandType === 'resume_session') {
  267 |         await sleep(200);
  268 |         model.session.status = body.commandType === 'pause_session' ? 'paused' : 'in_progress';
  269 |         model.session.revision += 1;
  270 |         return { success: true, session: model.session };
  271 |       }
  272 |       return { success: true, session: model.session };
  273 |     }
  274 | 
  275 |     if (name === 'endKotcSession') {
  276 |       await sleep(450);
  277 |       if (body.action === 'finish') model.session.status = 'completed';
  278 |       if (body.action === 'abandon') model.session.status = 'abandoned';
  279 |       model.session.actual_session_end = new Date().toISOString();
  280 |       return { success: true, session: model.session };
  281 |     }
  282 | 
  283 |     if (name === 'kotcResultsShare') return { success: true, token: 'e2e-results', sent: 18 };
  284 |     return { success: true };
  285 |   };
  286 | 
  287 |   return model;
  288 | }
  289 | 
  290 | async function installMockBackend(page, model) {
  291 |   await page.route('**/api/apps/**', async route => {
  292 |     const request = route.request();
  293 |     const url = new URL(request.url());
  294 |     const path = url.pathname;
  295 |     if (path.includes('/entities/KotcPlayerAggregate')) return json(route, []);
  296 |     const marker = `/api/apps/${APP_ID}/functions/`;
  297 |     const index = path.indexOf(marker);
  298 |     if (index >= 0) {
  299 |       const name = decodeURIComponent(path.slice(index + marker.length).split('/')[0]);
  300 |       let body = {};
  301 |       try { body = request.postDataJSON() || {}; } catch { body = {}; }
  302 |       const payload = await model.handleFunction(name, body);
  303 |       return json(route, payload);
  304 |     }
  305 |     return json(route, []);
  306 |   });
  307 | }
  308 | 
  309 | async function dismissTimerFullscreen(page) {
  310 |   const exit = page.getByTitle('Exit full screen timer');
  311 |   if (await exit.count()) await exit.first().click();
  312 |   const dock = page.getByTitle('Dock timer back in page');
  313 |   if (await dock.count()) await dock.first().click();
  314 | }
  315 | 
  316 | async function scoreCurrentRound(page, courtCount = 4, baseScore = 11) {
  317 |   const timings = [];
  318 |   for (let court = 1; court <= courtCount; court++) {
  319 |     await page.getByTestId(`kotc-score-${court}-a`).fill(String(baseScore));
  320 |     await page.getByTestId(`kotc-score-${court}-b`).fill(String(Math.max(0, baseScore - 4 - court)));
  321 |     const button = page.getByTestId(`kotc-complete-${court}`);
  322 |     const started = Date.now();
  323 |     await button.click();
  324 |     await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved', { timeout: 2000 });
  325 |     timings.push(Date.now() - started);
  326 |   }
  327 |   return timings;
  328 | }
  329 | 
  330 | function metric(report, name, value, max) {
  331 |   report[name] = value;
  332 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
  333 | }
  334 | 
  335 | test.use({ viewport: { width: 1440, height: 900 } });
  336 | 
  337 | test('18-player desktop Preview host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  338 |   const model = createModel();
  339 |   const report = {};
  340 |   await installMockBackend(page, model);
  341 |   page.on('dialog', dialog => dialog.accept());
  342 | 
  343 |   await page.goto('/e2e/kotcHarness.html');
  344 |   await expect(page.getByTestId('kotc-setup')).toBeVisible();
  345 |   await expect(page.getByTestId('kotc-setup')).toContainText('18 players');
  346 |   await expect(page.getByTestId('kotc-setup')).toContainText('4 courts');
  347 |   await expect(page.getByTestId('kotc-setup')).toContainText('2 bench');
  348 |   await expect(page.getByTestId('kotc-setup-summary')).toContainText('Create Round 1');
  349 | 
  350 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  351 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  352 |   const create = page.getByTestId('kotc-create-session');
  353 |   const createAt = Date.now();
  354 |   await create.click();
> 355 |   await expect(create).toContainText('Creating…');
      |                        ^ Error: expect(locator).toContainText(expected) failed
  356 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  357 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  358 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  359 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  360 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  361 | 
  362 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  363 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  364 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  365 |   await firstSlot.click();
  366 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  367 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  368 | 
  369 |   // Lock one pair and make sure the editor reflects the saved lock.
  370 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  371 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  372 | 
  373 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  374 |   let started = Date.now();
  375 |   const startRound = page.getByTestId('kotc-start-round');
  376 |   await startRound.click();
  377 |   await expect(startRound).toContainText('Starting…');
  378 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  379 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  380 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  381 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  382 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  383 | 
  384 |   // Timer controls: pause → reset → explicit Start Timer.
  385 |   await page.getByTestId('kotc-timer-pause').click();
  386 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  387 |   await page.getByTestId('kotc-timer-reset').click();
  388 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  389 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  390 |   await page.getByTestId('kotc-timer-start').click();
  391 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  392 |   await dismissTimerFullscreen(page);
  393 | 
  394 |   // Undo must keep accepted feedback visible for the entire backend delay.
  395 |   const undo = page.getByTestId('kotc-undo-start');
  396 |   await undo.scrollIntoViewIfNeeded();
  397 |   started = Date.now();
  398 |   await undo.evaluate(element => element.click());
  399 |   await expect(undo).toContainText('Returning to Round Setup…');
  400 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  401 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  402 |   await sleep(350);
  403 |   await expect(undo).toContainText('Returning to Round Setup…');
  404 |   await expect(undo).toBeDisabled();
  405 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  406 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  407 |   expect(model.timer?.running).toBe(false);
  408 |   expect(model.timer?.remainingSeconds).toBe(480);
  409 | 
  410 |   // Start again and complete Round 1.
  411 |   started = Date.now();
  412 |   await page.getByTestId('kotc-start-round').click();
  413 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  414 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  415 |   await dismissTimerFullscreen(page);
  416 |   // A player/scorer device has Court 1 locked. The host touching the score box must
  417 |   // take authority immediately without changing the match revision.
  418 |   const round1Court1=model.matches.find(m=>m.id==='match-r1-c1');
  419 |   round1Court1.scoring_lock_owner='player-device-1';
  420 |   round1Court1.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();
  421 |   await page.getByTestId('kotc-score-1-a').focus();
  422 |   await expect.poll(()=>round1Court1.scoring_lock_owner).toBe('host:e2e');
  423 |   report.host_displaced_player_scorer=true;
  424 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  425 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  426 | 
  427 |   await expect(page.getByText('All scores saved for Round 1')).toBeVisible({ timeout: 1800 });
  428 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('started');
  429 |   started = Date.now();
  430 |   await page.getByTestId('kotc-prepare-next-round').click();
  431 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2', { timeout: 2200 });
  432 |   metric(report, 'round1_review_to_round2_editor_ms', Date.now() - started, 2200);
  433 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  434 | 
  435 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  436 |   await page.getByTestId('kotc-start-round').click();
  437 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  438 |   await dismissTimerFullscreen(page);
  439 |   await page.getByTestId('kotc-session-menu').click();
  440 |   await page.getByTestId('kotc-players-menu').click();
  441 |   await page.getByTestId('kotc-player-participant-03').click();
  442 |   await page.getByTestId('kotc-player-sit-out').click();
  443 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('voluntary rest', { timeout: 1500 });
  444 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  445 | 
  446 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  447 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  448 |   await page.getByTestId('kotc-prepare-next-round').click();
  449 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3', { timeout: 2200 });
  450 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  451 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  452 | 
  453 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  454 |   await page.getByTestId('kotc-start-round').click();
  455 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
```