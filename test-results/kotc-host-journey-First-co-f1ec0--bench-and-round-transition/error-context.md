# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> First court to 11: whistle, partial scores, serving tie, 18-player bench and round transition
- Location: e2e/kotc-host-journey.spec.mjs:579:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-start-round')
Expected substring: "START ROUND 2"
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByTestId('kotc-start-round') with timeout 3000ms
  - waiting for getByTestId('kotc-start-round')

```

```yaml
- main:
  - paragraph: Round 1 — LIVE
  - paragraph: 4 courts · 2 bench · 4/4 scores saved
  - button "Roster":
    - img
    - text: Roster
  - button "Leaderboard":
    - img
    - text: Leaderboard
  - button "Links":
    - img
    - text: Links
  - button "Menu":
    - img
    - text: Menu
  - paragraph: What happens next
  - paragraph: Round 1 scores complete
  - paragraph: "Next: RallyHub prepares the next courts. Review/correct anything now; once ready, call the new courts and press START ROUND."
  - paragraph: First Court to 11 — All Courts Stop
  - paragraph: Whistle called · Collect scores from every court, then prepare the next round.
  - button "Change players / bench · Live round":
    - img
    - text: Change players / bench · Live round
  - paragraph: No need to restart or return to setup. Scored courts remain protected.
  - text: Undo Start unavailable. A score has already been entered or saved for this round. Correct the score if needed, or continue the round; RallyHub will not silently rewind scored play.
  - paragraph: Bench This Round
  - paragraph: Player 17 · Player 18
  - img
  - text: Court 1 SAVED
  - paragraph: Team A
  - paragraph:
    - img
    - text: Player 01 & Player 08
  - paragraph: WINNERS
  - textbox [disabled]: "11"
  - paragraph: Team B
  - paragraph: Player 09 & Player 16
  - textbox [disabled]: "7"
  - text: ✓ Saved 11–7 · Player 01 & Player 08 win 11–7
  - button "Edit result":
    - img
    - text: Edit result
  - text: Court 2 SAVED
  - paragraph: Team A
  - paragraph:
    - img
    - text: Player 02 & Player 07
  - paragraph: WINNERS
  - textbox [disabled]: "8"
  - paragraph: Team B
  - paragraph: Player 10 & Player 15
  - textbox [disabled]: "6"
  - text: ✓ Saved 8–6 · Player 02 & Player 07 win 8–6
  - button "Edit result":
    - img
    - text: Edit result
  - text: Court 3 SAVED
  - paragraph: Team A
  - paragraph: Player 03 & Player 06
  - textbox [disabled]: "5"
  - paragraph: Team B
  - paragraph:
    - img
    - text: Player 11 & Player 14
  - paragraph: WINNERS
  - textbox [disabled]: "5"
  - text: ✓ Saved 5–5 · Player 11 & Player 14 win 5–5 · serving at horn
  - button "Edit result":
    - img
    - text: Edit result
  - text: Court 4 SAVED
  - paragraph: Team A
  - paragraph:
    - img
    - text: Player 04 & Player 05
  - paragraph: WINNERS
  - textbox [disabled]: "9"
  - paragraph: Team B
  - paragraph: Player 12 & Player 13
  - textbox [disabled]: "4"
  - text: ✓ Saved 9–4 · Player 04 & Player 05 win 9–4
  - button "Edit result":
    - img
    - text: Edit result
  - paragraph: ✓ All scores saved for Round 1
  - paragraph: Review the scores above. Make any corrections before preparing the next round.
  - text: "Could not prepare the next round: Converting circular structure to JSON --> starting at object with constructor 'HTMLButtonElement' | property '__reactFiber$pghwgrmt6zg' -> object with constructor 'FiberNode' --- property 'stateNode' closes the circle"
  - button "Prepare Next Round":
    - img
    - text: Prepare Next Round
  - button "Finish Session":
    - img
    - text: Finish Session
  - paragraph: Player Device Verification
  - paragraph: Only check pending device requests when needed. Reduces background database traffic.
  - button "Check requests"
