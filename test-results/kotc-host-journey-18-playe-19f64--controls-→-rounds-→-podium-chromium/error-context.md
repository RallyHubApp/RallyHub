# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:354:1

# Error details

```
Error: start_ack_ms should be <= 250ms but was 258ms

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 250
Received:    258
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
      - paragraph [ref=e14]: Starting Round 1… command sent
      - paragraph [ref=e15]: RallyHub has accepted your tap. Keep this screen open; the button will stay locked until the action resolves.
    - generic [ref=e16]:
      - paragraph [ref=e17]: What happens next
      - paragraph [ref=e18]: Round 1 ready
      - paragraph [ref=e19]: "Next: check the 4 court assignments and bench, then Start Round 1."
    - generic [ref=e20]:
      - generic [ref=e21]:
        - paragraph [ref=e22]: Bench This Round
        - generic [ref=e23]:
          - button "Player 02" [ref=e24] [cursor=pointer]
          - button "Player 18" [ref=e25] [cursor=pointer]
        - paragraph [ref=e26]: Tap a court player, then a bench player, to swap them.
      - generic [ref=e27]:
        - generic [ref=e28]:
          - heading "Host Round Editor" [level=4] [ref=e29]
          - paragraph [ref=e30]: Tap one player then another to swap. Only one pending selection is allowed.
        - generic [ref=e31]:
          - generic [ref=e32]:
            - generic [ref=e33]: Court 1
            - generic [ref=e37]:
              - generic [ref=e38]:
                - paragraph [ref=e39]: Team A
                - button "Locked ✓ · Unlock" [disabled]
              - generic [ref=e40]:
                - button "Player 17" [ref=e41] [cursor=pointer]
                - button "Player 05" [ref=e50] [cursor=pointer]
            - generic [ref=e59]:
              - generic [ref=e60]:
                - paragraph [ref=e61]: Team B
                - button "Lock pair" [disabled]
              - generic [ref=e62]:
                - button "Player 09" [ref=e63] [cursor=pointer]
                - button "Player 15" [ref=e72] [cursor=pointer]
          - generic [ref=e81]:
            - generic [ref=e82]: Court 2
            - generic [ref=e84]:
              - generic [ref=e85]:
                - paragraph [ref=e86]: Team A
                - button "Lock pair" [disabled]
              - generic [ref=e87]:
                - button "Player 04" [ref=e88] [cursor=pointer]
                - button "Player 07" [ref=e97] [cursor=pointer]
            - generic [ref=e106]:
              - generic [ref=e107]:
                - paragraph [ref=e108]: Team B
                - button "Lock pair" [disabled]
              - generic [ref=e109]:
                - button "Player 12" [ref=e110] [cursor=pointer]
                - button "Player 14" [ref=e119] [cursor=pointer]
          - generic [ref=e128]:
            - generic [ref=e129]: Court 3
            - generic [ref=e131]:
              - generic [ref=e132]:
                - paragraph [ref=e133]: Team A
                - button "Lock pair" [disabled]
              - generic [ref=e134]:
                - button "Player 01" [ref=e135] [cursor=pointer]
                - button "Player 08" [ref=e144] [cursor=pointer]
            - generic [ref=e153]:
              - generic [ref=e154]:
                - paragraph [ref=e155]: Team B
                - button "Lock pair" [disabled]
              - generic [ref=e156]:
                - button "Player 10" [ref=e157] [cursor=pointer]
                - button "Player 13" [ref=e166] [cursor=pointer]
          - generic [ref=e175]:
            - generic [ref=e176]: Court 4
            - generic [ref=e178]:
              - generic [ref=e179]:
                - paragraph [ref=e180]: Team A
                - button "Lock pair" [disabled]
              - generic [ref=e181]:
                - button "Player 03" [ref=e182] [cursor=pointer]
                - button "Player 06" [ref=e191] [cursor=pointer]
            - generic [ref=e200]:
              - generic [ref=e201]:
                - paragraph [ref=e202]: Team B
                - button "Lock pair" [disabled]
              - generic [ref=e203]:
                - button "Player 11" [ref=e204] [cursor=pointer]
                - button "Player 16" [ref=e213] [cursor=pointer]
      - generic [ref=e222]:
        - generic [ref=e223]:
          - paragraph [ref=e224]: Pre-Round Check
          - paragraph [ref=e225]: Confirm the round time and hall sound before players begin.
        - generic [ref=e226]:
          - generic [ref=e227]:
            - generic [ref=e232]:
              - paragraph [ref=e233]: Round timer
              - paragraph [ref=e234]: Adjust now if tonight needs a shorter or longer round.
            - generic [ref=e235]: 08:00
          - generic [ref=e236]:
            - button "− 1 min" [disabled]
            - button "+ 1 min" [disabled]
        - generic [ref=e238]:
          - generic [ref=e239]:
            - paragraph [ref=e240]: Hall sound check
            - paragraph [ref=e241]: Test the real cue and spoken voice before play. This uses your device/speaker only — no Base44 call.
          - button "Test Sound" [ref=e242] [cursor=pointer]
        - button "Starting…" [disabled]
      - button "Back to Setup" [disabled]
      - button "Restore Original Draw" [disabled]
```

