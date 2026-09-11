# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-challenge-browser-robot.spec.mjs >> Club Challenge public Hall Display robot: now/resting/next + disconnect truth
- Location: e2e/club-challenge-browser-robot.spec.mjs:264:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Player 17')
Expected: visible
Error: strict mode violation: getByText('Player 17') resolved to 2 elements:
    1) <span data-dynamic-content="true" data-collection-item-id="hp17" data-collection-item-field="display_name" class="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium" data-source-location="src/pages/PublicClubChallengeDisplay.jsx:37:207">Player 17</span> aka getByText('Player 17', { exact: true })
    2) <p data-dynamic-content="true" data-collection-item-id="h-r2-c4" data-collection-item-field="club_a_names" data-source-location="src/pages/PublicClubChallengeDisplay.jsx:38:265">Player 14 & Player 15 vs Player 16 & Player 17</p> aka getByText('Player 14 & Player 15 vs')

Call log:
  - Expect "toBeVisible" getByText('Player 17') with timeout 3000ms
  - waiting for getByText('Player 17')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - paragraph [ref=e5]: Club Challenge · Hall Display
    - heading "Clare 0 – 0 Galway" [level=1] [ref=e6]:
      - text: Clare
      - generic [ref=e7]: 0 – 0
      - text: Galway
    - generic [ref=e8]:
      - generic [ref=e9]: Round 1
      - generic [ref=e10]: PLAY
      - generic [ref=e11]: 08:00
  - generic [ref=e12]:
    - heading "On Court Now" [level=2] [ref=e13]
    - generic [ref=e14]:
      - generic [ref=e15]:
        - paragraph [ref=e16]: Court 1
        - paragraph [ref=e17]: Player 1 & Player 2
        - paragraph [ref=e18]: vs
        - paragraph [ref=e19]: Player 3 & Player 4
      - generic [ref=e20]:
        - paragraph [ref=e21]: Court 2
        - paragraph [ref=e22]: Player 5 & Player 6
        - paragraph [ref=e23]: vs
        - paragraph [ref=e24]: Player 7 & Player 8
      - generic [ref=e25]:
        - paragraph [ref=e26]: Court 3
        - paragraph [ref=e27]: Player 9 & Player 10
        - paragraph [ref=e28]: vs
        - paragraph [ref=e29]: Player 11 & Player 12
      - generic [ref=e30]:
        - paragraph [ref=e31]: Court 4
        - paragraph [ref=e32]: Player 13 & Player 14
        - paragraph [ref=e33]: vs
        - paragraph [ref=e34]: Player 15 & Player 16
  - generic [ref=e35]:
    - heading "Resting This Round" [level=2] [ref=e36]
    - generic [ref=e37]:
      - generic [ref=e38]: Player 17
      - generic [ref=e39]: Player 18
      - generic [ref=e40]: Player 19
      - generic [ref=e41]: Player 20
  - generic [ref=e42]:
    - heading "Up Next · Round 2" [level=2] [ref=e43]
    - generic [ref=e44]:
      - generic [ref=e45]:
        - generic [ref=e46]: Court 1
        - paragraph [ref=e47]: Player 2 & Player 3 vs Player 4 & Player 5
      - generic [ref=e48]:
        - generic [ref=e49]: Court 2
        - paragraph [ref=e50]: Player 6 & Player 7 vs Player 8 & Player 9
      - generic [ref=e51]:
        - generic [ref=e52]: Court 3
        - paragraph [ref=e53]: Player 10 & Player 11 vs Player 12 & Player 13
      - generic [ref=e54]:
        - generic [ref=e55]: Court 4
        - paragraph [ref=e56]: Player 14 & Player 15 vs Player 16 & Player 17
  - paragraph [ref=e57]: Junior privacy mode · surnames abbreviated.
