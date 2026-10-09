# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:368:1

# Error details

```
Error: create_ack_ms should be <= 250ms but was 1236ms

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 250
Received:    1236
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
        - button "Leaderboard" [ref=e11] [cursor=pointer]
        - button "Links" [ref=e12] [cursor=pointer]
        - button "Menu" [ref=e13] [cursor=pointer]
    - generic [ref=e14]:
      - paragraph [ref=e15]: What happens next
      - paragraph [ref=e16]: Round 1 ready
      - paragraph [ref=e17]: "Next: check the 4 court assignments and bench, then Start Round 1."
    - generic [ref=e18]:
      - paragraph [ref=e19]: ROUND 1 HAS NOT STARTED
      - paragraph [ref=e20]: Call the court assignments below, make any host changes, then press START ROUND. The timer is not running and score entry is hidden until you start.
    - generic [ref=e21]:
      - generic [ref=e22]:
        - paragraph [ref=e23]: Bench This Round
        - generic [ref=e24]:
          - button "Player 17" [ref=e25] [cursor=pointer]
          - button "Player 18" [ref=e26] [cursor=pointer]
        - paragraph [ref=e27]: Tap a court player, then a bench player, to swap them.
      - generic [ref=e28]:
        - generic [ref=e29]:
          - heading "Host Round Editor" [level=4] [ref=e30]
          - paragraph [ref=e31]: Tap two players to swap them, or drag a whole court by its handle to move that four-player group to another court rank.
        - generic [ref=e32]:
          - generic [ref=e33]:
            - generic [ref=e34]:
              - generic [ref=e35]: Court 1
              - button "Move whole Court 1" [ref=e39] [cursor=pointer]: Move court
            - generic [ref=e47]:
              - generic [ref=e48]:
                - paragraph [ref=e49]: Team A
                - button "Lock pair" [ref=e50] [cursor=pointer]
              - generic [ref=e51]:
                - button "Player 01" [ref=e52] [cursor=pointer]
                - button "Player 08" [ref=e61] [cursor=pointer]
            - generic [ref=e70]:
              - generic [ref=e71]:
                - paragraph [ref=e72]: Team B
                - button "Lock pair" [ref=e73] [cursor=pointer]
              - generic [ref=e74]:
                - button "Player 09" [ref=e75] [cursor=pointer]
                - button "Player 16" [ref=e84] [cursor=pointer]
          - generic [ref=e93]:
            - generic [ref=e94]:
              - generic [ref=e95]: Court 2
              - button "Move whole Court 2" [ref=e97] [cursor=pointer]: Move court
            - generic [ref=e105]:
              - generic [ref=e106]:
                - paragraph [ref=e107]: Team A
                - button "Lock pair" [ref=e108] [cursor=pointer]
              - generic [ref=e109]:
                - button "Player 02" [ref=e110] [cursor=pointer]
                - button "Player 07" [ref=e119] [cursor=pointer]
            - generic [ref=e128]:
              - generic [ref=e129]:
                - paragraph [ref=e130]: Team B
                - button "Lock pair" [ref=e131] [cursor=pointer]
              - generic [ref=e132]:
                - button "Player 10" [ref=e133] [cursor=pointer]
                - button "Player 15" [ref=e142] [cursor=pointer]
          - generic [ref=e151]:
            - generic [ref=e152]:
              - generic [ref=e153]: Court 3
              - button "Move whole Court 3" [ref=e155] [cursor=pointer]: Move court
            - generic [ref=e163]:
              - generic [ref=e164]:
                - paragraph [ref=e165]: Team A
                - button "Lock pair" [ref=e166] [cursor=pointer]
              - generic [ref=e167]:
                - button "Player 03" [ref=e168] [cursor=pointer]
                - button "Player 06" [ref=e177] [cursor=pointer]
            - generic [ref=e186]:
              - generic [ref=e187]:
                - paragraph [ref=e188]: Team B
                - button "Lock pair" [ref=e189] [cursor=pointer]
              - generic [ref=e190]:
                - button "Player 11" [ref=e191] [cursor=pointer]
                - button "Player 14" [ref=e200] [cursor=pointer]
          - generic [ref=e209]:
            - generic [ref=e210]:
              - generic [ref=e211]: Court 4
              - button "Move whole Court 4" [ref=e213] [cursor=pointer]: Move court
            - generic [ref=e221]:
              - generic [ref=e222]:
                - paragraph [ref=e223]: Team A
                - button "Lock pair" [ref=e224] [cursor=pointer]
              - generic [ref=e225]:
                - button "Player 04" [ref=e226] [cursor=pointer]
                - button "Player 05" [ref=e235] [cursor=pointer]
            - generic [ref=e244]:
              - generic [ref=e245]:
                - paragraph [ref=e246]: Team B
                - button "Lock pair" [ref=e247] [cursor=pointer]
              - generic [ref=e248]:
                - button "Player 12" [ref=e249] [cursor=pointer]
                - button "Player 13" [ref=e258] [cursor=pointer]
        - generic [ref=e267]:
          - generic [ref=e268]:
            - paragraph [ref=e269]: Round setup is saved
            - paragraph [ref=e270]: You can leave this screen and return without losing the court layout.
          - button "Saved ✓" [disabled]
      - generic [ref=e271]:
        - generic [ref=e272]:
          - paragraph [ref=e273]: Pre-Round Check
          - paragraph [ref=e274]: Confirm the round time and hall sound before players begin.
        - generic [ref=e275]:
          - generic [ref=e276]:
            - generic [ref=e281]:
              - paragraph [ref=e282]: Round timer
              - paragraph [ref=e283]: Adjust now if tonight needs a shorter or longer round.
            - generic [ref=e284]: 08:00
          - generic [ref=e285]:
            - button "− 1 min" [ref=e286] [cursor=pointer]
            - button "+ 1 min" [ref=e287] [cursor=pointer]
        - generic [ref=e289]:
          - generic [ref=e290]:
            - paragraph [ref=e291]: Audio & announcements check
            - paragraph [ref=e292]: "Current KOTC announcement: “5, 4, 3, 2, 1. Hand in your scores.” No other automatic round warnings."
          - button "Test Full Announcement" [ref=e293] [cursor=pointer]
        - button "START ROUND 1" [ref=e294] [cursor=pointer]
      - button "Back to Setup" [ref=e295] [cursor=pointer]
      - button "Restore Original Draw" [ref=e296] [cursor=pointer]
```

