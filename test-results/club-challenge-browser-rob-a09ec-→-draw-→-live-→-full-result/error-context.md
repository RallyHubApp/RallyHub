# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-challenge-browser-robot.spec.mjs >> Club Challenge mobile host robot: setup → practice → draw → live → full result
- Location: e2e/club-challenge-browser-robot.spec.mjs:240:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Player Pool', { exact: true })
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Player Pool', { exact: true }) with timeout 3000ms
  - waiting for getByText('Player Pool', { exact: true })

```

```yaml
- main:
  - img
  - paragraph: RallyHub Interclub
  - paragraph: "Interclub Challenge · Status: draft"
  - text: CL Clare Pickleball Club vs GA Galway Pickleball
  - button "Public Links / QR"
  - button "Setup":
    - img
    - text: Setup
  - button "2 Teams"
  - button "3 Draw"
  - button "4 Live Event"
  - button "5 Simulator"
  - button "6 Results"
  - paragraph: Participants
  - paragraph: Event ranks are independent of permanent RallyHub skill ratings.
  - button "Practice with 32 Test Players":
    - img
    - text: Practice with 32 Test Players
  - paragraph: Build the two teams
  - paragraph: Import Spond or CSV directly into either team, then drag within each team to rank 1–16. Use the Player Pool only for genuinely unassigned players. Rotation players are included in the draw; Reserves stay outside the scheduled rotation until activated.
  - text: "32 players A: 16 rotation · 0 reserve B: 16 rotation · 0 reserve Rotation squads balanced"
  - paragraph: Unassigned Player Pool
  - paragraph: Use this only for players who are not yet assigned. Add or import players directly into their team panels where possible.
  - text: "0"
  - button "Import Unassigned Spond Players":
    - img
    - text: Import Unassigned Spond Players
  - textbox "Add player manually"
  - button [disabled]:
    - img
  - text: Import Spond attendees here Team name
  - textbox: Clare Pickleball Club
  - img
  - paragraph: Roster controls
  - img
  - textbox "Search RallyHub club players"
  - textbox "Guest name"
  - combobox: Gender optional
  - button "Add Guest" [disabled]
  - paragraph: Club players keep their RallyHub identity. A typed guest is event-only and does not become a club member.
  - button "Import Spond":
    - img
    - text: Import Spond
  - img
  - text: Import CSV 16 M 8 F 8
  - button:
    - img
  - text: 1 Club A Test 01
  - combobox: Rotation
  - text: M
  - button "Remove Club A Test 01 from roster":
    - img
  - button:
    - img
  - text: 2 Club A Test 02
  - combobox: Rotation
  - text: F
  - button "Remove Club A Test 02 from roster":
    - img
  - button:
    - img
  - text: 3 Club A Test 03
  - combobox: Rotation
  - text: M
  - button "Remove Club A Test 03 from roster":
    - img
  - button:
    - img
  - text: 4 Club A Test 04
  - combobox: Rotation
  - text: F
  - button "Remove Club A Test 04 from roster":
    - img
  - button:
    - img
  - text: 5 Club A Test 05
  - combobox: Rotation
  - text: M
  - button "Remove Club A Test 05 from roster":
    - img
  - button:
    - img
  - text: 6 Club A Test 06
  - combobox: Rotation
  - text: F
  - button "Remove Club A Test 06 from roster":
    - img
  - button:
    - img
  - text: 7 Club A Test 07
  - combobox: Rotation
  - text: M
  - button "Remove Club A Test 07 from roster":
    - img
  - button:
    - img
  - text: 8 Club A Test 08
  - combobox: Rotation
  - text: F
  - button "Remove Club A Test 08 from roster":
    - img
  - button:
    - img
  - text: 9 Club A Test 09
  - combobox: Rotation
  - text: M
  - button "Remove Club A Test 09 from roster":
    - img
  - button:
    - img
  - text: 10 Club A Test 10
  - combobox: Rotation
  - text: F
  - button "Remove Club A Test 10 from roster":
    - img
  - button:
    - img
  - text: 11 Club A Test 11
  - combobox: Rotation
  - text: M
  - button "Remove Club A Test 11 from roster":
    - img
  - button:
    - img
  - text: 12 Club A Test 12
  - combobox: Rotation
  - text: F
  - button "Remove Club A Test 12 from roster":
    - img
  - button:
    - img
  - text: 13 Club A Test 13
  - combobox: Rotation
  - text: M
  - button "Remove Club A Test 13 from roster":
    - img
  - button:
    - img
  - text: 14 Club A Test 14
  - combobox: Rotation
  - text: F
  - button "Remove Club A Test 14 from roster":
    - img
  - button:
    - img
  - text: 15 Club A Test 15
  - combobox: Rotation
  - text: M
  - button "Remove Club A Test 15 from roster":
    - img
  - button:
    - img
  - text: 16 Club A Test 16
  - combobox: Rotation
  - text: F
  - button "Remove Club A Test 16 from roster":
    - img
  - text: Team name
  - textbox: Galway Pickleball
  - img
  - paragraph: Roster controls
  - img
  - textbox "Search RallyHub club players"
  - textbox "Guest name"
  - combobox: Gender optional
  - button "Add Guest" [disabled]
  - paragraph: Club players keep their RallyHub identity. A typed guest is event-only and does not become a club member.
  - button "Import Spond":
    - img
    - text: Import Spond
  - img
  - text: Import CSV 16 M 8 F 8
  - button:
    - img
  - text: 1 Club B Test 01
  - combobox: Rotation
  - text: M
  - button "Remove Club B Test 01 from roster":
    - img
  - button:
    - img
  - text: 2 Club B Test 02
  - combobox: Rotation
  - text: F
  - button "Remove Club B Test 02 from roster":
    - img
  - button:
    - img
  - text: 3 Club B Test 03
  - combobox: Rotation
  - text: M
  - button "Remove Club B Test 03 from roster":
    - img
  - button:
    - img
  - text: 4 Club B Test 04
  - combobox: Rotation
  - text: F
  - button "Remove Club B Test 04 from roster":
    - img
  - button:
    - img
  - text: 5 Club B Test 05
  - combobox: Rotation
  - text: M
  - button "Remove Club B Test 05 from roster":
    - img
  - button:
    - img
  - text: 6 Club B Test 06
  - combobox: Rotation
  - text: F
  - button "Remove Club B Test 06 from roster":
    - img
  - button:
    - img
  - text: 7 Club B Test 07
  - combobox: Rotation
  - text: M
  - button "Remove Club B Test 07 from roster":
    - img
  - button:
    - img
  - text: 8 Club B Test 08
  - combobox: Rotation
  - text: F
  - button "Remove Club B Test 08 from roster":
    - img
  - button:
    - img
  - text: 9 Club B Test 09
  - combobox: Rotation
  - text: M
  - button "Remove Club B Test 09 from roster":
    - img
  - button:
    - img
  - text: 10 Club B Test 10
  - combobox: Rotation
  - text: F
  - button "Remove Club B Test 10 from roster":
    - img
  - button:
    - img
  - text: 11 Club B Test 11
  - combobox: Rotation
  - text: M
  - button "Remove Club B Test 11 from roster":
    - img
  - button:
    - img
  - text: 12 Club B Test 12
  - combobox: Rotation
  - text: F
  - button "Remove Club B Test 12 from roster":
    - img
  - button:
    - img
  - text: 13 Club B Test 13
  - combobox: Rotation
  - text: M
  - button "Remove Club B Test 13 from roster":
    - img
  - button:
    - img
  - text: 14 Club B Test 14
  - combobox: Rotation
  - text: F
  - button "Remove Club B Test 14 from roster":
    - img
  - button:
    - img
  - text: 15 Club B Test 15
  - combobox: Rotation
  - text: M
  - button "Remove Club B Test 15 from roster":
    - img
  - button:
    - img
  - text: 16 Club B Test 16
  - combobox: Rotation
  - text: F
  - button "Remove Club B Test 16 from roster":
    - img
  - text: "Ready: 16 rotation players per club."
  - button "Save Teams & Rankings" [disabled]
  - paragraph: "12"
  - paragraph: Rounds
  - paragraph: "48"
  - paragraph: Matches
  - paragraph: 6–6
  - paragraph: Games/player
  - paragraph: "164"
  - paragraph: Structured min
  - paragraph: "16"
  - paragraph: Contingency min
  - button "Generate Draw & Fairness Report":
    - img
    - text: Generate Draw & Fairness Report