# Test source

```ts
  249 |         match.revision += 1;
  250 |         return { success: true, match, correction };
  251 |       }
  252 | 
  253 |       if (name === 'prepareKotcNextRound' || body.commandType === 'generate_next_round') {
  254 |         await sleep(500);
  255 |         const prior = currentRound();
  256 |         prior.status = 'completed';
  257 |         prior.completed_at = new Date().toISOString();
  258 |         const priorActive = new Set(currentSlots().map(slot => slot.participant_id));
  259 |         const priorBench = model.participants.filter(p => ['present', 'registered', 'confirmed', 'leaving_early'].includes(p.status) && !priorActive.has(p.id)).map(p => p.id);
  260 |         const next = makeRound(Number(prior.round_number) + 1, priorBench.slice().reverse());
  261 |         model.session.revision += 1;
  262 |         return { success: true, session: model.session, round: next, slots:model.slots.filter(s=>s.round_id===next.id), matches:model.matches.filter(m=>m.round_id===next.id), participants:model.participants, runtimeVersion:'kotc-2026-09-10-r6' };
  263 |       }
  264 | 
  265 |       if (body.commandType === 'set_participant_status') {
  266 |         await sleep(300);
  267 |         const participant = model.participants.find(p => p.id === body.participantId);
  268 |         if (body.statusAction === 'voluntary_rest') {
  269 |           participant.status = 'voluntary_rest';
  270 |           participant.availability_effective_from_round = Number(model.session.current_round_number) + 1;
  271 |           participant.available_again_from_round = Number(model.session.current_round_number) + 2;
  272 |         } else if (body.statusAction === 'back_available') {
  273 |           participant.status = 'present';
  274 |           participant.availability_effective_from_round = null;
  275 |           participant.available_again_from_round = null;
  276 |         }
  277 |         model.session.revision += 1;
  278 |         return { success: true, session: model.session, participant };
  279 |       }
  280 | 
  281 |       if (body.commandType === 'pause_session' || body.commandType === 'resume_session') {
  282 |         await sleep(200);
  283 |         model.session.status = body.commandType === 'pause_session' ? 'paused' : 'in_progress';
  284 |         model.session.revision += 1;
  285 |         return { success: true, session: model.session };
  286 |       }
  287 |       return { success: true, session: model.session };
  288 |     }
  289 | 
  290 |     if (name === 'endKotcSession') {
  291 |       await sleep(450);
  292 |       if (body.action === 'finish') model.session.status = 'completed';
  293 |       if (body.action === 'abandon') model.session.status = 'abandoned';
  294 |       model.session.actual_session_end = new Date().toISOString();
  295 |       return { success: true, session: model.session };
  296 |     }
  297 | 
  298 |     if (name === 'kotcResultsShare') return { success: true, token: 'e2e-results', sent: 18 };
  299 |     return { success: true };
  300 |   };
  301 | 
  302 |   return model;
  303 | }
  304 | 
  305 | async function installMockBackend(page, model) {
  306 |   await page.route('**/api/apps/**', async route => {
  307 |     const request = route.request();
  308 |     const url = new URL(request.url());
  309 |     const path = url.pathname;
  310 |     if (path.includes('/entities/KotcPlayerAggregate')) return json(route, []);
  311 |     const marker = `/api/apps/${APP_ID}/functions/`;
  312 |     const index = path.indexOf(marker);
  313 |     if (index >= 0) {
  314 |       const name = decodeURIComponent(path.slice(index + marker.length).split('/')[0]);
  315 |       let body = {};
  316 |       try { body = request.postDataJSON() || {}; } catch { body = {}; }
  317 |       const payload = await model.handleFunction(name, body);
  318 |       return json(route, payload);
  319 |     }
  320 |     return json(route, []);
  321 |   });
  322 | }
  323 | 
  324 | async function dismissTimerFullscreen(page) {
  325 |   // The normal host flow must never manufacture a full-screen timer state. If a prior
  326 |   // explicit test/user action left it full-screen, return it to the docked in-page state.
  327 |   const exit = page.getByTitle('Exit full screen timer');
  328 |   if (await exit.count()) await exit.first().click();
  329 |   const dock = page.getByTitle('Dock timer back in page');
  330 |   if (await dock.count()) await dock.first().click();
  331 | }
  332 | 
  333 | async function scoreCurrentRound(page, courtCount = 4, baseScore = 11) {
  334 |   const timings = [];
  335 |   for (let court = 1; court <= courtCount; court++) {
  336 |     await page.getByTestId(`kotc-score-${court}-a`).fill(String(baseScore));
  337 |     await page.getByTestId(`kotc-score-${court}-b`).fill(String(Math.max(0, baseScore - 4 - court)));
  338 |     const button = page.getByTestId(`kotc-complete-${court}`);
  339 |     const started = Date.now();
  340 |     await button.click();
  341 |     await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved', { timeout: 2000 });
  342 |     timings.push(Date.now() - started);
  343 |   }
  344 |   return timings;
  345 | }
  346 | 
  347 | function metric(report, name, value, max) {
  348 |   report[name] = value;
> 349 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
      |                                                                     ^ Error: start_ack_ms should be <= 250ms but was 258ms
  350 | }
  351 | 
  352 | test.use({ viewport: { width: 390, height: 844 } });
  353 | 
  354 | test('18-player mobile host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  355 |   const model = createModel();
  356 |   const report = {};
  357 |   await installMockBackend(page, model);
  358 |   page.on('dialog', dialog => dialog.accept());
  359 | 
  360 |   await page.goto('/e2e/kotcHarness.html');
  361 |   await expect(page.getByTestId('kotc-setup')).toBeVisible();
  362 |   await expect(page.getByTestId('kotc-setup')).toContainText('18 players');
  363 |   await expect(page.getByTestId('kotc-setup')).toContainText('4 courts');
  364 |   await expect(page.getByTestId('kotc-setup')).toContainText('2 bench');
  365 | 
  366 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  367 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  368 |   const create = page.getByTestId('kotc-create-session');
  369 |   const createAt = Date.now();
  370 |   await create.click();
  371 |   await expect(create).toContainText('Creating Round 1…');
  372 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  373 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  374 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  375 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  376 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  377 | 
  378 |   // The host must be able to get the scoring/public links from the live Round screen
  379 |   // without navigating backwards through the app.
  380 |   await page.getByTestId('kotc-quick-links').click();
  381 |   await expect(page.getByText('Session Links & Access')).toBeVisible();
  382 |   await page.getByTestId('kotc-session-menu').click();
  383 | 
  384 |   // Mobile back/forward-cache recovery: returning to the host page must force a fresh
  385 |   // authoritative state read and leave Start Round actionable rather than stuck disabled.
  386 |   const stateReadsBeforeReturn=model.calls.filter(c=>c.name==='getKotcV2State').length;
  387 |   await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  388 |   await expect.poll(()=>model.calls.filter(c=>c.name==='getKotcV2State').length).toBeGreaterThan(stateReadsBeforeReturn);
  389 |   await expect(page.getByTestId('kotc-start-round')).toBeEnabled();
  390 | 
  391 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  392 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  393 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  394 |   await firstSlot.click();
  395 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  396 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  397 | 
  398 |   // Lock one pair and make sure the editor reflects the saved lock. The lock action must
  399 |   // also persist the current proposed-round draft, so the court/bench swap is no longer
  400 |   // stranded only in the browser until START ROUND is pressed.
  401 |   const swappedSlotId='r1-c1-A-1';
  402 |   const swappedParticipantBeforeLock=model.slots.find(s=>s.id===swappedSlotId)?.participant_id;
  403 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  404 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  405 |   const pairLockCall=[...model.calls].reverse().find(c=>c.name==='setKotcPairLock');
  406 |   expect(pairLockCall?.body?.slotParticipantIds).toBeTruthy();
  407 |   expect(model.slots.find(s=>s.id===swappedSlotId)?.participant_id).not.toBe(swappedParticipantBeforeLock);
  408 |   expect(Number(model.rounds.find(r=>r.id==='round-1')?.proposal_revision||0)).toBeGreaterThan(1);
  409 | 
  410 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  411 |   let started = Date.now();
  412 |   const startRound = page.getByTestId('kotc-start-round');
  413 |   await startRound.click();
  414 |   await expect(startRound).toContainText('Starting…');
  415 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  416 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  417 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  418 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  419 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  420 | 
  421 |   // Timer controls: pause → reset → explicit Start Timer.
  422 |   await page.getByTestId('kotc-timer-pause').click();
  423 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  424 |   await page.getByTestId('kotc-timer-reset').click();
  425 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  426 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  427 |   await page.getByTestId('kotc-timer-start').click();
  428 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  429 |   await dismissTimerFullscreen(page);
  430 | 
  431 |   // Undo must keep accepted feedback visible for the entire backend delay.
  432 |   const undo = page.getByTestId('kotc-undo-start');
  433 |   await undo.scrollIntoViewIfNeeded();
  434 |   started = Date.now();
  435 |   await undo.evaluate(element => element.click());
  436 |   await expect(undo).toContainText('Returning to Round Setup…');
  437 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  438 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  439 |   await sleep(350);
  440 |   await expect(undo).toContainText('Returning to Round Setup…');
  441 |   await expect(undo).toBeDisabled();
  442 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  443 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  444 |   expect(model.timer?.running).toBe(false);
  445 |   expect(model.timer?.remainingSeconds).toBe(480);
  446 | 
  447 |   // Start again and complete Round 1.
  448 |   started = Date.now();
  449 |   await page.getByTestId('kotc-start-round').click();
```