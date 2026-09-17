# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-challenge-browser-robot.spec.mjs >> Club Challenge mobile host robot: setup → practice → draw → live → full result
- Location: e2e/club-challenge-browser-robot.spec.mjs:233:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('On Court Now')
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('On Court Now') with timeout 3000ms
  - waiting for getByText('On Court Now')

```

```yaml
- main:
  - img
  - paragraph: RallyHub Interclub
  - paragraph: "Interclub Challenge · Status: in progress"
  - text: CL Clare Pickleball Club vs GA Galway Pickleball
  - button "Hall Display"
  - button "Public Links / QR"
  - button "Print Event Pack · OUT OF DATE"
  - button "Setup":
    - img
    - text: Setup
  - button "Teams":
    - img
    - text: Teams
  - button "Draw":
    - img
    - text: Draw
  - button "4 Live Event"
  - button "5 Simulator"
  - button "6 Results"
  - text: Round 2/16 10:00
  - strong: 0/3
  - text: scores saved
  - button "PA":
    - img
    - text: PA
  - button "Players":
    - img
    - text: Players
  - button "3 scores to save" [disabled]
  - paragraph: Live Event
  - paragraph: Round 2 of 16
  - paragraph: Clare Pickleball Club 8 – 0 Galway Pickleball
  - text: 4W 0D 0W
  - paragraph: Round at a Glance
  - paragraph: On court, resting and up next — all in one place.
  - text: R2
  - paragraph: Court 1 · NOW
  - paragraph: Club A Test 09 & Club A Test 10
  - paragraph: vs
  - paragraph: Club B Test 09 & Club B Test 10
  - paragraph: Court 2 · NOW
  - paragraph: Club A Test 11 & Club A Test 12
  - paragraph: vs
  - paragraph: Club B Test 11 & Club B Test 12
  - paragraph: Court 3 · NOW
  - paragraph: Club A Test 13 & Club A Test 14
  - paragraph: vs
  - paragraph: Club B Test 13 & Club B Test 14
  - paragraph: Resting this round
  - paragraph: Clare Pickleball Club
  - text: Replacement Test Club A Test 01 Club A Test 03 Club A Test 04 Club A Test 05 Club A Test 06 Club A Test 07 Club A Test 08 Club A Test 15 Club A Test 16
  - paragraph: Galway Pickleball
  - text: Club B Test 01 Club B Test 02 Club B Test 03 Club B Test 04 Club B Test 05 Club B Test 06 Club B Test 07 Club B Test 08 Club B Test 15 Club B Test 16
  - paragraph: Up next · Round 3
  - paragraph: Court 1 · NEXT
  - paragraph: Club A Test 15 & Club A Test 16
  - paragraph: vs
  - paragraph: Club B Test 15 & Club B Test 16
  - paragraph: Court 2 · NEXT
  - paragraph: Replacement Test & Club A Test 03
  - paragraph: vs
  - paragraph: Club B Test 05 & Club B Test 07
  - paragraph: Court 3 · NEXT
  - paragraph: Club A Test 01 & Club A Test 04
  - paragraph: vs
  - paragraph: Club B Test 06 & Club B Test 08
  - paragraph: Round Timer
  - paragraph: Round 2 of 16
  - text: ready
  - paragraph: 10:00
  - paragraph: This round
  - paragraph: Adjust before play or while paused.
  - button "Reduce this round by one minute":
    - img
  - paragraph: 10:00
  - button "Add one minute to this round":
    - img
  - button "Start Play":
    - img
    - text: Start Play
  - button "Changeover" [disabled]
  - button "+1 minute" [disabled]
  - group: Round options
  - paragraph: Round 2 Scores
  - paragraph: Enter each court result as it comes in — you do not need to wait for the timer to finish.
  - text: 0/3 saved Court 1 R2
  - paragraph: Clare Pickleball Club
  - paragraph: Club A Test 09 & Club A Test 10
  - textbox "Clare Pickleball Club score"
  - paragraph: Galway Pickleball
  - paragraph: Club B Test 09 & Club B Test 10
  - textbox "Galway Pickleball score"
  - button "Save Result" [disabled]
  - text: Court 2 R2
  - paragraph: Clare Pickleball Club
  - paragraph: Club A Test 11 & Club A Test 12
  - textbox "Clare Pickleball Club score"
  - paragraph: Galway Pickleball
  - paragraph: Club B Test 11 & Club B Test 12
  - textbox "Galway Pickleball score"
  - button "Save Result" [disabled]
  - text: Court 3 R2
  - paragraph: Clare Pickleball Club
  - paragraph: Club A Test 13 & Club A Test 14
  - textbox "Clare Pickleball Club score"
  - paragraph: Galway Pickleball
  - paragraph: Club B Test 13 & Club B Test 14
  - textbox "Galway Pickleball score"
  - button "Save Result" [disabled]
  - button "Save all 3 results to complete Round 2" [disabled]
  - group:
    - paragraph: PA & Announcements
    - paragraph: Open only when you need the microphone or an announcement.
    - text: AUDIO READY
    - img
  - group:
    - paragraph: Player Controls
    - paragraph: Injury, withdrawal, replacement or late arrival.
    - img
    - paragraph: Replace / Withdraw a Player
    - paragraph: Completed results stay unchanged. RallyHub updates future unplayed fixtures only.
    - text: Player leaving
    - combobox: Choose player
    - text: Registered reserve / available player
    - combobox [disabled]: Type a replacement manually
    - text: Replacement name
    - textbox "Name"
    - text: Reason
    - combobox: Withdrawn / unavailable
    - text: Gender
    - combobox: Inherit outgoing player
    - text: Note
    - textbox "Optional note"
    - button "Replace from Round 2" [disabled]
    - button "Continue Short · No Replacement" [disabled]
    - text: Club A Test 02 replaced by Replacement Test from Round 1. 5 future fixtures updated; completed results unchanged.
    - paragraph: Late Arrival
    - paragraph: Set the first round a player is available. RallyHub will flag that the remaining draw may need review.
    - combobox: Player
    - spinbutton: "1"
    - button "Set Round" [disabled]
  - group:
    - paragraph: Court & Time Changes
    - paragraph: Use this if you lose or gain a court, or if less event time remains than planned.
    - img
    - paragraph: Preview the impact before changing anything
    - paragraph: Enter the courts actually available now and the minutes remaining. RallyHub will show how many future matches still fit, which matches would move, and whether any would have to be marked Not Played. Completed results are never changed.
    - text: Courts available now
    - spinbutton "3"
    - text: Minutes remaining
    - spinbutton "e.g. 60": "180"
    - button "Preview Impact"
    - text: "Schedule updated: 41 future fixture positions changed; 0 marked Not Played. Event Pack marked out of date."
