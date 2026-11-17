# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-journey.spec.mjs >> Preset Finish: host saves two timed layouts, activates preset and preserves previous scores
- Location: e2e/kotc-host-journey.spec.mjs:632:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByTestId('kotc-court-layout-preset-1').getByTestId('kotc-whole-court-1').getByRole('button', { name: /Player 1$/ })

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
      - generic [ref=e19]:
        - generic [ref=e20]:
          - paragraph [ref=e21]: Preset Finish · Optional
          - paragraph [ref=e22]: The same court editor as normal rounds. Save one or two timed layouts; normal King of the Court continues until activated.
        - button "Close" [ref=e23] [cursor=pointer]
      - generic [ref=e24]:
        - generic [ref=e25]:
          - button "One preset" [ref=e26] [cursor=pointer]
          - button "Two presets" [ref=e27] [cursor=pointer]
        - generic [ref=e28]:
          - generic [ref=e29]:
            - strong [ref=e30]: Preset 1
            - generic [ref=e31]: Minutes
            - spinbutton "Preset 1 minutes" [ref=e32]: "15"
          - generic [ref=e33]:
            - generic [ref=e34]:
              - paragraph [ref=e35]: Bench This Round
              - generic [ref=e36]:
                - button "Player 17" [active] [ref=e37] [cursor=pointer]
                - button "Player 18" [ref=e38] [cursor=pointer]
              - paragraph [ref=e39]: Tap a court player, then a bench player, to swap them.
            - generic [ref=e40]:
              - generic [ref=e41]:
                - heading "Host Round Editor" [level=4] [ref=e42]
                - paragraph [ref=e43]: Tap two players to swap them, or drag a whole court by its handle to move that four-player group to another court rank.
              - generic [ref=e44]:
                - generic [ref=e45]:
                  - generic [ref=e46]:
                    - generic [ref=e47]: Court 1
                    - button "Move whole Court 1" [ref=e51] [cursor=pointer]: Move court
                  - generic [ref=e59]:
                    - generic [ref=e60]:
                      - paragraph [ref=e61]: Team A · 🔒 LOCKED PAIR
                      - button "Locked ✓ · Unlock" [ref=e62] [cursor=pointer]
                    - generic [ref=e63]:
                      - button "Player 01" [ref=e64] [cursor=pointer]
                      - button "Player 08" [ref=e73] [cursor=pointer]
                  - generic [ref=e82]:
                    - generic [ref=e83]:
                      - paragraph [ref=e84]: Team B
                      - button "Lock pair" [ref=e85] [cursor=pointer]
                    - generic [ref=e86]:
                      - button "Player 09" [ref=e87] [cursor=pointer]
                      - button "Player 16" [ref=e96] [cursor=pointer]
                - generic [ref=e105]:
                  - generic [ref=e106]:
                    - generic [ref=e107]: Court 2
                    - button "Move whole Court 2" [ref=e109] [cursor=pointer]: Move court
                  - generic [ref=e117]:
                    - generic [ref=e118]:
                      - paragraph [ref=e119]: Team A
                      - button "Lock pair" [ref=e120] [cursor=pointer]
                    - generic [ref=e121]:
                      - button "Player 02" [ref=e122] [cursor=pointer]
                      - button "Player 07" [ref=e131] [cursor=pointer]
                  - generic [ref=e140]:
                    - generic [ref=e141]:
                      - paragraph [ref=e142]: Team B
                      - button "Lock pair" [ref=e143] [cursor=pointer]
                    - generic [ref=e144]:
                      - button "Player 10" [ref=e145] [cursor=pointer]
                      - button "Player 15" [ref=e154] [cursor=pointer]
                - generic [ref=e163]:
                  - generic [ref=e164]:
                    - generic [ref=e165]: Court 3
                    - button "Move whole Court 3" [ref=e167] [cursor=pointer]: Move court
                  - generic [ref=e175]:
                    - generic [ref=e176]:
                      - paragraph [ref=e177]: Team A
                      - button "Lock pair" [ref=e178] [cursor=pointer]
                    - generic [ref=e179]:
                      - button "Player 03" [ref=e180] [cursor=pointer]
                      - button "Player 06" [ref=e189] [cursor=pointer]
                  - generic [ref=e198]:
                    - generic [ref=e199]:
                      - paragraph [ref=e200]: Team B
                      - button "Lock pair" [ref=e201] [cursor=pointer]
                    - generic [ref=e202]:
                      - button "Player 11" [ref=e203] [cursor=pointer]
                      - button "Player 14" [ref=e212] [cursor=pointer]
                - generic [ref=e221]:
                  - generic [ref=e222]:
                    - generic [ref=e223]: Court 4
                    - button "Move whole Court 4" [ref=e225] [cursor=pointer]: Move court
                  - generic [ref=e233]:
                    - generic [ref=e234]:
                      - paragraph [ref=e235]: Team A
                      - button "Lock pair" [ref=e236] [cursor=pointer]
                    - generic [ref=e237]:
                      - button "Player 04" [ref=e238] [cursor=pointer]
                      - button "Player 05" [ref=e247] [cursor=pointer]
                  - generic [ref=e256]:
                    - generic [ref=e257]:
                      - paragraph [ref=e258]: Team B
                      - button "Lock pair" [ref=e259] [cursor=pointer]
                    - generic [ref=e260]:
                      - button "Player 12" [ref=e261] [cursor=pointer]
                      - button "Player 13" [ref=e270] [cursor=pointer]
        - generic [ref=e279]:
          - generic [ref=e280]:
            - strong [ref=e281]: Preset 2
            - generic [ref=e282]: Minutes
            - spinbutton "Preset 2 minutes" [ref=e283]: "15"
          - generic [ref=e284]:
            - generic [ref=e285]:
              - paragraph [ref=e286]: Bench This Round
              - generic [ref=e287]:
                - button "Player 01" [ref=e288] [cursor=pointer]
                - button "Player 08" [ref=e289] [cursor=pointer]
              - paragraph [ref=e290]: Tap a court player, then a bench player, to swap them.
            - generic [ref=e291]:
              - generic [ref=e292]:
                - heading "Host Round Editor" [level=4] [ref=e293]
                - paragraph [ref=e294]: Tap two players to swap them, or drag a whole court by its handle to move that four-player group to another court rank.
              - generic [ref=e295]:
                - generic [ref=e296]:
                  - generic [ref=e297]:
                    - generic [ref=e298]: Court 1
                    - button "Move whole Court 1" [ref=e302] [cursor=pointer]: Move court
                  - generic [ref=e310]:
                    - generic [ref=e311]:
                      - paragraph [ref=e312]: Team A
                      - button "Lock pair" [ref=e313] [cursor=pointer]
                    - generic [ref=e314]:
                      - button "Player 09" [ref=e315] [cursor=pointer]
                      - button "Player 16" [ref=e324] [cursor=pointer]
                  - generic [ref=e333]:
                    - generic [ref=e334]:
                      - paragraph [ref=e335]: Team B
                      - button "Lock pair" [ref=e336] [cursor=pointer]
                    - generic [ref=e337]:
                      - button "Player 02" [ref=e338] [cursor=pointer]
                      - button "Player 07" [ref=e347] [cursor=pointer]
                - generic [ref=e356]:
                  - generic [ref=e357]:
                    - generic [ref=e358]: Court 2
                    - button "Move whole Court 2" [ref=e360] [cursor=pointer]: Move court
                  - generic [ref=e368]:
                    - generic [ref=e369]:
                      - paragraph [ref=e370]: Team A
                      - button "Lock pair" [ref=e371] [cursor=pointer]
                    - generic [ref=e372]:
                      - button "Player 10" [ref=e373] [cursor=pointer]
                      - button "Player 15" [ref=e382] [cursor=pointer]
                  - generic [ref=e391]:
                    - generic [ref=e392]:
                      - paragraph [ref=e393]: Team B
                      - button "Lock pair" [ref=e394] [cursor=pointer]
                    - generic [ref=e395]:
                      - button "Player 03" [ref=e396] [cursor=pointer]
                      - button "Player 06" [ref=e405] [cursor=pointer]
                - generic [ref=e414]:
                  - generic [ref=e415]:
                    - generic [ref=e416]: Court 3
                    - button "Move whole Court 3" [ref=e418] [cursor=pointer]: Move court
                  - generic [ref=e426]:
                    - generic [ref=e427]:
                      - paragraph [ref=e428]: Team A
                      - button "Lock pair" [ref=e429] [cursor=pointer]
                    - generic [ref=e430]:
                      - button "Player 11" [ref=e431] [cursor=pointer]
                      - button "Player 14" [ref=e440] [cursor=pointer]
                  - generic [ref=e449]:
                    - generic [ref=e450]:
                      - paragraph [ref=e451]: Team B
                      - button "Lock pair" [ref=e452] [cursor=pointer]
                    - generic [ref=e453]:
                      - button "Player 04" [ref=e454] [cursor=pointer]
                      - button "Player 05" [ref=e463] [cursor=pointer]
                - generic [ref=e472]:
                  - generic [ref=e473]:
                    - generic [ref=e474]: Court 4
                    - button "Move whole Court 4" [ref=e476] [cursor=pointer]: Move court
                  - generic [ref=e484]:
                    - generic [ref=e485]:
                      - paragraph [ref=e486]: Team A
                      - button "Lock pair" [ref=e487] [cursor=pointer]
                    - generic [ref=e488]:
                      - button "Player 12" [ref=e489] [cursor=pointer]
                      - button "Player 13" [ref=e498] [cursor=pointer]
                  - generic [ref=e507]:
                    - generic [ref=e508]:
                      - paragraph [ref=e509]: Team B
                      - button "Lock pair" [ref=e510] [cursor=pointer]
                    - generic [ref=e511]:
                      - button "Player 17" [ref=e512] [cursor=pointer]
                      - button "Player 18" [ref=e521] [cursor=pointer]
        - paragraph [ref=e530]: "Preset 1: 2 players would sit out for 15 minutes (host warning)."
        - paragraph [ref=e531]: "Preset 2: 2 players would sit out for 15 minutes (host warning)."
        - button "Save Preset Finish" [ref=e532] [cursor=pointer]
    - generic [ref=e533]:
      - paragraph [ref=e534]: ROUND 1 HAS NOT STARTED
      - paragraph [ref=e535]: Call the court assignments below, make any host changes, then press START ROUND. The timer is not running and score entry is hidden until you start.
    - generic [ref=e536]:
      - generic [ref=e537]:
        - generic [ref=e538]:
          - paragraph [ref=e539]: Bench This Round
          - generic [ref=e540]:
            - button "Player 17" [ref=e541] [cursor=pointer]
            - button "Player 18" [ref=e542] [cursor=pointer]
          - paragraph [ref=e543]: Tap a court player, then a bench player, to swap them.
        - generic [ref=e544]:
          - generic [ref=e545]:
            - heading "Host Round Editor" [level=4] [ref=e546]
            - paragraph [ref=e547]: Tap two players to swap them, or drag a whole court by its handle to move that four-player group to another court rank.
          - generic [ref=e548]:
            - generic [ref=e549]:
              - generic [ref=e550]:
                - generic [ref=e551]: Court 1
                - button "Move whole Court 1" [ref=e555] [cursor=pointer]: Move court
              - generic [ref=e563]:
                - generic [ref=e564]:
                  - paragraph [ref=e565]: Team A
                  - button "Lock pair" [ref=e566] [cursor=pointer]
                - generic [ref=e567]:
                  - button "Player 01" [ref=e568] [cursor=pointer]
                  - button "Player 08" [ref=e577] [cursor=pointer]
              - generic [ref=e586]:
                - generic [ref=e587]:
                  - paragraph [ref=e588]: Team B
                  - button "Lock pair" [ref=e589] [cursor=pointer]
                - generic [ref=e590]:
                  - button "Player 09" [ref=e591] [cursor=pointer]
                  - button "Player 16" [ref=e600] [cursor=pointer]
            - generic [ref=e609]:
              - generic [ref=e610]:
                - generic [ref=e611]: Court 2
                - button "Move whole Court 2" [ref=e613] [cursor=pointer]: Move court
              - generic [ref=e621]:
                - generic [ref=e622]:
                  - paragraph [ref=e623]: Team A
                  - button "Lock pair" [ref=e624] [cursor=pointer]
                - generic [ref=e625]:
                  - button "Player 02" [ref=e626] [cursor=pointer]
                  - button "Player 07" [ref=e635] [cursor=pointer]
              - generic [ref=e644]:
                - generic [ref=e645]:
                  - paragraph [ref=e646]: Team B
                  - button "Lock pair" [ref=e647] [cursor=pointer]
                - generic [ref=e648]:
                  - button "Player 10" [ref=e649] [cursor=pointer]
                  - button "Player 15" [ref=e658] [cursor=pointer]
            - generic [ref=e667]:
              - generic [ref=e668]:
                - generic [ref=e669]: Court 3
                - button "Move whole Court 3" [ref=e671] [cursor=pointer]: Move court
              - generic [ref=e679]:
                - generic [ref=e680]:
                  - paragraph [ref=e681]: Team A
                  - button "Lock pair" [ref=e682] [cursor=pointer]
                - generic [ref=e683]:
                  - button "Player 03" [ref=e684] [cursor=pointer]
                  - button "Player 06" [ref=e693] [cursor=pointer]
              - generic [ref=e702]:
                - generic [ref=e703]:
                  - paragraph [ref=e704]: Team B
                  - button "Lock pair" [ref=e705] [cursor=pointer]
                - generic [ref=e706]:
                  - button "Player 11" [ref=e707] [cursor=pointer]
                  - button "Player 14" [ref=e716] [cursor=pointer]
            - generic [ref=e725]:
              - generic [ref=e726]:
                - generic [ref=e727]: Court 4
                - button "Move whole Court 4" [ref=e729] [cursor=pointer]: Move court
              - generic [ref=e737]:
                - generic [ref=e738]:
                  - paragraph [ref=e739]: Team A
                  - button "Lock pair" [ref=e740] [cursor=pointer]
                - generic [ref=e741]:
                  - button "Player 04" [ref=e742] [cursor=pointer]
                  - button "Player 05" [ref=e751] [cursor=pointer]
              - generic [ref=e760]:
                - generic [ref=e761]:
                  - paragraph [ref=e762]: Team B
                  - button "Lock pair" [ref=e763] [cursor=pointer]
                - generic [ref=e764]:
                  - button "Player 12" [ref=e765] [cursor=pointer]
                  - button "Player 13" [ref=e774] [cursor=pointer]
      - generic [ref=e784]:
        - generic [ref=e785]:
          - paragraph [ref=e786]: Round setup is saved
          - paragraph [ref=e787]: You can leave this screen and return without losing the court layout.
        - button "Saved ✓" [disabled]
      - generic [ref=e788]:
        - generic [ref=e789]:
          - paragraph [ref=e790]: Pre-Round Check
          - paragraph [ref=e791]: Confirm the round time and hall sound before players begin.
        - generic [ref=e792]:
          - generic [ref=e793]:
            - generic [ref=e798]:
              - paragraph [ref=e799]: Round timer
              - paragraph [ref=e800]: Adjust now if tonight needs a shorter or longer round.
            - generic [ref=e801]: 08:00
          - generic [ref=e802]:
            - button "− 1 min" [ref=e803] [cursor=pointer]
            - button "+ 1 min" [ref=e804] [cursor=pointer]
        - generic [ref=e806]:
          - generic [ref=e807]:
            - paragraph [ref=e808]: Audio & announcements check
            - paragraph [ref=e809]: "Current KOTC announcement: “5, 4, 3, 2, 1. Hand in your scores.” No other automatic round warnings."
          - button "Test Full Announcement" [ref=e810] [cursor=pointer]
        - button "START ROUND 1" [ref=e811] [cursor=pointer]
      - generic [ref=e812]:
        - paragraph [ref=e813]: Change or redo the opening draw
        - paragraph [ref=e814]: "For one or two changes, swap players in the editor above and save: other courts stay intact. To change the complete Round 1 draw or roster, return to setup; the unplayed draw is discarded but the roster is kept. Create Round 1 again after your changes."
        - button "Return to Setup / Redo Round 1 Draw" [ref=e815] [cursor=pointer]
      - button "Restore Original Draw (undo unsaved edits)" [ref=e816] [cursor=pointer]
    - generic [ref=e818]:
      - generic [ref=e819]:
        - paragraph [ref=e820]: Player Device Verification
        - paragraph [ref=e821]: Only check pending device requests when needed. Reduces background database traffic.
      - button "Check requests" [ref=e822] [cursor=pointer]
```

# Test source

```ts
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
  638 |  await expect(page.getByTestId('kotc-preset-finish-editor')).toBeVisible();
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
> 652 |  await presetOne.getByTestId('kotc-whole-court-1').getByRole('button',{name:/Player 1$/}).click();
      |                                                                                           ^ Error: locator.click: Test timeout of 45000ms exceeded.
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