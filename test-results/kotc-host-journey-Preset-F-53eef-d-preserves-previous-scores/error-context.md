# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> Preset Finish: host saves two timed layouts, activates preset and preserves previous scores
- Location: e2e/kotc-host-journey.spec.mjs:632:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('kotc-preset-finish-editor')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('kotc-preset-finish-editor') with timeout 3000ms
  - waiting for getByTestId('kotc-preset-finish-editor')

```

# Test source

```ts
  538 |   await page.getByTestId('kotc-add-player-visible').click();
  539 |   await page.getByTestId('kotc-player-participant-03').click();
  540 |   await page.getByTestId('kotc-player-sit-out').click();
  541 |   await expect(page.getByTestId('kotc-player-participant-03')).toContainText('Bench · this round', { timeout: 1500 });
  542 |   expect(model.participants.find(p => p.id === 'participant-03')?.status).toBe('voluntary_rest');
  543 | 
  544 |   report.round2_score_save_ms = await scoreCurrentRound(page, 4, 10);
  545 |   await expect(page.getByText('All scores saved for Round 2')).toBeVisible({ timeout: 1800 });
  546 |   await page.getByTestId('kotc-prepare-next-round').click();
  547 |   await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3', { timeout: 2200 });
  548 |   const round3Ids = new Set(model.slots.filter(s => s.round_id === 'round-3').map(s => s.participant_id));
  549 |   expect(round3Ids.has('participant-03'), 'one-round rest player must not be assigned in Round 3').toBe(false);
  550 | 
  551 |   // Round 3: prove the reduced available roster still stages correctly, then finish the session.
  552 |   await page.getByTestId('kotc-start-round').click();
  553 |   await expect(page.getByText('Round 3 — LIVE')).toBeVisible({ timeout: 1800 });
  554 |   await dismissTimerFullscreen(page);
  555 |   const round3CourtCount = model.rounds.find(r => r.id === 'round-3')?.active_court_count || 4;
  556 |   report.round3_score_save_ms = await scoreCurrentRound(page, round3CourtCount, 9);
  557 |   await expect(page.getByText('All scores saved for Round 3')).toBeVisible({ timeout: 1800 });
  558 | 
  559 |   const finishButton = page.getByTestId('kotc-finish-session');
  560 |   if (!(await finishButton.isVisible().catch(() => false))) await page.getByTestId('kotc-session-menu').click();
  561 |   await expect(finishButton).toBeVisible();
  562 |   started = Date.now();
  563 |   await finishButton.click();
  564 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({ timeout: 1800 });
  565 |   metric(report, 'finish_to_podium_ms', Date.now() - started, 1500);
  566 |   await expect(page.getByText('Session complete')).toBeVisible();
  567 |   await expect(page.getByText('Gold')).toBeVisible();
  568 |   await expect(page.getByText('Silver')).toBeVisible();
  569 |   await expect(page.getByText('Bronze')).toBeVisible();
  570 | 
  571 |   // Post-event audit correction: reopen Round 1 / Court 1, reverse the result and
  572 |   // confirm RallyHub stores it as a correction without rewriting later court assignments.
  573 |   await expect(page.getByText('Review & Correct Results')).toBeVisible();
  574 |   await page.getByRole('button',{name:'Round 1',exact:true}).click();
  575 |   const preCorrectionRound2=JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'));
  576 |   const reviewCard=page.getByTestId('kotc-score-card-1').first();
  577 |   await reviewCard.getByRole('button',{name:'Edit result'}).click();
  578 |   await reviewCard.getByTestId('kotc-score-1-a').fill('2');
  579 |   await reviewCard.getByTestId('kotc-score-1-b').fill('12');
  580 |   await reviewCard.getByRole('button',{name:'Save Correction'}).click();
  581 |   await expect(reviewCard).toContainText('Saved 2–12',{timeout:1800});
  582 |   const corrected=model.matches.find(m=>m.id==='match-r1-c1');
  583 |   expect(corrected.correction_count).toBe(1);
  584 |   expect(corrected.winner_side).toBe('B');
  585 |   expect(JSON.stringify(model.slots.filter(s=>s.round_id==='round-2'))).toBe(preCorrectionRound2);
  586 |   report.post_event_score_correction=true;
  587 | 
  588 |   report.rounds_created = model.rounds.length;
  589 |   report.function_calls = model.calls.length;
  590 |   console.log(`KOTC HOST JOURNEY REPORT\n${JSON.stringify(report, null, 2)}`);
  591 |   await testInfo.attach('kotc-host-journey-report.json', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  592 | });
  593 | 
  594 | 
  595 | test('First court to 11: whistle, partial scores, serving tie, 18-player bench and round transition',async({page})=>{
  596 |  const model=createModel();await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  597 |  await page.goto('/e2e/kotcHarness.html');
  598 |  await expect(page.getByTestId('kotc-setup')).toBeVisible();
  599 |  await page.getByRole('combobox').first().click();
  600 |  await page.getByRole('option',{name:/First court to 11/}).click();
  601 |  await page.getByRole('button',{name:'Player 17',exact:true}).click();
  602 |  await page.getByRole('button',{name:'Player 18',exact:true}).click();
  603 |  await page.getByTestId('kotc-create-session').click();
  604 |  await expect(page.getByTestId('kotc-round-editor')).toBeVisible();
  605 |  expect(model.session.scoring_mode).toBe('first_court_to_target');
  606 |  expect(model.session.score_target).toBe(11);
  607 |  await expect(page.getByTestId('kotc-bench')).toContainText('Player 17');
  608 |  await expect(page.getByTestId('kotc-bench')).toContainText('Player 18');
  609 |  await page.getByTestId('kotc-start-round').click();
  610 |  await expect(page.getByText('Round 1 — LIVE')).toBeVisible();
  611 |  const scores=[[11,7],[8,6],[5,5],[9,4]];
  612 |  for(let c=1;c<=4;c++){
  613 |   await page.getByTestId(`kotc-score-${c}-a`).fill(String(scores[c-1][0]));
  614 |   await page.getByTestId(`kotc-score-${c}-b`).fill(String(scores[c-1][1]));
  615 |   if(c===3){await page.getByTestId('kotc-serving-3-b').click();}
  616 |   await page.getByTestId(`kotc-complete-${c}`).click();
  617 |   await expect(page.getByTestId(`kotc-score-card-${c}`)).toContainText('Saved');
  618 |  }
  619 |  expect(model.matches.find(m=>m.ladder_court_rank===3).winner_side).toBe('B');
  620 |  await expect(page.getByRole('button',{name:'End Round — First Court Reached 11'})).toBeVisible();
  621 |  await page.getByRole('button',{name:'End Round — First Court Reached 11'}).click();
  622 |  await expect(page.getByText(/Whistle called · Collect scores/)).toBeVisible();
  623 |  expect(JSON.parse(model.session.timer_state_json).firstCourtCalledRoundId).toBe('round-1');
  624 |  await page.getByTestId('kotc-prepare-next-round').click();
  625 |  await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2');
  626 |  expect(model.rounds.find(r=>r.round_number===1).status).toBe('completed');
  627 |  expect(model.rounds.find(r=>r.round_number===2).bench_count).toBe(2);
  628 |  expect(model.matches.filter(m=>m.round_number===1).map(m=>m.winner_side)).toEqual(['A','A','B','A']);
  629 | });
  630 | 
  631 | 
  632 | test('Preset Finish: host saves two timed layouts, activates preset and preserves previous scores', async ({page})=>{
  633 |  const model=createModel();await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  634 |  await page.goto('/e2e/kotcHarness.html');
  635 |  await page.getByRole('button',{name:'Player 17',exact:true}).click();
  636 |  await page.getByRole('button',{name:'Player 18',exact:true}).click();
  637 |  await page.getByTestId('kotc-create-session').click();
> 638 |  await expect(page.getByTestId('kotc-preset-finish-editor')).toBeVisible();
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  639 |  await page.getByTestId('kotc-preset-finish-editor').getByRole('button',{name:'Configure'}).click();
  640 |  await expect(page.getByLabel('Preset 1 minutes')).toHaveValue('15');
  641 |  await expect(page.getByLabel('Preset 2 minutes')).toHaveValue('15');
  642 |  const presetOne=page.getByTestId('kotc-court-layout-preset-1');
  643 |  const presetTwo=page.getByTestId('kotc-court-layout-preset-2');
  644 |  await expect(presetOne.getByTestId('kotc-whole-court-1')).toBeVisible();
  645 |  await expect(presetTwo.getByTestId('kotc-whole-court-4')).toBeVisible();
  646 |  await expect(presetOne.getByText('Move court').first()).toBeVisible();
  647 |  await expect(presetOne.getByRole('button',{name:'Lock pair'}).first()).toBeVisible();
  648 |  await expect(presetOne.getByTestId('kotc-bench')).toContainText('Player 17');
  649 |  await presetOne.getByRole('button',{name:'Lock pair'}).first().click();
  650 |  await expect(presetOne.getByText('LOCKED PAIR').first()).toBeVisible();
  651 |  await presetOne.getByTestId('kotc-bench').getByRole('button',{name:'Player 17'}).click();
  652 |  await presetOne.getByTestId('kotc-whole-court-1').getByRole('button',{name:'Player 09'}).click();
  653 |  await expect(presetOne.getByTestId('kotc-whole-court-1')).toContainText('Player 17');
  654 |  await page.getByLabel('Preset 1 minutes').fill('10');
  655 |  await page.getByLabel('Preset 2 minutes').fill('12');
  656 |  await page.getByTestId('kotc-save-preset-finish').click();
  657 |  await expect.poll(()=>model.calls.some(c=>c.name==='saveKotcPresetFinish')).toBe(true);
  658 |  expect(JSON.parse(model.session.preset_finish_json).presets.map(p=>p.minutes)).toEqual([10,12]);
  659 |  await page.getByTestId('kotc-start-round').click();
  660 |  await expect(page.getByText('Round 1 — LIVE')).toBeVisible();
  661 |  await scoreCurrentRound(page);
  662 |  await expect(page.getByTestId('kotc-activate-preset-finish')).toBeVisible();
  663 |  const before=model.matches.filter(m=>m.round_number===1).map(m=>({id:m.id,a:m.team_a_score,b:m.team_b_score}));
  664 |  await page.getByTestId('kotc-activate-preset-finish').getByRole('button',{name:'Activate Preset 1'}).click();
  665 |  await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 2',{timeout:5000});
  666 |  expect(model.rounds.find(r=>r.round_number===2).preset_finish_index).toBe(1);
  667 |  expect(model.session.play_minutes).toBe(10);
  668 |  expect(model.matches.filter(m=>m.round_number===1).map(m=>({id:m.id,a:m.team_a_score,b:m.team_b_score}))).toEqual(before);
  669 |  await expect(page.getByTestId('kotc-preset-finish-editor')).toBeVisible();
  670 |  await page.getByTestId('kotc-start-round').click();
  671 |  await expect(page.getByText('Round 2 — LIVE')).toBeVisible();
  672 |  await scoreCurrentRound(page);
  673 |  await expect(page.getByTestId('kotc-activate-preset-finish')).toContainText('Preset 2');
  674 |  await page.getByTestId('kotc-activate-preset-finish').getByRole('button',{name:'Activate Preset 2'}).click();
  675 |  await expect(page.getByTestId('kotc-start-round')).toContainText('START ROUND 3',{timeout:5000});
  676 |  expect(model.rounds.find(r=>r.round_number===3).preset_finish_index).toBe(2);
  677 |  expect(model.session.play_minutes).toBe(12);
  678 |  expect(model.matches.filter(m=>m.round_number===1).map(m=>({id:m.id,a:m.team_a_score,b:m.team_b_score}))).toEqual(before);
  679 | 
  680 | });
  681 | 
```