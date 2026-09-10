# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> desktop timer: full screen centres a dominant clock and exits back into the page
- Location: e2e/kotc-host-desktop.spec.mjs:554:1

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 520
Received:   900
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
        - generic [ref=e16]:
          - paragraph [ref=e17]: Play Time
          - paragraph [ref=e18]: 8 min round timer
        - generic [ref=e19]:
          - button "Test / enable speaker sound" [ref=e20] [cursor=pointer]
          - button "Float and move timer" [ref=e21] [cursor=pointer]
          - button "Full screen timer" [active] [ref=e22] [cursor=pointer]
      - generic [ref=e23]: 08:00
      - generic [ref=e26]:
        - slider [ref=e31]: "1"
        - generic [ref=e32]: 100%
      - generic [ref=e33]:
        - button "Pause Timer" [ref=e34] [cursor=pointer]
        - button "Reset" [ref=e35] [cursor=pointer]
    - paragraph [ref=e36]: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
    - button "Undo Start / Back to Round Setup" [ref=e37] [cursor=pointer]
    - generic [ref=e38]:
      - paragraph [ref=e39]: Bench This Round
      - paragraph [ref=e40]: Player 17 · Player 18
    - generic [ref=e41]:
      - generic [ref=e42]:
        - generic [ref=e43]:
          - generic [ref=e44]: Court 1
          - generic [ref=e48]: LIVE
        - generic [ref=e49]:
          - generic [ref=e50]:
            - paragraph [ref=e51]: Team A
            - paragraph [ref=e52]: Player 03 & Player 06
          - spinbutton [ref=e53]
        - generic [ref=e54]:
          - generic [ref=e55]:
            - paragraph [ref=e56]: Team B
            - paragraph [ref=e57]: Player 12 & Player 13
          - spinbutton [ref=e58]
        - button "Complete Match" [disabled]
      - generic [ref=e59]:
        - generic [ref=e60]:
          - generic [ref=e61]: Court 2
          - generic [ref=e63]: LIVE
        - generic [ref=e64]:
          - generic [ref=e65]:
            - paragraph [ref=e66]: Team A
            - paragraph [ref=e67]: Player 02 & Player 05
          - spinbutton [ref=e68]
        - generic [ref=e69]:
          - generic [ref=e70]:
            - paragraph [ref=e71]: Team B
            - paragraph [ref=e72]: Player 10 & Player 14
          - spinbutton [ref=e73]
        - button "Complete Match" [disabled]
      - generic [ref=e74]:
        - generic [ref=e75]:
          - generic [ref=e76]: Court 3
          - generic [ref=e78]: LIVE
        - generic [ref=e79]:
          - generic [ref=e80]:
            - paragraph [ref=e81]: Team A
            - paragraph [ref=e82]: Player 04 & Player 07
          - spinbutton [ref=e83]
        - generic [ref=e84]:
          - generic [ref=e85]:
            - paragraph [ref=e86]: Team B
            - paragraph [ref=e87]: Player 11 & Player 15
          - spinbutton [ref=e88]
        - button "Complete Match" [disabled]
      - generic [ref=e89]:
        - generic [ref=e90]:
          - generic [ref=e91]: Court 4
          - generic [ref=e93]: LIVE
        - generic [ref=e94]:
          - generic [ref=e95]:
            - paragraph [ref=e96]: Team A
            - paragraph [ref=e97]: Player 01 & Player 08
          - spinbutton [ref=e98]
        - generic [ref=e99]:
          - generic [ref=e100]:
            - paragraph [ref=e101]: Team B
            - paragraph [ref=e102]: Player 09 & Player 16
          - spinbutton [ref=e103]
        - button "Complete Match" [disabled]
