# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> KOTC hall-pressure simulator: 18 players, 12 rounds, slow provider, rapid scoring, phone focus churn
- Location: e2e/kotc-host-desktop.spec.mjs:589:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 3200
Received:    3253
```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Session complete" [level=3] [ref=e12]
      - paragraph [ref=e13]: Final standings after 12 completed rounds
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]: 🥇
        - paragraph [ref=e17]: Gold
        - paragraph [ref=e18]: Player 03
        - paragraph [ref=e19]: 12W · 0L · +80
      - generic [ref=e20]:
        - generic [ref=e21]: 🥈
        - paragraph [ref=e22]: Silver
        - paragraph [ref=e23]: Player 07
        - paragraph [ref=e24]: 12W · 0L · +80
      - generic [ref=e25]:
        - generic [ref=e26]: 🥉
        - paragraph [ref=e27]: Bronze
        - paragraph [ref=e28]: Player 04
        - paragraph [ref=e29]: 12W · 0L · +79
    - generic [ref=e30]:
      - generic [ref=e31]:
        - generic [ref=e32]: "#"
        - generic [ref=e33]: Player
        - generic [ref=e34]: W
        - generic [ref=e35]: L
        - generic [ref=e36]: Played
        - generic [ref=e37]: Diff
      - generic [ref=e38]:
        - generic [ref=e39]: "1"
        - generic [ref=e40]: Player 03
        - generic [ref=e41]: "12"
        - generic [ref=e42]: "0"
        - generic [ref=e43]: "12"
        - generic [ref=e44]: "+80"
      - generic [ref=e45]:
        - generic [ref=e46]: "2"
        - generic [ref=e47]: Player 07
        - generic [ref=e48]: "12"
        - generic [ref=e49]: "0"
        - generic [ref=e50]: "12"
        - generic [ref=e51]: "+80"
      - generic [ref=e52]:
        - generic [ref=e53]: "3"
        - generic [ref=e54]: Player 04
        - generic [ref=e55]: "12"
        - generic [ref=e56]: "0"
        - generic [ref=e57]: "12"
        - generic [ref=e58]: "+79"
      - generic [ref=e59]:
        - generic [ref=e60]: "4"
        - generic [ref=e61]: Player 06
        - generic [ref=e62]: "12"
        - generic [ref=e63]: "0"
        - generic [ref=e64]: "12"
        - generic [ref=e65]: "+79"
      - generic [ref=e66]:
        - generic [ref=e67]: "5"
        - generic [ref=e68]: Player 01
        - generic [ref=e69]: "12"
        - generic [ref=e70]: "0"
        - generic [ref=e71]: "12"
        - generic [ref=e72]: "+78"
      - generic [ref=e73]:
        - generic [ref=e74]: "6"
        - generic [ref=e75]: Player 08
        - generic [ref=e76]: "12"
        - generic [ref=e77]: "0"
        - generic [ref=e78]: "12"
        - generic [ref=e79]: "+78"
      - generic [ref=e80]:
        - generic [ref=e81]: "7"
        - generic [ref=e82]: Player 02
        - generic [ref=e83]: "12"
        - generic [ref=e84]: "0"
        - generic [ref=e85]: "12"
        - generic [ref=e86]: "+77"
      - generic [ref=e87]:
        - generic [ref=e88]: "8"
        - generic [ref=e89]: Player 05
        - generic [ref=e90]: "12"
        - generic [ref=e91]: "0"
        - generic [ref=e92]: "12"
        - generic [ref=e93]: "+77"
      - generic [ref=e94]:
        - generic [ref=e95]: "9"
        - generic [ref=e96]: Player 17
        - generic [ref=e97]: "0"
        - generic [ref=e98]: "0"
        - generic [ref=e99]: "0"
        - generic [ref=e100]: "0"
      - generic [ref=e101]:
        - generic [ref=e102]: "10"
        - generic [ref=e103]: Player 18
        - generic [ref=e104]: "0"
        - generic [ref=e105]: "0"
        - generic [ref=e106]: "0"
        - generic [ref=e107]: "0"
      - generic [ref=e108]:
        - generic [ref=e109]: "11"
        - generic [ref=e110]: Player 09
        - generic [ref=e111]: "0"
        - generic [ref=e112]: "12"
        - generic [ref=e113]: "12"
        - generic [ref=e114]: "-77"
      - generic [ref=e115]:
        - generic [ref=e116]: "12"
        - generic [ref=e117]: Player 14
        - generic [ref=e118]: "0"
        - generic [ref=e119]: "12"
        - generic [ref=e120]: "12"
        - generic [ref=e121]: "-77"
      - generic [ref=e122]:
        - generic [ref=e123]: "13"
        - generic [ref=e124]: Player 10
        - generic [ref=e125]: "0"
        - generic [ref=e126]: "12"
        - generic [ref=e127]: "12"
        - generic [ref=e128]: "-78"
      - generic [ref=e129]:
        - generic [ref=e130]: "14"
        - generic [ref=e131]: Player 16
        - generic [ref=e132]: "0"
        - generic [ref=e133]: "12"
        - generic [ref=e134]: "12"
        - generic [ref=e135]: "-78"
      - generic [ref=e136]:
        - generic [ref=e137]: "15"
        - generic [ref=e138]: Player 12
        - generic [ref=e139]: "0"
        - generic [ref=e140]: "12"
        - generic [ref=e141]: "12"
        - generic [ref=e142]: "-79"
      - generic [ref=e143]:
        - generic [ref=e144]: "16"
        - generic [ref=e145]: Player 15
        - generic [ref=e146]: "0"
        - generic [ref=e147]: "12"
        - generic [ref=e148]: "12"
        - generic [ref=e149]: "-79"
      - generic [ref=e150]:
        - generic [ref=e151]: "17"
        - generic [ref=e152]: Player 11
        - generic [ref=e153]: "0"
        - generic [ref=e154]: "12"
        - generic [ref=e155]: "12"
        - generic [ref=e156]: "-80"
      - generic [ref=e157]:
        - generic [ref=e158]: "18"
        - generic [ref=e159]: Player 13
        - generic [ref=e160]: "0"
        - generic [ref=e161]: "12"
        - generic [ref=e162]: "12"
        - generic [ref=e163]: "-80"
    - generic [ref=e164]:
      - generic [ref=e165]:
        - paragraph [ref=e166]: Review & Correct Results
        - paragraph [ref=e167]: Choose any completed round and correct a court score. RallyHub recalculates the night’s standings/podium and member leaderboard. Historical court assignments are not rewritten.
      - generic [ref=e168]:
        - button "Round 1" [ref=e169] [cursor=pointer]
        - button "Round 2" [ref=e170] [cursor=pointer]
        - button "Round 3" [ref=e171] [cursor=pointer]
        - button "Round 4" [ref=e172] [cursor=pointer]
        - button "Round 5" [ref=e173] [cursor=pointer]
        - button "Round 6" [ref=e174] [cursor=pointer]
        - button "Round 7" [ref=e175] [cursor=pointer]
        - button "Round 8" [ref=e176] [cursor=pointer]
        - button "Round 9" [ref=e177] [cursor=pointer]
        - button "Round 10" [ref=e178] [cursor=pointer]
        - button "Round 11" [ref=e179] [cursor=pointer]
        - button "Round 12" [ref=e180] [cursor=pointer]
      - generic [ref=e181]:
        - generic [ref=e182]:
          - generic [ref=e183]:
            - generic [ref=e184]: Court 1
            - generic [ref=e188]: SAVED
          - generic [ref=e189]:
            - generic [ref=e190]:
              - paragraph [ref=e191]: Team A
              - paragraph [ref=e192]: Player 04 & Player 06
            - textbox [disabled] [ref=e193]: "10"
          - generic [ref=e194]:
            - generic [ref=e195]:
              - paragraph [ref=e196]: Team B
              - paragraph [ref=e197]: Player 12 & Player 15
            - textbox [disabled] [ref=e198]: "5"
          - generic [ref=e199]: ✓ Saved 10–5
          - button "Edit result" [ref=e200] [cursor=pointer]
        - generic [ref=e201]:
          - generic [ref=e202]:
            - generic [ref=e203]: Court 2
            - generic [ref=e205]: SAVED
          - generic [ref=e206]:
            - generic [ref=e207]:
              - paragraph [ref=e208]: Team A
              - paragraph [ref=e209]: Player 02 & Player 05
            - textbox [disabled] [ref=e210]: "11"
          - generic [ref=e211]:
            - generic [ref=e212]:
              - paragraph [ref=e213]: Team B
              - paragraph [ref=e214]: Player 09 & Player 14
            - textbox [disabled] [ref=e215]: "6"
          - generic [ref=e216]: ✓ Saved 11–6
          - button "Edit result" [ref=e217] [cursor=pointer]
        - generic [ref=e218]:
          - generic [ref=e219]:
            - generic [ref=e220]: Court 3
            - generic [ref=e222]: SAVED
          - generic [ref=e223]:
            - generic [ref=e224]:
              - paragraph [ref=e225]: Team A
              - paragraph [ref=e226]: Player 03 & Player 07
            - textbox [disabled] [ref=e227]: "12"
          - generic [ref=e228]:
            - generic [ref=e229]:
              - paragraph [ref=e230]: Team B
              - paragraph [ref=e231]: Player 11 & Player 13
            - textbox [disabled] [ref=e232]: "2"
          - generic [ref=e233]: ✓ Saved 12–2
          - button "Edit result" [ref=e234] [cursor=pointer]
        - generic [ref=e235]:
          - generic [ref=e236]:
            - generic [ref=e237]: Court 4
            - generic [ref=e239]: SAVED
          - generic [ref=e240]:
            - generic [ref=e241]:
              - paragraph [ref=e242]: Team A
              - paragraph [ref=e243]: Player 01 & Player 08
            - textbox [disabled] [ref=e244]: "13"
          - generic [ref=e245]:
            - generic [ref=e246]:
              - paragraph [ref=e247]: Team B
              - paragraph [ref=e248]: Player 10 & Player 16
            - textbox [disabled] [ref=e249]: "3"
          - generic [ref=e250]: ✓ Saved 13–3
          - button "Edit result" [ref=e251] [cursor=pointer]
    - generic [ref=e252]:
      - button "Copy Results Link" [ref=e253] [cursor=pointer]
      - button "Email Players" [ref=e254] [cursor=pointer]
```

