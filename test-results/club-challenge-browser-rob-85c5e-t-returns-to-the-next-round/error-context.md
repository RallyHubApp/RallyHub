# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-challenge-browser-robot.spec.mjs >> Live recovery robot: stale timer is silent, break controls work, and host returns to the next round
- Location: e2e/club-challenge-browser-robot.spec.mjs:362:1

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: /^Start 20-min Break/ }) resolved to 2 elements:
    1) <button data-dynamic-content="true" data-collection-item-field="advanceActionLabel" data-source-location="src/components/clubchallenge/ClubChallengeView.jsx:2479:20" class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary…>Start 20-min Break · 4 scores pending</button> aka getByTestId('cc-sticky-host-bar').getByRole('button', { name: 'Start 20-min Break · 4 scores' })
    2) <button data-dynamic-content="true" data-collection-item-field="advanceActionLabel" data-source-location="src/components/clubchallenge/ClubChallengeView.jsx:2527:1193" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground sh…>Start 20-min Break · 4 scores pending</button> aka getByRole('button', { name: 'Start 20-min Break · 4 scores' }).nth(1)

Call log:
  - waiting for getByRole('button', { name: /^Start 20-min Break/ })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e11]:
          - paragraph [ref=e12]: RallyHub Interclub
          - paragraph [ref=e13]: "Interclub Challenge · Status: in progress"
        - generic [ref=e14]:
          - generic [ref=e15]:
            - generic [ref=e16]:
              - generic [ref=e17]: CL
              - generic [ref=e18]: Clare Blue
            - generic [ref=e19]: vs
            - generic [ref=e20]:
              - generic [ref=e21]: CL
              - generic [ref=e22]: Clare Gold
          - button "Live Event View" [ref=e23] [cursor=pointer]
          - button "Player Link / QR" [ref=e24] [cursor=pointer]
          - button "Print Sheets · Pack v1" [ref=e25] [cursor=pointer]
      - generic [ref=e27]:
        - button [ref=e28] [cursor=pointer]
        - button [ref=e33] [cursor=pointer]
        - button [ref=e38] [cursor=pointer]
        - button "4 Live Event" [active] [ref=e43] [cursor=pointer]:
          - generic [ref=e44]: "4"
          - text: Live Event
        - button "5 Simulator" [ref=e45] [cursor=pointer]:
          - generic [ref=e46]: "5"
          - text: Simulator
        - button "6 Results" [ref=e47] [cursor=pointer]:
          - generic [ref=e48]: "6"
          - text: Results
      - generic [ref=e50]:
        - generic [ref=e53]:
          - generic [ref=e54]: Round 6/12
          - generic [ref=e55]: 00:00
          - generic [ref=e56]:
            - strong [ref=e57]: 0/4
            - text: current scores saved
          - generic [ref=e58]:
            - button "Audio ON" [ref=e59] [cursor=pointer]
            - button "PA" [ref=e60] [cursor=pointer]
            - button "Reserve / Player Change" [ref=e61] [cursor=pointer]
            - button "Start 20-min Break · 4 scores pending" [ref=e62] [cursor=pointer]
        - generic [ref=e63]:
          - generic [ref=e64]:
            - generic [ref=e65]:
              - generic [ref=e66]:
                - paragraph [ref=e67]: Finish-on-Time Guide
                - generic [ref=e68]: RECOVERY NEEDED
              - paragraph [ref=e69]: Booked finish 09:07 AM · projected finish 09:09 AM · started 90 min late
            - generic [ref=e70]:
              - paragraph [ref=e71]: 3 min over
              - paragraph [ref=e72]: Recalculates throughout the event
          - generic [ref=e73]:
            - paragraph [ref=e74]: Recommended recovery
            - paragraph [ref=e75]: Use 1-minute changeovers (saves up to 6 min) · Treat the Showcase Final as optional unless time is recovered
        - generic [ref=e76]:
          - generic [ref=e77]:
            - generic [ref=e78]:
              - paragraph [ref=e79]: Live Event
              - paragraph [ref=e80]: Round 6 of 12
              - paragraph [ref=e81]: Clare Blue 0 – 0 Clare Gold
            - generic [ref=e82]:
              - generic [ref=e83]: 0W
              - generic [ref=e84]: 0D
              - generic [ref=e85]: 0W
          - generic [ref=e91]:
            - paragraph [ref=e92]: Break next · 20 minutes
            - paragraph [ref=e93]: Scheduled immediately after Round 6. Round 7 will wait until the host ends the break.
        - generic [ref=e94]:
          - generic [ref=e95]:
            - generic [ref=e96]:
              - paragraph [ref=e97]: Round at a Glance
              - paragraph [ref=e98]: On court, resting and up next — all in one place.
            - generic [ref=e99]: R6
          - generic [ref=e100]:
            - generic [ref=e101]:
              - paragraph [ref=e102]: Court 1 · NOW
              - paragraph [ref=e103]: Live Player 01 & Live Player 02
              - paragraph [ref=e104]: vs
              - paragraph [ref=e105]: Live Player 17 & Live Player 18
            - generic [ref=e106]:
              - paragraph [ref=e107]: Court 2 · NOW
              - paragraph [ref=e108]: Live Player 03 & Live Player 04
              - paragraph [ref=e109]: vs
              - paragraph [ref=e110]: Live Player 19 & Live Player 20
            - generic [ref=e111]:
              - paragraph [ref=e112]: Court 3 · NOW
              - paragraph [ref=e113]: Live Player 05 & Live Player 06
              - paragraph [ref=e114]: vs
              - paragraph [ref=e115]: Live Player 21 & Live Player 22
            - generic [ref=e116]:
              - paragraph [ref=e117]: Court 4 · NOW
              - paragraph [ref=e118]: Live Player 07 & Live Player 08
              - paragraph [ref=e119]: vs
              - paragraph [ref=e120]: Live Player 23 & Live Player 24
          - generic [ref=e121]:
            - paragraph [ref=e122]: Resting this round
            - generic [ref=e123]:
              - generic [ref=e124]:
                - paragraph [ref=e125]: Clare Blue
                - generic [ref=e126]:
                  - generic [ref=e127]: Live Player 09
                  - generic [ref=e128]: Live Player 10
                  - generic [ref=e129]: Live Player 11
                  - generic [ref=e130]: Live Player 12
                  - generic [ref=e131]: Live Player 13
                  - generic [ref=e132]: Live Player 14
                  - generic [ref=e133]: Live Player 15
                  - generic [ref=e134]: Live Player 16
              - generic [ref=e135]:
                - paragraph [ref=e136]: Clare Gold
                - generic [ref=e137]:
                  - generic [ref=e138]: Live Player 25
                  - generic [ref=e139]: Live Player 26
                  - generic [ref=e140]: Live Player 27
                  - generic [ref=e141]: Live Player 28
                  - generic [ref=e142]: Live Player 29
                  - generic [ref=e143]: Live Player 30
                  - generic [ref=e144]: Live Player 31
                  - generic [ref=e145]: Live Player 32
          - generic [ref=e146]:
            - paragraph [ref=e147]: Up next · Round 7
            - generic [ref=e148]:
              - generic [ref=e149]:
                - paragraph [ref=e150]: Court 1 · NEXT
                - paragraph [ref=e151]: Live Player 01 & Live Player 02
                - paragraph [ref=e152]: vs
                - paragraph [ref=e153]: Live Player 17 & Live Player 18
              - generic [ref=e154]:
                - paragraph [ref=e155]: Court 2 · NEXT
                - paragraph [ref=e156]: Live Player 03 & Live Player 04
                - paragraph [ref=e157]: vs
                - paragraph [ref=e158]: Live Player 19 & Live Player 20
              - generic [ref=e159]:
                - paragraph [ref=e160]: Court 3 · NEXT
                - paragraph [ref=e161]: Live Player 05 & Live Player 06
                - paragraph [ref=e162]: vs
                - paragraph [ref=e163]: Live Player 21 & Live Player 22
              - generic [ref=e164]:
                - paragraph [ref=e165]: Court 4 · NEXT
                - paragraph [ref=e166]: Live Player 07 & Live Player 08
                - paragraph [ref=e167]: vs
                - paragraph [ref=e168]: Live Player 23 & Live Player 24
        - generic [ref=e169]:
          - generic [ref=e170]:
            - generic [ref=e171]:
              - paragraph [ref=e172]: Round Timer
              - paragraph [ref=e173]: Round 6 of 12
            - generic [ref=e174]: play
          - paragraph [ref=e176]: 00:00
          - generic [ref=e177]:
            - generic [ref=e178]:
              - paragraph [ref=e179]: This round
              - paragraph [ref=e180]: Adjust before play or while paused.
            - generic [ref=e181]:
              - button "Reduce this round by one minute" [ref=e182] [cursor=pointer]
              - paragraph [ref=e183]: 10:00
              - button "Add one minute to this round" [ref=e184] [cursor=pointer]
          - generic [ref=e185]:
            - button "Start Changeover" [ref=e186] [cursor=pointer]
            - button "Changeover" [disabled]
            - button "+1 minute" [disabled]
            - group [ref=e187]:
              - generic "Round options" [ref=e188] [cursor=pointer]
        - generic [ref=e189]:
          - generic [ref=e190]:
            - generic [ref=e191]:
              - paragraph [ref=e192]: Round 6 Scores
              - paragraph [ref=e193]: Enter each court result as it comes in — you do not need to wait for the timer to finish.
            - generic [ref=e194]: 0/4 saved
          - generic [ref=e195]:
            - generic [ref=e196]:
              - generic [ref=e197]:
                - generic [ref=e198]: Court 1
                - generic [ref=e199]: R6
              - generic [ref=e200]:
                - generic [ref=e201]:
                  - generic [ref=e202]:
                    - paragraph [ref=e203]: Clare Blue
                    - paragraph [ref=e204]: Live Player 01 & Live Player 02
                  - textbox "Clare Blue score" [ref=e205]
                - generic [ref=e206]:
                  - generic [ref=e207]:
                    - paragraph [ref=e208]: Clare Gold
                    - paragraph [ref=e209]: Live Player 17 & Live Player 18
                  - textbox "Clare Gold score" [ref=e210]
              - button "Save Result" [disabled]
            - generic [ref=e211]:
              - generic [ref=e212]:
                - generic [ref=e213]: Court 2
                - generic [ref=e214]: R6
              - generic [ref=e215]:
                - generic [ref=e216]:
                  - generic [ref=e217]:
                    - paragraph [ref=e218]: Clare Blue
                    - paragraph [ref=e219]: Live Player 03 & Live Player 04
                  - textbox "Clare Blue score" [ref=e220]
                - generic [ref=e221]:
                  - generic [ref=e222]:
                    - paragraph [ref=e223]: Clare Gold
                    - paragraph [ref=e224]: Live Player 19 & Live Player 20
                  - textbox "Clare Gold score" [ref=e225]
              - button "Save Result" [disabled]
            - generic [ref=e226]:
              - generic [ref=e227]:
                - generic [ref=e228]: Court 3
                - generic [ref=e229]: R6
              - generic [ref=e230]:
                - generic [ref=e231]:
                  - generic [ref=e232]:
                    - paragraph [ref=e233]: Clare Blue
                    - paragraph [ref=e234]: Live Player 05 & Live Player 06
                  - textbox "Clare Blue score" [ref=e235]
                - generic [ref=e236]:
                  - generic [ref=e237]:
                    - paragraph [ref=e238]: Clare Gold
                    - paragraph [ref=e239]: Live Player 21 & Live Player 22
                  - textbox "Clare Gold score" [ref=e240]
              - button "Save Result" [disabled]
            - generic [ref=e241]:
              - generic [ref=e242]:
                - generic [ref=e243]: Court 4
                - generic [ref=e244]: R6
              - generic [ref=e245]:
                - generic [ref=e246]:
                  - generic [ref=e247]:
                    - paragraph [ref=e248]: Clare Blue
                    - paragraph [ref=e249]: Live Player 07 & Live Player 08
                  - textbox "Clare Blue score" [ref=e250]
                - generic [ref=e251]:
                  - generic [ref=e252]:
                    - paragraph [ref=e253]: Clare Gold
                    - paragraph [ref=e254]: Live Player 23 & Live Player 24
                  - textbox "Clare Gold score" [ref=e255]
              - button "Save Result" [disabled]
          - button "Start 20-min Break · 4 scores pending" [ref=e256] [cursor=pointer]
        - group [ref=e257]:
          - generic "PA & Announcements Open only when you need the microphone or an announcement. NOT TESTED" [ref=e258] [cursor=pointer]:
            - generic [ref=e259]:
              - paragraph [ref=e260]: PA & Announcements
              - paragraph [ref=e261]: Open only when you need the microphone or an announcement.
            - generic [ref=e262]: NOT TESTED
        - group [ref=e266]:
          - generic [ref=e268] [cursor=pointer]:
            - paragraph [ref=e269]: Player Changes & Reserves
            - paragraph [ref=e270]: Quick reserve handover, injury, withdrawal, replacement or late arrival.
        - group [ref=e273]:
          - generic [ref=e275] [cursor=pointer]:
            - paragraph [ref=e276]: Court & Time Changes
            - paragraph [ref=e277]: Use this if you lose or gain a court, or if less event time remains than planned.
  - region "Notifications alt+T"