```

# Test source

```ts
  171 |     const fnMarker=`/api/apps/${APP_ID}/functions/`;
  172 |     const fnIndex=path.indexOf(fnMarker);
  173 |     if(fnIndex>=0){const name=decodeURIComponent(path.slice(fnIndex+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}return json(route,await model.handleFunction(name,body));}
  174 |     const entityMarker=`/api/apps/${APP_ID}/entities/`;
  175 |     const entityIndex=path.indexOf(entityMarker);
  176 |     if(entityIndex>=0){const rest=path.slice(entityIndex+entityMarker.length);const [entity,recordId]=rest.split('/').map(decodeURIComponent);let body={};try{body=req.postDataJSON()||{};}catch{}
  177 |       if(req.method()==='GET')return json(route,model.entityList(entity));
  178 |       if(req.method()==='POST')return json(route,model.createEntity(entity,body));
  179 |       if(['PUT','PATCH'].includes(req.method()))return json(route,model.updateEntity(entity,recordId,body));
  180 |       if(req.method()==='DELETE')return json(route,{});
  181 |     }
  182 |     return json(route,{});
  183 |   });
  184 | }
  185 | 
  186 | async function installHallDeviceMocks(page){
  187 |   await page.addInitScript(()=>{
  188 |     window.__ccDevice={audioSignals:0,speech:[],wakeRequests:0,wakeReleases:0,vibrations:0};
  189 |     class FakeParam{setValueAtTime(){} exponentialRampToValueAtTime(){}}
  190 |     class FakeOsc{constructor(){this.frequency=new FakeParam();this.type='square';}connect(){}start(){window.__ccDevice.audioSignals++;}stop(){}}
  191 |     class FakeGain{constructor(){this.gain=new FakeParam();}connect(){}}
  192 |     class FakeAudioContext{constructor(){this.state='suspended';this.currentTime=0;this.destination={};}createOscillator(){return new FakeOsc();}createGain(){return new FakeGain();}async resume(){this.state='running';}}
  193 |     window.AudioContext=FakeAudioContext;window.webkitAudioContext=FakeAudioContext;
  194 |     window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;this.volume=1;this.lang='';this.rate=1;this.pitch=1;this.voice=null;}};
  195 |     window.speechSynthesis={getVoices:()=>[{name:'Moira',lang:'en-IE'}],cancel(){},resume(){},speak(u){window.__ccDevice.speech.push({text:u.text,volume:u.volume,lang:u.lang});},addEventListener(){},removeEventListener(){}};
  196 |     Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{window.__ccDevice.wakeRequests++;return{release:async()=>{window.__ccDevice.wakeReleases++;}};}}});
  197 |     Object.defineProperty(navigator,'vibrate',{configurable:true,value:()=>{window.__ccDevice.vibrations++;return true;}});
  198 |   });
  199 | }
  200 | 
  201 | function metric(report,name,value,max){report[name]=value;expect(value,`${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);}
  202 | async function expectNoHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,'mobile page should not require horizontal body scrolling').toBeLessThanOrEqual(1);}
  203 | 
  204 | test.use({ viewport:{width:390,height:844} });
  205 | 
  206 | test('Club Challenge mobile host robot: setup → practice → draw → live → full result',async({page},testInfo)=>{
  207 |   const model=createClubChallengeModel();const report={};await installHallDeviceMocks(page);await installClubChallengeBackend(page,model);page.on('dialog',d=>d.accept());
  208 |   await page.goto('/e2e/clubChallengeHarness.html');
  209 |   await expect(page.getByTestId('cc-root')).toBeVisible();
  210 |   await expect(page.getByText('Estimated event duration')).toBeVisible();
  211 |   await expect(page.getByText('2h 44m')).toBeVisible();
  212 |   await expectNoHorizontalOverflow(page);
  213 | 
  214 |   let started=Date.now();await page.getByTestId('cc-save-setup').click();await expect(page.getByTestId('cc-load-practice')).toBeVisible({timeout:1800});metric(report,'setup_to_teams_ms',Date.now()-started,1500);
  215 |   expect(model.event?.status).toBe('draft');
  216 | 
  217 |   started=Date.now();await page.getByTestId('cc-load-practice').click();await expect(page.getByText('Club A Test 01')).toBeVisible({timeout:1800});metric(report,'practice_roster_ms',Date.now()-started,1500);expect(model.participants.length).toBe(32);
  218 |   await expect(page.getByText('12').first()).toBeVisible();await expectNoHorizontalOverflow(page);
  219 | 
  220 |   const reorderBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='reorder').length;
  221 |   started=Date.now();await page.getByRole('button',{name:'Move Club A Test 02 up'}).click();await expect(page.getByText('Saving player ranking… one command sent')).toBeVisible({timeout:300});metric(report,'ranking_ack_ms',Date.now()-started,250);await expect(page.getByText('Saving player ranking… one command sent')).toBeHidden({timeout:1800});
  222 |   expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='reorder').length-reorderBefore).toBe(1);report.ranking_browser_calls=1;
  223 | 
  224 |   const drawBefore=model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length;
  225 |   started=Date.now();await page.getByTestId('cc-generate-draw').click();await expect(page.getByText('Generating draw and fairness report… one command sent')).toBeVisible({timeout:300});metric(report,'draw_ack_ms',Date.now()-started,250);await expect(page.getByText('Hard checks PASS')).toBeVisible({timeout:2200});metric(report,'draw_to_review_ms',Date.now()-started,1800);expect(model.matches.filter(m=>!m.is_showcase).length).toBe(48);expect(new Set(model.matches.map(m=>m.round_number)).size).toBe(12);expect(model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length-drawBefore).toBe(1);report.draw_browser_calls=1;
  226 | 
  227 |   const approveBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length;
  228 |   started=Date.now();await page.getByTestId('cc-approve-draw').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Approving and locking draw… command sent')).toBeVisible({timeout:300});metric(report,'approve_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-prestart-sound-check')).toBeVisible({timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length-approveBefore).toBe(1);report.approve_double_tap_calls=1;
  229 | 
  230 |   const fnBeforeSound=model.calls.length;await page.getByTestId('cc-prestart-sound-check').click();await expect.poll(async()=>await page.evaluate(()=>window.__ccDevice.audioSignals)).toBeGreaterThan(0);await expect.poll(async()=>await page.evaluate(()=>window.__ccDevice.speech.length)).toBeGreaterThan(0);expect(model.calls.length).toBe(fnBeforeSound);report.sound_check_base44_calls=0;
  231 | 
  232 |   const startBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length;
  233 |   started=Date.now();await page.getByTestId('cc-start-event').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting Club Challenge… command sent')).toBeVisible({timeout:300});metric(report,'event_start_ack_ms',Date.now()-started,250);await expect(page.getByText('Round at a Glance')).toBeVisible({timeout:2000});metric(report,'event_start_to_live_ms',Date.now()-started,1800);expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length-startBefore).toBe(1);report.start_double_tap_calls=1;
  234 |   await expect(page.getByText('Resting this round')).toBeVisible();await expect(page.getByText('Up next · Round 2')).toBeVisible();await expectNoHorizontalOverflow(page);
  235 | 
  236 |   const timerBefore=model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length;
  237 |   started=Date.now();await page.getByTestId('cc-timer-start-play').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting play… command sent')).toBeVisible({timeout:300});metric(report,'timer_start_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-timer-pause')).toBeEnabled({timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length-timerBefore).toBe(1);const device=await page.evaluate(()=>window.__ccDevice);expect(device.wakeRequests).toBeGreaterThan(0);expect(device.speech.some(x=>/Start round/i.test(x.text))).toBe(true);report.timer_double_tap_calls=1;
  238 | 
  239 |   await page.getByTestId('cc-score-r1-c1-a').fill('11');await page.getByTestId('cc-score-r1-c1-b').fill('8');started=Date.now();await page.getByTestId('cc-save-score-r1-c1').click();await expect(page.getByTestId('cc-score-card-r1-c1')).toContainText('Revision 1',{timeout:1500});metric(report,'single_score_save_ms',Date.now()-started,1200);
  240 | 
  241 |   await page.getByRole('button',{name:'Hall Display'}).click();await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next')).toBeVisible();await expect(page.getByRole('button',{name:'Exit Display'})).toBeVisible();report.internal_hall_display=true;await page.getByRole('button',{name:'Exit Display'}).click();
  242 | 
  243 |   await page.getByTestId('cc-tab-simulator').click();await expect(page.getByTestId('cc-populate-full')).toBeVisible();
  244 |   const populateBefore=model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length;started=Date.now();await page.getByTestId('cc-populate-full').click();await expect(page.getByText('Populating full TEST MODE event… one server command sent')).toBeVisible({timeout:300});metric(report,'full_test_ack_ms',Date.now()-started,250);await expect(page.getByText('Final Result')).toBeVisible({timeout:2200});metric(report,'full_test_to_results_ms',Date.now()-started,2000);expect(model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length-populateBefore).toBe(1);expect(model.matches.filter(m=>!m.is_showcase&&m.status==='completed').length).toBe(48);expect(model.matches.filter(m=>m.is_showcase&&m.status==='completed').length).toBe(1);expect(model.votes.length).toBe(8);report.full_population_browser_calls=1;
  245 |   await expect(page.getByText('Player of the Tournament')).toBeVisible();await expect(page.getByText('Club A Test 01')).toBeVisible();await expectNoHorizontalOverflow(page);
  246 | 
  247 |   await page.getByTestId('cc-tab-draw').click();await expect(page.getByText('Round 12',{exact:true})).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByText('Round at a Glance')).toBeVisible();report.revisit_populated_screens=true;
  248 | 
  249 |   report.total_function_calls=model.calls.length;report.normal_matches=model.matches.filter(m=>!m.is_showcase).length;report.participants=model.participants.length;
  250 |   console.log(`CLUB CHALLENGE HOST ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-host-robot-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  251 | });
  252 | 
  253 | test('Club Challenge public voter robot: simple identity → code → nominee → vote',async({page},testInfo)=>{
  254 |   const participants=[
  255 |     {id:'p1',display_name:'Aoife M.',can_vote:true},{id:'p2',display_name:'Brian K.',can_vote:true},{id:'p3',display_name:'Cara D.',can_vote:true},{id:'p4',display_name:'Declan R.',can_vote:true},
  256 |   ];
  257 |   const calls=[];
  258 |   await page.route('**/api/apps/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;if(path.includes('/analytics/'))return json(route,{});const marker=`/api/apps/${APP_ID}/functions/`;const i=path.indexOf(marker);if(i<0)return json(route,{});const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}calls.push({name,body});if(name==='getPublicClubChallengeVote')return json(route,{success:true,event:{club_a_name:'Clare',club_b_name:'Galway',pot_status:'open',junior_display_mode:true},participants});if(name==='castPublicClubChallengePotVote'){await sleep(420);if(body.voterCode!=='A1B2C3D4')return json(route,{error:'Participant access code is incorrect.'});if(body.voterParticipantId===body.nomineeParticipantId)return json(route,{error:'Players cannot vote for themselves.'});return json(route,{success:true,voteId:'vote-public-1'});}return json(route,{});});
  259 |   await page.goto('/e2e/clubChallengePublicVoteHarness.html');await expect(page.getByText('Clare vs Galway')).toBeVisible();await expect(page.getByText('One vote per participant · no self-voting · individual votes remain private.')).toBeVisible();
  260 |   const combos=page.getByRole('combobox');await combos.nth(0).click();await page.getByRole('option',{name:'Aoife M.'}).click();await page.getByPlaceholder('8-character code').fill('A1B2C3D4');await combos.nth(1).click();await expect(page.getByRole('option',{name:'Aoife M.'})).toHaveCount(0);await page.getByRole('option',{name:'Brian K.'}).click();
  261 |   const castBefore=calls.filter(c=>c.name==='castPublicClubChallengePotVote').length;const started=Date.now();const cast=page.getByRole('button',{name:'Cast Vote'});await cast.evaluate(el=>{el.click();el.click();});await expect(page.getByRole('button',{name:'Recording…'})).toBeVisible({timeout:250});await expect(page.getByText('Vote recorded')).toBeVisible({timeout:1500});expect(calls.filter(c=>c.name==='castPublicClubChallengePotVote').length-castBefore).toBe(1);const report={vote_ack_ms:Date.now()-started,cast_calls:1,self_nominee_hidden:true,privacy_copy:true};console.log(`CLUB CHALLENGE PUBLIC VOTE ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-vote-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  262 | });
  263 | 
  264 | test('Club Challenge public Hall Display robot: now/resting/next + disconnect truth',async({page},testInfo)=>{
  265 |   const participants=Array.from({length:20},(_,i)=>({id:`hp${i+1}`,display_name:`Player ${i+1}`}));
  266 |   const names=ids=>ids.map(id=>participants.find(p=>p.id===id)?.display_name||'Player');
  267 |   const current=[];for(let c=1;c<=4;c++){const ids=participants.slice((c-1)*4,c*4).map(p=>p.id);current.push({id:`h-r1-c${c}`,round_number:1,court_number:c,status:'scheduled',winner:'none',score_a:null,score_b:null,is_showcase:false,club_a_participant_ids:ids.slice(0,2),club_b_participant_ids:ids.slice(2),club_a_names:names(ids.slice(0,2)),club_b_names:names(ids.slice(2))});}
  268 |   const next=current.map((m,i)=>({...m,id:`h-r2-c${i+1}`,round_number:2,club_a_participant_ids:[participants[(i*4+1)%20].id,participants[(i*4+2)%20].id],club_b_participant_ids:[participants[(i*4+3)%20].id,participants[(i*4+4)%20].id,].filter(Boolean)})).map(m=>({...m,club_a_names:names(m.club_a_participant_ids),club_b_names:names(m.club_b_participant_ids)}));
  269 |   const payload={success:true,event:{id:'hall-event',status:'in_progress',club_a_name:'Clare',club_b_name:'Galway',current_round:1,timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:480,started_at:null,round:1}),timer_revision:1,junior_display_mode:true,win_points:2,draw_points:1,loss_points:0},participants,matches:[...current,...next]};
  270 |   await page.route('**/api/apps/**',async route=>{const path=new URL(route.request().url()).pathname;if(path.includes('/analytics/'))return json(route,{});if(path.includes('/functions/getPublicClubChallengeDisplay'))return json(route,payload);return json(route,{});});
> 271 |   await page.goto('/e2e/clubChallengePublicDisplayHarness.html');await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next · Round 2')).toBeVisible();await expect(page.getByText('Player 17')).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('online')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeHidden({timeout:1200});await expectNoHorizontalOverflow(page);const report={now:true,resting:true,next:true,disconnect_warning:true,reconnect:true};console.log(`CLUB CHALLENGE PUBLIC DISPLAY ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-display-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
      |                                                                                                                                                                                                                                                                                                        ^ Error: expect(locator).toBeVisible() failed
  272 | });
```