- region "Notifications alt+T":
  - list:
    - listitem:
      - img
      - text: "Schedule updated: 41 future fixture positions changed; 0 marked Not Played. Event Pack marked out of date."
    - listitem:
      - img
      - text: 44 future matches fit; 0 would be marked Not Played. Review before confirming.
    - listitem:
      - img
      - text: Round 2 ready · 4 courts · 16 players resting
    - listitem:
      - img
      - text: Score saved
    - listitem:
      - img
      - text: Score saved
    - listitem:
      - img
      - text: Score saved
    - listitem:
      - img
      - text: Club A Test 02 replaced by Replacement Test from Round 1. 5 future fixtures updated; completed results unchanged.
    - listitem:
      - img
      - text: Score saved
    - listitem:
      - img
      - text: Interclub Challenge started
```

# Test source

```ts
  178 |     }
  179 |     if (name === 'castClubChallengePotVote') {
  180 |       await sleep(180); if(body.voterParticipantId===body.nomineeParticipantId)return {error:'Players cannot vote for themselves.'};if(model.votes.some(v=>v.voter_participant_id===body.voterParticipantId&&v.valid!==false))return {error:'This player has already voted.'};const v={id:id('vote'),tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,voter_identity_key:`participant:${body.voterParticipantId}`,voter_participant_id:body.voterParticipantId,nominee_participant_id:body.nomineeParticipantId,access_route:'logged_in',cast_at:now(),valid:true};model.votes.push(v);return {success:true,vote:v};
  181 |     }
  182 | 
  183 |     if (name === 'manageClubChallengePublicLinks') {
  184 |       return {success:true,displayToken:'e2e-display-token',votingToken:'e2e-vote-token',voterCodes:model.participants.map(p=>({participantId:p.id,displayName:p.display_name,code:p.guest_access_token||'TESTCODE'}))};
  185 |     }
  186 | 
  187 |     return { success:true };
  188 |   };
  189 | 
  190 |   return model;
  191 | }
  192 | 
  193 | async function installClubChallengeBackend(page, model) {
  194 |   await page.route('**/api/apps/**', async route => {
  195 |     const req=route.request(), url=new URL(req.url()), path=url.pathname;
  196 |     if(path.includes('/analytics/'))return json(route,{});
  197 |     if(path.endsWith('/entities/User/me'))return json(route,model.user);
  198 |     const fnMarker=`/api/apps/${APP_ID}/functions/`;
  199 |     const fnIndex=path.indexOf(fnMarker);
  200 |     if(fnIndex>=0){const name=decodeURIComponent(path.slice(fnIndex+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}return json(route,await model.handleFunction(name,body));}
  201 |     const entityMarker=`/api/apps/${APP_ID}/entities/`;
  202 |     const entityIndex=path.indexOf(entityMarker);
  203 |     if(entityIndex>=0){const rest=path.slice(entityIndex+entityMarker.length);const [entity,recordId]=rest.split('/').map(decodeURIComponent);let body={};try{body=req.postDataJSON()||{};}catch{}
  204 |       if(req.method()==='GET')return json(route,model.entityList(entity));
  205 |       if(req.method()==='POST')return json(route,model.createEntity(entity,body));
  206 |       if(['PUT','PATCH'].includes(req.method()))return json(route,model.updateEntity(entity,recordId,body));
  207 |       if(req.method()==='DELETE')return json(route,{});
  208 |     }
  209 |     return json(route,{});
  210 |   });
  211 | }
  212 | 
  213 | async function installHallDeviceMocks(page){
  214 |   await page.addInitScript(()=>{
  215 |     window.__ccDevice={audioSignals:0,speech:[],wakeRequests:0,wakeReleases:0,vibrations:0};
  216 |     class FakeParam{setValueAtTime(){} exponentialRampToValueAtTime(){}}
  217 |     class FakeOsc{constructor(){this.frequency=new FakeParam();this.type='square';}connect(){}start(){window.__ccDevice.audioSignals++;}stop(){}}
  218 |     class FakeGain{constructor(){this.gain=new FakeParam();}connect(){}}
  219 |     class FakeAudioContext{constructor(){this.state='suspended';this.currentTime=0;this.destination={};}createOscillator(){return new FakeOsc();}createGain(){return new FakeGain();}async resume(){this.state='running';}}
  220 |     Object.defineProperty(window,'AudioContext',{configurable:true,writable:true,value:FakeAudioContext});Object.defineProperty(window,'webkitAudioContext',{configurable:true,writable:true,value:FakeAudioContext});
  221 |     Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:class{constructor(text){this.text=text;this.volume=1;this.lang='';this.rate=1;this.pitch=1;this.voice=null;}}});
  222 |     Object.defineProperty(window,'speechSynthesis',{configurable:true,writable:true,value:{getVoices:()=>[{name:'Moira',lang:'en-IE'}],cancel(){},resume(){},speak(u){window.__ccDevice.speech.push({text:u.text,volume:u.volume,lang:u.lang});},addEventListener(){},removeEventListener(){}}});
  223 |     Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{window.__ccDevice.wakeRequests++;return{release:async()=>{window.__ccDevice.wakeReleases++;}};}}});
  224 |     Object.defineProperty(navigator,'vibrate',{configurable:true,value:()=>{window.__ccDevice.vibrations++;return true;}});
  225 |   });
  226 | }
  227 | 
  228 | function metric(report,name,value,max){report[name]=value;expect(value,`${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);}
  229 | async function expectNoHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,'mobile page should not require horizontal body scrolling').toBeLessThanOrEqual(1);}
  230 | 
  231 | test.use({ viewport:{width:390,height:844} });
  232 | 
  233 | test('Club Challenge mobile host robot: setup → practice → draw → live → full result',async({page},testInfo)=>{
  234 |   const model=createClubChallengeModel();const report={};await installHallDeviceMocks(page);await installClubChallengeBackend(page,model);page.on('dialog',d=>d.accept());
  235 |   await page.goto('/e2e/clubChallengeHarness.html');
  236 |   await expect(page.getByTestId('cc-root')).toBeVisible();
  237 |   await expect(page.getByText('Estimated event duration')).toBeVisible();
  238 |   await expect(page.getByText('2h 44m')).toBeVisible();
  239 |   await expectNoHorizontalOverflow(page);
  240 | 
  241 |   let started=Date.now();await page.getByTestId('cc-save-setup').click();await expect(page.getByTestId('cc-load-practice')).toBeVisible({timeout:1800});metric(report,'setup_to_teams_ms',Date.now()-started,1500);
  242 |   expect(model.event?.status).toBe('draft');
  243 | 
  244 |   started=Date.now();await page.getByTestId('cc-load-practice').click();await expect(page.getByText('Club A Test 01')).toBeVisible({timeout:1800});metric(report,'practice_roster_ms',Date.now()-started,1500);expect(model.participants.length).toBe(32);
  245 |   await expect(page.getByText('12').first()).toBeVisible();await expectNoHorizontalOverflow(page);
  246 | 
  247 |   const reorderBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='reorder').length;
  248 |   started=Date.now();await page.getByRole('button',{name:'Move Club A Test 02 up'}).click();await expect(page.getByText('Saving player ranking… one command sent')).toBeVisible({timeout:300});metric(report,'ranking_ack_ms',Date.now()-started,350);await expect(page.getByText('Saving player ranking… one command sent')).toBeHidden({timeout:1800});
  249 |   expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='reorder').length-reorderBefore).toBe(1);report.ranking_browser_calls=1;
  250 | 
  251 |   const drawBefore=model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length;
  252 |   started=Date.now();await page.getByTestId('cc-generate-draw').click();await expect(page.getByText('Generating draw and fairness report… one command sent')).toBeVisible({timeout:300});metric(report,'draw_ack_ms',Date.now()-started,250);await expect(page.getByText('Fairness checks passed')).toBeVisible({timeout:2200});metric(report,'draw_to_review_ms',Date.now()-started,1800);expect(model.matches.filter(m=>!m.is_showcase).length).toBe(48);expect(new Set(model.matches.map(m=>m.round_number)).size).toBe(12);expect(model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length-drawBefore).toBe(1);report.draw_browser_calls=1;
  253 | 
  254 |   const approveBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length;
  255 |   started=Date.now();await page.getByTestId('cc-approve-draw').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Approving and locking draw… command sent')).toBeVisible({timeout:300});metric(report,'approve_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-prestart-sound-check')).toBeVisible({timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length-approveBefore).toBe(1);report.approve_double_tap_calls=1;
  256 | 
  257 |   const fnBeforeSound=model.calls.length;await page.getByTestId('cc-prestart-sound-check').click();await expect(page.getByTestId('cc-prestart-sound-check')).toContainText('Test Sound Again ✓',{timeout:800});await expect.poll(async()=>await page.evaluate(()=>window.__ccDevice.speech.length)).toBeGreaterThan(0);expect(await page.evaluate(()=>window.__rallyhubAudioContext?.state)).toBe('running');expect(model.calls.length).toBe(fnBeforeSound);report.sound_check_base44_calls=0;report.local_audio_unlocked=true;
  258 | 
  259 |   const startBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length;
  260 |   started=Date.now();await page.getByTestId('cc-start-event').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting Interclub Challenge… command sent')).toBeVisible({timeout:300});metric(report,'event_start_ack_ms',Date.now()-started,250);await expect(page.getByText('Round at a Glance')).toBeVisible({timeout:2000});metric(report,'event_start_to_live_ms',Date.now()-started,1800);expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length-startBefore).toBe(1);report.start_double_tap_calls=1;
  261 |   await expect(page.getByText('Resting this round')).toBeVisible();await expect(page.getByText('Up next · Round 2')).toBeVisible();await expect(page.getByText('scores saved')).toBeVisible();await expect(page.getByText('ready',{exact:true})).toBeVisible();await expect(page.getByText('10:00').first()).toBeVisible();await expect(page.getByRole('button',{name:'Changeover',exact:true})).toBeDisabled();await expectNoHorizontalOverflow(page);report.initial_timer_ready=true;
  262 |   const hostBar=page.getByTestId('cc-sticky-host-bar');await expect(hostBar).toBeVisible();await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await expect(hostBar).toHaveAttribute('data-pinned','true',{timeout:1000});const hostBarTop=await hostBar.evaluate(el=>Math.round(el.getBoundingClientRect().top));expect(hostBarTop).toBeGreaterThanOrEqual(60);expect(hostBarTop).toBeLessThanOrEqual(80);report.host_bar_pinned=true;await page.evaluate(()=>window.scrollTo(0,0));
  263 | 
  264 |   const timerBefore=model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length;
  265 |   started=Date.now();await page.getByTestId('cc-timer-start-play').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting play… command sent')).toBeVisible({timeout:300});metric(report,'timer_start_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-timer-pause')).toBeEnabled({timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length-timerBefore).toBe(1);const device=await page.evaluate(()=>window.__ccDevice);expect(device.wakeRequests).toBeGreaterThan(0);expect(device.speech.some(x=>/Start round/i.test(x.text))).toBe(true);report.timer_double_tap_calls=1;
  266 | 
  267 |   expect(await page.getByTestId('cc-score-r1-c1-a').getAttribute('maxlength')).toBe('2');await page.getByTestId('cc-score-r1-c1-a').fill('11');await page.getByTestId('cc-score-r1-c1-b').fill('8');started=Date.now();await page.getByTestId('cc-save-score-r1-c1').click();await expect(page.getByTestId('cc-score-card-r1-c1')).toContainText('Saved ·',{timeout:1500});metric(report,'single_score_save_ms',Date.now()-started,1200);
  268 | 
  269 |   const savedR1C1=model.matches.find(m=>m.round_number===1&&m.court_number===1);const outgoingName=savedR1C1.club_a_names[0];const historicalNames=[...savedR1C1.club_a_names];
  270 |   await page.getByRole('button',{name:'Players',exact:true}).click();await expect(page.getByText('Replace / Withdraw a Player')).toBeVisible();await page.getByTestId('cc-replacement-outgoing').click();await page.getByRole('option',{name:new RegExp(`^${outgoingName.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')} ·`)}).click();await page.getByTestId('cc-replacement-name').fill('Replacement Test');
  271 |   const replaceBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length;started=Date.now();await page.getByTestId('cc-replace-player').click();await expect(page.getByText('Applying player replacement from Round 1… command sent')).toBeVisible({timeout:300});metric(report,'replacement_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-player-control-status')).toContainText('replaced by Replacement Test',{timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length-replaceBefore).toBe(1);expect(savedR1C1.club_a_names).toEqual(historicalNames);expect(model.matches.some(m=>m.round_number>1&&(m.club_a_names||[]).includes('Replacement Test'))).toBe(true);report.replacement_future_only=true;
  272 | 
  273 |   for(const court of [2,3,4]){await page.getByTestId(`cc-score-r1-c${court}-a`).fill('11');await page.getByTestId(`cc-score-r1-c${court}-b`).fill('7');await page.getByTestId(`cc-save-score-r1-c${court}`).click();await expect(page.getByTestId(`cc-score-card-r1-c${court}`)).toContainText('Saved ·',{timeout:1500});}
  274 |   started=Date.now();await page.getByRole('button',{name:'Complete Round 1 & Go to Round 2'}).click();await expect(page.getByText('Preparing Round 2… command sent')).toBeVisible({timeout:300});metric(report,'round_advance_ack_ms',Date.now()-started,350);await expect(page.getByText('Round 2/12',{exact:true})).toBeVisible({timeout:1800});await expect(page.getByText('ready',{exact:true})).toBeVisible();await expect(page.getByText('10:00').first()).toBeVisible();await expect(page.getByText('0/4').first()).toBeVisible();report.round_transition_timer_reset=true;
  275 | 
  276 |   await page.locator('#cc-court-time-controls > summary').click();await page.getByTestId('cc-courts-now').fill('3');await page.getByTestId('cc-minutes-remaining').fill('180');await page.getByTestId('cc-preview-schedule-change').click();await expect(page.getByText(/Proposed change:.*0 would be marked Not Played/)).toBeVisible();const scheduleBefore=model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length;started=Date.now();await page.getByTestId('cc-confirm-schedule-change').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Applying court & time changes… command sent')).toBeVisible({timeout:300});metric(report,'schedule_change_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-schedule-change-status')).toContainText('Schedule updated:',{timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length-scheduleBefore).toBe(1);expect(model.event.courts).toBe(3);expect(model.event.event_pack_stale).toBe(true);report.schedule_change_double_tap_calls=1;
  277 | 
> 278 |   await page.getByRole('button',{name:'Hall Display'}).click({force:true});await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next')).toBeVisible();await expect(page.getByRole('button',{name:'Exit Display'})).toBeVisible();report.internal_hall_display=true;await page.getByRole('button',{name:'Exit Display'}).evaluate(el=>el.click());await expect(page.getByTestId('cc-tab-simulator')).toBeVisible({timeout:1500});
      |                                                                                                                         ^ Error: expect(locator).toBeVisible() failed
  279 | 
  280 |   await page.getByTestId('cc-tab-simulator').click();await expect(page.getByTestId('cc-populate-full')).toBeVisible();
  281 |   const populateBefore=model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length;started=Date.now();await page.getByTestId('cc-populate-full').click();await expect(page.getByText('Populating full TEST MODE event… one server command sent')).toBeVisible({timeout:300});metric(report,'full_test_ack_ms',Date.now()-started,250);await expect(page.getByText('Final Result')).toBeVisible({timeout:2200});metric(report,'full_test_to_results_ms',Date.now()-started,2000);expect(model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length-populateBefore).toBe(1);expect(model.matches.filter(m=>!m.is_showcase&&m.status==='completed').length).toBe(48);expect(model.matches.filter(m=>m.is_showcase&&m.status==='completed').length).toBe(1);expect(model.votes.length).toBe(8);report.full_population_browser_calls=1;
  282 |   await expect(page.getByText('Player of the Tournament',{exact:true}).first()).toBeVisible();await expect(page.getByText('Club A Test 01',{exact:true}).first()).toBeVisible();await expectNoHorizontalOverflow(page);
  283 | 
  284 |   await page.getByTestId('cc-tab-draw').click();await expect(page.getByText('Round 12',{exact:true})).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByText('Round at a Glance')).toBeVisible();report.revisit_populated_screens=true;
  285 | 
  286 |   report.total_function_calls=model.calls.length;report.normal_matches=model.matches.filter(m=>!m.is_showcase).length;report.participants=model.participants.length;
  287 |   console.log(`CLUB CHALLENGE HOST ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-host-robot-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  288 | });
  289 | 
  290 | test('Club Challenge public voter robot: simple identity → code → nominee → vote',async({page},testInfo)=>{
  291 |   const participants=[
  292 |     {id:'p1',display_name:'Aoife M.',can_vote:true},{id:'p2',display_name:'Brian K.',can_vote:true},{id:'p3',display_name:'Cara D.',can_vote:true},{id:'p4',display_name:'Declan R.',can_vote:true},
  293 |   ];
  294 |   const calls=[];
  295 |   await page.route('**/api/apps/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;if(path.includes('/analytics/'))return json(route,{});const marker=`/api/apps/${APP_ID}/functions/`;const i=path.indexOf(marker);if(i<0)return json(route,{});const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}calls.push({name,body});if(name==='getPublicClubChallengeVote')return json(route,{success:true,event:{club_a_name:'Clare',club_b_name:'Galway',pot_status:'open',junior_display_mode:true},participants});if(name==='castPublicClubChallengePotVote'){await sleep(420);if(body.voterCode!=='A1B2C3D4')return json(route,{error:'Participant access code is incorrect.'});if(body.voterParticipantId===body.nomineeParticipantId)return json(route,{error:'Players cannot vote for themselves.'});return json(route,{success:true,voteId:'vote-public-1'});}return json(route,{});});
  296 |   await page.goto('/e2e/clubChallengePublicVoteHarness.html');await expect(page.getByText('Clare vs Galway')).toBeVisible();await expect(page.getByText('One vote per participant · no self-voting · individual votes remain private.')).toBeVisible();
  297 |   const combos=page.getByRole('combobox');await combos.nth(0).click();await page.getByRole('option',{name:'Aoife M.'}).click();await page.getByPlaceholder('8-character code').fill('A1B2C3D4');await combos.nth(1).click();await expect(page.getByRole('option',{name:'Aoife M.'})).toHaveCount(0);await page.getByRole('option',{name:'Brian K.'}).click();
  298 |   const castBefore=calls.filter(c=>c.name==='castPublicClubChallengePotVote').length;const started=Date.now();const cast=page.getByRole('button',{name:'Cast Vote'});await cast.evaluate(el=>{el.click();el.click();});await expect(page.getByRole('button',{name:'Recording…'})).toBeVisible({timeout:250});await expect(page.getByText('Vote recorded')).toBeVisible({timeout:1500});expect(calls.filter(c=>c.name==='castPublicClubChallengePotVote').length-castBefore).toBe(1);const report={vote_ack_ms:Date.now()-started,cast_calls:1,self_nominee_hidden:true,privacy_copy:true};console.log(`CLUB CHALLENGE PUBLIC VOTE ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-vote-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  299 | });
  300 | 
  301 | test('Club Challenge public Hall Display robot: now/resting/next + disconnect truth',async({page},testInfo)=>{
  302 |   const participants=Array.from({length:20},(_,i)=>({id:`hp${i+1}`,display_name:`Player ${i+1}`}));
  303 |   const names=ids=>ids.map(id=>participants.find(p=>p.id===id)?.display_name||'Player');
  304 |   const current=[];for(let c=1;c<=4;c++){const ids=participants.slice((c-1)*4,c*4).map(p=>p.id);current.push({id:`h-r1-c${c}`,round_number:1,court_number:c,status:'scheduled',winner:'none',score_a:null,score_b:null,is_showcase:false,club_a_participant_ids:ids.slice(0,2),club_b_participant_ids:ids.slice(2),club_a_names:names(ids.slice(0,2)),club_b_names:names(ids.slice(2))});}
  305 |   const next=current.map((m,i)=>({...m,id:`h-r2-c${i+1}`,round_number:2,club_a_participant_ids:[participants[(i*4+1)%20].id,participants[(i*4+2)%20].id],club_b_participant_ids:[participants[(i*4+3)%20].id,participants[(i*4+4)%20].id,].filter(Boolean)})).map(m=>({...m,club_a_names:names(m.club_a_participant_ids),club_b_names:names(m.club_b_participant_ids)}));
  306 |   const payload={success:true,event:{id:'hall-event',status:'in_progress',club_a_name:'Clare',club_b_name:'Galway',current_round:1,timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:480,started_at:null,round:1}),timer_revision:1,junior_display_mode:true,win_points:2,draw_points:1,loss_points:0},participants,matches:[...current,...next]};
  307 |   await page.route('**/api/apps/**',async route=>{const path=new URL(route.request().url()).pathname;if(path.includes('/analytics/'))return json(route,{});if(path.includes('/functions/getPublicClubChallengeDisplay'))return json(route,payload);return json(route,{});});
  308 |   await page.goto('/e2e/clubChallengePublicDisplayHarness.html');await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next · Round 2')).toBeVisible();await expect(page.getByText('Player 17',{exact:true}).first()).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('online')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeHidden({timeout:1200});await expectNoHorizontalOverflow(page);const report={now:true,resting:true,next:true,disconnect_warning:true,reconnect:true};console.log(`CLUB CHALLENGE PUBLIC DISPLAY ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-display-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  309 | });
```