- region "Notifications alt+T":
  - list:
    - listitem:
      - img
      - text: 32 practice players loaded. You can now rehearse the full setup and draw journey.
    - listitem:
      - img
      - text: Interclub Challenge setup saved
```

# Test source

```ts
  154 |       return {success:true,event:model.event,timer_state:nextTimer,timer_revision:model.event.timer_revision};
  155 |     }
  156 | 
  157 |     if (name === 'updateClubChallengeSchedule') {
  158 |       await sleep(420);
  159 |       for(const c of body.changes||[]){const m=model.matches.find(x=>x.id===c.id);if(m)Object.assign(m,{round_number:Number(c.newRound),court_number:Number(c.newCourt),revision:Number(m.revision||0)+1});}
  160 |       for(const matchId of body.dropIds||[]){const m=model.matches.find(x=>x.id===matchId);if(m)Object.assign(m,{status:'not_played',winner:'none',revision:Number(m.revision||0)+1});}
  161 |       Object.assign(model.event,{courts:Number(body.courts),available_minutes:Number(body.availableMinutes),event_pack_stale:true});
  162 |       return {success:true,event:model.event,changed:(body.changes||[]).length,dropped:(body.dropIds||[]).length,alreadyApplied:false};
  163 |     }
  164 | 
  165 |     if (name === 'saveClubChallengeScore') {
  166 |       await sleep(260);
  167 |       const match=model.matches.find(m=>m.id===body.matchId); if(!match)return {error:'Match not found'};
  168 |       if(Number(body.expectedRevision||0)!==Number(match.revision||0))return {conflict:true,error:'Revision conflict',match};
  169 |       const a=Number(body.scoreA),b=Number(body.scoreB);Object.assign(match,{score_a:a,score_b:b,winner:a===b?'draw':a>b?'club_a':'club_b',status:a===b?'draw':'completed',revision:Number(match.revision||0)+1,scored_by_user_id:model.user.id,scored_at:now()});
  170 |       return {success:true,match};
  171 |     }
  172 | 
  173 |     if (name === 'populateClubChallengePracticeScenario') {
  174 |       await sleep(650);
  175 |       const normal=model.matches.filter(m=>!m.is_showcase).sort((a,b)=>a.round_number-b.round_number||a.court_number-b.court_number);
  176 |       normal.forEach((m,i)=>Object.assign(m,{status:'completed',score_a:i%2===0?11:8,score_b:i%2===0?8:11,winner:i%2===0?'club_a':'club_b',revision:Number(m.revision||0)+1,scored_by_user_id:model.user.id,scored_at:now()}));
  177 |       if(model.event.showcase_enabled){const a=model.participants.filter(p=>p.side==='club_a'),b=model.participants.filter(p=>p.side==='club_b');model.matches.push({id:'cc-showcase',tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,tournament_id:model.event.tournament_id,draw_version:model.event.draw_version,round_number:13,court_number:1,match_number:49,club_a_participant_ids:[a[0].id,a[1].id],club_b_participant_ids:[b[0].id,b[1].id],club_a_names:[a[0].display_name,a[1].display_name],club_b_names:[b[0].display_name,b[1].display_name],status:'completed',score_a:15,score_b:13,winner:'club_a',revision:1,correction_count:0,is_showcase:true,scored_by_user_id:model.user.id,scored_at:now()});}
  178 |       const winner=model.participants[0];model.votes=model.participants.filter(p=>p.id!==winner.id).slice(0,8).map((p,i)=>({id:`vote-${i+1}`,tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,voter_identity_key:`practice:${p.id}`,voter_participant_id:p.id,nominee_participant_id:winner.id,access_route:'guest',cast_at:now(),valid:true}));
  179 |       const maxRound=Math.max(...normal.map(m=>Number(m.round_number||0)));Object.assign(model.event,{status:'completed',current_round:maxRound,finalised_at:now(),showcase_resolution_method:'showcase_final',showcase_resolved_winner:'club_a',pot_status:'revealed',pot_winner_participant_ids:[winner.id],pot_revealed_at:now(),timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:0,started_at:null,round:maxRound}),timer_revision:Number(model.event.timer_revision||0)+1});model.tournament.status='Completed';
  180 |       return {success:true,normalMatches:normal.length,showcase:true,practiceVotes:model.votes.length,winner:'club_a'};
  181 |     }
  182 | 
  183 |     if (name === 'updateClubChallengePot') {
  184 |       await sleep(180); if(body.action==='open')model.event.pot_status='open';if(body.action==='close')model.event.pot_status='closed';return {success:true,event:model.event};
  185 |     }
  186 |     if (name === 'castClubChallengePotVote') {
  187 |       await sleep(180); if(body.voterParticipantId===body.nomineeParticipantId)return {error:'Players cannot vote for themselves.'};if(model.votes.some(v=>v.voter_participant_id===body.voterParticipantId&&v.valid!==false))return {error:'This player has already voted.'};const v={id:id('vote'),tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,voter_identity_key:`participant:${body.voterParticipantId}`,voter_participant_id:body.voterParticipantId,nominee_participant_id:body.nomineeParticipantId,access_route:'logged_in',cast_at:now(),valid:true};model.votes.push(v);return {success:true,vote:v};
  188 |     }
  189 | 
  190 |     if (name === 'manageClubChallengePublicLinks') {
  191 |       return {success:true,displayToken:'e2e-display-token',votingToken:'e2e-vote-token',voterCodes:model.participants.map(p=>({participantId:p.id,displayName:p.display_name,code:p.guest_access_token||'TESTCODE'}))};
  192 |     }
  193 | 
  194 |     return { success:true };
  195 |   };
  196 | 
  197 |   return model;
  198 | }
  199 | 
  200 | async function installClubChallengeBackend(page, model) {
  201 |   await page.route('**/api/apps/**', async route => {
  202 |     const req=route.request(), url=new URL(req.url()), path=url.pathname;
  203 |     if(path.includes('/analytics/'))return json(route,{});
  204 |     if(path.endsWith('/entities/User/me'))return json(route,model.user);
  205 |     const fnMarker=`/api/apps/${APP_ID}/functions/`;
  206 |     const fnIndex=path.indexOf(fnMarker);
  207 |     if(fnIndex>=0){const name=decodeURIComponent(path.slice(fnIndex+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}return json(route,await model.handleFunction(name,body));}
  208 |     const entityMarker=`/api/apps/${APP_ID}/entities/`;
  209 |     const entityIndex=path.indexOf(entityMarker);
  210 |     if(entityIndex>=0){const rest=path.slice(entityIndex+entityMarker.length);const [entity,recordId]=rest.split('/').map(decodeURIComponent);let body={};try{body=req.postDataJSON()||{};}catch{}
  211 |       if(req.method()==='GET')return json(route,model.entityList(entity));
  212 |       if(req.method()==='POST')return json(route,model.createEntity(entity,body));
  213 |       if(['PUT','PATCH'].includes(req.method()))return json(route,model.updateEntity(entity,recordId,body));
  214 |       if(req.method()==='DELETE')return json(route,{});
  215 |     }
  216 |     return json(route,{});
  217 |   });
  218 | }
  219 | 
  220 | async function installHallDeviceMocks(page){
  221 |   await page.addInitScript(()=>{
  222 |     window.__ccDevice={audioSignals:0,speech:[],wakeRequests:0,wakeReleases:0,vibrations:0};
  223 |     class FakeParam{setValueAtTime(){} exponentialRampToValueAtTime(){}}
  224 |     class FakeOsc{constructor(){this.frequency=new FakeParam();this.type='square';}connect(){}start(){window.__ccDevice.audioSignals++;}stop(){}}
  225 |     class FakeGain{constructor(){this.gain=new FakeParam();}connect(){}}
  226 |     class FakeAudioContext{constructor(){this.state='suspended';this.currentTime=0;this.destination={};}createOscillator(){return new FakeOsc();}createGain(){return new FakeGain();}async resume(){this.state='running';}}
  227 |     Object.defineProperty(window,'AudioContext',{configurable:true,writable:true,value:FakeAudioContext});Object.defineProperty(window,'webkitAudioContext',{configurable:true,writable:true,value:FakeAudioContext});
  228 |     Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:class{constructor(text){this.text=text;this.volume=1;this.lang='';this.rate=1;this.pitch=1;this.voice=null;}}});
  229 |     Object.defineProperty(window,'speechSynthesis',{configurable:true,writable:true,value:{getVoices:()=>[{name:'Moira',lang:'en-IE'}],cancel(){},resume(){},speak(u){window.__ccDevice.speech.push({text:u.text,volume:u.volume,lang:u.lang});},addEventListener(){},removeEventListener(){}}});
  230 |     Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{window.__ccDevice.wakeRequests++;return{release:async()=>{window.__ccDevice.wakeReleases++;}};}}});
  231 |     Object.defineProperty(navigator,'vibrate',{configurable:true,value:()=>{window.__ccDevice.vibrations++;return true;}});
  232 |   });
  233 | }
  234 | 
  235 | function metric(report,name,value,max){report[name]=value;expect(value,`${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);}
  236 | async function expectNoHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,'mobile page should not require horizontal body scrolling').toBeLessThanOrEqual(1);}
  237 | 
  238 | test.use({ viewport:{width:390,height:844} });
  239 | 
  240 | test('Club Challenge mobile host robot: setup → practice → draw → live → full result',async({page},testInfo)=>{
  241 |   const model=createClubChallengeModel();const report={};await installHallDeviceMocks(page);await installClubChallengeBackend(page,model);page.on('dialog',d=>d.accept());
  242 |   await page.goto('/e2e/clubChallengeHarness.html');
  243 |   await expect(page.getByTestId('cc-root')).toBeVisible();
  244 |   await expect(page.getByText('Estimated event duration')).toBeVisible();
  245 |   await expect(page.getByText('2h 44m')).toBeVisible();
  246 |   await expectNoHorizontalOverflow(page);
  247 | 
  248 |   let started=Date.now();await page.getByTestId('cc-save-setup').click();await expect(page.getByTestId('cc-load-practice')).toBeVisible({timeout:1800});metric(report,'setup_to_teams_ms',Date.now()-started,1500);
  249 |   expect(model.event?.status).toBe('draft');
  250 | 
  251 |   started=Date.now();await page.getByTestId('cc-load-practice').click();await expect(page.getByText('Club A Test 01')).toBeVisible({timeout:1800});metric(report,'practice_roster_ms',Date.now()-started,1500);expect(model.participants.length).toBe(32);
  252 |   await expect(page.getByText('12').first()).toBeVisible();await expectNoHorizontalOverflow(page);
  253 | 
> 254 |   await expect(page.getByText('Build the two teams')).toBeVisible();await expect(page.getByText('Player Pool',{exact:true})).toBeVisible();
      |                                                                                                                              ^ Error: expect(locator).toBeVisible() failed
  255 |   const organiseBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='organise_teams').length;
  256 |   await page.getByTestId('cc-team-name-club_a').fill('Clare Blue');await page.getByTestId('cc-team-name-club_b').fill('Clare Gold');
  257 |   const drag=page.getByTestId('cc-team-drag-cc-a-2');await drag.focus();await drag.press('Space');await drag.press('ArrowUp');await drag.press('Space');
  258 |   started=Date.now();await page.getByTestId('cc-save-team-builder').click();await expect(page.getByText('Saving teams and rankings… one command sent')).toBeVisible({timeout:300});metric(report,'team_builder_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-team-builder-status')).toContainText('Teams saved',{timeout:1800});
  259 |   expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='organise_teams').length-organiseBefore).toBe(1);expect(model.participants.find(p=>p.id==='cc-a-2')?.event_rank).toBe(1);expect(model.event.club_a_name).toBe('Clare Blue');expect(model.event.club_b_name).toBe('Clare Gold');report.team_builder_browser_calls=1;report.drag_ranking_saved=true;
  260 | 
  261 |   const drawBefore=model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length;
  262 |   started=Date.now();await page.getByTestId('cc-generate-draw').click();await expect(page.getByText('Generating draw and fairness report… one command sent')).toBeVisible({timeout:300});metric(report,'draw_ack_ms',Date.now()-started,250);await expect(page.getByText('Fairness checks passed')).toBeVisible({timeout:2200});metric(report,'draw_to_review_ms',Date.now()-started,1800);expect(model.matches.filter(m=>!m.is_showcase).length).toBe(48);expect(new Set(model.matches.map(m=>m.round_number)).size).toBe(12);expect(model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length-drawBefore).toBe(1);report.draw_browser_calls=1;
  263 | 
  264 |   const approveBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length;
  265 |   started=Date.now();await page.getByTestId('cc-approve-draw').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Approving and locking draw… command sent')).toBeVisible({timeout:300});metric(report,'approve_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-prestart-sound-check')).toBeVisible({timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length-approveBefore).toBe(1);report.approve_double_tap_calls=1;
  266 | 
  267 |   const fnBeforeSound=model.calls.length;await page.getByTestId('cc-prestart-sound-check').click();await expect(page.getByTestId('cc-prestart-sound-check')).toContainText('Test Sound Again ✓',{timeout:800});await expect.poll(async()=>await page.evaluate(()=>window.__ccDevice.speech.length)).toBeGreaterThan(0);expect(await page.evaluate(()=>window.__rallyhubAudioContext?.state)).toBe('running');expect(model.calls.length).toBe(fnBeforeSound);report.sound_check_base44_calls=0;report.local_audio_unlocked=true;
  268 | 
  269 |   const startBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length;
  270 |   started=Date.now();await page.getByTestId('cc-start-event').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting Interclub Challenge… command sent')).toBeVisible({timeout:300});metric(report,'event_start_ack_ms',Date.now()-started,250);await expect(page.getByText('Round at a Glance')).toBeVisible({timeout:2000});metric(report,'event_start_to_live_ms',Date.now()-started,1800);expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length-startBefore).toBe(1);report.start_double_tap_calls=1;
  271 |   await expect(page.getByText('Resting this round')).toBeVisible();await expect(page.getByText('Up next · Round 2')).toBeVisible();await expect(page.getByText('scores saved')).toBeVisible();await expect(page.getByText('ready',{exact:true})).toBeVisible();await expect(page.getByText('10:00').first()).toBeVisible();await expect(page.getByRole('button',{name:'Changeover',exact:true})).toBeDisabled();await expectNoHorizontalOverflow(page);report.initial_timer_ready=true;
  272 |   const hostBar=page.getByTestId('cc-sticky-host-bar');await expect(hostBar).toBeVisible();await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await expect(hostBar).toHaveAttribute('data-pinned','true',{timeout:1000});const hostBarTop=await hostBar.evaluate(el=>Math.round(el.getBoundingClientRect().top));expect(hostBarTop).toBeGreaterThanOrEqual(60);expect(hostBarTop).toBeLessThanOrEqual(80);report.host_bar_pinned=true;await page.evaluate(()=>window.scrollTo(0,0));
  273 | 
  274 |   const timerBefore=model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length;
  275 |   started=Date.now();await page.getByTestId('cc-timer-start-play').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting play… command sent')).toBeVisible({timeout:300});metric(report,'timer_start_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-timer-pause')).toBeEnabled({timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length-timerBefore).toBe(1);const device=await page.evaluate(()=>window.__ccDevice);expect(device.wakeRequests).toBeGreaterThan(0);expect(device.speech.some(x=>/Starting now/i.test(x.text))).toBe(true);expect(device.speech.some(x=>/One minute remaining|Thirty seconds|Ten seconds/i.test(x.text))).toBe(false);report.timer_double_tap_calls=1;report.start_announcement_full=true;report.legacy_warnings_removed=true;
  276 |   await page.getByRole('button',{name:'Audio ON',exact:true}).click();await expect(page.getByRole('button',{name:'Audio OFF',exact:true})).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('cc-audio-muted'))).toBe('true');await page.getByRole('button',{name:'Audio OFF',exact:true}).click();await expect(page.getByRole('button',{name:'Audio ON',exact:true})).toBeVisible();report.audio_toggle_persistent=true;
  277 | 
  278 |   expect(await page.getByTestId('cc-score-r1-c1-a').getAttribute('maxlength')).toBe('2');await page.getByTestId('cc-score-r1-c1-a').fill('11');await page.getByTestId('cc-score-r1-c1-b').fill('8');started=Date.now();await page.getByTestId('cc-save-score-r1-c1').click();await expect(page.getByTestId('cc-score-card-r1-c1')).toContainText('Saved ·',{timeout:1500});metric(report,'single_score_save_ms',Date.now()-started,1200);
  279 | 
  280 |   const savedR1C1=model.matches.find(m=>m.round_number===1&&m.court_number===1);const outgoingName=savedR1C1.club_a_names[0];const historicalNames=[...savedR1C1.club_a_names];
  281 |   await page.getByRole('button',{name:'Players',exact:true}).click();await expect(page.getByText('Player Controls',{exact:true})).toBeVisible();await page.getByTestId('cc-replacement-outgoing').click();await page.getByRole('option',{name:new RegExp(`^${outgoingName.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')} ·`)}).click();await page.getByTestId('cc-replacement-name').fill('Replacement Test');
  282 |   const replaceBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length;started=Date.now();await page.getByTestId('cc-replace-player').click();await expect(page.getByText(new RegExp(`^Replacing .* with Replacement Test from Round 1… command sent$`))).toBeVisible({timeout:300});metric(report,'replacement_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-player-control-status')).toContainText('replaced by Replacement Test',{timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length-replaceBefore).toBe(1);expect(savedR1C1.club_a_names).toEqual(historicalNames);expect(model.matches.some(m=>m.round_number>1&&(m.club_a_names||[]).includes('Replacement Test'))).toBe(true);report.replacement_future_only=true;
  283 | 
  284 |   model.event.timer_state_json=JSON.stringify({phase:'play',running:false,remaining_seconds:0,started_at:null,round:1});model.event.timer_revision=Number(model.event.timer_revision||0)+1;
  285 |   await page.reload();await expect(page.getByTestId('cc-root')).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByRole('button',{name:'Prepare Round 2 · 3 scores pending'})).toBeVisible({timeout:1800});
  286 |   started=Date.now();await page.getByRole('button',{name:'Prepare Round 2 · 3 scores pending'}).click();await expect(page.getByText('Preparing Round 2… command sent')).toBeVisible({timeout:300});metric(report,'round_advance_ack_ms',Date.now()-started,350);await expect(page.getByText('Round 2/12',{exact:true})).toBeVisible({timeout:1800});await expect(page.getByText('Earlier scores still to enter')).toBeVisible();expect(model.calls.filter(c=>c.name==='updateClubChallengeRound').at(-1)?.body.allowPendingScores).toBe(true);report.next_round_before_scores=true;
  287 |   for(const court of [2,3,4]){await page.getByTestId(`cc-score-r1-c${court}-a`).fill('11');await page.getByTestId(`cc-score-r1-c${court}-b`).fill('7');await page.getByTestId(`cc-save-score-r1-c${court}`).click();await expect(page.getByTestId(`cc-score-card-r1-c${court}`)).toContainText('Saved ·',{timeout:1500});}
  288 |   await expect(page.getByText('Earlier scores still to enter')).toBeHidden({timeout:1800});await expect(page.getByText('ready',{exact:true})).toBeVisible();await expect(page.getByText('10:00').first()).toBeVisible();await expect(page.getByText('0/4').first()).toBeVisible();report.pending_scores_cleared_during_next_round=true;report.round_transition_timer_reset=true;
  289 | 
  290 |   await page.locator('#cc-court-time-controls > summary').click();await page.getByTestId('cc-courts-now').fill('3');await page.getByTestId('cc-minutes-remaining').fill('180');await page.getByTestId('cc-preview-schedule-change').click();await expect(page.getByText(/Proposed change:.*0 would be marked Not Played/)).toBeVisible();const scheduleBefore=model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length;started=Date.now();await page.getByTestId('cc-confirm-schedule-change').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Applying court & time changes… command sent')).toBeVisible({timeout:300});metric(report,'schedule_change_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-schedule-change-status')).toContainText('Schedule updated:',{timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length-scheduleBefore).toBe(1);expect(model.event.courts).toBe(3);expect(model.event.event_pack_stale).toBe(true);report.schedule_change_double_tap_calls=1;
  291 | 
  292 |   await page.getByRole('button',{name:'Hall Display'}).evaluate(el=>el.click());await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next')).toBeVisible();await expect(page.getByRole('button',{name:'Exit Display'})).toBeVisible();report.internal_hall_display=true;await page.getByRole('button',{name:'Exit Display'}).evaluate(el=>el.click());await expect(page.getByTestId('cc-tab-simulator')).toBeVisible({timeout:1500});
  293 | 
  294 |   await page.getByTestId('cc-tab-simulator').click();await expect(page.getByTestId('cc-populate-full')).toBeVisible();
  295 |   const populateBefore=model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length;started=Date.now();await page.getByTestId('cc-populate-full').click();await expect(page.getByText('Populating full TEST MODE event… one server command sent')).toBeVisible({timeout:300});metric(report,'full_test_ack_ms',Date.now()-started,250);await expect(page.getByText('Final Result')).toBeVisible({timeout:2200});metric(report,'full_test_to_results_ms',Date.now()-started,2000);expect(model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length-populateBefore).toBe(1);expect(model.matches.filter(m=>!m.is_showcase&&m.status==='completed').length).toBe(48);expect(model.matches.filter(m=>m.is_showcase&&m.status==='completed').length).toBe(1);expect(model.votes.length).toBe(8);report.full_population_browser_calls=1;
  296 |   await expect(page.getByText('Player of the Tournament',{exact:true}).first()).toBeVisible();await expect(page.getByText('Club A Test 01',{exact:true}).first()).toBeVisible();await expectNoHorizontalOverflow(page);
  297 | 
  298 |   await page.getByTestId('cc-tab-draw').click();await expect(page.getByText('Round 12',{exact:true})).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByText('Round at a Glance')).toBeVisible();report.revisit_populated_screens=true;
  299 | 
  300 |   report.total_function_calls=model.calls.length;report.normal_matches=model.matches.filter(m=>!m.is_showcase).length;report.participants=model.participants.length;
  301 |   console.log(`CLUB CHALLENGE HOST ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-host-robot-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  302 | });
  303 | 
  304 | test('Club Challenge public voter robot: one browser ballot across both teams',async({page},testInfo)=>{
  305 |   const participants=[
  306 |     {id:'a1',side:'club_a',display_name:'Aoife M.'},{id:'a2',side:'club_a',display_name:'Brian K.'},{id:'b1',side:'club_b',display_name:'Cara D.'},{id:'b2',side:'club_b',display_name:'Declan R.'},
  307 |   ];
  308 |   const calls=[];
  309 |   await page.route('**/api/apps/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;if(path.includes('/analytics/'))return json(route,{});const marker=`/api/apps/${APP_ID}/functions/`;const i=path.indexOf(marker);if(i<0)return json(route,{});const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}calls.push({name,body});if(name==='getPublicClubChallengeVote')return json(route,{success:true,event:{club_a_name:'Clare',club_b_name:'Galway',pot_status:'open',pot_vote_closes_at:null,junior_display_mode:true,display_token:'ccd_0123456789abcdef0123456789abcdef'},participants});if(name==='castPublicClubChallengePotVote'){await sleep(420);if(!body.voterDeviceId||!body.clubANomineeParticipantId||!body.clubBNomineeParticipantId)return json(route,{error:'Both team choices and device are required.'});return json(route,{success:true,votesRecorded:2,sides:['club_a','club_b']});}return json(route,{});});
  310 |   await page.goto('/e2e/clubChallengePublicVoteHarness.html');await expect(page.getByText('Clare vs Galway')).toBeVisible();await expect(page.getByText('One ballot per phone/browser for this Interclub.')).toBeVisible();
  311 |   const combos=page.getByRole('combobox');await combos.nth(0).click();await page.getByRole('option',{name:'Aoife M.'}).click();await combos.nth(1).click();await page.getByRole('option',{name:'Cara D.'}).click();
  312 |   const castBefore=calls.filter(c=>c.name==='castPublicClubChallengePotVote').length;const started=Date.now();const cast=page.getByRole('button',{name:'Submit My Votes'});await cast.evaluate(el=>{el.click();el.click();});await expect(page.getByRole('button',{name:'Recording…'})).toBeVisible({timeout:250});await expect(page.getByText('Votes recorded')).toBeVisible({timeout:1500});expect(calls.filter(c=>c.name==='castPublicClubChallengePotVote').length-castBefore).toBe(1);await expect(page.getByRole('link',{name:'Back to Live Event'})).toHaveAttribute('href','https://rallyhub.ie/club-challenge/display/ccd_0123456789abcdef0123456789abcdef');const report={vote_ack_ms:Date.now()-started,cast_calls:1,two_team_ballot:true,device_identity:true,live_return_link:true};console.log(`CLUB CHALLENGE PUBLIC VOTE ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-vote-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  313 | });
  314 | 
  315 | test('Club Challenge public Hall Display robot: now/resting/next + disconnect truth',async({page},testInfo)=>{
  316 |   const participants=Array.from({length:20},(_,i)=>({id:`hp${i+1}`,display_name:`Player ${i+1}`,side:i<10?'club_a':'club_b',event_rank:(i%10)+1,roster_role:'rotation',reserve_activated:false,status:'active'}));
  317 |   const names=ids=>ids.map(id=>participants.find(p=>p.id===id)?.display_name||'Player');
  318 |   const current=[];for(let c=1;c<=4;c++){const ids=participants.slice((c-1)*4,c*4).map(p=>p.id);current.push({id:`h-r1-c${c}`,round_number:1,court_number:c,status:'scheduled',winner:'none',score_a:null,score_b:null,is_showcase:false,club_a_participant_ids:ids.slice(0,2),club_b_participant_ids:ids.slice(2),club_a_names:names(ids.slice(0,2)),club_b_names:names(ids.slice(2))});}
  319 |   const next=current.map((m,i)=>({...m,id:`h-r2-c${i+1}`,round_number:2,club_a_participant_ids:[participants[(i*4+1)%20].id,participants[(i*4+2)%20].id],club_b_participant_ids:[participants[(i*4+3)%20].id,participants[(i*4+4)%20].id,].filter(Boolean)})).map(m=>({...m,club_a_names:names(m.club_a_participant_ids),club_b_names:names(m.club_b_participant_ids)}));
  320 |   const payload={success:true,event:{id:'hall-event',status:'in_progress',club_a_name:'Clare',club_b_name:'Galway',current_round:1,timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:480,started_at:null,round:1}),timer_revision:1,junior_display_mode:true,win_points:2,draw_points:1,loss_points:0},participants,matches:[...current,...next]};
  321 |   await page.route('**/api/apps/**',async route=>{const path=new URL(route.request().url()).pathname;if(path.includes('/analytics/'))return json(route,{});if(path.includes('/functions/getPublicClubChallengeDisplay'))return json(route,payload);return json(route,{});});
  322 |   await page.goto('/e2e/clubChallengePublicDisplayHarness.html');await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next · Round 2')).toBeVisible();await expect(page.getByText('Player 17',{exact:true}).first()).toBeVisible();await page.getByRole('button',{name:'Teams'}).click();await expect(page.getByRole('heading',{name:'Teams'})).toBeVisible();await expect(page.getByText('Player 1',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Results'}).click();await expect(page.getByRole('heading',{name:'Match Results'})).toBeVisible();await page.getByRole('button',{name:'Live'}).click();await expect(page.getByText('On Court Now')).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('online')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeHidden({timeout:1200});await expectNoHorizontalOverflow(page);const report={now:true,resting:true,next:true,disconnect_warning:true,reconnect:true};console.log(`CLUB CHALLENGE PUBLIC DISPLAY ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-display-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  323 | });
```