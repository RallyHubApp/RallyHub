# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> 18-player desktop Preview host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-desktop.spec.mjs:375:1

# Error details

```
Error: create_ack_ms should be <= 250ms but was 483ms

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 250
Received:    483
```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e11]:
        - paragraph [ref=e12]: King of the Court
        - heading "Set up tonight’s session" [level=2] [ref=e13]
        - paragraph [ref=e14]: Confirm the hall settings, decide the Round 1 draw and choose the bench. You can review the actual courts before anything starts.
      - generic [ref=e15]:
        - generic [ref=e16]: 18 players
        - generic [ref=e17]: 4 courts
        - generic [ref=e18]: 2 bench
    - generic [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e27]:
            - paragraph [ref=e28]: 1 · Session settings
            - paragraph [ref=e29]: The essentials for this hall and tonight’s scoring.
          - generic [ref=e30]:
            - generic [ref=e31]:
              - text: Venue courts
              - spinbutton [ref=e32]: "4"
            - generic [ref=e33]:
              - text: Hall / session duration
              - generic [ref=e34]:
                - spinbutton [ref=e35]: "90"
                - generic [ref=e36]: min
            - generic [ref=e37]:
              - text: Scoring
              - combobox [ref=e38] [cursor=pointer]:
                - generic: Timed rounds
            - generic [ref=e41]:
              - text: Round duration
              - generic [ref=e42]:
                - spinbutton [ref=e43]: "8"
                - generic [ref=e44]: min
          - generic [ref=e45] [cursor=pointer]:
            - checkbox "Super Admin Test mode Diagnostic only. Excludes this session from KOTC history and enables local Fill Test Scores controls. Session hosts never see this option." [ref=e46]
            - generic [ref=e47]:
              - text: Super Admin Test mode
              - generic [ref=e48]: Diagnostic only. Excludes this session from KOTC history and enables local Fill Test Scores controls. Session hosts never see this option.
          - generic [ref=e49] [cursor=pointer]:
            - checkbox "Counts toward club leaderboard Turn this on only for an official club competition. Test mode is always excluded." [checked] [ref=e50]
            - generic [ref=e51]:
              - text: Counts toward club leaderboard
              - generic [ref=e52]: Turn this on only for an official club competition. Test mode is always excluded.
        - generic [ref=e53]:
          - generic [ref=e59]:
            - paragraph [ref=e60]: 2 · Round 1 setup
            - paragraph [ref=e61]: Choose how the starting order is built and how that order is distributed across courts.
          - generic [ref=e62]:
            - generic [ref=e63]:
              - text: Starting order
              - combobox [ref=e64] [cursor=pointer]:
                - generic: Roster order
              - paragraph [ref=e67]: This sets the starting order only. RallyHub does not invent ratings.
            - generic [ref=e68]:
              - text: Round 1 draw
              - combobox [ref=e69] [cursor=pointer]:
                - generic: Balanced Ranking
              - paragraph [ref=e72]: Balanced Ranking uses your 1-to-N order to spread strength across the courts and, where possible, pairs the strongest player with the weakest in that court. Strict Ranking keeps the strongest four together, then the next four, and so on.
          - button "Review player order (18) Show" [ref=e73] [cursor=pointer]:
            - generic [ref=e74]:
              - text: Review player order
              - generic [ref=e75]: (18)
            - generic [ref=e76]: Show
        - generic [ref=e77]:
          - generic [ref=e78]:
            - generic [ref=e86]:
              - paragraph [ref=e87]: 3 · Choose Round 1 bench
              - paragraph [ref=e88]: Choose exactly 2. You can still swap the proposed Round 1 courts before starting.
            - generic [ref=e89]: 2/2
          - generic [ref=e90]:
            - button "Player 01" [ref=e91] [cursor=pointer]
            - button "Player 02" [ref=e94] [cursor=pointer]
            - button "Player 03" [ref=e97] [cursor=pointer]
            - button "Player 04" [ref=e100] [cursor=pointer]
            - button "Player 05" [ref=e103] [cursor=pointer]
            - button "Player 06" [ref=e106] [cursor=pointer]
            - button "Player 07" [ref=e109] [cursor=pointer]
            - button "Player 08" [ref=e112] [cursor=pointer]
            - button "Player 09" [ref=e115] [cursor=pointer]
            - button "Player 10" [ref=e118] [cursor=pointer]
            - button "Player 11" [ref=e121] [cursor=pointer]
            - button "Player 12" [ref=e124] [cursor=pointer]
            - button "Player 13" [ref=e127] [cursor=pointer]
            - button "Player 14" [ref=e130] [cursor=pointer]
            - button "Player 15" [ref=e133] [cursor=pointer]
            - button "Player 16" [ref=e136] [cursor=pointer]
            - button "Player 17 ✓" [pressed] [ref=e139] [cursor=pointer]:
              - generic [ref=e140]:
                - generic [ref=e141]: Player 17
                - generic [ref=e142]: ✓
            - button "Player 18 ✓" [pressed] [ref=e143] [cursor=pointer]:
              - generic [ref=e144]:
                - generic [ref=e145]: Player 18
                - generic [ref=e146]: ✓
      - complementary [ref=e147]:
        - generic [ref=e148]:
          - generic [ref=e149]:
            - paragraph [ref=e150]: Ready check
            - heading "Create Round 1" [level=3] [ref=e151]
            - paragraph [ref=e152]: RallyHub will generate the proposed courts next. You will review them before the timer starts.
          - generic [ref=e153]:
            - generic [ref=e154]:
              - generic [ref=e155]: Players
              - strong [ref=e156]: "18"
            - generic [ref=e157]:
              - generic [ref=e158]: Active courts
              - strong [ref=e159]: "4"
            - generic [ref=e160]:
              - generic [ref=e161]: Bench
              - strong [ref=e162]: "2"
            - generic [ref=e163]:
              - generic [ref=e164]: Scoring
              - strong [ref=e165]: 8 min timed rounds
            - generic [ref=e166]:
              - generic [ref=e167]: Starting order
              - strong [ref=e168]: Roster order
            - generic [ref=e169]:
              - generic [ref=e170]: Draw
              - strong [ref=e171]: Balanced Ranking
            - generic [ref=e172]:
              - generic [ref=e173]: Mode
              - strong [ref=e174]: Live
          - generic [ref=e179]:
            - paragraph [ref=e180]: Ready to create the draw
            - paragraph [ref=e181]: Nothing starts until you review Round 1 and press Start Round 1.
          - button "Creating Round 1…" [disabled]
  - generic [ref=e182]:
    - button "Scroll up" [ref=e183] [cursor=pointer]
    - button "Scroll down" [disabled]
