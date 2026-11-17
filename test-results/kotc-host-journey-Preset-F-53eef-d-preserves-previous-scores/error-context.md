# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> Preset Finish: host saves two timed layouts, activates preset and preserves previous scores
- Location: e2e/kotc-host-journey.spec.mjs:631:1

# Error details

```
ReferenceError: Cannot access 'next' before initialization
```

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-start-round')
Expected substring: "START ROUND 2"
Error: element(s) not found

Call log:
  - Expect "toContainText" getByTestId('kotc-start-round') with timeout 5000ms
  - waiting for getByTestId('kotc-start-round')
  - Test ended.

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
  - paragraph: Preparing Round 2… command sent
  - paragraph: RallyHub has accepted your tap. Keep this screen open; the button will stay locked until the action resolves.
  - paragraph: What happens next
  - paragraph: Round 1 scores complete
  - paragraph: "Next: RallyHub prepares the next courts. Review/correct anything now; once ready, call the new courts and press START ROUND."
  - paragraph: Preset Finish · Optional
  - paragraph: Save up to two timed court layouts. Normal King of the Court continues unless you activate one.
  - button "Close"
  - button "One preset"
  - button "Two presets"
  - strong: Preset 1
  - text: Minutes
  - spinbutton "Preset 1 minutes": "10"
  - paragraph: Court 1
  - paragraph: Team A
  - button "Player 01"
  - button "Player 08"
  - paragraph: Team B
  - button "Player 09"
  - button "Player 16"
  - paragraph: Court 2
  - paragraph: Team A
  - button "Player 02"
  - button "Player 07"
  - paragraph: Team B
  - button "Player 10"
  - button "Player 15"
  - paragraph: Court 3
  - paragraph: Team A
  - button "Player 03"
  - button "Player 06"
  - paragraph: Team B
  - button "Player 11"
  - button "Player 14"
  - paragraph: Court 4
  - paragraph: Team A
  - button "Player 04"
  - button "Player 05"
  - paragraph: Team B
  - button "Player 12"
  - button "Player 13"
  - paragraph: Bench · 2 players
  - button "Player 17"
  - button "Player 18"
  - strong: Preset 2
  - text: Minutes
  - spinbutton "Preset 2 minutes": "12"
  - paragraph: Court 1
  - paragraph: Team A
  - button "Player 09"
  - button "Player 16"
  - paragraph: Team B
  - button "Player 02"
  - button "Player 07"
  - paragraph: Court 2
  - paragraph: Team A
  - button "Player 10"
  - button "Player 15"
  - paragraph: Team B
  - button "Player 03"
  - button "Player 06"
  - paragraph: Court 3
  - paragraph: Team A
  - button "Player 11"
  - button "Player 14"
  - paragraph: Team B
  - button "Player 04"
  - button "Player 05"
  - paragraph: Court 4
  - paragraph: Team A
  - button "Player 12"
  - button "Player 13"
  - paragraph: Team B
  - button "Player 17"
  - button "Player 18"
  - paragraph: Bench · 2 players
  - button "Player 01"
  - button "Player 08"
  - paragraph: "Preset 2: 2 players would sit out for 12 minutes (host warning)."
  - paragraph: Tap two players to swap court positions, or tap a court player and a benched player to exchange them.
  - button "Save Preset Finish"
  - paragraph: Optional Preset Finish · Preset 1
  - paragraph: All scores must be saved. Activate the saved court pairings for a 10-minute round, or use Prepare Next Round below to continue normal King of the Court.
  - button "Activate Preset 1" [disabled]
  - button "Change players / bench · Live round":
    - img
    - text: Change players / bench · Live round
  - paragraph: No need to restart or return to setup. Scored courts remain protected.
  - paragraph: Play Time
  - paragraph: 8 min round timer
  - button "Test speaker and spoken announcement":
    - img
  - button "Float and move timer":
    - img
  - button "Full screen timer":
    - img
  - text: 07:57
  - paragraph: Cue and announcements play at full RallyHub volume using this device’s default voice. Set the actual hall loudness with the device media-volume buttons before play.
  - button "Pause Timer":
    - img
    - text: Pause Timer
  - button "Reset":
    - img
    - text: Reset
  - paragraph: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
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
  - textbox [disabled]: "6"
  - text: ✓ Saved 11–6 · Player 01 & Player 08 win 11–6
  - button "Edit result":
    - img
    - text: Edit result
  - text: Court 2 SAVED
  - paragraph: Team A
  - paragraph:
    - img
    - text: Player 02 & Player 07
  - paragraph: WINNERS
  - textbox [disabled]: "11"
  - paragraph: Team B
  - paragraph: Player 10 & Player 15
  - textbox [disabled]: "5"
  - text: ✓ Saved 11–5 · Player 02 & Player 07 win 11–5
  - button "Edit result":
    - img
    - text: Edit result
  - text: Court 3 SAVED
  - paragraph: Team A
  - paragraph:
    - img
    - text: Player 03 & Player 06
  - paragraph: WINNERS
  - textbox [disabled]: "11"
  - paragraph: Team B
  - paragraph: Player 11 & Player 14
  - textbox [disabled]: "4"
  - text: ✓ Saved 11–4 · Player 03 & Player 06 win 11–4
  - button "Edit result":
    - img
    - text: Edit result
  - text: Court 4 SAVED
  - paragraph: Team A
  - paragraph:
    - img
    - text: Player 04 & Player 05
  - paragraph: WINNERS
  - textbox [disabled]: "11"
  - paragraph: Team B
  - paragraph: Player 12 & Player 13
  - textbox [disabled]: "3"
  - text: ✓ Saved 11–3 · Player 04 & Player 05 win 11–3
  - button "Edit result":
    - img
    - text: Edit result
  - paragraph: ✓ All scores saved for Round 1
  - paragraph: Review the scores above. Make any corrections before preparing the next round.
  - text: Preparing the next round…
  - button "Preparing Round…" [disabled]:
    - img
    - text: Preparing Round…
  - button "Finish Session" [disabled]:
    - img
    - text: Finish Session
  - paragraph: Player Device Verification
  - paragraph: Only check pending device requests when needed. Reduces background database traffic.
  - button "Check requests"
