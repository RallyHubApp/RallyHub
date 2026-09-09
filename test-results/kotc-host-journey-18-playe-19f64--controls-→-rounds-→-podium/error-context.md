# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:322:1

# Error details

```
Error: undo_ack_ms should be <= 250ms but was 4061ms

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 250
Received:    4061
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - paragraph [ref=e7]: Round 1 — LIVE
          - paragraph [ref=e8]: 4 courts · 2 bench
        - button "Session Menu" [ref=e9] [cursor=pointer]
      - generic [ref=e10]:
        - generic [ref=e11]:
          - paragraph [ref=e13]: Play Time
          - generic [ref=e14]:
            - button "Test / enable speaker sound" [ref=e20] [cursor=pointer]
            - button "Dock timer back in page" [ref=e21] [cursor=pointer]
            - button "Full screen timer" [ref=e22] [cursor=pointer]
        - generic [ref=e23]: 07:56
        - generic [ref=e26]:
          - button "Pause Timer" [ref=e27] [cursor=pointer]
          - button "Reset" [ref=e28] [cursor=pointer]
      - paragraph [ref=e29]: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
      - button "Returning to Round Setup…" [disabled]
      - generic [ref=e30]:
        - paragraph [ref=e31]: Bench This Round
        - paragraph [ref=e32]: Player 04 · Player 18
      - generic [ref=e33]:
        - generic [ref=e34]:
          - generic [ref=e35]:
            - generic [ref=e36]: Court 1
            - generic [ref=e40]: LIVE
          - generic [ref=e41]:
            - generic [ref=e42]:
              - paragraph [ref=e43]: Team A
              - paragraph [ref=e44]: Player 17 & Player 07
            - spinbutton [ref=e45]
          - generic [ref=e46]:
            - generic [ref=e47]:
              - paragraph [ref=e48]: Team B
              - paragraph [ref=e49]: Player 11 & Player 14
            - spinbutton [ref=e50]
          - button "Complete Match" [disabled]
        - generic [ref=e51]:
          - generic [ref=e52]:
            - generic [ref=e53]: Court 2
            - generic [ref=e55]: LIVE
          - generic [ref=e56]:
            - generic [ref=e57]:
              - paragraph [ref=e58]: Team A
              - paragraph [ref=e59]: Player 01 & Player 05
            - spinbutton [ref=e60]
          - generic [ref=e61]:
            - generic [ref=e62]:
              - paragraph [ref=e63]: Team B
              - paragraph [ref=e64]: Player 12 & Player 15
            - spinbutton [ref=e65]
          - button "Complete Match" [disabled]
        - generic [ref=e66]:
          - generic [ref=e67]:
            - generic [ref=e68]: Court 3
            - generic [ref=e70]: LIVE
          - generic [ref=e71]:
            - generic [ref=e72]:
              - paragraph [ref=e73]: Team A
              - paragraph [ref=e74]: Player 02 & Player 08
            - spinbutton [ref=e75]
          - generic [ref=e76]:
            - generic [ref=e77]:
              - paragraph [ref=e78]: Team B
              - paragraph [ref=e79]: Player 10 & Player 13
            - spinbutton [ref=e80]
          - button "Complete Match" [disabled]
        - generic [ref=e81]:
          - generic [ref=e82]:
            - generic [ref=e83]: Court 4
            - generic [ref=e85]: LIVE
          - generic [ref=e86]:
            - generic [ref=e87]:
              - paragraph [ref=e88]: Team A
              - paragraph [ref=e89]: Player 03 & Player 06
            - spinbutton [ref=e90]
          - generic [ref=e91]:
            - generic [ref=e92]:
              - paragraph [ref=e93]: Team B
              - paragraph [ref=e94]: Player 09 & Player 16
            - spinbutton [ref=e95]
          - button "Complete Match" [disabled]
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e96]:
        - generic [ref=e112]: Returning to Round Setup…
```

# Test source