```

# Test source

```ts
  260 |         return { success: true, match, correction };
  261 |       }
  262 | 
  263 |       if (name === 'prepareKotcNextRound' || body.commandType === 'generate_next_round') {
  264 |         await delayFor(name==='prepareKotcNextRound'?'prepareKotcNextRound':'kotcCommand',500);
  265 |         if(model.failPrepareBeforeCommit&&!model.prepareFailureInjected){model.prepareFailureInjected=true;return {__status:429,error:'Rate limit exceeded before sporting write'};}
  266 |         const prior = currentRound();
  267 |         prior.status = 'completed';
  268 |         prior.completed_at = new Date().toISOString();
  269 |         const priorActive = new Set(currentSlots().map(slot => slot.participant_id));
  270 |         const priorBench = model.participants.filter(p => ['present', 'registered', 'confirmed', 'leaving_early'].includes(p.status) && !priorActive.has(p.id)).map(p => p.id);
  271 |         const next = makeRound(Number(prior.round_number) + 1, priorBench.slice().reverse());
  272 |         model.session.revision += 1;
  273 |         if(model.commitThenFailPrepare&&!model.prepareFailureInjected){model.prepareFailureInjected=true;return {__status:503,error:'Base44 response lost after Round 2 commit'};}
  274 |         return { success: true, session: model.session, round: next, slots:model.slots.filter(s=>s.round_id===next.id), matches:model.matches.filter(m=>m.round_id===next.id), participants:model.participants, runtimeVersion:'kotc-2026-09-10-r6' };
  275 |       }
  276 | 
  277 |       if (body.commandType === 'set_participant_status') {
  278 |         await sleep(300);
  279 |         const participant = model.participants.find(p => p.id === body.participantId);
  280 |         if (body.statusAction === 'voluntary_rest') {
  281 |           participant.status = 'voluntary_rest';
  282 |           participant.availability_effective_from_round = Number(model.session.current_round_number) + 1;
  283 |           participant.available_again_from_round = Number(model.session.current_round_number) + 2;
  284 |         } else if (body.statusAction === 'back_available') {
  285 |           participant.status = 'present';
  286 |           participant.availability_effective_from_round = null;
  287 |           participant.available_again_from_round = null;
  288 |         }
  289 |         model.session.revision += 1;
  290 |         return { success: true, session: model.session, participant };
  291 |       }
  292 | 
  293 |       if (body.commandType === 'pause_session' || body.commandType === 'resume_session') {
  294 |         await sleep(200);
  295 |         model.session.status = body.commandType === 'pause_session' ? 'paused' : 'in_progress';
  296 |         model.session.revision += 1;
  297 |         return { success: true, session: model.session };
  298 |       }
  299 |       return { success: true, session: model.session };
  300 |     }
  301 | 
  302 |     if (name === 'endKotcSession') {
  303 |       await delayFor('endKotcSession',450);
  304 |       if (body.action === 'finish') model.session.status = 'completed';
  305 |       if (body.action === 'abandon') model.session.status = 'abandoned';
  306 |       model.session.actual_session_end = new Date().toISOString();
  307 |       return { success: true, session: model.session };
  308 |     }
  309 | 
  310 |     if (name === 'kotcResultsShare') return { success: true, token: 'e2e-results', sent: 18 };
  311 |     return { success: true };
  312 |   };
  313 | 
  314 |   return model;
  315 | }
  316 | 
  317 | async function installMockBackend(page, model) {
  318 |   await page.route('**/api/apps/**', async route => {
  319 |     const request = route.request();
  320 |     const url = new URL(request.url());
  321 |     const path = url.pathname;
  322 |     if (path.includes('/entities/KotcPlayerAggregate')) return json(route, []);
  323 |     const marker = `/api/apps/${APP_ID}/functions/`;
  324 |     const index = path.indexOf(marker);
  325 |     if (index >= 0) {
  326 |       const name = decodeURIComponent(path.slice(index + marker.length).split('/')[0]);
  327 |       let body = {};
  328 |       try { body = request.postDataJSON() || {}; } catch { body = {}; }
  329 |       const payload = await model.handleFunction(name, body);
  330 |       if(payload?.__status)return json(route,{error:payload.error},payload.__status);
  331 |       return json(route, payload);
  332 |     }
  333 |     return json(route, []);
  334 |   });
  335 | }
  336 | 
  337 | async function dismissTimerFullscreen(page) {
  338 |   const exit = page.getByTitle('Exit full screen timer');
  339 |   if (await exit.count()) await exit.first().click();
  340 |   const dock = page.getByTitle('Dock timer back in page');
  341 |   if (await dock.count()) await dock.first().click();
  342 | }
  343 | 
  344 | async function scoreCurrentRound(page, courtCount = 4, baseScore = 11) {
  345 |   const timings = [];
  346 |   for (let court = 1; court <= courtCount; court++) {
  347 |     await page.getByTestId(`kotc-score-${court}-a`).fill(String(baseScore));
  348 |     await page.getByTestId(`kotc-score-${court}-b`).fill(String(Math.max(0, baseScore - 4 - court)));
  349 |     const button = page.getByTestId(`kotc-complete-${court}`);
  350 |     const started = Date.now();
  351 |     await button.click();
  352 |     await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved', { timeout: 2000 });
  353 |     timings.push(Date.now() - started);
  354 |   }
  355 |   return timings;
  356 | }
  357 | 
  358 | function metric(report, name, value, max) {
  359 |   report[name] = value;
> 360 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
      |                                                                     ^ Error: create_ack_ms should be <= 250ms but was 483ms
  361 | }
  362 | 
  363 | async function createAndStartRoundOne(page){
  364 |   await page.goto('/e2e/kotcHarness.html');
  365 |   await page.getByRole('button',{name:'Player 17',exact:true}).click();
  366 |   await page.getByRole('button',{name:'Player 18',exact:true}).click();
  367 |   await page.getByTestId('kotc-create-session').click();
  368 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:2000});
  369 |   await page.getByTestId('kotc-start-round').click();
  370 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({timeout:2000});
  371 | }
  372 | 
  373 | test.use({ viewport: { width: 1440, height: 900 } });
  374 | 
  375 | test('18-player desktop Preview host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  376 |   const model = createModel();
  377 |   const report = {};
  378 |   await installMockBackend(page, model);
  379 |   page.on('dialog', dialog => dialog.accept());
  380 | 
  381 |   await page.goto('/e2e/kotcHarness.html');
  382 |   await expect(page.getByTestId('kotc-setup')).toBeVisible();
  383 |   await expect(page.getByTestId('kotc-setup')).toContainText('18 players');
  384 |   await expect(page.getByTestId('kotc-setup')).toContainText('4 courts');
  385 |   await expect(page.getByTestId('kotc-setup')).toContainText('2 bench');
  386 |   await expect(page.getByTestId('kotc-setup-summary')).toContainText('Create Round 1');
  387 | 
  388 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  389 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  390 |   const create = page.getByTestId('kotc-create-session');
  391 |   const createAt = Date.now();
  392 |   await create.click();
  393 |   await expect(create).toContainText('Creating Round 1…');
  394 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  395 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  396 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  397 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  398 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  399 | 
  400 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  401 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  402 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  403 |   await firstSlot.click();
  404 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  405 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  406 | 
  407 |   // Lock one pair. The host must get immediate acknowledgement, then a persistent locked state.
  408 |   const lockButton=page.getByRole('button', { name: 'Lock pair' }).first();
  409 |   await lockButton.click();
  410 |   await expect(page.getByRole('button', { name: 'Saving…' }).first()).toBeVisible({ timeout: 250 });
  411 |   await expect(page.getByRole('button', { name: /Locked ✓ · Unlock/ }).first()).toBeVisible({ timeout: 1500 });
  412 | 
  413 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  414 |   let started = Date.now();
  415 |   const startRound = page.getByTestId('kotc-start-round');
  416 |   await startRound.click();
  417 |   await expect(startRound).toContainText('Starting…');
  418 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  419 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  420 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  421 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  422 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  423 | 
  424 |   // Timer controls: pause → reset → explicit Start Timer.
  425 |   await page.getByTestId('kotc-timer-pause').click();
  426 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  427 |   await page.getByTestId('kotc-timer-reset').click();
  428 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  429 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  430 |   await page.getByTestId('kotc-timer-start').click();
  431 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  432 |   await dismissTimerFullscreen(page);
  433 | 
  434 |   // Undo must keep accepted feedback visible for the entire backend delay.
  435 |   const undo = page.getByTestId('kotc-undo-start');
  436 |   await undo.scrollIntoViewIfNeeded();
  437 |   started = Date.now();
  438 |   await undo.evaluate(element => element.click());
  439 |   await expect(undo).toContainText('Returning to Round Setup…');
  440 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  441 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  442 |   await sleep(350);
  443 |   await expect(undo).toContainText('Returning to Round Setup…');
  444 |   await expect(undo).toBeDisabled();
  445 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  446 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  447 |   expect(model.timer?.running).toBe(false);
  448 |   expect(model.timer?.remainingSeconds).toBe(480);
  449 | 
  450 |   // Start again and complete Round 1.
  451 |   started = Date.now();
  452 |   await page.getByTestId('kotc-start-round').click();
  453 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  454 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  455 |   await dismissTimerFullscreen(page);
  456 |   // Host-only sessions remain fast: ordinary score entry does not create scorer-lease traffic.
  457 |   // Collaborative first-claim-wins locking is covered separately by the host + two scorer robot.
  458 |   const claimsBefore=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  459 |   await page.getByTestId('kotc-score-1-a').focus();
  460 |   expect(model.calls.filter(c=>c.body?.commandType==='host_claim_score').length).toBe(claimsBefore);
```