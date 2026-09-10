# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> 18-player desktop Preview host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-desktop.spec.mjs:337:1

# Error details

```
Error: start_ack_ms should be <= 250ms but was 255ms

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 250
Received:    255
```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Round 1 — ROUND READY
        - paragraph [ref=e8]: 4 courts · 2 bench
      - button "Session Menu" [ref=e9] [cursor=pointer]
    - generic [ref=e10]:
      - paragraph [ref=e11]: What happens next
      - paragraph [ref=e12]: Round 1 ready
      - paragraph [ref=e13]: "Next: check the 4 court assignments and bench, then Start Round 1."
    - generic [ref=e14]:
      - generic [ref=e15]:
        - paragraph [ref=e16]: Bench This Round
        - generic [ref=e17]:
          - button "Player 04" [ref=e18] [cursor=pointer]
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
                - button "Unlock" [disabled]
              - generic [ref=e34]:
                - button "Player 17" [ref=e35] [cursor=pointer]
                - button "Player 05" [ref=e44] [cursor=pointer]
            - generic [ref=e53]:
              - generic [ref=e54]:
                - paragraph [ref=e55]: Team B
                - button "Lock pair" [disabled]
              - generic [ref=e56]:
                - button "Player 11" [ref=e57] [cursor=pointer]
                - button "Player 14" [ref=e66] [cursor=pointer]
          - generic [ref=e75]:
            - generic [ref=e76]: Court 2
            - generic [ref=e78]:
              - generic [ref=e79]:
                - paragraph [ref=e80]: Team A
                - button "Lock pair" [disabled]
              - generic [ref=e81]:
                - button "Player 01" [ref=e82] [cursor=pointer]
                - button "Player 06" [ref=e91] [cursor=pointer]
            - generic [ref=e100]:
              - generic [ref=e101]:
                - paragraph [ref=e102]: Team B
                - button "Lock pair" [disabled]
              - generic [ref=e103]:
                - button "Player 12" [ref=e104] [cursor=pointer]
                - button "Player 15" [ref=e113] [cursor=pointer]
          - generic [ref=e122]:
            - generic [ref=e123]: Court 3
            - generic [ref=e125]:
              - generic [ref=e126]:
                - paragraph [ref=e127]: Team A
                - button "Lock pair" [disabled]
              - generic [ref=e128]:
                - button "Player 02" [ref=e129] [cursor=pointer]
                - button "Player 07" [ref=e138] [cursor=pointer]
            - generic [ref=e147]:
              - generic [ref=e148]:
                - paragraph [ref=e149]: Team B
                - button "Lock pair" [disabled]
              - generic [ref=e150]:
                - button "Player 09" [ref=e151] [cursor=pointer]
                - button "Player 13" [ref=e160] [cursor=pointer]
          - generic [ref=e169]:
            - generic [ref=e170]: Court 4
            - generic [ref=e172]:
              - generic [ref=e173]:
                - paragraph [ref=e174]: Team A
                - button "Lock pair" [disabled]
              - generic [ref=e175]:
                - button "Player 03" [ref=e176] [cursor=pointer]
                - button "Player 08" [ref=e185] [cursor=pointer]
            - generic [ref=e194]:
              - generic [ref=e195]:
                - paragraph [ref=e196]: Team B
                - button "Lock pair" [disabled]
              - generic [ref=e197]:
                - button "Player 10" [ref=e198] [cursor=pointer]
                - button "Player 16" [ref=e207] [cursor=pointer]
      - button "Starting…" [disabled]
      - button "Back to Setup" [disabled]
      - button "Restore Original Draw" [disabled]
```

# Test source

```ts
  232 |         match.scoring_lock_expires_at = null;
  233 |         if (correction) match.correction_count = Number(match.correction_count || 0) + 1;
  234 |         match.revision += 1;
  235 |         return { success: true, match, correction };
  236 |       }
  237 | 
  238 |       if (body.commandType === 'generate_next_round') {
  239 |         await sleep(500);
  240 |         const prior = currentRound();
  241 |         prior.status = 'completed';
  242 |         prior.completed_at = new Date().toISOString();
  243 |         const priorActive = new Set(currentSlots().map(slot => slot.participant_id));
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
> 332 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
      |                                                                     ^ Error: start_ack_ms should be <= 250ms but was 255ms
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
  344 |   await expect(page.getByText('18 players · 4 active courts · 2 bench')).toBeVisible();
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
```