```ts
  217 |         match.team_b_score = Number(body.teamBScore);
  218 |         match.winner_side = match.team_a_score >= match.team_b_score ? 'A' : 'B';
  219 |         match.status = 'completed';
  220 |         match.completed_at = new Date().toISOString();
  221 |         match.revision += 1;
  222 |         return { success: true, match };
  223 |       }
  224 | 
  225 |       if (body.commandType === 'generate_next_round') {
  226 |         await sleep(500);
  227 |         const prior = currentRound();
  228 |         prior.status = 'completed';
  229 |         prior.completed_at = new Date().toISOString();
  230 |         const priorActive = new Set(currentSlots().map(slot => slot.participant_id));
  231 |         const priorBench = model.participants.filter(p => ['present', 'registered', 'confirmed', 'leaving_early'].includes(p.status) && !priorActive.has(p.id)).map(p => p.id);
  232 |         const next = makeRound(Number(prior.round_number) + 1, priorBench.slice().reverse());
  233 |         model.session.revision += 1;
  234 |         return { success: true, session: model.session, round: next };
  235 |       }
  236 | 
  237 |       if (body.commandType === 'set_participant_status') {
  238 |         await sleep(300);
  239 |         const participant = model.participants.find(p => p.id === body.participantId);
  240 |         if (body.statusAction === 'voluntary_rest') {
  241 |           participant.status = 'voluntary_rest';
  242 |           participant.availability_effective_from_round = Number(model.session.current_round_number) + 1;
  243 |           participant.available_again_from_round = Number(model.session.current_round_number) + 2;
  244 |         } else if (body.statusAction === 'back_available') {
  245 |           participant.status = 'present';
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
> 317 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
      |                                                                     ^ Error: undo_ack_ms should be <= 250ms but was 4061ms
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
  344 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  345 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  346 |   await firstSlot.click();
  347 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  348 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  349 | 
  350 |   // Lock one pair and make sure the editor reflects the saved lock.
  351 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  352 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  353 | 
  354 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  355 |   let started = Date.now();
  356 |   const startRound = page.getByTestId('kotc-start-round');
  357 |   await startRound.click();
  358 |   await expect(startRound).toContainText('Starting…');
  359 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  360 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  361 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  362 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  363 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  364 | 
  365 |   // Timer controls: pause → reset → explicit Start Timer.
  366 |   await page.getByTestId('kotc-timer-pause').click();
  367 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  368 |   await page.getByTestId('kotc-timer-reset').click();
  369 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  370 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  371 |   await page.getByTestId('kotc-timer-start').click();
  372 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  373 |   await dismissTimerFullscreen(page);
  374 | 
  375 |   // Undo must keep accepted feedback visible for the entire backend delay.
  376 |   const undo = page.getByTestId('kotc-undo-start');
  377 |   started = Date.now();
  378 |   await undo.click();
  379 |   await expect(undo).toContainText('Returning to Round Setup…');
  380 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  381 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  382 |   await sleep(350);
  383 |   await expect(undo).toContainText('Returning to Round Setup…');
  384 |   await expect(undo).toBeDisabled();
  385 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  386 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  387 |   expect(model.timer?.running).toBe(false);
  388 |   expect(model.timer?.remainingSeconds).toBe(480);
  389 | 
  390 |   // Start again and complete Round 1.
  391 |   started = Date.now();
  392 |   await page.getByTestId('kotc-start-round').click();
  393 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  394 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  395 |   await dismissTimerFullscreen(page);
  396 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  397 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  398 | 
  399 |   started = Date.now();
  400 |   await expect(page.getByText('START ROUND 2')).toBeVisible({ timeout: 2200 });
  401 |   metric(report, 'round1_to_round2_editor_ms', Date.now() - started, 2200);
  402 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  403 | 
  404 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  405 |   await page.getByTestId('kotc-start-round').click();
  406 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  407 |   await dismissTimerFullscreen(page);
  408 |   await page.getByTestId('kotc-session-menu').click();
  409 |   await page.getByTestId('kotc-players-menu').click();
  410 |   await page.getByTestId('kotc-player-participant-03').click();
  411 |   await page.getByTestId('kotc-player-sit-out').click();
  412 |   await expect(page.getByText('Player 03 updated')).toBeVisible({ timeout: 1200 });
  413 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  414 | 
  415 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  416 |   await expect(page.getByText('START ROUND 3')).toBeVisible({ timeout: 2200 });
  417 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
```