```

# Test source

```ts
  509 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2', { timeout: 2200 });
  510 |   metric(report, 'round1_review_to_round2_editor_ms', Date.now() - started, 2200);
  511 |   expect(model.rounds.find(r => r.round_number === 1)?.status).toBe('completed');
  512 | 
  513 |   // Round 2: start, then use the real Session Menu to sit one player out for the next round.
  514 |   await page.getByTestId('kotc-start-round').click();
  515 |   await expect(page.getByText('Round 2 — LIVE')).toBeVisible({ timeout: 1800 });
  516 |   await dismissTimerFullscreen(page);
  517 |   await page.getByTestId('kotc-session-menu').click();
  518 |   await page.getByTestId('kotc-players-menu').click();
  519 |   await expect(page.getByTestId('kotc-add-player-visible')).toBeVisible();
  520 |   await page.getByTestId('kotc-add-player-visible').click();
  521 |   await expect(page.getByTestId('kotc-add-player-panel')).toBeVisible();
  522 |   await page.getByTestId('kotc-add-player-visible').click();
  523 |   await page.getByTestId('kotc-player-participant-03').click();
  524 |   await page.getByTestId('kotc-player-sit-out').click();
  525 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('Bench · this round', { timeout: 1500 });
  526 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  527 | 
  528 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  529 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  530 |   await page.getByTestId('kotc-prepare-next-round').click();
  531 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3', { timeout: 2200 });
  532 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  533 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  534 | 
  535 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  536 |   await page.getByTestId('kotc-start-round').click();
  537 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  538 |   await dismissTimerFullscreen(page);
  539 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  540 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  541 |   await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });
  542 | 
  543 |   const finishButton = page.getByTestId('kotc-finish-session');
  544 |   if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  545 |   await expect(finishButton).toBeVisible();
  546 |   started = Date.now();
  547 |   await finishButton.click();
  548 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  549 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  550 |   await expect(page.getByText('Session complete')).toBeVisible();
  551 |   await expect(page.getByText('Gold')).toBeVisible();
  552 |   await expect(page.getByText('Silver')).toBeVisible();
  553 |   await expect(page.getByText('Bronze')).toBeVisible();
  554 | 
  555 |   // Post-event audit correction: reopen Round 1 / Court 1, reverse the result and
  556 |   // confirm RallyHub stores it as a correction without rewriting later court assignments.
  557 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  558 |   await page.getByRole('button',{name:'Round 1',exact:true}).click();
  559 |   const preCorrectionRound2=JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'));
  560 |   const reviewCard=page.getByTestId('kotc-score-card-1').first();
  561 |   await reviewCard.getByRole('button',{name:'Edit result'}).click();
  562 |   await reviewCard.getByTestId('kotc-score-1-a').fill('2');
  563 |   await reviewCard.getByTestId('kotc-score-1-b').fill('12');
  564 |   await reviewCard.getByRole('button',{name:'Save Correction'}).click();
  565 |   await expect(reviewCard).toContainText('Saved 2–12',{timeout:1800});
  566 |   const corrected=model.matches.find(m=>m.id==='match-r1-c1');
  567 |   expect(corrected.correction_count).toBe(1);
  568 |   expect(corrected.winner_side).toBe('B');
  569 |   expect(JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'))).toBe(preCorrectionRound2);
  570 |   report.post_event_score_correction=true;
  571 | 
  572 |   report.rounds_created = model.rounds.length;
  573 |   report.function_calls = model.calls.length;
  574 |   console.log(`KOTC HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  575 |   await testInfo.attach('kotc-host-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  576 | });
  577 | 
  578 | 
  579 | test('First court to 11: whistle, partial scores, serving tie, 18-player bench and round transition',async({page})=>{
  580 |  const model=createModel();await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  581 |  await page.goto('/e2e/kotcHarness.html');
  582 |  await expect(page.getByTestId('kotc-setup')).toBeVisible();
  583 |  await page.getByRole('combobox').first().click();
  584 |  await page.getByRole('option',{name:/First court to 11/}).click();
  585 |  await page.getByRole('button',{name:'Player 17',exact:true}).click();
  586 |  await page.getByRole('button',{name:'Player 18',exact:true}).click();
  587 |  await page.getByTestId('kotc-create-session').click();
  588 |  await expect(page.getByTestId('kotc-round-editor')).toBeVisible();
  589 |  expect(model.session.scoring_mode).toBe('first_court_to_target');
  590 |  expect(model.session.score_target).toBe(11);
  591 |  await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  592 |  await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  593 |  await page.getByTestId('kotc-start-round').click();
  594 |  await expect(page.getByText('Round 1 — LIVE')).toBeVisible();
  595 |  const scores=[[11,7],[8,6],[5,5],[9,4]];
  596 |  for(let c=1;c<=4;c++){
  597 |   await page.getByTestId(`kotc-score-${c}-a`).fill(String(scores[c-1][0]));
  598 |   await page.getByTestId(`kotc-score-${c}-b`).fill(String(scores[c-1][1]));
  599 |   if(c===3){await page.getByTestId('kotc-serving-3-b').click();}
  600 |   await page.getByTestId(`kotc-complete-${c}`).click();
  601 |   await expect(page.getByTestId(`kotc-score-card-${c}`)).toContainText('Saved');
  602 |  }
  603 |  expect(model.matches.find(m=>m.ladder_court_rank===3).winner_side).toBe('B');
  604 |  await expect(page.getByRole('button',{name:'End Round — First Court Reached 11'})).toBeVisible();
  605 |  await page.getByRole('button',{name:'End Round — First Court Reached 11'}).click();
  606 |  await expect(page.getByText(/Whistle called · Collect scores/)).toBeVisible();
  607 |  expect(JSON.parse(model.session.timer_state_json).firstCourtCalledRoundId).toBe('round-1');
  608 |  await page.getByTestId('kotc-prepare-next-round').click();
> 609 |  await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2');
      |                                                     ^ Error: expect(locator).toContainText(expected) failed
  610 |  expect(model.rounds.find(r=>r.round_number===1).status).toBe('completed');
  611 |  expect(model.rounds.find(r=>r.round_number===2).bench_count).toBe(2);
  612 |  expect(model.matches.filter(m=>m.round_number===1).map(m=>m.winner_side)).toEqual(['A','A','B','A']);
  613 | });
  614 | 
```