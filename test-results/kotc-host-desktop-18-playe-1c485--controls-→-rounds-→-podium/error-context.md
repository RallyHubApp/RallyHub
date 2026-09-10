# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> 18-player desktop Preview host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-desktop.spec.mjs:337:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('18 players · 4 active courts · 2 bench')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('18 players · 4 active courts · 2 bench') with timeout 3000ms
  - waiting for getByText('18 players · 4 active courts · 2 bench')

```

```yaml
- main:
  - img
  - paragraph: King of the Court
  - heading "Set up tonight’s session" [level=2]
  - paragraph: Confirm the hall settings, decide the Round 1 draw and choose the bench. You can review the actual courts before anything starts.
  - text: 18 players 4 courts 2 bench
  - img
  - paragraph: 1 · Session settings
  - paragraph: The essentials for this hall and tonight’s scoring.
  - text: Venue courts
  - spinbutton: "4"
  - text: Hall / session duration
  - spinbutton: "90"
  - text: min Scoring
  - combobox: Timed rounds
  - text: Round duration
  - spinbutton: "8"
  - text: min
  - img
  - paragraph: 2 · Round 1 setup
  - paragraph: Choose how the starting order is built and how that order is distributed across courts.
  - text: Starting order
  - combobox: Roster order
  - paragraph: This sets the starting order only. RallyHub does not invent ratings.
  - text: Round 1 draw
  - combobox: Balanced Random
  - paragraph: Balanced Random spreads the starting order across courts while keeping some variety.
  - button "Review player order (18) Show"
  - img
  - paragraph: 3 · Choose Round 1 bench
  - paragraph: Choose exactly 2. You can still swap the proposed Round 1 courts before starting.
  - text: 0/2
  - button "Player 01"
  - button "Player 02"
  - button "Player 03"
  - button "Player 04"
  - button "Player 05"
  - button "Player 06"
  - button "Player 07"
  - button "Player 08"
  - button "Player 09"
  - button "Player 10"
  - button "Player 11"
  - button "Player 12"
  - button "Player 13"
  - button "Player 14"
  - button "Player 15"
  - button "Player 16"
  - button "Player 17"
  - button "Player 18"
  - complementary:
    - paragraph: Ready check
    - heading "Create Round 1" [level=3]
    - paragraph: RallyHub will generate the proposed courts next. You will review them before the timer starts.
    - text: Players
    - strong: "18"
    - text: Active courts
    - strong: "4"
    - text: Bench
    - strong: "2"
    - text: Scoring
    - strong: 8 min timed rounds
    - text: Starting order
    - strong: Roster order
    - text: Draw
    - strong: Balanced Random
    - paragraph: Choose 2 more bench players
    - button "Create Round 1" [disabled]:
      - img
      - text: Create Round 1
```

# Test source

```ts
  244 |         const priorBench = model.participants.filter(p => ['present', 'registered', 'confirmed', 'leaving_early'].includes(p.status) && !priorActive.has(p.id)).map(p => p.id);
  245 |         const next = makeRound(Number(prior.round_number) + 1, priorBench.slice().reverse());
  246 |         model.session.revision += 1;
  247 |         return { success: true, session: model.session, round: next };
  248 |       }
  249 | 
  250 |       if (body.commandType === 'set_participant_status') {
  251 |         await sleep(300);
  252 |         const participant = model.participants.find(p => p.id === body.participantId);
  253 |         if (body.statusAction === 'voluntary_rest') {
  254 |           participant.status = 'voluntary_rest';
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
> 344 |   await expect(page.getByText('18 players · 4 active courts · 2 bench')).toBeVisible();
      |                                                                          ^ Error: expect(locator).toBeVisible() failed
  345 | 
  346 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  347 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  348 |   const create = page.getByTestId('kotc-create-session');
  349 |   const createAt = Date.now();
  350 |   await create.click();
  351 |   await expect(create).toContainText('Creating…');
  352 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  353 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  354 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  355 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  356 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  357 | 
  358 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  359 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  360 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  361 |   await firstSlot.click();
  362 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  363 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  364 | 
  365 |   // Lock one pair and make sure the editor reflects the saved lock.
  366 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  367 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  368 | 
  369 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  370 |   let started = Date.now();
  371 |   const startRound = page.getByTestId('kotc-start-round');
  372 |   await startRound.click();
  373 |   await expect(startRound).toContainText('Starting…');
  374 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  375 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  376 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  377 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  378 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  379 | 
  380 |   // Timer controls: pause → reset → explicit Start Timer.
  381 |   await page.getByTestId('kotc-timer-pause').click();
  382 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  383 |   await page.getByTestId('kotc-timer-reset').click();
  384 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  385 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  386 |   await page.getByTestId('kotc-timer-start').click();
  387 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  388 |   await dismissTimerFullscreen(page);
  389 | 
  390 |   // Undo must keep accepted feedback visible for the entire backend delay.
  391 |   const undo = page.getByTestId('kotc-undo-start');
  392 |   await undo.scrollIntoViewIfNeeded();
  393 |   started = Date.now();
  394 |   await undo.evaluate(element => element.click());
  395 |   await expect(undo).toContainText('Returning to Round Setup…');
  396 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  397 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  398 |   await sleep(350);
  399 |   await expect(undo).toContainText('Returning to Round Setup…');
  400 |   await expect(undo).toBeDisabled();
  401 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  402 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  403 |   expect(model.timer?.running).toBe(false);
  404 |   expect(model.timer?.remainingSeconds).toBe(480);
  405 | 
  406 |   // Start again and complete Round 1.
  407 |   started = Date.now();
  408 |   await page.getByTestId('kotc-start-round').click();
  409 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  410 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  411 |   await dismissTimerFullscreen(page);
  412 |   // A player/scorer device has Court 1 locked. The host touching the score box must
  413 |   // take authority immediately without changing the match revision.
  414 |   const round1Court1=model.matches.find(m=>m.id==='match-r1-c1');
  415 |   round1Court1.scoring_lock_owner='player-device-1';
  416 |   round1Court1.scoring_lock_expires_at=new Date(Date.now()+90000).toISOString();
  417 |   await page.getByTestId('kotc-score-1-a').focus();
  418 |   await expect.poll(()=>round1Court1.scoring_lock_owner).toBe('host:e2e');
  419 |   report.host_displaced_player_scorer=true;
  420 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  421 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  422 | 
  423 |   await expect(page.getByText('All scores saved for Round 1')).toBeVisible({ timeout: 1800 });
  424 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('started');
  425 |   started = Date.now();
  426 |   await page.getByTestId('kotc-prepare-next-round').click();
  427 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2', { timeout: 2200 });
  428 |   metric(report, 'round1_review_to_round2_editor_ms', Date.now() - started, 2200);
  429 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  430 | 
  431 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  432 |   await page.getByTestId('kotc-start-round').click();
  433 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  434 |   await dismissTimerFullscreen(page);
  435 |   await page.getByTestId('kotc-session-menu').click();
  436 |   await page.getByTestId('kotc-players-menu').click();
  437 |   await page.getByTestId('kotc-player-participant-03').click();
  438 |   await page.getByTestId('kotc-player-sit-out').click();
  439 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('voluntary rest', { timeout: 1500 });
  440 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  441 | 
  442 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  443 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  444 |   await page.getByTestId('kotc-prepare-next-round').click();
```