```

# Test source

```ts
  552 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  553 |   await dismissTimerFullscreen(page);
  554 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  555 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  556 |   await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });
  557 | 
  558 |   const finishButton = page.getByTestId('kotc-finish-session');
  559 |   if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  560 |   await expect(finishButton).toBeVisible();
  561 |   started = Date.now();
  562 |   await finishButton.click();
  563 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  564 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  565 |   await expect(page.getByText('Session complete')).toBeVisible();
  566 |   await expect(page.getByText('Gold')).toBeVisible();
  567 |   await expect(page.getByText('Silver')).toBeVisible();
  568 |   await expect(page.getByText('Bronze')).toBeVisible();
  569 | 
  570 |   // Post-event audit correction: reopen Round 1 / Court 1, reverse the result and
  571 |   // confirm RallyHub stores it as a correction without rewriting later court assignments.
  572 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  573 |   await page.getByRole('button',{name:'Round 1',exact:true}).click();
  574 |   const preCorrectionRound2=JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'));
  575 |   const reviewCard=page.getByTestId('kotc-score-card-1').first();
  576 |   await reviewCard.getByRole('button',{name:'Edit result'}).click();
  577 |   await reviewCard.getByTestId('kotc-score-1-a').fill('2');
  578 |   await reviewCard.getByTestId('kotc-score-1-b').fill('12');
  579 |   await reviewCard.getByRole('button',{name:'Save Correction'}).click();
  580 |   await expect(reviewCard).toContainText('Saved 2–12',{timeout:1800});
  581 |   const corrected=model.matches.find(m=>m.id==='match-r1-c1');
  582 |   expect(corrected.correction_count).toBe(1);
  583 |   expect(corrected.winner_side).toBe('B');
  584 |   expect(JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'))).toBe(preCorrectionRound2);
  585 |   report.post_event_score_correction=true;
  586 | 
  587 |   report.rounds_created = model.rounds.length;
  588 |   report.function_calls = model.calls.length;
  589 |   console.log(`KOTC HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  590 |   await testInfo.attach('kotc-host-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  591 | });
  592 | 
  593 | 
  594 | test('First court to 11: whistle, partial scores, serving tie, 18-player bench and round transition',async({page})=>{
  595 |  const model=createModel();await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  596 |  await page.goto('/e2e/kotcHarness.html');
  597 |  await expect(page.getByTestId('kotc-setup')).toBeVisible();
  598 |  await page.getByRole('combobox').first().click();
  599 |  await page.getByRole('option',{name:/First court to 11/}).click();
  600 |  await page.getByRole('button',{name:'Player 17',exact:true}).click();
  601 |  await page.getByRole('button',{name:'Player 18',exact:true}).click();
  602 |  await page.getByTestId('kotc-create-session').click();
  603 |  await expect(page.getByTestId('kotc-round-editor')).toBeVisible();
  604 |  expect(model.session.scoring_mode).toBe('first_court_to_target');
  605 |  expect(model.session.score_target).toBe(11);
  606 |  await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  607 |  await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  608 |  await page.getByTestId('kotc-start-round').click();
  609 |  await expect(page.getByText('Round 1 — LIVE')).toBeVisible();
  610 |  const scores=[[11,7],[8,6],[5,5],[9,4]];
  611 |  for(let c=1;c<=4;c++){
  612 |   await page.getByTestId(`kotc-score-${c}-a`).fill(String(scores[c-1][0]));
  613 |   await page.getByTestId(`kotc-score-${c}-b`).fill(String(scores[c-1][1]));
  614 |   if(c===3){await page.getByTestId('kotc-serving-3-b').click();}
  615 |   await page.getByTestId(`kotc-complete-${c}`).click();
  616 |   await expect(page.getByTestId(`kotc-score-card-${c}`)).toContainText('Saved');
  617 |  }
  618 |  expect(model.matches.find(m=>m.ladder_court_rank===3).winner_side).toBe('B');
  619 |  await expect(page.getByRole('button',{name:'End Round — First Court Reached 11'})).toBeVisible();
  620 |  await page.getByRole('button',{name:'End Round — First Court Reached 11'}).click();
  621 |  await expect(page.getByText(/Whistle called · Collect scores/)).toBeVisible();
  622 |  expect(JSON.parse(model.session.timer_state_json).firstCourtCalledRoundId).toBe('round-1');
  623 |  await page.getByTestId('kotc-prepare-next-round').click();
  624 |  await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2');
  625 |  expect(model.rounds.find(r=>r.round_number===1).status).toBe('completed');
  626 |  expect(model.rounds.find(r=>r.round_number===2).bench_count).toBe(2);
  627 |  expect(model.matches.filter(m=>m.round_number===1).map(m=>m.winner_side)).toEqual(['A','A','B','A']);
  628 | });
  629 | 
  630 | 
  631 | test('Preset Finish: host saves two timed layouts, activates preset and preserves previous scores', async ({page})=>{
  632 |  const model=createModel();await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  633 |  await page.goto('/e2e/kotcHarness.html');
  634 |  await page.getByRole('button',{name:'Player 17',exact:true}).click();
  635 |  await page.getByRole('button',{name:'Player 18',exact:true}).click();
  636 |  await page.getByTestId('kotc-create-session').click();
  637 |  await expect(page.getByTestId('kotc-preset-finish-editor')).toBeVisible();
  638 |  await page.getByTestId('kotc-preset-finish-editor').getByRole('button',{name:'Configure'}).click();
  639 |  await expect(page.getByLabel('Preset 1 minutes')).toHaveValue('15');
  640 |  await expect(page.getByLabel('Preset 2 minutes')).toHaveValue('15');
  641 |  await page.getByLabel('Preset 1 minutes').fill('10');
  642 |  await page.getByLabel('Preset 2 minutes').fill('12');
  643 |  await page.getByTestId('kotc-save-preset-finish').click();
  644 |  await expect.poll(()=>model.calls.some(c=>c.name==='saveKotcPresetFinish')).toBe(true);
  645 |  expect(JSON.parse(model.session.preset_finish_json).presets.map(p=>p.minutes)).toEqual([10,12]);
  646 |  await page.getByTestId('kotc-start-round').click();
  647 |  await expect(page.getByText('Round 1 — LIVE')).toBeVisible();
  648 |  await scoreCurrentRound(page);
  649 |  await expect(page.getByTestId('kotc-activate-preset-finish')).toBeVisible();
  650 |  const before=model.matches.filter(m=>m.round_number===1).map(m=>({id:m.id,a:m.team_a_score,b:m.team_b_score}));
  651 |  await page.getByTestId('kotc-activate-preset-finish').getByRole('button',{name:'Activate Preset 1'}).click();
> 652 |  await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2',{timeout:5000});
      |                                                     ^ Error: expect(locator).toContainText(expected) failed
  653 |  expect(model.rounds.find(r=>r.round_number===2).preset_finish_index).toBe(1);
  654 |  expect(model.session.play_minutes).toBe(10);
  655 |  expect(model.matches.filter(m=>m.round_number===1).map(m=>({id:m.id,a:m.team_a_score,b:m.team_b_score}))).toEqual(before);
  656 |  await expect(page.getByTestId('kotc-preset-finish-editor')).toBeVisible();
  657 | });
  658 | 
```