# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-challenge-browser-robot.spec.mjs >> Interclub uneven rosters: host can save one side ranking before opponent roster is complete
- Location: e2e/club-challenge-browser-robot.spec.mjs:243:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Club A Test 01')
Expected: visible
Timeout: 1800ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Club A Test 01') with timeout 1800ms
  - waiting for getByText('Club A Test 01')

```

```yaml
- main:
  - img
  - paragraph: RallyHub Interclub
  - paragraph: "Interclub Challenge · Status: draft"
  - text: CL Clare Pickleball Club vs OP Opponent Club
  - button "Player Link / QR"
  - button "1 Setup"
  - button "2 Teams"
  - button "3 Draw"
  - button "4 Live Event"
  - button "5 Simulator"
  - button "6 Results"
  - paragraph: Participants
  - paragraph: Event ranks are independent of permanent RallyHub skill ratings.
  - button "Practice with 32 Test Players" [disabled]:
    - img
    - text: Practice with 32 Test Players
  - paragraph: Guest Player Registration
  - paragraph: Send the appropriate team link to guest or visiting players. Each player enters their own contact and emergency details and accepts the event waiver, Code of Conduct and privacy notice. They are added directly to that team as event-only players, not club members. Social / Improver and ranking stay under organiser control.
  - paragraph: Clare Pickleball Club
  - paragraph: Guest registration link
  - button "Prepare Link"
  - paragraph: Team Manager Link
  - text: Needs saving
  - paragraph: Give this to the team captain/manager. They see only this team and can repeatedly edit rank, Social/Improver and Rotation/Reserve as registrations change.
  - button "Prepare Manager Link"
  - paragraph: Opponent Club
  - paragraph: Guest registration link
  - button "Prepare Link"
  - paragraph: Team Manager Link
  - text: Needs saving
  - paragraph: Give this to the team captain/manager. They see only this team and can repeatedly edit rank, Social/Improver and Rotation/Reserve as registrations change.
  - button "Prepare Manager Link"
  - paragraph: Registration results
  - paragraph: These are stored against this Interclub event in the host club tenant. Visiting players remain event-only players, not Clare members.
  - text: "Clare Pickleball Club: 0 Opponent Club: 0"
  - button "Refresh" [disabled]:
    - img
    - text: Refresh
  - paragraph: No completed registration forms have been received yet.
  - paragraph: As players submit, RallyHub also adds them to the event roster. The form does not ask the player to grade themselves.
  - paragraph: Build the two teams
  - paragraph: Registered players appear directly in their team. Set Social / Improver, drag players into the current ranking and mark any Reserves. Save the current rosters whenever you need to — the teams do not have to be complete or equal to save. The equality check applies only when you later generate the draw.
  - text: "0 players A: 0 rotation · 0 reserve B: 0 rotation · 0 reserve Rotation squads 0–0 · draw not ready"
  - button "Unassigned Pool"
  - text: Team name
  - textbox [disabled]: Clare Pickleball Club
  - img
  - paragraph: Roster controls
  - img
  - textbox "Search RallyHub club players" [disabled]
  - textbox "Guest name" [disabled]
  - combobox [disabled]: Gender optional
  - button "Add Guest" [disabled]
  - paragraph: Club players keep their RallyHub identity. A typed guest is event-only and does not become a club member.
  - button "Import Spond" [disabled]:
    - img
    - text: Import Spond
  - img
  - text: Import CSV 0 M 0 F 0 Drag players here Team name
  - textbox [disabled]: Opponent Club
  - img
  - paragraph: Roster controls
  - img
  - textbox "Search RallyHub club players" [disabled]
  - textbox "Guest name" [disabled]
  - combobox [disabled]: Gender optional
  - button "Add Guest" [disabled]
  - paragraph: Club players keep their RallyHub identity. A typed guest is event-only and does not become a club member.
  - button "Import Spond" [disabled]:
    - img
    - text: Import Spond
  - img
  - text: Import CSV 0 M 0 F 0 Drag players here Current squads are 0–0. You can save now; only the draw remains locked until the Rotation squads are equal.
  - button "Saving…" [disabled]
  - button "Generate Draw & Fairness Report" [disabled]:
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
  154 |       await sleep(260);
  155 |       const round=Number(body.nextRound);const nextTimer={phase:'ready',running:false,remaining_seconds:Number(model.event.play_minutes||10)*60,started_at:null,round};
  156 |       Object.assign(model.event,{current_round:round,status:'in_progress',timer_state_json:JSON.stringify(nextTimer),timer_revision:Number(model.event.timer_revision||0)+1});
  157 |       return {success:true,event:model.event,timer_state:nextTimer,timer_revision:model.event.timer_revision};
  158 |     }
  159 | 
  160 |     if (name === 'updateClubChallengeSchedule') {
  161 |       await sleep(420);
  162 |       for(const c of body.changes||[]){const m=model.matches.find(x=>x.id===c.id);if(m)Object.assign(m,{round_number:Number(c.newRound),court_number:Number(c.newCourt),revision:Number(m.revision||0)+1});}
  163 |       for(const matchId of body.dropIds||[]){const m=model.matches.find(x=>x.id===matchId);if(m)Object.assign(m,{status:'not_played',winner:'none',revision:Number(m.revision||0)+1});}
  164 |       Object.assign(model.event,{courts:Number(body.courts),available_minutes:Number(body.availableMinutes),event_pack_stale:true});
  165 |       return {success:true,event:model.event,changed:(body.changes||[]).length,dropped:(body.dropIds||[]).length,alreadyApplied:false};
  166 |     }
  167 | 
  168 |     if (name === 'saveClubChallengeScore') {
  169 |       await sleep(260);
  170 |       const match=model.matches.find(m=>m.id===body.matchId); if(!match)return {error:'Match not found'};
  171 |       if(Number(body.expectedRevision||0)!==Number(match.revision||0))return {conflict:true,error:'Revision conflict',match};
  172 |       const a=Number(body.scoreA),b=Number(body.scoreB);Object.assign(match,{score_a:a,score_b:b,winner:a===b?'draw':a>b?'club_a':'club_b',status:a===b?'draw':'completed',revision:Number(match.revision||0)+1,scored_by_user_id:model.user.id,scored_at:now()});
  173 |       return {success:true,match};
  174 |     }
  175 | 
  176 |     if (name === 'populateClubChallengePracticeScenario') {
  177 |       await sleep(650);
  178 |       const normal=model.matches.filter(m=>!m.is_showcase).sort((a,b)=>a.round_number-b.round_number||a.court_number-b.court_number);
  179 |       normal.forEach((m,i)=>Object.assign(m,{status:'completed',score_a:i%2===0?11:8,score_b:i%2===0?8:11,winner:i%2===0?'club_a':'club_b',revision:Number(m.revision||0)+1,scored_by_user_id:model.user.id,scored_at:now()}));
  180 |       if(model.event.showcase_enabled){const a=model.participants.filter(p=>p.side==='club_a'),b=model.participants.filter(p=>p.side==='club_b');model.matches.push({id:'cc-showcase',tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,tournament_id:model.event.tournament_id,draw_version:model.event.draw_version,round_number:13,court_number:1,match_number:49,club_a_participant_ids:[a[0].id,a[1].id],club_b_participant_ids:[b[0].id,b[1].id],club_a_names:[a[0].display_name,a[1].display_name],club_b_names:[b[0].display_name,b[1].display_name],status:'completed',score_a:15,score_b:13,winner:'club_a',revision:1,correction_count:0,is_showcase:true,scored_by_user_id:model.user.id,scored_at:now()});}
  181 |       const winner=model.participants[0];model.votes=model.participants.filter(p=>p.id!==winner.id).slice(0,8).map((p,i)=>({id:`vote-${i+1}`,tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,voter_identity_key:`practice:${p.id}`,voter_participant_id:p.id,nominee_participant_id:winner.id,access_route:'guest',cast_at:now(),valid:true}));
  182 |       const maxRound=Math.max(...normal.map(m=>Number(m.round_number||0)));Object.assign(model.event,{status:'completed',current_round:maxRound,finalised_at:now(),showcase_resolution_method:'showcase_final',showcase_resolved_winner:'club_a',pot_status:'revealed',pot_winner_participant_ids:[winner.id],pot_revealed_at:now(),timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:0,started_at:null,round:maxRound}),timer_revision:Number(model.event.timer_revision||0)+1});model.tournament.status='Completed';
  183 |       return {success:true,normalMatches:normal.length,showcase:true,practiceVotes:model.votes.length,winner:'club_a'};
  184 |     }
  185 | 
  186 |     if (name === 'updateClubChallengePot') {
  187 |       await sleep(180); if(body.action==='open')model.event.pot_status='open';if(body.action==='close')model.event.pot_status='closed';return {success:true,event:model.event};
  188 |     }
  189 |     if (name === 'castClubChallengePotVote') {
  190 |       await sleep(180); if(body.voterParticipantId===body.nomineeParticipantId)return {error:'Players cannot vote for themselves.'};if(model.votes.some(v=>v.voter_participant_id===body.voterParticipantId&&v.valid!==false))return {error:'This player has already voted.'};const v={id:id('vote'),tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,voter_identity_key:`participant:${body.voterParticipantId}`,voter_participant_id:body.voterParticipantId,nominee_participant_id:body.nomineeParticipantId,access_route:'logged_in',cast_at:now(),valid:true};model.votes.push(v);return {success:true,vote:v};
  191 |     }
  192 | 
  193 |     if (name === 'manageClubChallengePublicLinks') {
  194 |       return {success:true,displayToken:'e2e-display-token',votingToken:'e2e-vote-token',voterCodes:model.participants.map(p=>({participantId:p.id,displayName:p.display_name,code:p.guest_access_token||'TESTCODE'}))};
  195 |     }
  196 | 
  197 |     return { success:true };
  198 |   };
  199 | 
  200 |   return model;
  201 | }
  202 | 
  203 | async function installClubChallengeBackend(page, model) {
  204 |   await page.route('**/api/apps/**', async route => {
  205 |     const req=route.request(), url=new URL(req.url()), path=url.pathname;
  206 |     if(path.includes('/analytics/'))return json(route,{});
  207 |     if(path.endsWith('/entities/User/me'))return json(route,model.user);
  208 |     const fnMarker=`/api/apps/${APP_ID}/functions/`;
  209 |     const fnIndex=path.indexOf(fnMarker);
  210 |     if(fnIndex>=0){const name=decodeURIComponent(path.slice(fnIndex+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}const remaining=Number(model.rateLimitFailures?.[name]||0);if(remaining>0){model.rateLimitFailures[name]=remaining-1;model.calls.push({name,body,at:Date.now(),rateLimited:true});return json(route,{error:'Burst rate limit exceeded'},429);}return json(route,await model.handleFunction(name,body));}
  211 |     const entityMarker=`/api/apps/${APP_ID}/entities/`;
  212 |     const entityIndex=path.indexOf(entityMarker);
  213 |     if(entityIndex>=0){const rest=path.slice(entityIndex+entityMarker.length);const [entity,recordId]=rest.split('/').map(decodeURIComponent);let body={};try{body=req.postDataJSON()||{};}catch{}
  214 |       if(req.method()==='GET')return json(route,model.entityList(entity));
  215 |       if(req.method()==='POST')return json(route,model.createEntity(entity,body));
  216 |       if(['PUT','PATCH'].includes(req.method()))return json(route,model.updateEntity(entity,recordId,body));
  217 |       if(req.method()==='DELETE')return json(route,{});
  218 |     }
  219 |     return json(route,{});
  220 |   });
  221 | }
  222 | 
  223 | async function installHallDeviceMocks(page){
  224 |   await page.addInitScript(()=>{
  225 |     window.__ccDevice={audioSignals:0,speech:[],wakeRequests:0,wakeReleases:0,vibrations:0};
  226 |     class FakeParam{setValueAtTime(){} exponentialRampToValueAtTime(){}}
  227 |     class FakeOsc{constructor(){this.frequency=new FakeParam();this.type='square';}connect(){}start(){window.__ccDevice.audioSignals++;}stop(){}}
  228 |     class FakeGain{constructor(){this.gain=new FakeParam();}connect(){}}
  229 |     class FakeAudioContext{constructor(){this.state='suspended';this.currentTime=0;this.destination={};}createOscillator(){return new FakeOsc();}createGain(){return new FakeGain();}async resume(){this.state='running';}}
  230 |     Object.defineProperty(window,'AudioContext',{configurable:true,writable:true,value:FakeAudioContext});Object.defineProperty(window,'webkitAudioContext',{configurable:true,writable:true,value:FakeAudioContext});
  231 |     Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:class{constructor(text){this.text=text;this.volume=1;this.lang='';this.rate=1;this.pitch=1;this.voice=null;}}});
  232 |     Object.defineProperty(window,'speechSynthesis',{configurable:true,writable:true,value:{getVoices:()=>[{name:'Moira',lang:'en-IE'}],cancel(){},resume(){},speak(u){window.__ccDevice.speech.push({text:u.text,volume:u.volume,lang:u.lang});},addEventListener(){},removeEventListener(){}}});
  233 |     Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{window.__ccDevice.wakeRequests++;return{release:async()=>{window.__ccDevice.wakeReleases++;}};}}});
  234 |     Object.defineProperty(navigator,'vibrate',{configurable:true,value:()=>{window.__ccDevice.vibrations++;return true;}});
  235 |   });
  236 | }
  237 | 
  238 | function metric(report,name,value,max){report[name]=value;report[`${name}_target_ms`]=max;}
  239 | async function expectNoHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,'mobile page should not require horizontal body scrolling').toBeLessThanOrEqual(1);}
  240 | 
  241 | test.use({ viewport:{width:390,height:844} });
  242 | 
  243 | test('Interclub uneven rosters: host can save one side ranking before opponent roster is complete',async({page})=>{
  244 |   const model=createClubChallengeModel();
  245 |   await installHallDeviceMocks(page);
  246 |   await installClubChallengeBackend(page,model);
  247 |   page.on('dialog',d=>d.accept());
  248 |   await page.goto('/e2e/clubChallengeHarness.html');
  249 |   await expect(page.getByTestId('cc-root')).toBeVisible();
  250 | 
  251 |   await page.getByTestId('cc-save-setup').click();
  252 |   await expect(page.getByTestId('cc-load-practice')).toBeVisible({timeout:1800});
  253 |   await page.getByTestId('cc-load-practice').click();
> 254 |   await expect(page.getByText('Club A Test 01')).toBeVisible({timeout:1800});
      |                                                  ^ Error: expect(locator).toBeVisible() failed
  255 | 
  256 |   model.participants = model.participants.filter(p => p.side !== 'club_b' || Number(p.event_rank) <= 9);
  257 |   model.participants.push(
  258 |     { id:'cc-a-17', tenant_id:model.event.tenant_id, challenge_event_id:model.event.id, tournament_id:model.event.tournament_id, side:'club_a', display_name:'Clare Extra 17', event_rank:17, gender:'Female', status:'active', available_from_round:1, roster_role:'rotation', unique_identity_key:'uneven-a-17' },
  259 |     { id:'cc-a-18', tenant_id:model.event.tenant_id, challenge_event_id:model.event.id, tournament_id:model.event.tournament_id, side:'club_a', display_name:'Caroline McDonnell', event_rank:18, gender:'Female', status:'active', available_from_round:1, roster_role:'rotation', unique_identity_key:'uneven-a-18' },
  260 |   );
  261 | 
  262 |   await page.reload();
  263 |   await expect(page.getByTestId('cc-root')).toBeVisible();
  264 |   await page.getByTestId('cc-tab-teams').click();
  265 |   await expect(page.getByText('Caroline McDonnell')).toBeVisible({timeout:1800});
  266 |   await expect(page.getByText('A: 18 rotation · 0 reserve')).toBeVisible();
  267 |   await expect(page.getByText('B: 9 rotation · 0 reserve')).toBeVisible();
  268 | 
  269 |   const drag=page.getByTestId('cc-team-drag-cc-a-18');
  270 |   await drag.focus();
  271 |   await drag.press('Space');
  272 |   await drag.press('ArrowUp');
  273 |   await drag.press('Space');
  274 |   await expect(page.getByTestId('cc-save-team-builder')).toBeEnabled();
  275 | 
  276 |   const organiseBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='organise_teams').length;
  277 |   await page.getByTestId('cc-save-team-builder').click();
  278 |   await expect(page.getByTestId('cc-team-builder-status')).toContainText('Teams saved',{timeout:1800});
  279 |   const saveCall=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='organise_teams').at(-1);
  280 |   expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='organise_teams').length-organiseBefore).toBe(1);
  281 |   expect(saveCall.body.clubAParticipantIds).toHaveLength(18);
  282 |   expect(saveCall.body.clubBParticipantIds).toHaveLength(9);
  283 |   expect(model.participants.find(p=>p.id==='cc-a-18')?.event_rank).toBe(17);
  284 |   await expect(page.getByTestId('cc-generate-draw')).toBeDisabled();
  285 | });
  286 | 
  287 | test('Club Challenge mobile host robot: setup → practice → draw → live → full result',async({page},testInfo)=>{
  288 |   const model=createClubChallengeModel();const report={};await installHallDeviceMocks(page);await installClubChallengeBackend(page,model);page.on('dialog',d=>d.accept());
  289 |   await page.goto('/e2e/clubChallengeHarness.html');
  290 |   await expect(page.getByTestId('cc-root')).toBeVisible();
  291 |   await expect(page.getByText('Estimated event duration')).toBeVisible();
  292 |   await expect(page.getByText('2h 44m')).toBeVisible();
  293 |   await expectNoHorizontalOverflow(page);
  294 |   const lateStartClock=new Date(Date.now()-90*60000);const lateStartHHMM=`${String(lateStartClock.getHours()).padStart(2,'0')}:${String(lateStartClock.getMinutes()).padStart(2,'0')}`;await page.getByTestId('cc-scheduled-start-time').fill(lateStartHHMM);
  295 | 
  296 |   let started=Date.now();await page.getByTestId('cc-save-setup').click();await expect(page.getByTestId('cc-load-practice')).toBeVisible({timeout:1800});metric(report,'setup_to_teams_ms',Date.now()-started,1500);
  297 |   expect(model.event?.status).toBe('draft');
  298 | 
  299 |   started=Date.now();await page.getByTestId('cc-load-practice').click();await expect(page.getByText('Club A Test 01')).toBeVisible({timeout:1800});metric(report,'practice_roster_ms',Date.now()-started,1500);expect(model.participants.length).toBe(32);
  300 |   await expect(page.getByText('12').first()).toBeVisible();await expectNoHorizontalOverflow(page);
  301 | 
  302 |   await expect(page.getByText('Build the two teams')).toBeVisible();await expect(page.getByText('Unassigned Player Pool',{exact:true})).toBeHidden();await page.getByRole('button',{name:/^Unassigned Pool/}).click();await expect(page.getByText('Unassigned Player Pool',{exact:true})).toBeVisible();report.unassigned_pool_on_demand=true;
  303 |   const organiseBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='organise_teams').length;
  304 |   await page.getByTestId('cc-team-name-club_a').fill('Clare Blue');await page.getByTestId('cc-team-name-club_b').fill('Clare Gold');
  305 |   const drag=page.getByTestId('cc-team-drag-cc-a-2');await drag.focus();await drag.press('Space');await drag.press('ArrowUp');await drag.press('Space');
  306 |   started=Date.now();await page.getByTestId('cc-save-team-builder').click();await expect(page.getByText('Saving teams and rankings… one command sent')).toBeVisible({timeout:300});metric(report,'team_builder_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-team-builder-status')).toContainText('Teams saved',{timeout:1800});
  307 |   expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='organise_teams').length-organiseBefore).toBe(1);expect(model.participants.find(p=>p.id==='cc-a-2')?.event_rank).toBe(1);expect(model.event.club_a_name).toBe('Clare Blue');expect(model.event.club_b_name).toBe('Clare Gold');report.team_builder_browser_calls=1;report.drag_ranking_saved=true;
  308 | 
  309 |   const drawBefore=model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length;
  310 |   started=Date.now();await page.getByTestId('cc-generate-draw').click();await expect(page.getByText('Generating draw and fairness report… one command sent')).toBeVisible({timeout:300});metric(report,'draw_ack_ms',Date.now()-started,600);await expect(page.getByText('Fairness checks passed')).toBeVisible({timeout:2200});metric(report,'draw_to_review_ms',Date.now()-started,1800);expect(model.matches.filter(m=>!m.is_showcase).length).toBe(48);expect(new Set(model.matches.map(m=>m.round_number)).size).toBe(12);expect(model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length-drawBefore).toBe(1);report.draw_browser_calls=1;
  311 | 
  312 |   const approveBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length;
  313 |   started=Date.now();await page.getByTestId('cc-approve-draw').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Approving and locking draw… command sent')).toBeVisible({timeout:300});metric(report,'approve_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-prestart-sound-check')).toBeVisible({timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length-approveBefore).toBe(1);report.approve_double_tap_calls=1;
  314 | 
  315 |   const fnBeforeSound=model.calls.length;await page.getByTestId('cc-prestart-sound-check').click();await expect(page.getByTestId('cc-prestart-sound-check')).toContainText('Test Sound Again ✓',{timeout:800});await expect.poll(async()=>await page.evaluate(()=>window.__ccDevice.speech.length)).toBeGreaterThan(0);expect(await page.evaluate(()=>window.__rallyhubAudioContext?.state)).toBe('running');const soundCalls=model.calls.slice(fnBeforeSound).map(c=>c.name);expect(soundCalls.filter(n=>n==='generateHallSpeech').length).toBeLessThanOrEqual(1);report.sound_check_base44_calls=soundCalls.filter(n=>n==='generateHallSpeech').length;report.local_audio_unlocked=true;
  316 | 
  317 |   const startBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length;
  318 |   started=Date.now();await page.getByTestId('cc-start-event').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting Interclub Challenge… command sent')).toBeVisible({timeout:300});metric(report,'event_start_ack_ms',Date.now()-started,250);await expect(page.getByText('Round at a Glance')).toBeVisible({timeout:2000});metric(report,'event_start_to_live_ms',Date.now()-started,1800);expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length-startBefore).toBe(1);report.start_double_tap_calls=1;
  319 |   await expect(page.getByText('Resting this round')).toBeVisible();await expect(page.getByText('Up next · Round 2')).toBeVisible();await expect(page.getByText('scores saved')).toBeVisible();await expect(page.getByText('ready',{exact:true})).toBeVisible();await expect(page.getByText('10:00').first()).toBeVisible();await expect(page.getByRole('button',{name:'Changeover',exact:true})).toBeDisabled();await expect(page.getByText('Finish-on-Time Guide')).toBeVisible();await expect(page.getByText('RECOVERY NEEDED')).toBeVisible();await expectNoHorizontalOverflow(page);report.initial_timer_ready=true;report.finish_on_time_recovery_visible=true;
  320 |   const hostBar=page.getByTestId('cc-sticky-host-bar');await expect(hostBar).toBeVisible();await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await expect(hostBar).toHaveAttribute('data-pinned','true',{timeout:1000});const hostBarTop=await hostBar.evaluate(el=>Math.round(el.getBoundingClientRect().top));expect(hostBarTop).toBeGreaterThanOrEqual(60);expect(hostBarTop).toBeLessThanOrEqual(80);report.host_bar_pinned=true;await page.evaluate(()=>window.scrollTo(0,0));
  321 | 
  322 |   const timerBefore=model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length;
  323 |   started=Date.now();await page.getByTestId('cc-timer-start-play').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting play… command sent')).toBeVisible({timeout:300});metric(report,'timer_start_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-timer-pause')).toBeEnabled({timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length-timerBefore).toBe(1);const device=await page.evaluate(()=>window.__ccDevice);expect(device.wakeRequests).toBeGreaterThan(0);expect(device.speech.some(x=>x.text==='Round 1. Round 1 starting now.')).toBe(true);expect(device.speech.some(x=>/Round 1 starting now\. Round 1 starting now\./i.test(x.text))).toBe(false);expect(device.speech.some(x=>/One minute remaining|Thirty seconds|Ten seconds/i.test(x.text))).toBe(false);report.timer_double_tap_calls=1;report.start_announcement_full=true;report.legacy_warnings_removed=true;
  324 |   await page.getByRole('button',{name:'Audio ON',exact:true}).click();await expect(page.getByRole('button',{name:'Audio OFF',exact:true})).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('cc-audio-muted'))).toBe('true');await page.getByRole('button',{name:'Audio OFF',exact:true}).click();await expect(page.getByRole('button',{name:'Audio ON',exact:true})).toBeVisible();report.audio_toggle_persistent=true;
  325 | 
  326 |   expect(await page.getByTestId('cc-score-r1-c1-a').getAttribute('maxlength')).toBe('2');await page.getByTestId('cc-score-r1-c1-a').fill('11');await page.getByTestId('cc-score-r1-c1-b').fill('8');model.rateLimitFailures.saveClubChallengeScore=1;started=Date.now();await page.getByTestId('cc-save-score-r1-c1').click();await expect(page.getByTestId('cc-score-card-r1-c1')).toContainText('Saved ·',{timeout:2200});metric(report,'single_score_save_with_rate_limit_retry_ms',Date.now()-started,2000);expect(model.calls.filter(c=>c.name==='saveClubChallengeScore'&&c.rateLimited).length).toBe(1);expect(model.calls.filter(c=>c.name==='saveClubChallengeScore'&&!c.rateLimited).length).toBe(1);report.base44_429_retry_recovered=true;
  327 | 
  328 |   const savedR1C1=model.matches.find(m=>m.round_number===1&&m.court_number===1);const outgoingName=savedR1C1.club_a_names[0];const historicalNames=[...savedR1C1.club_a_names];
  329 |   await page.getByRole('button',{name:'Reserve / Player Change',exact:true}).click();await expect(page.getByText('Player Changes & Reserves',{exact:true})).toBeVisible();await page.getByTestId('cc-replacement-outgoing').click();await page.getByRole('option',{name:new RegExp(`^${outgoingName.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')} ·`)}).click();await page.getByTestId('cc-replacement-name').fill('Replacement Test');
  330 |   const replaceBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length;started=Date.now();await page.getByTestId('cc-replace-player').click();await expect(page.getByText(new RegExp(`^Replacing .* with Replacement Test from Round 1… command sent$`))).toBeVisible({timeout:300});metric(report,'replacement_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-player-control-status')).toContainText('replaced by Replacement Test',{timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length-replaceBefore).toBe(1);expect(savedR1C1.club_a_names).toEqual(historicalNames);expect(model.matches.some(m=>m.round_number>1&&(m.club_a_names||[]).includes('Replacement Test'))).toBe(true);report.replacement_future_only=true;
  331 | 
  332 |   model.event.timer_state_json=JSON.stringify({phase:'play',running:false,remaining_seconds:0,started_at:null,round:1});model.event.timer_revision=Number(model.event.timer_revision||0)+1;
  333 |   await page.reload();await expect(page.getByTestId('cc-root')).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByTestId('cc-sticky-host-bar').getByRole('button',{name:'Prepare Round 2 · 3 scores pending'})).toBeVisible({timeout:1800});
  334 |   started=Date.now();await page.getByTestId('cc-sticky-host-bar').getByRole('button',{name:'Prepare Round 2 · 3 scores pending'}).click();await expect(page.getByText('Preparing Round 2… command sent')).toBeVisible({timeout:300});metric(report,'round_advance_ack_ms',Date.now()-started,350);await expect(page.getByText('Round 2/12',{exact:true})).toBeVisible({timeout:1800});await expect(page.getByText('Earlier scores still to enter')).toBeVisible();expect(model.calls.filter(c=>c.name==='updateClubChallengeRound').at(-1)?.body.allowPendingScores).toBe(true);report.next_round_before_scores=true;
  335 |   for(const court of [2,3,4]){await page.getByTestId(`cc-score-r1-c${court}-a`).fill('11');await page.getByTestId(`cc-score-r1-c${court}-b`).fill('7');await page.getByTestId(`cc-save-score-r1-c${court}`).click();await expect(page.getByTestId(`cc-score-card-r1-c${court}`)).toBeHidden({timeout:1800});}
  336 |   await expect(page.getByText('Earlier scores still to enter')).toBeHidden({timeout:1800});await expect(page.getByText('ready',{exact:true})).toBeVisible();await expect(page.getByText('10:00').first()).toBeVisible();await expect(page.getByText('0/4').first()).toBeVisible();report.pending_scores_cleared_during_next_round=true;report.round_transition_timer_reset=true;
  337 | 
  338 |   await page.locator('#cc-court-time-controls > summary').click();await page.getByTestId('cc-courts-now').fill('3');await page.getByTestId('cc-minutes-remaining').fill('180');await page.getByTestId('cc-preview-schedule-change').click();await expect(page.getByText(/Proposed change:.*would be marked Not Played/)).toBeVisible();expect(model.event.courts).toBe(4);await page.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page.getByText(/Preview cancelled/)).toBeVisible();expect(model.event.courts).toBe(4);report.schedule_preview_cancel_is_safe=true;await page.getByTestId('cc-preview-schedule-change').click();await expect(page.getByText(/Proposed change:/)).toBeVisible();const scheduleBefore=model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length;started=Date.now();await page.getByTestId('cc-confirm-schedule-change').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Applying court & time changes… command sent')).toBeVisible({timeout:300});report.schedule_change_ack_ms=Date.now()-started;await expect(page.getByTestId('cc-schedule-change-status')).toContainText('Schedule updated:',{timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length-scheduleBefore).toBe(1);expect(model.event.courts).toBe(3);expect(model.event.event_pack_stale).toBe(true);report.schedule_change_double_tap_calls=1;
  339 | 
  340 |   await page.getByRole('button',{name:'Live Event View'}).evaluate(el=>el.click());await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next')).toBeVisible();await expect(page.getByRole('button',{name:'Exit Display'})).toBeVisible();report.internal_hall_display=true;await page.getByRole('button',{name:'Exit Display'}).evaluate(el=>el.click());await expect(page.getByTestId('cc-tab-simulator')).toBeVisible({timeout:1500});
  341 | 
  342 |   await page.getByTestId('cc-tab-simulator').click();await expect(page.getByTestId('cc-populate-full')).toBeVisible();
  343 |   const populateBefore=model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length;started=Date.now();await page.getByTestId('cc-populate-full').click();await expect(page.getByText('Populating full TEST MODE event… one server command sent')).toBeVisible({timeout:300});metric(report,'full_test_ack_ms',Date.now()-started,250);await expect(page.getByText('Final Result',{exact:true}).first()).toBeVisible({timeout:2200});metric(report,'full_test_to_results_ms',Date.now()-started,2000);expect(model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length-populateBefore).toBe(1);expect(model.matches.filter(m=>!m.is_showcase&&m.status==='completed').length).toBe(48);expect(model.matches.filter(m=>m.is_showcase&&m.status==='completed').length).toBe(1);expect(model.votes.length).toBe(8);report.full_population_browser_calls=1;
  344 |   await expect(page.getByText(/^(Players of the Tournament|Highest Scoring Players|Team Player Awards)$/).first()).toBeVisible();await expect(page.getByText('Club A Test 01',{exact:true}).first()).toBeVisible();await expectNoHorizontalOverflow(page);
  345 | 
  346 |   await page.getByTestId('cc-tab-live').click();await expect(page.getByTestId('cc-host-round-nav')).toBeVisible();await page.getByTestId('cc-host-round-4').click();await expect(page.getByText('Round 4 Scores',{exact:true})).toBeVisible();expect(model.event.current_round).toBe(12);expect(model.event.status).toBe('completed');const completedR4C1=model.matches.find(m=>m.round_number===4&&m.court_number===1&&!m.is_showcase);const completedRevision=Number(completedR4C1.revision||0);await page.getByTestId('cc-score-r4-c1-a').fill('9');await page.getByTestId('cc-score-r4-c1-b').fill('11');await page.getByTestId('cc-save-score-r4-c1').click();await expect.poll(()=>Number(completedR4C1.revision||0),{timeout:1800}).toBe(completedRevision+1);expect(completedR4C1.score_a).toBe(9);expect(completedR4C1.score_b).toBe(11);expect(model.event.current_round).toBe(12);expect(model.event.status).toBe('completed');report.completed_round_navigation=true;report.completed_score_correction=true;
  347 | 
  348 |   await page.getByTestId('cc-tab-draw').click();await expect(page.getByText('Round 12',{exact:true})).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByText('Round at a Glance')).toBeVisible();report.revisit_populated_screens=true;
  349 | 
  350 |   report.total_function_calls=model.calls.length;report.normal_matches=model.matches.filter(m=>!m.is_showcase).length;report.participants=model.participants.length;
  351 |   console.log(`CLUB CHALLENGE HOST ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-host-robot-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  352 | });
  353 | 
  354 | test('Club Challenge public voter robot: one browser ballot across both teams',async({page},testInfo)=>{
```