# Test source

```ts
  263 |         match.revision += 1;
  264 |         return { success: true, match, correction };
  265 |       }
  266 | 
  267 |       if (name === 'prepareKotcNextRound' || body.commandType === 'generate_next_round') {
  268 |         await sleep(500);
  269 |         const prior = currentRound();
  270 |         prior.status = 'completed';
  271 |         prior.completed_at = new Date().toISOString();
  272 |         const priorActive = new Set(currentSlots().map(slot => slot.participant_id));
  273 |         const priorBench = model.participants.filter(p => ['present', 'registered', 'confirmed', 'leaving_early'].includes(p.status) && !priorActive.has(p.id)).map(p => p.id);
  274 |         const next = makeRound(Number(prior.round_number) + 1, priorBench.slice().reverse());
  275 |         model.session.revision += 1;
  276 |         return { success: true, session: model.session, round: next, slots:model.slots.filter(s=>s.round_id===next.id), matches:model.matches.filter(m=>m.round_id===next.id), participants:model.participants, runtimeVersion:'kotc-2026-09-10-r6' };
  277 |       }
  278 | 
  279 |       if (body.commandType === 'set_participant_status') {
  280 |         await sleep(300);
  281 |         const participant = model.participants.find(p => p.id === body.participantId);
  282 |         if (body.statusAction === 'voluntary_rest') {
  283 |           participant.status = 'voluntary_rest';
  284 |           participant.availability_effective_from_round = Number(model.session.current_round_number) + 1;
  285 |           participant.available_again_from_round = Number(model.session.current_round_number) + 2;
  286 |         } else if (body.statusAction === 'back_available') {
  287 |           participant.status = 'present';
  288 |           participant.availability_effective_from_round = null;
  289 |           participant.available_again_from_round = null;
  290 |         }
  291 |         model.session.revision += 1;
  292 |         return { success: true, session: model.session, participant };
  293 |       }
  294 | 
  295 |       if (body.commandType === 'pause_session' || body.commandType === 'resume_session') {
  296 |         await sleep(200);
  297 |         model.session.status = body.commandType === 'pause_session' ? 'paused' : 'in_progress';
  298 |         model.session.revision += 1;
  299 |         return { success: true, session: model.session };
  300 |       }
  301 |       return { success: true, session: model.session };
  302 |     }
  303 | 
  304 |     if (name === 'endKotcSession') {
  305 |       await sleep(450);
  306 |       if (body.action === 'finish') model.session.status = 'completed';
  307 |       if (body.action === 'abandon') model.session.status = 'abandoned';
  308 |       model.session.actual_session_end = new Date().toISOString();
  309 |       return { success: true, session: model.session };
  310 |     }
  311 | 
  312 |     if (name === 'kotcResultsShare') return { success: true, token: 'e2e-results', sent: 18 };
  313 |     return { success: true };
  314 |   };
  315 | 
  316 |   return model;
  317 | }
  318 | 
  319 | async function installMockBackend(page, model) {
  320 |   await page.route('**/api/apps/**', async route => {
  321 |     const request = route.request();
  322 |     const url = new URL(request.url());
  323 |     const path = url.pathname;
  324 |     if (path.includes('/entities/KotcPlayerAggregate')) return json(route, []);
  325 |     const marker = `/api/apps/${APP_ID}/functions/`;
  326 |     const index = path.indexOf(marker);
  327 |     if (index >= 0) {
  328 |       const name = decodeURIComponent(path.slice(index + marker.length).split('/')[0]);
  329 |       let body = {};
  330 |       try { body = request.postDataJSON() || {}; } catch { body = {}; }
  331 |       const payload = await model.handleFunction(name, body);
  332 |       return json(route, payload);
  333 |     }
  334 |     return json(route, []);
  335 |   });
  336 | }
  337 | 
  338 | async function dismissTimerFullscreen(page) {
  339 |   // The normal host flow must never manufacture a full-screen timer state. If a prior
  340 |   // explicit test/user action left it full-screen, return it to the docked in-page state.
  341 |   const exit = page.getByTitle('Exit full screen timer');
  342 |   if (await exit.count()) await exit.first().click();
  343 |   const dock = page.getByTitle('Dock timer back in page');
  344 |   if (await dock.count()) await dock.first().click();
  345 | }
  346 | 
  347 | async function scoreCurrentRound(page, courtCount = 4, baseScore = 11) {
  348 |   const timings = [];
  349 |   for (let court = 1; court <= courtCount; court++) {
  350 |     await page.getByTestId(`kotc-score-${court}-a`).fill(String(baseScore));
  351 |     await page.getByTestId(`kotc-score-${court}-b`).fill(String(Math.max(0, baseScore - 4 - court)));
  352 |     const button = page.getByTestId(`kotc-complete-${court}`);
  353 |     const started = Date.now();
  354 |     await button.click();
  355 |     await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved', { timeout: 2000 });
  356 |     timings.push(Date.now() - started);
  357 |   }
  358 |   return timings;
  359 | }
  360 | 
  361 | function metric(report, name, value, max) {
  362 |   report[name] = value;
> 363 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
      |                                                                     ^ Error: create_ack_ms should be <= 250ms but was 1236ms
  364 | }
  365 | 
  366 | test.use({ viewport: { width: 390, height: 844 } });
  367 | 
  368 | test('18-player mobile host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  369 |   const model = createModel();
  370 |   const report = {};
  371 |   await installMockBackend(page, model);
  372 |   page.on('dialog', dialog => dialog.accept());
  373 | 
  374 |   await page.goto('/e2e/kotcHarness.html');
  375 |   await expect(page.getByTestId('kotc-setup')).toBeVisible();
  376 |   await expect(page.getByTestId('kotc-setup')).toContainText('18 players');
  377 |   await expect(page.getByTestId('kotc-setup')).toContainText('4 courts');
  378 |   await expect(page.getByTestId('kotc-setup')).toContainText('2 bench');
  379 | 
  380 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  381 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  382 |   const create = page.getByTestId('kotc-create-session');
  383 |   const createAt = Date.now();
  384 |   await create.click();
  385 |   await expect(create).toContainText('Creating Round 1…');
  386 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  387 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  388 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  389 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  390 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  391 | 
  392 |   // The host must be able to get the scoring/public links from the live Round screen
  393 |   // without navigating backwards through the app.
  394 |   await page.getByTestId('kotc-quick-links').click();
  395 |   await expect(page.getByText('Session Links & Access')).toBeVisible();
  396 |   await page.getByTestId('kotc-session-menu').click();
  397 | 
  398 |   // Mobile back/forward-cache recovery: returning to the host page must force a fresh
  399 |   // authoritative state read and leave Start Round actionable rather than stuck disabled.
  400 |   const stateReadsBeforeReturn=model.calls.filter(c=>c.name==='getKotcV2State').length;
  401 |   await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  402 |   await expect.poll(()=>model.calls.filter(c=>c.name==='getKotcV2State').length).toBeGreaterThan(stateReadsBeforeReturn);
  403 |   await expect(page.getByTestId('kotc-start-round')).toBeEnabled();
  404 | 
  405 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  406 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  407 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  408 |   await firstSlot.click();
  409 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  410 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  411 | 
  412 |   // Lock one pair and make sure the editor reflects the saved lock. The lock action must
  413 |   // also persist the current proposed-round draft, so the court/bench swap is no longer
  414 |   // stranded only in the browser until START ROUND is pressed.
  415 |   const swappedSlotId='r1-c1-A-1';
  416 |   const swappedParticipantBeforeLock=model.slots.find(s=>s.id===swappedSlotId)?.participant_id;
  417 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  418 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  419 |   const pairLockCall=[...model.calls].reverse().find(c=>c.name==='setKotcPairLock');
  420 |   expect(pairLockCall?.body?.slotParticipantIds).toBeTruthy();
  421 |   expect(model.slots.find(s=>s.id===swappedSlotId)?.participant_id).not.toBe(swappedParticipantBeforeLock);
  422 |   expect(Number(model.rounds.find(r=>r.id==='round-1')?.proposal_revision||0)).toBeGreaterThan(1);
  423 | 
  424 |   // Busy-hall setup: move an entire four-player court as one unit, save it without
  425 |   // starting the round, then reload and prove that the saved court layout survives.
  426 |   const court4Before=model.slots.filter(s=>s.round_id==='round-1'&&Number(s.ladder_court_rank)===4).sort((a,b)=>String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number)).map(s=>s.participant_id);
  427 |   const courtMove=page.getByTestId('kotc-whole-court-drag-4');
  428 |   await courtMove.focus();await courtMove.press('Space');await courtMove.press('ArrowUp');await courtMove.press('ArrowUp');await courtMove.press('Space');
  429 |   const saveRound=page.getByTestId('kotc-save-round-setup');
  430 |   await expect(saveRound).toBeEnabled();
  431 |   const saveBefore=model.calls.filter(c=>c.name==='kotcCommand'&&c.body.commandType==='adjust_proposed_round').length;
  432 |   const saveStarted=Date.now();await saveRound.click();await expect(page.getByText('Saving Round 1 setup… command sent')).toBeVisible({timeout:300});metric(report,'round_setup_save_ack_ms',Date.now()-saveStarted,300);await expect(page.getByTestId('kotc-save-round-status')).toContainText('Round setup saved',{timeout:1800});
  433 |   expect(model.calls.filter(c=>c.name==='kotcCommand'&&c.body.commandType==='adjust_proposed_round').length-saveBefore).toBe(1);
  434 |   const court2After=model.slots.filter(s=>s.round_id==='round-1'&&Number(s.ladder_court_rank)===2).sort((a,b)=>String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number)).map(s=>s.participant_id);
  435 |   expect(court2After).toEqual(court4Before);report.whole_court_drag_saved=true;
  436 |   const movedCourtName=model.participants.find(p=>p.id===court4Before[0])?.display_name;
  437 |   await page.reload();await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:1800});await expect(page.getByTestId('kotc-whole-court-2')).toContainText(movedCourtName);report.round_setup_survives_reload=true;
  438 | 
  439 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  440 |   let started = Date.now();
  441 |   const startRound = page.getByTestId('kotc-start-round');
  442 |   await startRound.click();
  443 |   await expect(startRound).toContainText('Starting…');
  444 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  445 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  446 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  447 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  448 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  449 | 
  450 |   // Timer controls: pause → reset → explicit Start Timer.
  451 |   await page.getByTestId('kotc-timer-pause').click();
  452 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  453 |   await page.getByTestId('kotc-timer-reset').click();
  454 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  455 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  456 |   await page.getByTestId('kotc-timer-start').click();
  457 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  458 |   await dismissTimerFullscreen(page);
  459 | 
  460 |   // Undo must keep accepted feedback visible for the entire backend delay.
  461 |   const undo = page.getByTestId('kotc-undo-start');
  462 |   await undo.scrollIntoViewIfNeeded();
  463 |   started = Date.now();
```