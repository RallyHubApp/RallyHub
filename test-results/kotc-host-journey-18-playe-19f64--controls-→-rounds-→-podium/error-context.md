# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> 18-player mobile host journey: setup → controls → rounds → podium
- Location: e2e/kotc-host-journey.spec.mjs:327:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByTestId('kotc-session-menu')
    - locator resolved to <button data-dynamic-content="true" data-testid="kotc-session-menu" data-source-location="src/components/kotc/KotcV2SessionView.jsx:137:351" class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-fore…>…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <li class="" tabindex="0" data-index="0" data-front="true" data-styled="true" data-mounted="true" data-swiped="false" data-visible="true" data-type="success" data-sonner-toast="" data-promise="false" data-removed="false" data-swiping="false" data-y-position="top" data-expanded="false" data-swipe-out="false" data-rich-colors="true" data-dismissible="true" data-x-position="center">…</li> from <section tabindex="-1" aria-live="polite" aria-atomic="false" aria-relevant="additions text" aria-label="Notifications alt+T">…</section> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <li class="" tabindex="0" data-index="0" data-front="true" data-styled="true" data-mounted="true" data-swiped="false" data-visible="true" data-type="success" data-sonner-toast="" data-promise="false" data-removed="false" data-swiping="false" data-y-position="top" data-expanded="false" data-swipe-out="false" data-rich-colors="true" data-dismissible="true" data-x-position="center">…</li> from <section tabindex="-1" aria-live="polite" aria-atomic="false" aria-relevant="additions text" aria-label="Notifications alt+T">…</section> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    4 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <li class="" tabindex="0" data-index="0" data-front="true" data-styled="true" data-mounted="true" data-swiped="false" data-visible="true" data-type="success" data-sonner-toast="" data-promise="false" data-removed="false" data-swiping="false" data-y-position="top" data-expanded="false" data-swipe-out="false" data-rich-colors="true" data-dismissible="true" data-x-position="center">…</li> from <section tabindex="-1" aria-live="polite" aria-atomic="false" aria-relevant="additions text" aria-label="Notifications alt+T">…</section> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
    69 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <li class="" tabindex="0" data-index="0" data-front="true" data-styled="true" data-mounted="true" data-swiped="false" data-visible="true" data-type="success" data-sonner-toast="" data-promise="false" data-removed="false" data-swiping="false" data-expanded="true" data-y-position="top" data-swipe-out="false" data-rich-colors="true" data-dismissible="true" data-x-position="center">…</li> from <section tabindex="-1" aria-live="polite" aria-atomic="false" aria-relevant="additions text" aria-label="Notifications alt+T">…</section> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - paragraph [ref=e7]: Round 2 — LIVE
          - paragraph [ref=e8]: 4 courts · 2 bench
        - button "Session Menu" [ref=e9] [cursor=pointer]
      - generic [ref=e10]:
        - generic [ref=e11]:
          - paragraph [ref=e13]: Play Time
          - generic [ref=e14]:
            - button "Test / enable speaker sound" [ref=e20] [cursor=pointer]
            - button "Dock timer back in page" [active] [ref=e21] [cursor=pointer]
            - button "Full screen timer" [ref=e22] [cursor=pointer]
        - generic [ref=e23]: 07:22
        - generic [ref=e26]:
          - button "Pause Timer" [ref=e27] [cursor=pointer]
          - button "Reset" [ref=e28] [cursor=pointer]
      - paragraph [ref=e29]: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
      - button "Undo Start / Back to Round Setup" [ref=e30] [cursor=pointer]
      - generic [ref=e31]:
        - paragraph [ref=e32]: Bench This Round
        - paragraph [ref=e33]: Player 02 · Player 18
      - generic [ref=e34]:
        - generic [ref=e35]:
          - generic [ref=e36]:
            - generic [ref=e37]: Court 1
            - generic [ref=e41]: LIVE
          - generic [ref=e42]:
            - generic [ref=e43]:
              - paragraph [ref=e44]: Team A
              - paragraph [ref=e45]: Player 17 & Player 05
            - spinbutton [ref=e46]
          - generic [ref=e47]:
            - generic [ref=e48]:
              - paragraph [ref=e49]: Team B
              - paragraph [ref=e50]: Player 12 & Player 13
            - spinbutton [ref=e51]
          - button "Complete Match" [disabled]
        - generic [ref=e52]:
          - generic [ref=e53]:
            - generic [ref=e54]: Court 2
            - generic [ref=e56]: LIVE
          - generic [ref=e57]:
            - generic [ref=e58]:
              - paragraph [ref=e59]: Team A
              - paragraph [ref=e60]: Player 04 & Player 08
            - spinbutton [ref=e61]
          - generic [ref=e62]:
            - generic [ref=e63]:
              - paragraph [ref=e64]: Team B
              - paragraph [ref=e65]: Player 09 & Player 15
            - spinbutton [ref=e66]
          - button "Complete Match" [disabled]
        - generic [ref=e67]:
          - generic [ref=e68]:
            - generic [ref=e69]: Court 3
            - generic [ref=e71]: LIVE
          - generic [ref=e72]:
            - generic [ref=e73]:
              - paragraph [ref=e74]: Team A
              - paragraph [ref=e75]: Player 03 & Player 07
            - spinbutton [ref=e76]
          - generic [ref=e77]:
            - generic [ref=e78]:
              - paragraph [ref=e79]: Team B
              - paragraph [ref=e80]: Player 10 & Player 14
            - spinbutton [ref=e81]
          - button "Complete Match" [disabled]
        - generic [ref=e82]:
          - generic [ref=e83]:
            - generic [ref=e84]: Court 4
            - generic [ref=e86]: LIVE
          - generic [ref=e87]:
            - generic [ref=e88]:
              - paragraph [ref=e89]: Team A
              - paragraph [ref=e90]: Player 01 & Player 06
            - spinbutton [ref=e91]
          - generic [ref=e92]:
            - generic [ref=e93]:
              - paragraph [ref=e94]: Team B
              - paragraph [ref=e95]: Player 11 & Player 16
            - spinbutton [ref=e96]
          - button "Complete Match" [disabled]
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e97]:
        - generic [ref=e101]: Round 2 started
      - listitem [ref=e103]:
        - generic [ref=e107]: Result saved
