# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:322:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-bench')
Expected substring: "Player 01"
Received string:    "Bench This RoundPlayer 04Player 18Tap a court player, then a bench player, to swap them."
Timeout: 3000ms

Call log:
  - Expect "toContainText" getByTestId('kotc-bench') with timeout 3000ms
  - waiting for getByTestId('kotc-bench')
    10 × locator resolved to <div data-testid="kotc-bench" data-dynamic-content="true" class="rounded-xl border-2 border-amber-400/60 bg-amber-500/10 p-3" data-source-location="src/components/kotc/KotcV2SessionView.jsx:71:21">…</div>
       - unexpected value "Bench This RoundPlayer 04Player 18Tap a court player, then a bench player, to swap them."

```

```yaml
- paragraph: Bench This Round
- button "Player 04"
- button "Player 18"
- paragraph: Tap a court player, then a bench player, to swap them.
```

# Test source

```ts
  246 |           participant.availability_effective_from_round = null;
  247 |           participant.available_again_from_round = null;
  248 |         }
  249 |         model.session.revision += 1;
  250 |         return { success: true, session: model.session, participant };
  251 |       }
  252 | 
  253 |       if (body.commandType === 'pause_session' || body.commandType === 'resume_session') {
  254 |         await sleep(200);
  255 |         model.session.status = body.commandType === 'pause_session' ? 'paused' : 'in_progress';
  256 |         model.session.revision += 1;
  257 |         return { success: true, session: model.session };
  258 |       }
  259 |       return { success: true, session: model.session };
  260 |     }
  261 | 
  262 |     if (name === 'endKotcSession') {
  263 |       await sleep(450);
  264 |       if (body.action === 'finish') model.session.status = 'completed';
  265 |       if (body.action === 'abandon') model.session.status = 'abandoned';
  266 |       model.session.actual_session_end = new Date().toISOString();
  267 |       return { success: true, session: model.session };
  268 |     }
  269 | 
  270 |     if (name === 'kotcResultsShare') return { success: true, token: 'e2e-results', sent: 18 };
  271 |     return { success: true };
  272 |   };
  273 | 
  274 |   return model;
  275 | }
  276 | 
  277 | async function installMockBackend(page, model) {
  278 |   await page.route('**/api/apps/**', async route => {
  279 |     const request = route.request();
  280 |     const url = new URL(request.url());
  281 |     const path = url.pathname;
  282 |     if (path.includes('/entities/KotcPlayerAggregate')) return json(route, []);
  283 |     const marker = `/api/apps/${APP_ID}/functions/`;
  284 |     const index = path.indexOf(marker);
  285 |     if (index >= 0) {
  286 |       const name = decodeURIComponent(path.slice(index + marker.length).split('/')[0]);
  287 |       let body = {};
  288 |       try { body = request.postDataJSON() || {}; } catch { body = {}; }
  289 |       const payload = await model.handleFunction(name, body);
  290 |       return json(route, payload);
  291 |     }
  292 |     return json(route, []);
  293 |   });
  294 | }
  295 | 
  296 | async function dismissTimerFullscreen(page) {
  297 |   const control = page.getByTitle('Full screen timer');
  298 |   if (await control.count()) await control.first().click();
  299 | }
  300 | 
  301 | async function scoreCurrentRound(page, courtCount = 4, baseScore = 11) {
  302 |   const timings = [];
  303 |   for (let court = 1; court <= courtCount; court++) {
  304 |     await page.getByTestId(`kotc-score-${court}-a`).fill(String(baseScore));
  305 |     await page.getByTestId(`kotc-score-${court}-b`).fill(String(Math.max(0, baseScore - 4 - court)));
  306 |     const button = page.getByTestId(`kotc-complete-${court}`);
  307 |     const started = Date.now();
  308 |     await button.click();
  309 |     await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved', { timeout: 2000 });
  310 |     timings.push(Date.now() - started);
  311 |   }
  312 |   return timings;
  313 | }
  314 | 
  315 | function metric(report, name, value, max) {
  316 |   report[name] = value;
  317 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
  318 | }
  319 | 
  320 | test.use({ viewport: { width: 390, height: 844 } });
  321 | 
  322 | test('18-player mobile host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  323 |   const model = createModel();
  324 |   const report = {};
  325 |   await installMockBackend(page, model);
  326 |   page.on('dialog', dialog => dialog.accept());
  327 | 
  328 |   await page.goto('/e2e/kotcHarness.html');
  329 |   await expect(page.getByText('18 players · 4 active courts · 2 bench')).toBeVisible();
  330 | 
  331 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  332 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  333 |   const create = page.getByTestId('kotc-create-session');
  334 |   const createAt = Date.now();
  335 |   await create.click();
  336 |   await expect(create).toContainText('Creating…');
  337 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  338 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  339 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  340 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  341 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  342 | 
  343 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  344 |   await page.getByTestId('kotc-slot-r1-c1-A-1').click();
  345 |   await page.getByTestId('kotc-bench-player-participant-17').click();
> 346 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 01');
      |                                                ^ Error: expect(locator).toContainText(expected) failed
  347 | 
  348 |   // Lock one pair and make sure the editor reflects the saved lock.
  349 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  350 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  351 | 
  352 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  353 |   let started = Date.now();
  354 |   const startRound = page.getByTestId('kotc-start-round');
  355 |   await startRound.click();
  356 |   await expect(startRound).toContainText('Starting…');
  357 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  358 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  359 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  360 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  361 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  362 | 
  363 |   // Timer controls: pause → reset → explicit Start Timer.
  364 |   await page.getByTestId('kotc-timer-pause').click();
  365 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  366 |   await page.getByTestId('kotc-timer-reset').click();
  367 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  368 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  369 |   await page.getByTestId('kotc-timer-start').click();
  370 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  371 |   await dismissTimerFullscreen(page);
  372 | 
  373 |   // Undo must keep accepted feedback visible for the entire backend delay.
  374 |   const undo = page.getByTestId('kotc-undo-start');
  375 |   started = Date.now();
  376 |   await undo.click();
  377 |   await expect(undo).toContainText('Returning to Round Setup…');
  378 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  379 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  380 |   await sleep(350);
  381 |   await expect(undo).toContainText('Returning to Round Setup…');
  382 |   await expect(undo).toBeDisabled();
  383 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  384 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  385 |   expect(model.timer?.running).toBe(false);
  386 |   expect(model.timer?.remainingSeconds).toBe(480);
  387 | 
  388 |   // Start again and complete Round 1.
  389 |   started = Date.now();
  390 |   await page.getByTestId('kotc-start-round').click();
  391 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  392 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  393 |   await dismissTimerFullscreen(page);
  394 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  395 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  396 | 
  397 |   started = Date.now();
  398 |   await expect(page.getByText('START ROUND 2')).toBeVisible({ timeout: 2200 });
  399 |   metric(report, 'round1_to_round2_editor_ms', Date.now() - started, 2200);
  400 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  401 | 
  402 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  403 |   await page.getByTestId('kotc-start-round').click();
  404 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  405 |   await dismissTimerFullscreen(page);
  406 |   await page.getByTestId('kotc-session-menu').click();
  407 |   await page.getByTestId('kotc-players-menu').click();
  408 |   await page.getByTestId('kotc-player-participant-03').click();
  409 |   await page.getByTestId('kotc-player-sit-out').click();
  410 |   await expect(page.getByText('Player 03 updated')).toBeVisible({ timeout: 1200 });
  411 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  412 | 
  413 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  414 |   await expect(page.getByText('START ROUND 3')).toBeVisible({ timeout: 2200 });
  415 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  416 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  417 | 
  418 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  419 |   await page.getByTestId('kotc-start-round').click();
  420 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  421 |   await dismissTimerFullscreen(page);
  422 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  423 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  424 |   await expect(page.getByText('START ROUND 4')).toBeVisible({ timeout: 2200 });
  425 | 
  426 |   await page.getByTestId('kotc-session-menu').click();
  427 |   started = Date.now();
  428 |   await page.getByTestId('kotc-finish-session').click();
  429 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  430 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  431 |   await expect(page.getByText('Session complete')).toBeVisible();
  432 |   await expect(page.getByText('Gold')).toBeVisible();
  433 |   await expect(page.getByText('Silver')).toBeVisible();
  434 |   await expect(page.getByText('Bronze')).toBeVisible();
  435 | 
  436 |   report.rounds_created = model.rounds.length;
  437 |   report.function_calls = model.calls.length;
  438 |   console.log(`KOTC HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  439 |   await testInfo.attach('kotc-host-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  440 | });
  441 | 
```