```

# Test source

```ts
  464 | 
  465 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  466 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  467 |   await page.getByTestId('kotc-prepare-next-round').click();
  468 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3', { timeout: 2200 });
  469 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  470 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  471 | 
  472 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  473 |   await page.getByTestId('kotc-start-round').click();
  474 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  475 |   await dismissTimerFullscreen(page);
  476 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  477 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  478 |   await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });
  479 | 
  480 |   const finishButton = page.getByTestId('kotc-finish-session');
  481 |   if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  482 |   await expect(finishButton).toBeVisible();
  483 |   started = Date.now();
  484 |   await finishButton.click();
  485 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  486 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  487 |   await expect(page.getByText('Session complete')).toBeVisible();
  488 |   await expect(page.getByText('Gold')).toBeVisible();
  489 |   await expect(page.getByText('Silver')).toBeVisible();
  490 |   await expect(page.getByText('Bronze')).toBeVisible();
  491 | 
  492 |   // Post-event audit correction: reopen Round 1 / Court 1, reverse the result and
  493 |   // confirm RallyHub stores it as a correction without rewriting later court assignments.
  494 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  495 |   await page.getByRole('button',{name:'Round 1',exact:true}).click();
  496 |   const preCorrectionRound2=JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'));
  497 |   const reviewCard=page.getByTestId('kotc-score-card-1').first();
  498 |   await reviewCard.getByRole('button',{name:'Edit result'}).click();
  499 |   await reviewCard.getByTestId('kotc-score-1-a').fill('2');
  500 |   await reviewCard.getByTestId('kotc-score-1-b').fill('12');
  501 |   await reviewCard.getByRole('button',{name:'Save Correction'}).click();
  502 |   await expect(reviewCard).toContainText('Saved 2–12',{timeout:1800});
  503 |   const corrected=model.matches.find(m=>m.id==='match-r1-c1');
  504 |   expect(corrected.correction_count).toBe(1);
  505 |   expect(corrected.winner_side).toBe('B');
  506 |   expect(JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'))).toBe(preCorrectionRound2);
  507 |   report.post_event_score_correction=true;
  508 | 
  509 |   report.rounds_created = model.rounds.length;
  510 |   report.function_calls = model.calls.length;
  511 |   console.log(`KOTC DESKTOP HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  512 |   await testInfo.attach('kotc-host-desktop-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  513 | });
  514 | 
  515 | test('Base44 resilience: score committed but response fails is reconciled as Saved',async({page})=>{
  516 |   const model=createModel({commitThenFailScore:true});await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  517 |   await createAndStartRoundOne(page);
  518 |   await page.getByTestId('kotc-score-1-a').fill('11');await page.getByTestId('kotc-score-1-b').fill('7');
  519 |   await page.getByTestId('kotc-complete-1').click();
  520 |   await expect(page.getByTestId('kotc-score-card-1')).toContainText('Saved 11–7',{timeout:2200});
  521 |   await expect(page.getByTestId('kotc-score-card-1')).not.toContainText('Retry Save');
  522 |   expect(model.scoreFailureInjected).toBe(true);expect(model.matches.find(m=>m.id==='match-r1-c1').revision).toBe(1);
  523 | });
  524 | 
  525 | test('Base44 resilience: next round committed but response fails is reconciled without duplicate generation',async({page})=>{
  526 |   const model=createModel({commitThenFailPrepare:true});await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  527 |   await createAndStartRoundOne(page);await scoreCurrentRound(page,4,11);
  528 |   await page.getByTestId('kotc-prepare-next-round').click();
  529 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2',{timeout:2500});
  530 |   expect(model.prepareFailureInjected).toBe(true);expect(model.rounds.filter(r=>r.round_number===2)).toHaveLength(1);
  531 | });
  532 | 
  533 | test('Base44 resilience: genuine prepare failure stays explicit and safely retryable',async({page})=>{
  534 |   const model=createModel({failPrepareBeforeCommit:true});await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  535 |   await createAndStartRoundOne(page);await scoreCurrentRound(page,4,11);
  536 |   await page.getByTestId('kotc-prepare-next-round').click();
  537 |   await expect(page.getByTestId('kotc-prepare-status')).toContainText('Could not prepare the next round',{timeout:2200});
  538 |   expect(model.rounds.filter(r=>r.round_number===2)).toHaveLength(0);
  539 |   await expect(page.getByTestId('kotc-prepare-next-round')).toBeEnabled();
  540 | });
  541 | 
  542 | test('desktop usability: long host screens expose mouse-click up/down navigation',async({page})=>{
  543 |   const model=createModel();await installMockBackend(page,model);
  544 |   await page.goto('/e2e/kotcHarness.html');
  545 |   await expect(page.getByTestId('kotc-scroll-controls')).toBeVisible({timeout:1800});
  546 |   const before=await page.evaluate(()=>window.scrollY);
  547 |   await page.getByRole('button',{name:'Scroll down'}).click();
  548 |   await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(before+100);
  549 |   await expect(page.getByRole('button',{name:'Scroll up'})).toBeEnabled();
  550 |   await page.getByRole('button',{name:'Scroll up'}).click();
  551 |   await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeLessThan(120);
  552 | });
  553 | 
  554 | test('desktop timer: full screen centres a dominant clock and exits back into the page',async({page})=>{
  555 |   const model=createModel();await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  556 |   await createAndStartRoundOne(page);
  557 |   await page.getByTitle('Full screen timer').click();
  558 |   await expect(page.getByTitle('Exit full screen timer')).toBeVisible({timeout:1500});
  559 |   const metrics=await page.evaluate(()=>{const timer=document.querySelector('[data-testid="kotc-timer"]')?.getBoundingClientRect();const value=document.querySelector('[data-testid="kotc-timer-value"]')?.getBoundingClientRect();const style=getComputedStyle(document.querySelector('[data-testid="kotc-timer-value"]'));return{timer,value,fontSize:parseFloat(style.fontSize),w:innerWidth,h:innerHeight};});
  560 |   expect(metrics.timer.width).toBeGreaterThan(metrics.w*0.9);expect(metrics.timer.height).toBeGreaterThan(metrics.h*0.9);expect(metrics.fontSize).toBeGreaterThan(140);
  561 |   const valueCenterY=metrics.value.y+metrics.value.height/2;expect(Math.abs(valueCenterY-metrics.h/2)).toBeLessThan(metrics.h*0.22);
  562 |   await page.getByTitle('Exit full screen timer').click();
  563 |   await expect(page.getByTitle('Full screen timer')).toBeVisible({timeout:1500});
> 564 |   const docked=await page.getByTestId('kotc-timer').boundingBox();expect(docked.height).toBeLessThan(520);
      |                                                                                         ^ Error: expect(received).toBeLessThan(expected)
  565 | });
  566 | 
```