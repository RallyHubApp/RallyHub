# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> KOTC hall-pressure simulator: 18 players, 12 rounds, slow provider, rapid scoring, phone focus churn
- Location: e2e/kotc-host-desktop.spec.mjs:586:1

# Error details

```
Error: 12-round host journey should remain inside a compact API-call budget

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 95
Received:    98
```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Session complete" [level=3] [ref=e12]
      - paragraph [ref=e13]: Final podium after 12 completed rounds. Detailed round scores remain available for review below.
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]: 🥇
        - paragraph [ref=e17]: Gold
        - paragraph [ref=e18]: Player 03
        - paragraph [ref=e19]: 12W · 0L · +80
      - generic [ref=e20]:
        - generic [ref=e21]: 🥈
        - paragraph [ref=e22]: Silver
        - paragraph [ref=e23]: Player 06
        - paragraph [ref=e24]: 12W · 0L · +80
      - generic [ref=e25]:
        - generic [ref=e26]: 🥉
        - paragraph [ref=e27]: Bronze
        - paragraph [ref=e28]: Player 01
        - paragraph [ref=e29]: 12W · 0L · +79
    - generic [ref=e30]:
      - generic [ref=e31]:
        - paragraph [ref=e32]: Review & Correct Results
        - paragraph [ref=e33]: Choose any completed round and correct a court score. RallyHub recalculates the session standings/podium and member leaderboard. Historical court assignments are not rewritten.
      - generic [ref=e34]:
        - button "Round 1" [ref=e35] [cursor=pointer]
        - button "Round 2" [ref=e36] [cursor=pointer]
        - button "Round 3" [ref=e37] [cursor=pointer]
        - button "Round 4" [ref=e38] [cursor=pointer]
        - button "Round 5" [ref=e39] [cursor=pointer]
        - button "Round 6" [ref=e40] [cursor=pointer]
        - button "Round 7" [ref=e41] [cursor=pointer]
        - button "Round 8" [ref=e42] [cursor=pointer]
        - button "Round 9" [ref=e43] [cursor=pointer]
        - button "Round 10" [ref=e44] [cursor=pointer]
        - button "Round 11" [ref=e45] [cursor=pointer]
        - button "Round 12" [ref=e46] [cursor=pointer]
      - generic [ref=e47]:
        - generic [ref=e48]:
          - generic [ref=e49]:
            - generic [ref=e50]: Court 1
            - generic [ref=e54]: SAVED
          - generic [ref=e55]:
            - generic [ref=e56]:
              - paragraph [ref=e57]: Team A
              - paragraph [ref=e58]: Player 01 & Player 08
              - paragraph [ref=e65]: WINNERS
            - textbox [disabled] [ref=e66]: "10"
          - generic [ref=e67]:
            - generic [ref=e68]:
              - paragraph [ref=e69]: Team B
              - paragraph [ref=e70]: Player 09 & Player 16
            - textbox [disabled] [ref=e71]: "5"
          - generic [ref=e72]: ✓ Saved 10–5 · Player 01 & Player 08 win 10–5
          - button "Edit result" [ref=e73] [cursor=pointer]
        - generic [ref=e74]:
          - generic [ref=e75]:
            - generic [ref=e76]: Court 2
            - generic [ref=e78]: SAVED
          - generic [ref=e79]:
            - generic [ref=e80]:
              - paragraph [ref=e81]: Team A
              - paragraph [ref=e82]: Player 02 & Player 07
              - paragraph [ref=e89]: WINNERS
            - textbox [disabled] [ref=e90]: "11"
          - generic [ref=e91]:
            - generic [ref=e92]:
              - paragraph [ref=e93]: Team B
              - paragraph [ref=e94]: Player 10 & Player 15
            - textbox [disabled] [ref=e95]: "6"
          - generic [ref=e96]: ✓ Saved 11–6 · Player 02 & Player 07 win 11–6
          - button "Edit result" [ref=e97] [cursor=pointer]
        - generic [ref=e98]:
          - generic [ref=e99]:
            - generic [ref=e100]: Court 3
            - generic [ref=e102]: SAVED
          - generic [ref=e103]:
            - generic [ref=e104]:
              - paragraph [ref=e105]: Team A
              - paragraph [ref=e106]: Player 03 & Player 06
              - paragraph [ref=e113]: WINNERS
            - textbox [disabled] [ref=e114]: "12"
          - generic [ref=e115]:
            - generic [ref=e116]:
              - paragraph [ref=e117]: Team B
              - paragraph [ref=e118]: Player 11 & Player 14
            - textbox [disabled] [ref=e119]: "2"
          - generic [ref=e120]: ✓ Saved 12–2 · Player 03 & Player 06 win 12–2
          - button "Edit result" [ref=e121] [cursor=pointer]
        - generic [ref=e122]:
          - generic [ref=e123]:
            - generic [ref=e124]: Court 4
            - generic [ref=e126]: SAVED
          - generic [ref=e127]:
            - generic [ref=e128]:
              - paragraph [ref=e129]: Team A
              - paragraph [ref=e130]: Player 04 & Player 05
              - paragraph [ref=e137]: WINNERS
            - textbox [disabled] [ref=e138]: "13"
          - generic [ref=e139]:
            - generic [ref=e140]:
              - paragraph [ref=e141]: Team B
              - paragraph [ref=e142]: Player 12 & Player 13
            - textbox [disabled] [ref=e143]: "3"
          - generic [ref=e144]: ✓ Saved 13–3 · Player 04 & Player 05 win 13–3
          - button "Edit result" [ref=e145] [cursor=pointer]
    - generic [ref=e147]:
      - button "Share Results" [ref=e148] [cursor=pointer]
      - button "Copy Results Link" [ref=e149] [cursor=pointer]
      - button "Email Players" [ref=e150] [cursor=pointer]