```

# Test source

```ts
  271 |   const fnBeforeSound=model.calls.length;await page.getByTestId('cc-prestart-sound-check').click();await expect(page.getByTestId('cc-prestart-sound-check')).toContainText('Test Sound Again ✓',{timeout:800});await expect.poll(async()=>await page.evaluate(()=>window.__ccDevice.speech.length)).toBeGreaterThan(0);expect(await page.evaluate(()=>window.__rallyhubAudioContext?.state)).toBe('running');const soundCalls=model.calls.slice(fnBeforeSound).map(c=>c.name);expect(soundCalls.filter(n=>n==='generateHallSpeech').length).toBeLessThanOrEqual(1);report.sound_check_base44_calls=soundCalls.filter(n=>n==='generateHallSpeech').length;report.local_audio_unlocked=true;
  272 | 
  273 |   const startBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length;
  274 |   started=Date.now();await page.getByTestId('cc-start-event').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting Interclub Challenge… command sent')).toBeVisible({timeout:300});metric(report,'event_start_ack_ms',Date.now()-started,250);await expect(page.getByText('Round at a Glance')).toBeVisible({timeout:2000});metric(report,'event_start_to_live_ms',Date.now()-started,1800);expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length-startBefore).toBe(1);report.start_double_tap_calls=1;
  275 |   await expect(page.getByText('Resting this round')).toBeVisible();await expect(page.getByText('Up next · Round 2')).toBeVisible();await expect(page.getByText('scores saved')).toBeVisible();await expect(page.getByText('ready',{exact:true})).toBeVisible();await expect(page.getByText('10:00').first()).toBeVisible();await expect(page.getByRole('button',{name:'Changeover',exact:true})).toBeDisabled();await expect(page.getByText('Finish-on-Time Guide')).toBeVisible();await expect(page.getByText('RECOVERY NEEDED')).toBeVisible();await expectNoHorizontalOverflow(page);report.initial_timer_ready=true;report.finish_on_time_recovery_visible=true;
  276 |   const hostBar=page.getByTestId('cc-sticky-host-bar');await expect(hostBar).toBeVisible();await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await expect(hostBar).toHaveAttribute('data-pinned','true',{timeout:1000});const hostBarTop=await hostBar.evaluate(el=>Math.round(el.getBoundingClientRect().top));expect(hostBarTop).toBeGreaterThanOrEqual(60);expect(hostBarTop).toBeLessThanOrEqual(80);report.host_bar_pinned=true;await page.evaluate(()=>window.scrollTo(0,0));
  277 | 
  278 |   const timerBefore=model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length;
  279 |   started=Date.now();await page.getByTestId('cc-timer-start-play').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting play… command sent')).toBeVisible({timeout:300});metric(report,'timer_start_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-timer-pause')).toBeEnabled({timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length-timerBefore).toBe(1);const device=await page.evaluate(()=>window.__ccDevice);expect(device.wakeRequests).toBeGreaterThan(0);expect(device.speech.some(x=>x.text==='Round 1. Round 1 starting now.')).toBe(true);expect(device.speech.some(x=>/Round 1 starting now\. Round 1 starting now\./i.test(x.text))).toBe(false);expect(device.speech.some(x=>/One minute remaining|Thirty seconds|Ten seconds/i.test(x.text))).toBe(false);report.timer_double_tap_calls=1;report.start_announcement_full=true;report.legacy_warnings_removed=true;
  280 |   await page.getByRole('button',{name:'Audio ON',exact:true}).click();await expect(page.getByRole('button',{name:'Audio OFF',exact:true})).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('cc-audio-muted'))).toBe('true');await page.getByRole('button',{name:'Audio OFF',exact:true}).click();await expect(page.getByRole('button',{name:'Audio ON',exact:true})).toBeVisible();report.audio_toggle_persistent=true;
  281 | 
  282 |   expect(await page.getByTestId('cc-score-r1-c1-a').getAttribute('maxlength')).toBe('2');await page.getByTestId('cc-score-r1-c1-a').fill('11');await page.getByTestId('cc-score-r1-c1-b').fill('8');model.rateLimitFailures.saveClubChallengeScore=1;started=Date.now();await page.getByTestId('cc-save-score-r1-c1').click();await expect(page.getByTestId('cc-score-card-r1-c1')).toContainText('Saved ·',{timeout:2200});metric(report,'single_score_save_with_rate_limit_retry_ms',Date.now()-started,2000);expect(model.calls.filter(c=>c.name==='saveClubChallengeScore'&&c.rateLimited).length).toBe(1);expect(model.calls.filter(c=>c.name==='saveClubChallengeScore'&&!c.rateLimited).length).toBe(1);report.base44_429_retry_recovered=true;
  283 | 
  284 |   const savedR1C1=model.matches.find(m=>m.round_number===1&&m.court_number===1);const outgoingName=savedR1C1.club_a_names[0];const historicalNames=[...savedR1C1.club_a_names];
  285 |   await page.getByRole('button',{name:'Reserve / Player Change',exact:true}).click();await expect(page.getByText('Player Changes & Reserves',{exact:true})).toBeVisible();await page.getByTestId('cc-replacement-outgoing').click();await page.getByRole('option',{name:new RegExp(`^${outgoingName.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')} ·`)}).click();await page.getByTestId('cc-replacement-name').fill('Replacement Test');
  286 |   const replaceBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length;started=Date.now();await page.getByTestId('cc-replace-player').click();await expect(page.getByText(new RegExp(`^Replacing .* with Replacement Test from Round 1… command sent$`))).toBeVisible({timeout:300});metric(report,'replacement_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-player-control-status')).toContainText('replaced by Replacement Test',{timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length-replaceBefore).toBe(1);expect(savedR1C1.club_a_names).toEqual(historicalNames);expect(model.matches.some(m=>m.round_number>1&&(m.club_a_names||[]).includes('Replacement Test'))).toBe(true);report.replacement_future_only=true;
  287 | 
  288 |   model.event.timer_state_json=JSON.stringify({phase:'play',running:false,remaining_seconds:0,started_at:null,round:1});model.event.timer_revision=Number(model.event.timer_revision||0)+1;
  289 |   await page.reload();await expect(page.getByTestId('cc-root')).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByRole('button',{name:'Prepare Round 2 · 3 scores pending'})).toBeVisible({timeout:1800});
  290 |   started=Date.now();await page.getByRole('button',{name:'Prepare Round 2 · 3 scores pending'}).click();await expect(page.getByText('Preparing Round 2… command sent')).toBeVisible({timeout:300});metric(report,'round_advance_ack_ms',Date.now()-started,350);await expect(page.getByText('Round 2/12',{exact:true})).toBeVisible({timeout:1800});await expect(page.getByText('Earlier scores still to enter')).toBeVisible();expect(model.calls.filter(c=>c.name==='updateClubChallengeRound').at(-1)?.body.allowPendingScores).toBe(true);report.next_round_before_scores=true;
  291 |   for(const court of [2,3,4]){await page.getByTestId(`cc-score-r1-c${court}-a`).fill('11');await page.getByTestId(`cc-score-r1-c${court}-b`).fill('7');await page.getByTestId(`cc-save-score-r1-c${court}`).click();await expect(page.getByTestId(`cc-score-card-r1-c${court}`)).toContainText('Saved ·',{timeout:1500});}
  292 |   await expect(page.getByText('Earlier scores still to enter')).toBeHidden({timeout:1800});await expect(page.getByText('ready',{exact:true})).toBeVisible();await expect(page.getByText('10:00').first()).toBeVisible();await expect(page.getByText('0/4').first()).toBeVisible();report.pending_scores_cleared_during_next_round=true;report.round_transition_timer_reset=true;
  293 | 
  294 |   await page.locator('#cc-court-time-controls > summary').click();await page.getByTestId('cc-courts-now').fill('3');await page.getByTestId('cc-minutes-remaining').fill('180');await page.getByTestId('cc-preview-schedule-change').click();await expect(page.getByText(/Proposed change:.*0 would be marked Not Played/)).toBeVisible();const scheduleBefore=model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length;started=Date.now();await page.getByTestId('cc-confirm-schedule-change').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Applying court & time changes… command sent')).toBeVisible({timeout:300});metric(report,'schedule_change_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-schedule-change-status')).toContainText('Schedule updated:',{timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length-scheduleBefore).toBe(1);expect(model.event.courts).toBe(3);expect(model.event.event_pack_stale).toBe(true);report.schedule_change_double_tap_calls=1;
  295 | 
  296 |   await page.getByRole('button',{name:'Live Event View'}).evaluate(el=>el.click());await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next')).toBeVisible();await expect(page.getByRole('button',{name:'Exit Display'})).toBeVisible();report.internal_hall_display=true;await page.getByRole('button',{name:'Exit Display'}).evaluate(el=>el.click());await expect(page.getByTestId('cc-tab-simulator')).toBeVisible({timeout:1500});
  297 | 
  298 |   await page.getByTestId('cc-tab-simulator').click();await expect(page.getByTestId('cc-populate-full')).toBeVisible();
  299 |   const populateBefore=model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length;started=Date.now();await page.getByTestId('cc-populate-full').click();await expect(page.getByText('Populating full TEST MODE event… one server command sent')).toBeVisible({timeout:300});metric(report,'full_test_ack_ms',Date.now()-started,250);await expect(page.getByText('Final Result')).toBeVisible({timeout:2200});metric(report,'full_test_to_results_ms',Date.now()-started,2000);expect(model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length-populateBefore).toBe(1);expect(model.matches.filter(m=>!m.is_showcase&&m.status==='completed').length).toBe(48);expect(model.matches.filter(m=>m.is_showcase&&m.status==='completed').length).toBe(1);expect(model.votes.length).toBe(8);report.full_population_browser_calls=1;
  300 |   await expect(page.getByText('Player of the Tournament',{exact:true}).first()).toBeVisible();await expect(page.getByText('Club A Test 01',{exact:true}).first()).toBeVisible();await expectNoHorizontalOverflow(page);
  301 | 
  302 |   await page.getByTestId('cc-tab-draw').click();await expect(page.getByText('Round 12',{exact:true})).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByText('Round at a Glance')).toBeVisible();report.revisit_populated_screens=true;
  303 | 
  304 |   report.total_function_calls=model.calls.length;report.normal_matches=model.matches.filter(m=>!m.is_showcase).length;report.participants=model.participants.length;
  305 |   console.log(`CLUB CHALLENGE HOST ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-host-robot-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  306 | });
  307 | 
  308 | test('Club Challenge public voter robot: one browser ballot across both teams',async({page},testInfo)=>{
  309 |   const participants=[
  310 |     {id:'a1',side:'club_a',display_name:'Aoife M.'},{id:'a2',side:'club_a',display_name:'Brian K.'},{id:'b1',side:'club_b',display_name:'Cara D.'},{id:'b2',side:'club_b',display_name:'Declan R.'},
  311 |   ];
  312 |   const calls=[];
  313 |   await page.route('**/api/apps/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;if(path.includes('/analytics/'))return json(route,{});const marker=`/api/apps/${APP_ID}/functions/`;const i=path.indexOf(marker);if(i<0)return json(route,{});const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}calls.push({name,body});if(name==='getPublicClubChallengeVote')return json(route,{success:true,event:{club_a_name:'Clare',club_b_name:'Galway',pot_status:'open',pot_vote_closes_at:null,junior_display_mode:true,display_token:'ccd_0123456789abcdef0123456789abcdef'},participants});if(name==='castPublicClubChallengePotVote'){await sleep(420);if(!body.voterDeviceId||!body.clubANomineeParticipantId||!body.clubBNomineeParticipantId)return json(route,{error:'Both team choices and device are required.'});return json(route,{success:true,votesRecorded:2,sides:['club_a','club_b']});}return json(route,{});});
  314 |   await page.goto('/e2e/clubChallengePublicVoteHarness.html');await expect(page.getByText('Clare vs Galway')).toBeVisible();await expect(page.getByText('One ballot per phone/browser for this Interclub.')).toBeVisible();
  315 |   const combos=page.getByRole('combobox');await combos.nth(0).click();await page.getByRole('option',{name:'Aoife M.'}).click();await combos.nth(1).click();await page.getByRole('option',{name:'Cara D.'}).click();
  316 |   const castBefore=calls.filter(c=>c.name==='castPublicClubChallengePotVote').length;const started=Date.now();const cast=page.getByRole('button',{name:'Submit My Votes'});await cast.evaluate(el=>{el.click();el.click();});await expect(page.getByRole('button',{name:'Recording…'})).toBeVisible({timeout:250});await expect(page.getByText('Votes recorded')).toBeVisible({timeout:1500});expect(calls.filter(c=>c.name==='castPublicClubChallengePotVote').length-castBefore).toBe(1);await expect(page.getByRole('link',{name:'Back to Live Event'})).toHaveAttribute('href','https://rallyhub.ie/club-challenge/display/ccd_0123456789abcdef0123456789abcdef');const report={vote_ack_ms:Date.now()-started,cast_calls:1,two_team_ballot:true,device_identity:true,live_return_link:true};console.log(`CLUB CHALLENGE PUBLIC VOTE ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-vote-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  317 | });
  318 | 
  319 | test('Club Challenge public Hall Display robot: now/resting/next + disconnect truth',async({page},testInfo)=>{
  320 |   const participants=Array.from({length:20},(_,i)=>({id:`hp${i+1}`,display_name:`Player ${i+1}`,side:i<10?'club_a':'club_b',event_rank:(i%10)+1,roster_role:'rotation',reserve_activated:false,status:'active'}));
  321 |   const names=ids=>ids.map(id=>participants.find(p=>p.id===id)?.display_name||'Player');
  322 |   const current=[];for(let c=1;c<=4;c++){const ids=participants.slice((c-1)*4,c*4).map(p=>p.id);current.push({id:`h-r1-c${c}`,round_number:1,court_number:c,status:'scheduled',winner:'none',score_a:null,score_b:null,is_showcase:false,club_a_participant_ids:ids.slice(0,2),club_b_participant_ids:ids.slice(2),club_a_names:names(ids.slice(0,2)),club_b_names:names(ids.slice(2))});}
  323 |   const next=current.map((m,i)=>({...m,id:`h-r2-c${i+1}`,round_number:2,club_a_participant_ids:[participants[(i*4+1)%20].id,participants[(i*4+2)%20].id],club_b_participant_ids:[participants[(i*4+3)%20].id,participants[(i*4+4)%20].id,].filter(Boolean)})).map(m=>({...m,club_a_names:names(m.club_a_participant_ids),club_b_names:names(m.club_b_participant_ids)}));
  324 |   const payload={success:true,event:{id:'hall-event',status:'in_progress',club_a_name:'Clare',club_b_name:'Galway',current_round:1,timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:480,started_at:null,round:1}),timer_revision:1,junior_display_mode:true,win_points:2,draw_points:1,loss_points:0},participants,matches:[...current,...next]};
  325 |   await page.route('**/api/apps/**',async route=>{const path=new URL(route.request().url()).pathname;if(path.includes('/analytics/'))return json(route,{});if(path.includes('/functions/getPublicClubChallengeDisplay'))return json(route,payload);return json(route,{});});
  326 |   await page.goto('/e2e/clubChallengePublicDisplayHarness.html');await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next · Round 2')).toBeVisible();await expect(page.getByText('Player 17',{exact:true}).first()).toBeVisible();await page.getByRole('button',{name:'Teams'}).click();await expect(page.getByRole('heading',{name:'Teams'})).toBeVisible();await expect(page.getByText('Player 1',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Results'}).click();await expect(page.getByRole('heading',{name:'Match Results'})).toBeVisible();await page.getByRole('button',{name:'Live'}).click();await expect(page.getByText('On Court Now')).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('online')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeHidden({timeout:1200});await expectNoHorizontalOverflow(page);const report={now:true,resting:true,next:true,disconnect_warning:true,reconnect:true};console.log(`CLUB CHALLENGE PUBLIC DISPLAY ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-display-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  327 | });
  328 | 
  329 | test('Completed player link robot: Final landing, alphabetical teams, Event Info, Summary and integrated voting have no dead end',async({page},testInfo)=>{
  330 |   const participants=[
  331 |     {id:'a-z',side:'club_a',display_name:'Zara Player',event_rank:1,roster_role:'rotation',status:'active'},
  332 |     {id:'a-a',side:'club_a',display_name:'Aoife Player',event_rank:3,roster_role:'rotation',status:'active'},
  333 |     {id:'a-b',side:'club_a',display_name:'Brian Player',event_rank:2,roster_role:'rotation',status:'active'},
  334 |     {id:'b-e',side:'club_b',display_name:'Eoin Player',event_rank:1,roster_role:'rotation',status:'active'},
  335 |     {id:'b-c',side:'club_b',display_name:'Cara Player',event_rank:3,roster_role:'rotation',status:'active'},
  336 |     {id:'b-d',side:'club_b',display_name:'Declan Player',event_rank:2,roster_role:'rotation',status:'active'},
  337 |   ];
  338 |   const matches=[
  339 |     {id:'r1c1',round_number:1,court_number:1,status:'completed',winner:'club_a',score_a:11,score_b:8,is_showcase:false,club_a_names:['Aoife Player','Brian Player'],club_b_names:['Cara Player','Declan Player'],club_a_participant_ids:['a-a','a-b'],club_b_participant_ids:['b-c','b-d']},
  340 |     {id:'r2c1',round_number:2,court_number:1,status:'completed',winner:'club_b',score_a:7,score_b:11,is_showcase:false,club_a_names:['Zara Player','Aoife Player'],club_b_names:['Eoin Player','Cara Player'],club_a_participant_ids:['a-z','a-a'],club_b_participant_ids:['b-e','b-c']},
  341 |     {id:'r2c2',round_number:2,court_number:2,status:'completed',winner:'club_a',score_a:11,score_b:9,is_showcase:false,club_a_names:['Brian Player','Zara Player'],club_b_names:['Declan Player','Eoin Player'],club_a_participant_ids:['a-b','a-z'],club_b_participant_ids:['b-d','b-e']},
  342 |   ];
  343 |   const event={id:'completed-player-link',status:'completed',club_a_name:'Banner Strikers',club_b_name:'Banner Smashers',current_round:2,planned_rounds:2,courts:2,timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:0,started_at:null,round:2}),play_minutes:10,changeover_minutes:2,normal_match_type:'timed',timed_draws_allowed:true,include_break:false,pot_enabled:true,pot_status:'open',pot_voting_token:'ccv_integrated_test',pot_vote_closes_at:null,win_points:2,draw_points:1,loss_points:0};
  344 |   const calls=[];
  345 |   await page.route('**/api/apps/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;if(path.includes('/analytics/'))return json(route,{});const marker=`/api/apps/${APP_ID}/functions/`;const i=path.indexOf(marker);if(i<0)return json(route,{});const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}calls.push({name,body});if(name==='getPublicClubChallengeDisplay')return json(route,{success:true,event,participants,matches});if(name==='castPublicClubChallengePotVote'){await sleep(220);return json(route,{success:true,votesRecorded:2,sides:['club_a','club_b']});}return json(route,{});});
  346 |   await page.goto('/e2e/clubChallengePublicDisplayHarness.html');
  347 |   await expect(page.getByText('Final Result',{exact:true})).toBeVisible();
  348 |   await expect(page.getByRole('button',{name:'Final',exact:true})).toBeVisible();
  349 | 
  350 |   await page.getByRole('button',{name:'Teams',exact:true}).click();await expect(page.getByRole('heading',{name:'Teams'})).toBeVisible();
  351 |   const aTeam=page.getByRole('heading',{name:'Banner Strikers'}).locator('xpath=../..');const aText=await aTeam.innerText();expect(aText.indexOf('Aoife Player')).toBeLessThan(aText.indexOf('Brian Player'));expect(aText.indexOf('Brian Player')).toBeLessThan(aText.indexOf('Zara Player'));
  352 | 
  353 |   await page.getByRole('button',{name:'Event Info',exact:true}).click();await expect(page.getByRole('heading',{name:'Interclub Event Information'})).toBeVisible();await expect(page.getByText('2 courts, 2 rounds')).toBeVisible();await expect(page.getByRole('heading',{name:'Interclub Etiquette'})).toBeVisible();
  354 | 
  355 |   await page.getByRole('button',{name:'Summary',exact:true}).click();await expect(page.getByRole('heading',{name:'Interclub Summary'})).toBeVisible();await expect(page.getByRole('heading',{name:'Round 1'})).toBeVisible();await expect(page.getByRole('heading',{name:'Round 2'})).toBeVisible();
  356 | 
  357 |   await page.getByRole('button',{name:'Vote · Open',exact:true}).click();await expect(page.getByRole('heading',{name:'Players of the Tournament'})).toBeVisible();const combos=page.getByRole('combobox');await combos.nth(0).selectOption('a-a');await combos.nth(1).selectOption('b-c');const before=calls.filter(c=>c.name==='castPublicClubChallengePotVote').length;await page.getByRole('button',{name:'Submit My Votes'}).evaluate(el=>{el.click();el.click();});await expect(page.getByText('Votes recorded')).toBeVisible({timeout:1200});expect(calls.filter(c=>c.name==='castPublicClubChallengePotVote').length-before).toBe(1);
  358 |   await page.getByRole('button',{name:'Back to Summary'}).click();await expect(page.getByRole('heading',{name:'Interclub Summary'})).toBeVisible();await page.getByRole('button',{name:'Final',exact:true}).click();await expect(page.getByText('Final Result',{exact:true})).toBeVisible();await expectNoHorizontalOverflow(page);
  359 |   const report={final_landing:true,alphabetical_public_teams:true,event_info:true,round_summary:true,integrated_vote:true,return_to_summary:true,return_to_final:true};console.log(`COMPLETED PLAYER LINK ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('completed-player-link-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  360 | });
  361 | 
  362 | test('Live recovery robot: stale timer is silent, break controls work, and host returns to the next round',async({page},testInfo)=>{
  363 |   const model=createClubChallengeModel();await installHallDeviceMocks(page);await installClubChallengeBackend(page,model);
  364 |   const now=new Date(),start=new Date(Date.now()-90*60000);model.tournament.start_date=now.toISOString().slice(0,10);model.tournament.status='In Progress';
  365 |   const hhmm=`${String(start.getHours()).padStart(2,'0')}:${String(start.getMinutes()).padStart(2,'0')}`;
  366 |   model.event={id:'cc-live-recovery',tenant_id:model.tournament.tenant_id,tournament_id:model.tournament.id,club_a_name:'Clare Blue',club_b_name:'Clare Gold',status:'in_progress',current_round:6,planned_rounds:12,courts:4,available_minutes:180,scheduled_start_time:hhmm,actual_started_at:now.toISOString(),play_minutes:10,changeover_minutes:2,include_break:true,break_minutes:20,break_after_round:6,normal_match_type:'timed',timed_draws_allowed:true,showcase_enabled:true,pot_enabled:false,win_points:2,draw_points:1,loss_points:0,timer_revision:2,timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:0,started_at:null,round:6}),event_pack_stale:false};
  367 |   model.participants=Array.from({length:32},(_,i)=>({id:`lrp-${i+1}`,challenge_event_id:model.event.id,tournament_id:model.tournament.id,side:i<16?'club_a':'club_b',display_name:`Live Player ${String(i+1).padStart(2,'0')}`,event_rank:(i%16)+1,roster_role:'rotation',status:'active',available_from_round:1}));
  368 |   for(const round of [6,7])for(let court=1;court<=4;court++){const ai=(court-1)*2,bi=16+(court-1)*2;model.matches.push({id:`lr-r${round}-c${court}`,challenge_event_id:model.event.id,tournament_id:model.tournament.id,round_number:round,court_number:court,status:'scheduled',winner:'none',revision:0,is_showcase:false,club_a_participant_ids:[model.participants[ai].id,model.participants[ai+1].id],club_b_participant_ids:[model.participants[bi].id,model.participants[bi+1].id],club_a_names:[model.participants[ai].display_name,model.participants[ai+1].display_name],club_b_names:[model.participants[bi].display_name,model.participants[bi+1].display_name]});}
  369 |   await page.goto('/e2e/clubChallengeHarness.html');await page.getByTestId('cc-tab-live').click();await expect(page.getByText('Round at a Glance')).toBeVisible();await expect(page.getByText('RECOVERY NEEDED')).toBeVisible();
  370 |   await page.waitForTimeout(400);expect((await page.evaluate(()=>window.__ccDevice.speech)).length).toBe(0);
> 371 |   await page.getByRole('button',{name:/^Start 20-min Break/}).click();await expect(page.getByText('Break now',{exact:false}).first()).toBeVisible({timeout:1600});await expect(page.getByText('20:00').first()).toBeVisible();
      |                                                               ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: /^Start 20-min Break/ }) resolved to 2 elements:
  372 |   const fiveButtons=page.getByRole('button',{name:'5 min'});await expect(fiveButtons).toHaveCount(4);await fiveButtons.nth(0).click();await expect(page.getByText('15:00').first()).toBeVisible({timeout:1200});await fiveButtons.nth(1).click();await expect(page.getByText('20:00').first()).toBeVisible({timeout:1200});
  373 |   await page.getByRole('button',{name:/End Break Early/}).first().click();await expect(page.getByText('Round 7/12',{exact:true})).toBeVisible({timeout:1600});await expect(page.getByText('Up next · Round 8')).toBeVisible();await expectNoHorizontalOverflow(page);
  374 |   const report={historic_refresh_silent:true,recovery_guide:true,break_minus:true,break_plus:true,end_break_to_next_round:true};console.log(`LIVE RECOVERY ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('live-recovery-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  375 | });
```