```

# Test source

```ts
  314 |     await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved', { timeout: 2000 });
  315 |     timings.push(Date.now() - started);
  316 |   }
  317 |   return timings;
  318 | }
  319 | 
  320 | function metric(report, name, value, max) {
  321 |   report[name] = value;
  322 |   expect(value, `${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);
  323 | }
  324 | 
  325 | test.use({ viewport: { width: 390, height: 844 } });
  326 | 
  327 | test('18-player mobile host journey: setup → controls → rounds → podium', async ({ page }, testInfo) => {
  328 |   const model = createModel();
  329 |   const report = {};
  330 |   await installMockBackend(page, model);
  331 |   page.on('dialog', dialog => dialog.accept());
  332 | 
  333 |   await page.goto('/e2e/kotcHarness.html');
  334 |   await expect(page.getByText('18 players · 4 active courts · 2 bench')).toBeVisible();
  335 | 
  336 |   await page.getByRole('button', { name: 'Player 17', exact: true }).click();
  337 |   await page.getByRole('button', { name: 'Player 18', exact: true }).click();
  338 |   const create = page.getByTestId('kotc-create-session');
  339 |   const createAt = Date.now();
  340 |   await create.click();
  341 |   await expect(create).toContainText('Creating…');
  342 |   metric(report, 'create_ack_ms', Date.now() - createAt, 250);
  343 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 2000 });
  344 |   metric(report, 'create_to_editor_ms', Date.now() - createAt, 1500);
  345 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  346 |   await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  347 | 
  348 |   // Real host adjustment: swap a court player with a bench player before Round 1.
  349 |   const firstSlot = page.getByTestId('kotc-slot-r1-c1-A-1');
  350 |   const outgoingPlayer = (await firstSlot.innerText()).trim();
  351 |   await firstSlot.click();
  352 |   await page.getByTestId('kotc-bench-player-participant-17').click();
  353 |   await expect(page.getByTestId('kotc-bench')).toContainText(outgoingPlayer);
  354 | 
  355 |   // Lock one pair and make sure the editor reflects the saved lock.
  356 |   await page.getByRole('button', { name: 'Lock pair' }).first().click();
  357 |   await expect(page.getByRole('button', { name: 'Unlock' }).first()).toBeVisible({ timeout: 1500 });
  358 | 
  359 |   // START ROUND must acknowledge instantly and transition to LIVE promptly.
  360 |   let started = Date.now();
  361 |   const startRound = page.getByTestId('kotc-start-round');
  362 |   await startRound.click();
  363 |   await expect(startRound).toContainText('Starting…');
  364 |   metric(report, 'start_ack_ms', Date.now() - started, 250);
  365 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 2000 });
  366 |   metric(report, 'start_to_live_ms', Date.now() - started, 1500);
  367 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible({ timeout: 1000 });
  368 |   metric(report, 'start_to_timer_running_ms', Date.now() - started, 1700);
  369 | 
  370 |   // Timer controls: pause → reset → explicit Start Timer.
  371 |   await page.getByTestId('kotc-timer-pause').click();
  372 |   await expect(page.getByTestId('kotc-timer-start')).toContainText(/Resume Timer|Start Timer/);
  373 |   await page.getByTestId('kotc-timer-reset').click();
  374 |   await expect(page.getByTestId('kotc-timer-value')).toHaveText('08:00');
  375 |   await expect(page.getByTestId('kotc-timer-start')).toContainText('Start Timer');
  376 |   await page.getByTestId('kotc-timer-start').click();
  377 |   await expect(page.getByTestId('kotc-timer-pause')).toBeVisible();
  378 |   await dismissTimerFullscreen(page);
  379 | 
  380 |   // Undo must keep accepted feedback visible for the entire backend delay.
  381 |   const undo = page.getByTestId('kotc-undo-start');
  382 |   await undo.scrollIntoViewIfNeeded();
  383 |   started = Date.now();
  384 |   await undo.evaluate(element => element.click());
  385 |   await expect(undo).toContainText('Returning to Round Setup…');
  386 |   await expect(undo).toHaveAttribute('aria-busy', 'true');
  387 |   metric(report, 'undo_ack_ms', Date.now() - started, 250);
  388 |   await sleep(350);
  389 |   await expect(undo).toContainText('Returning to Round Setup…');
  390 |   await expect(undo).toBeDisabled();
  391 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({ timeout: 1600 });
  392 |   metric(report, 'undo_to_editor_ms', Date.now() - started, 1500);
  393 |   expect(model.timer?.running).toBe(false);
  394 |   expect(model.timer?.remainingSeconds).toBe(480);
  395 | 
  396 |   // Start again and complete Round 1.
  397 |   started = Date.now();
  398 |   await page.getByTestId('kotc-start-round').click();
  399 |   await expect(page.getByText('Round 1 — LIVE')).toBeVisible({ timeout: 1800 });
  400 |   metric(report, 'restart_to_live_ms', Date.now() - started, 1500);
  401 |   await dismissTimerFullscreen(page);
  402 |   report.round1_score_save_ms = await scoreCurrentRound(page, 4, 11);
  403 |   for (const ms of report.round1_score_save_ms) expect(ms).toBeLessThanOrEqual(1200);
  404 | 
  405 |   started = Date.now();
  406 |   await expect(page.getByText('START ROUND 2')).toBeVisible({ timeout: 2200 });
  407 |   metric(report, 'round1_to_round2_editor_ms', Date.now() - started, 2200);
  408 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  409 | 
  410 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  411 |   await page.getByTestId('kotc-start-round').click();
  412 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  413 |   await dismissTimerFullscreen(page);
> 414 |   await page.getByTestId('kotc-session-menu').click();
      |                                               ^ Error: locator.click: Test timeout of 45000ms exceeded.
  415 |   await page.getByTestId('kotc-players-menu').click();
  416 |   await page.getByTestId('kotc-player-participant-03').click();
  417 |   await page.getByTestId('kotc-player-sit-out').click();
  418 |   await expect(page.getByText('Player 03 updated')).toBeVisible({ timeout: 1200 });
  419 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  420 | 
  421 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  422 |   await expect(page.getByText('START ROUND 3')).toBeVisible({ timeout: 2200 });
  423 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  424 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  425 | 
  426 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  427 |   await page.getByTestId('kotc-start-round').click();
  428 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  429 |   await dismissTimerFullscreen(page);
  430 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  431 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  432 |   await expect(page.getByText('START ROUND 4')).toBeVisible({ timeout: 2200 });
  433 | 
  434 |   await page.getByTestId('kotc-session-menu').click();
  435 |   started = Date.now();
  436 |   await page.getByTestId('kotc-finish-session').click();
  437 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  438 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  439 |   await expect(page.getByText('Session complete')).toBeVisible();
  440 |   await expect(page.getByText('Gold')).toBeVisible();
  441 |   await expect(page.getByText('Silver')).toBeVisible();
  442 |   await expect(page.getByText('Bronze')).toBeVisible();
  443 | 
  444 |   report.rounds_created = model.rounds.length;
  445 |   report.function_calls = model.calls.length;
  446 |   console.log(`KOTC HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  447 |   await testInfo.attach('kotc-host-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  448 | });
  449 | 
```