# Test source

```ts
  593 |     getKotcV2State:[220,900,350],
  594 |     createKotcV2Session:[850],
  595 |     startKotcRound:[1250,420,1750,680,1100,510,1500,760],
  596 |     saveKotcScore:[900,1650,520,1250,700,1450,430,1050],
  597 |     prepareKotcNextRound:[1850,620,2250,880,1600,700],
  598 |     kotcTimer:[70,110,60],
  599 |     endKotcSession:[1450],
  600 |   };
  601 |   const model=createModel({stressProfile});
  602 |   const report={rounds:12,start_ack_ms:[],start_confirm_ms:[],score_ack_ms:[],score_burst_confirm_ms:[],prepare_ack_ms:[],prepare_confirm_ms:[]};
  603 |   await installMockBackend(page,model);page.on('dialog',d=>d.accept());
  604 |   await page.goto('/e2e/kotcHarness.html');
  605 |   await page.getByRole('button',{name:'Player 17',exact:true}).click();
  606 |   await page.getByRole('button',{name:'Player 18',exact:true}).click();
  607 |   await page.getByTestId('kotc-create-session').click();
  608 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:3000});
  609 | 
  610 |   for(let round=1;round<=12;round++){
  611 |     const start=page.getByTestId('kotc-start-round');
  612 |     await expect(start).toContainText(`START ROUND ${round}`);
  613 |     const startAt=Date.now();
  614 |     await start.click();
  615 |     await expect(start).toContainText('Starting…',{timeout:250});
  616 |     report.start_ack_ms.push(Date.now()-startAt);
  617 |     await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Starting Round ${round}`,{timeout:300});
  618 |     await sleep(180);
  619 |     await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:false}));});
  620 |     await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Starting Round ${round}`);
  621 |     await expect(start).toBeDisabled();
  622 |     await expect(page.getByText(`Round ${round} — LIVE`)).toBeVisible({timeout:3500});
  623 |     report.start_confirm_ms.push(Date.now()-startAt);
  624 | 
  625 |     const hostClaimsBefore=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  626 |     for(let court=1;court<=4;court++){
  627 |       await page.getByTestId(`kotc-score-${court}-a`).fill(String(8+((round+court)%6)));
  628 |       await page.getByTestId(`kotc-score-${court}-b`).fill(String(2+((round*2+court)%5)));
  629 |     }
  630 |     const burstAt=Date.now();
  631 |     for(let court=1;court<=4;court++){
  632 |       const button=page.getByTestId(`kotc-complete-${court}`);
  633 |       const ackAt=Date.now();
  634 |       await button.click();
  635 |       await expect(button).toContainText('Saving…',{timeout:250});
  636 |       report.score_ack_ms.push(Date.now()-ackAt);
  637 |     }
  638 |     await sleep(220);
  639 |     await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});
  640 |     for(let court=1;court<=4;court++)await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved',{timeout:3000});
  641 |     report.score_burst_confirm_ms.push(Date.now()-burstAt);
  642 |     const hostClaimsAfter=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  643 |     expect(hostClaimsAfter,`Round ${round} must not claim scorer leases when no player scorer owns a court`).toBe(hostClaimsBefore);
  644 |     await expect(page.getByText(`All scores saved for Round ${round}`)).toBeVisible();
  645 | 
  646 |     if(round<12){
  647 |       const prepare=page.getByTestId('kotc-prepare-next-round');
  648 |       const prepAt=Date.now();
  649 |       await prepare.click();
  650 |       await expect(prepare).toContainText('Preparing Round…',{timeout:250});
  651 |       report.prepare_ack_ms.push(Date.now()-prepAt);
  652 |       await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Preparing Round ${round+1}`,{timeout:300});
  653 |       await sleep(300);
  654 |       await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});
  655 |       await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Preparing Round ${round+1}`);
  656 |       await expect(prepare).toBeDisabled();
  657 |       await expect(page.getByTestId('kotc-start-round')).toContainText(`START ROUND ${round+1}`,{timeout:4000});
  658 |       report.prepare_confirm_ms.push(Date.now()-prepAt);
  659 |     }
  660 |   }
  661 | 
  662 |   const roundsBeforeFinish=model.rounds.length;
  663 |   const finish=page.getByTestId('kotc-finish-after-scores');
  664 |   await expect(finish).toBeVisible();
  665 |   const finishAt=Date.now();
  666 |   await finish.click();
  667 |   await expect(page.getByTestId('kotc-host-action-status')).toContainText('Finishing session',{timeout:300});
  668 |   await sleep(250);
  669 |   await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  670 |   await expect(page.getByTestId('kotc-host-action-status')).toContainText('Finishing session');
  671 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({timeout:3500});
  672 |   report.finish_to_podium_ms=Date.now()-finishAt;
  673 |   expect(model.rounds.length,'Finish after scores must not manufacture an unused next round').toBe(roundsBeforeFinish);
  674 |   expect(model.rounds.length).toBe(12);
  675 | 
  676 |   const callsByName=Object.fromEntries([...new Set(model.calls.map(c=>c.name))].map(name=>[name,model.calls.filter(c=>c.name===name).length]));
  677 |   report.calls_by_name=callsByName;
  678 |   report.total_function_calls=model.calls.length;
  679 |   report.full_state_reads=callsByName.getKotcV2State||0;
  680 |   report.host_claim_score_calls=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  681 |   report.max_start_ack_ms=Math.max(...report.start_ack_ms);
  682 |   report.max_start_confirm_ms=Math.max(...report.start_confirm_ms);
  683 |   report.max_score_ack_ms=Math.max(...report.score_ack_ms);
  684 |   report.max_score_burst_confirm_ms=Math.max(...report.score_burst_confirm_ms);
  685 |   report.max_prepare_ack_ms=Math.max(...report.prepare_ack_ms);
  686 |   report.max_prepare_confirm_ms=Math.max(...report.prepare_confirm_ms);
  687 | 
  688 |   expect(report.max_start_ack_ms).toBeLessThanOrEqual(250);
  689 |   expect(report.max_score_ack_ms).toBeLessThanOrEqual(250);
  690 |   expect(report.max_prepare_ack_ms).toBeLessThanOrEqual(250);
  691 |   expect(report.max_start_confirm_ms).toBeLessThanOrEqual(2300);
  692 |   expect(report.max_score_burst_confirm_ms).toBeLessThanOrEqual(2300);
> 693 |   expect(report.max_prepare_confirm_ms).toBeLessThanOrEqual(3200);
      |                                         ^ Error: expect(received).toBeLessThanOrEqual(expected)
  694 |   expect(report.full_state_reads,'Normal live play must not poll/reload heavyweight state after successful actions').toBeLessThanOrEqual(3);
  695 |   expect(report.host_claim_score_calls,'Typing host scores must not create empty scorer-takeover traffic').toBe(0);
  696 |   expect(callsByName.startKotcRound).toBe(12);
  697 |   expect(callsByName.saveKotcScore).toBe(48);
  698 |   expect(callsByName.prepareKotcNextRound).toBe(11);
  699 |   expect(callsByName.endKotcSession).toBe(1);
  700 |   expect(report.total_function_calls,'12-round host journey should remain inside a compact API-call budget').toBeLessThanOrEqual(95);
  701 | 
  702 |   console.log(`KOTC HALL-PRESSURE SIMULATOR REPORT\n${JSON.stringify(report,null,2)}`);
  703 |   await testInfo.attach('kotc-hall-pressure-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  704 | });
  705 | 
```