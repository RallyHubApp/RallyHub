# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> 18-player desktop Preview host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-desktop.spec.mjs:375:1

# Error details

```
Error: create_ack_ms should be <= 250ms but was 527ms

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 250
Received:    527
```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Round 1 — ROUND READY
        - paragraph [ref=e8]: 4 courts · 2 bench
      - generic [ref=e9]:
        - button "Roster" [ref=e10] [cursor=pointer]
        - button "Links" [ref=e11] [cursor=pointer]
        - button "Menu" [ref=e12] [cursor=pointer]
    - generic [ref=e13]:
      - paragraph [ref=e14]: What happens next
      - paragraph [ref=e15]: Round 1 ready
      - paragraph [ref=e16]: "Next: check the 4 court assignments and bench, then Start Round 1."
    - generic [ref=e17]:
      - generic [ref=e18]:
        - paragraph [ref=e19]: Bench This Round
        - generic [ref=e20]:
          - button "Player 17" [ref=e21] [cursor=pointer]
          - button "Player 18" [ref=e22] [cursor=pointer]
        - paragraph [ref=e23]: Tap a court player, then a bench player, to swap them.
      - generic [ref=e24]:
        - generic [ref=e25]:
          - heading "Host Round Editor" [level=4] [ref=e26]
          - paragraph [ref=e27]: Tap two players to swap them, or drag a whole court by its handle to move that four-player group to another court rank.
        - generic [ref=e28]:
          - generic [ref=e29]:
            - generic [ref=e30]:
              - generic [ref=e31]: Court 1
              - button "Move whole Court 1" [ref=e35] [cursor=pointer]: Move court
            - generic [ref=e43]:
              - generic [ref=e44]:
                - paragraph [ref=e45]: Team A
                - button "Lock pair" [ref=e46] [cursor=pointer]
              - generic [ref=e47]:
                - button "Player 01" [ref=e48] [cursor=pointer]
                - button "Player 08" [ref=e57] [cursor=pointer]
            - generic [ref=e66]:
              - generic [ref=e67]:
                - paragraph [ref=e68]: Team B
                - button "Lock pair" [ref=e69] [cursor=pointer]
              - generic [ref=e70]:
                - button "Player 09" [ref=e71] [cursor=pointer]
                - button "Player 16" [ref=e80] [cursor=pointer]
          - generic [ref=e89]:
            - generic [ref=e90]:
              - generic [ref=e91]: Court 2
              - button "Move whole Court 2" [ref=e93] [cursor=pointer]: Move court
            - generic [ref=e101]:
              - generic [ref=e102]:
                - paragraph [ref=e103]: Team A
                - button "Lock pair" [ref=e104] [cursor=pointer]
              - generic [ref=e105]:
                - button "Player 02" [ref=e106] [cursor=pointer]
                - button "Player 07" [ref=e115] [cursor=pointer]
            - generic [ref=e124]:
              - generic [ref=e125]:
                - paragraph [ref=e126]: Team B
                - button "Lock pair" [ref=e127] [cursor=pointer]
              - generic [ref=e128]:
                - button "Player 10" [ref=e129] [cursor=pointer]
                - button "Player 15" [ref=e138] [cursor=pointer]
          - generic [ref=e147]:
            - generic [ref=e148]:
              - generic [ref=e149]: Court 3
              - button "Move whole Court 3" [ref=e151] [cursor=pointer]: Move court
            - generic [ref=e159]:
              - generic [ref=e160]:
                - paragraph [ref=e161]: Team A
                - button "Lock pair" [ref=e162] [cursor=pointer]
              - generic [ref=e163]:
                - button "Player 03" [ref=e164] [cursor=pointer]
                - button "Player 06" [ref=e173] [cursor=pointer]
            - generic [ref=e182]:
              - generic [ref=e183]:
                - paragraph [ref=e184]: Team B
                - button "Lock pair" [ref=e185] [cursor=pointer]
              - generic [ref=e186]:
                - button "Player 11" [ref=e187] [cursor=pointer]
                - button "Player 14" [ref=e196] [cursor=pointer]
          - generic [ref=e205]:
            - generic [ref=e206]:
              - generic [ref=e207]: Court 4
              - button "Move whole Court 4" [ref=e209] [cursor=pointer]: Move court
            - generic [ref=e217]:
              - generic [ref=e218]:
                - paragraph [ref=e219]: Team A
                - button "Lock pair" [ref=e220] [cursor=pointer]
              - generic [ref=e221]:
                - button "Player 04" [ref=e222] [cursor=pointer]
                - button "Player 05" [ref=e231] [cursor=pointer]
            - generic [ref=e240]:
              - generic [ref=e241]:
                - paragraph [ref=e242]: Team B
                - button "Lock pair" [ref=e243] [cursor=pointer]
              - generic [ref=e244]:
                - button "Player 12" [ref=e245] [cursor=pointer]
                - button "Player 13" [ref=e254] [cursor=pointer]
        - generic [ref=e263]:
          - generic [ref=e264]:
            - paragraph [ref=e265]: Round setup is saved
            - paragraph [ref=e266]: You can leave this screen and return without losing the court layout.
          - button "Saved ✓" [disabled]
      - generic [ref=e267]:
        - generic [ref=e268]:
          - paragraph [ref=e269]: Pre-Round Check
          - paragraph [ref=e270]: Confirm the round time and hall sound before players begin.
        - generic [ref=e271]:
          - generic [ref=e272]:
            - generic [ref=e277]:
              - paragraph [ref=e278]: Round timer
              - paragraph [ref=e279]: Adjust now if tonight needs a shorter or longer round.
            - generic [ref=e280]: 08:00
          - generic [ref=e281]:
            - button "− 1 min" [ref=e282] [cursor=pointer]
            - button "+ 1 min" [ref=e283] [cursor=pointer]
        - generic [ref=e285]:
          - generic [ref=e286]:
            - paragraph [ref=e287]: Hall sound check
            - paragraph [ref=e288]: Test the real cue and spoken voice before play. This uses your device/speaker only — no Base44 call.
          - button "Test Sound" [ref=e289] [cursor=pointer]
        - button "START ROUND 1" [ref=e290] [cursor=pointer]
      - button "Back to Setup" [ref=e291] [cursor=pointer]
      - button "Restore Original Draw" [ref=e292] [cursor=pointer]
  - generic [ref=e293]:
    - button "Scroll up" [ref=e294] [cursor=pointer]
    - button "Scroll down" [ref=e295] [cursor=pointer]
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
      |                                                                     ^ Error: create_ack_ms should be <= 250ms but was 527ms
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