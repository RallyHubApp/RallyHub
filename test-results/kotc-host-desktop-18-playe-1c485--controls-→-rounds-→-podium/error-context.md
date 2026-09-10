# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> 18-player desktop Preview host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-desktop.spec.mjs:340:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByTestId('kotc-complete-1')
    - locator resolved to <button data-dynamic-content="true" data-testid="kotc-complete-1" data-source-location="src/components/kotc/KotcV2SessionView.jsx:46:16" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px…>Complete Match</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div data-testid="kotc-timer" data-dynamic-content="true" data-source-location="src/components/kotc/RoundTimer.jsx:277:4" class="glass rounded-2xl p-4 sm:p-5 space-y-4 border border-primary/20 bg-background">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div data-testid="kotc-timer" data-dynamic-content="true" data-source-location="src/components/kotc/RoundTimer.jsx:277:4" class="glass rounded-2xl p-4 sm:p-5 space-y-4 border border-primary/20 bg-background">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    75 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div data-testid="kotc-timer" data-dynamic-content="true" data-source-location="src/components/kotc/RoundTimer.jsx:277:4" class="glass rounded-2xl p-4 sm:p-5 space-y-4 border border-primary/20 bg-background">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Round 1 — LIVE
        - paragraph [ref=e8]: 4 courts · 2 bench · 0/4 scores saved
      - button "Session Menu" [ref=e9] [cursor=pointer]
    - generic [ref=e10]:
      - paragraph [ref=e11]: What happens next
      - paragraph [ref=e12]: Round 1 live · 0/4 scores saved
      - paragraph [ref=e13]: "Next: collect Court 1, Court 2, Court 3, Court 4 results. You can correct any saved score before advancing."
    - generic [ref=e14]:
      - generic [ref=e15]:
        - paragraph [ref=e17]: Play Time
        - generic [ref=e18]:
          - button "Test / enable speaker sound" [ref=e19] [cursor=pointer]
          - button "Float and move timer" [ref=e20] [cursor=pointer]
          - button "Full screen timer" [ref=e21] [cursor=pointer]
      - generic [ref=e22]: 07:20
      - generic [ref=e25]:
        - button "Pause Timer" [ref=e26] [cursor=pointer]
        - button "Reset" [ref=e27] [cursor=pointer]
    - paragraph [ref=e28]: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
    - button "Undo Start / Back to Round Setup" [ref=e29] [cursor=pointer]
    - generic [ref=e30]:
      - paragraph [ref=e31]: Bench This Round
      - paragraph [ref=e32]: Player 01 · Player 18
    - generic [ref=e33]:
      - generic [ref=e34]:
        - generic [ref=e35]:
          - generic [ref=e36]: Court 1
          - generic [ref=e40]: LIVE
        - generic [ref=e41]:
          - generic [ref=e42]:
            - paragraph [ref=e43]: Team A
            - paragraph [ref=e44]: Player 17 & Player 07
          - spinbutton [ref=e45]: "11"
        - generic [ref=e46]:
          - generic [ref=e47]:
            - paragraph [ref=e48]: Team B
            - paragraph [ref=e49]: Player 10 & Player 15
          - spinbutton [ref=e50]: "6"
        - button "Complete Match" [ref=e51] [cursor=pointer]
      - generic [ref=e52]:
        - generic [ref=e53]:
          - generic [ref=e54]: Court 2
          - generic [ref=e56]: LIVE
        - generic [ref=e57]:
          - generic [ref=e58]:
            - paragraph [ref=e59]: Team A
            - paragraph [ref=e60]: Player 02 & Player 06
          - spinbutton [ref=e61]
        - generic [ref=e62]:
          - generic [ref=e63]:
            - paragraph [ref=e64]: Team B
            - paragraph [ref=e65]: Player 12 & Player 14
          - spinbutton [ref=e66]
        - button "Complete Match" [disabled]
      - generic [ref=e67]:
        - generic [ref=e68]:
          - generic [ref=e69]: Court 3
          - generic [ref=e71]: LIVE
        - generic [ref=e72]:
          - generic [ref=e73]:
            - paragraph [ref=e74]: Team A
            - paragraph [ref=e75]: Player 03 & Player 08
          - spinbutton [ref=e76]
        - generic [ref=e77]:
          - generic [ref=e78]:
            - paragraph [ref=e79]: Team B
            - paragraph [ref=e80]: Player 09 & Player 16
          - spinbutton [ref=e81]
        - button "Complete Match" [disabled]
      - generic [ref=e82]:
        - generic [ref=e83]:
          - generic [ref=e84]: Court 4
          - generic [ref=e86]: LIVE
        - generic [ref=e87]:
          - generic [ref=e88]:
            - paragraph [ref=e89]: Team A
            - paragraph [ref=e90]: Player 04 & Player 05
          - spinbutton [ref=e91]
        - generic [ref=e92]:
          - generic [ref=e93]:
            - paragraph [ref=e94]: Team B
            - paragraph [ref=e95]: Player 11 & Player 13
          - spinbutton [ref=e96]
        - button "Complete Match" [disabled]
```

# Test source

```ts
  226 |         match.team_a_score = Number(body.teamAScore);
  227 |         match.team_b_score = Number(body.teamBScore);
  228 |         match.winner_side = match.team_a_score >= match.team_b_score ? 'A' : 'B';
  229 |         match.status = 'completed';
  230 |         match.completed_at = match.completed_at || new Date().toISOString();
  231 |         match.scoring_lock_owner = null;
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
  310 |   const control = page.getByTitle('Full screen timer');
  311 |   if (await control.count()) await control.first().click();
  312 |   // Leaving fullscreen intentionally floats the timer for live hall use. The automated
  313 |   // host journey docks it again so it cannot physically cover controls underneath and
  314 |   // distort click-latency measurements.
  315 |   const dock = page.getByTitle('Dock timer back in page');
  316 |   if (await dock.count()) await dock.first().click();
  317 | }
  318 | 
  319 | async function scoreCurrentRound(page, courtCount = 4, baseScore = 11) {
  320 |   const timings = [];
  321 |   for (let court = 1; court <= courtCount; court++) {
  322 |     await page.getByTestId(`kotc-score-${court}-a`).fill(String(baseScore));
  323 |     await page.getByTestId(`kotc-score-${court}-b`).fill(String(Math.max(0, baseScore - 4 - court)));
  324 |     const button = page.getByTestId(`kotc-complete-${court}`);
  325 |     const started = Date.now();
> 326 |     await button.click();
      |                  ^ Error: locator.click: Test timeout of 45000ms exceeded.
  327 |     await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved', { timeout: 2000 });
  328 |     timings.push(Date.now() - started);
  329 |   }
  330 |   return timings;
  331 | }
  332 | 
  333 | function metric(report, name, value, max) {
  334 |   report[name] = value;
  335 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
  336 | }
  337 | 
  338 | test.use({ viewport: { width: 1440, height: 900 } });
  339 | 
  340 | test('18-player desktop Preview host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
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
```