```

# Test source

```ts
  602 |   await page.getByRole('button',{name:'Player 17',exact:true}).click();
  603 |   await page.getByRole('button',{name:'Player 18',exact:true}).click();
  604 |   await page.getByTestId('kotc-create-session').click();
  605 |   await expect(page.getByTestId('kotc-round-editor')).toBeVisible({timeout:3000});
  606 | 
  607 |   for(let round=1;round<=12;round++){
  608 |     const start=page.getByTestId('kotc-start-round');
  609 |     await expect(start).toContainText(`START ROUND ${round}`);
  610 |     const startAt=Date.now();
  611 |     await start.click();
  612 |     await expect(start).toContainText('Starting…',{timeout:250});
  613 |     report.start_ack_ms.push(Date.now()-startAt);
  614 |     await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Starting Round ${round}`,{timeout:300});
  615 |     await sleep(180);
  616 |     await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:false}));});
  617 |     if(await page.getByTestId('kotc-host-action-status').isVisible().catch(()=>false)){
  618 |       await expect(page.getByTestId('kotc-host-action-status')).toContainText(`Starting Round ${round}`);
  619 |       await expect(start).toBeDisabled();
  620 |     }
  621 |     await expect(page.getByText(`Round ${round} — LIVE`)).toBeVisible({timeout:3500});
  622 |     report.start_confirm_ms.push(Date.now()-startAt);
  623 | 
  624 |     const hostClaimsBefore=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  625 |     for(let court=1;court<=4;court++){
  626 |       await page.getByTestId(`kotc-score-${court}-a`).fill(String(8+((round+court)%6)));
  627 |       await page.getByTestId(`kotc-score-${court}-b`).fill(String(2+((round*2+court)%5)));
  628 |     }
  629 |     const burstAt=Date.now();
  630 |     for(let court=1;court<=4;court++){
  631 |       const button=page.getByTestId(`kotc-complete-${court}`);
  632 |       const ackAt=Date.now();
  633 |       await button.click();
  634 |       await expect(button).toContainText('Saving…',{timeout:250});
  635 |       report.score_ack_ms.push(Date.now()-ackAt);
  636 |     }
  637 |     await sleep(220);
  638 |     await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});
  639 |     for(let court=1;court<=4;court++)await expect(page.getByTestId(`kotc-score-card-${court}`)).toContainText('Saved',{timeout:3000});
  640 |     report.score_burst_confirm_ms.push(Date.now()-burstAt);
  641 |     const hostClaimsAfter=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  642 |     expect(hostClaimsAfter,`Round ${round} must not claim scorer leases when no player scorer owns a court`).toBe(hostClaimsBefore);
  643 |     await expect(page.getByText(`All scores saved for Round ${round}`)).toBeVisible();
  644 | 
  645 |     if(round<12){
  646 |       const prepare=page.getByTestId('kotc-prepare-next-round');
  647 |       const prepAt=Date.now();
  648 |       await prepare.click();
  649 |       await expect(prepare).toContainText('Preparing Round…',{timeout:250});
  650 |       report.prepare_ack_ms.push(Date.now()-prepAt);
  651 |       await expect(page.getByTestId('kotc-host-action-status')).toContainText(new RegExp(`Checking Round ${round} scores|Preparing Round ${round+1}`),{timeout:300});
  652 |       await sleep(300);
  653 |       await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));});
  654 |       if(await page.getByTestId('kotc-host-action-status').isVisible().catch(()=>false)){
  655 |         await expect(page.getByTestId('kotc-host-action-status')).toContainText(new RegExp(`Checking Round ${round} scores|Preparing Round ${round+1}`));
  656 |         await expect(prepare).toBeDisabled();
  657 |       }
  658 |       await expect(page.getByTestId('kotc-start-round')).toContainText(`START ROUND ${round+1}`,{timeout:4000});
  659 |       report.prepare_confirm_ms.push(Date.now()-prepAt);
  660 |     }
  661 |   }
  662 | 
  663 |   const roundsBeforeFinish=model.rounds.length;
  664 |   const finish=page.getByTestId('kotc-finish-after-scores');
  665 |   await expect(finish).toBeVisible();
  666 |   const finishAt=Date.now();
  667 |   await finish.click();
  668 |   await expect(page.getByTestId('kotc-host-action-status')).toContainText('Finishing session',{timeout:300});
  669 |   await sleep(250);
  670 |   await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  671 |   await expect(page.getByTestId('kotc-host-action-status')).toContainText('Finishing session');
  672 |   await expect(page.getByTestId('kotc-podium')).toBeVisible({timeout:3500});
  673 |   report.finish_to_podium_ms=Date.now()-finishAt;
  674 |   expect(model.rounds.length,'Finish after scores must not manufacture an unused next round').toBe(roundsBeforeFinish);
  675 |   expect(model.rounds.length).toBe(12);
  676 | 
  677 |   const callsByName=Object.fromEntries([...new Set(model.calls.map(c=>c.name))].map(name=>[name,model.calls.filter(c=>c.name===name).length]));
  678 |   report.calls_by_name=callsByName;
  679 |   report.total_function_calls=model.calls.length;
  680 |   report.full_state_reads=callsByName.getKotcV2State||0;
  681 |   report.host_claim_score_calls=model.calls.filter(c=>c.body?.commandType==='host_claim_score').length;
  682 |   report.max_start_ack_ms=Math.max(...report.start_ack_ms);
  683 |   report.max_start_confirm_ms=Math.max(...report.start_confirm_ms);
  684 |   report.max_score_ack_ms=Math.max(...report.score_ack_ms);
  685 |   report.max_score_burst_confirm_ms=Math.max(...report.score_burst_confirm_ms);
  686 |   report.max_prepare_ack_ms=Math.max(...report.prepare_ack_ms);
  687 |   report.max_prepare_confirm_ms=Math.max(...report.prepare_confirm_ms);
  688 | 
  689 |   expect(report.max_start_ack_ms).toBeLessThanOrEqual(250);
  690 |   expect(report.max_score_ack_ms).toBeLessThanOrEqual(250);
  691 |   expect(report.max_prepare_ack_ms).toBeLessThanOrEqual(250);
  692 |   expect(report.max_start_confirm_ms).toBeLessThanOrEqual(2300);
  693 |   expect(report.max_score_burst_confirm_ms).toBeLessThanOrEqual(2300);
  694 |   expect(report.max_prepare_confirm_ms).toBeLessThanOrEqual(3500);
  695 |   expect(report.full_state_reads,'Normal live play must not poll/reload heavyweight state after successful actions').toBeLessThanOrEqual(3);
  696 |   expect(report.host_claim_score_calls,'Typing host scores must not create empty scorer-takeover traffic').toBe(0);
  697 |   expect(callsByName.startKotcRound).toBe(12);
  698 |   expect(callsByName.saveKotcScore).toBe(48);
  699 |   expect(callsByName.prepareKotcNextRound).toBe(11);
  700 |   expect(callsByName.endKotcSession).toBe(1);
  701 |   console.log('KOTC PRESSURE CALL BREAKDOWN',JSON.stringify(report.calls_by_name));
> 702 |   expect(report.total_function_calls,'12-round host journey should remain inside a compact API-call budget').toBeLessThanOrEqual(95);
      |                                                                                                              ^ Error: 12-round host journey should remain inside a compact API-call budget
  703 | 
  704 |   console.log(`KOTC HALL-PRESSURE SIMULATOR REPORT\n${JSON.stringify(report,null,2)}`);
  705 |   await testInfo.attach('kotc-hall-pressure-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  706 | });
  707 | 
```