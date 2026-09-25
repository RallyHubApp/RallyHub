# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-challenge-browser-robot.spec.mjs >> Club Challenge mobile host robot: setup → practice → draw → live → full result
- Location: e2e/club-challenge-browser-robot.spec.mjs:243:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Prepare Round 2 · 3 scores pending' })
Expected: visible
Error: strict mode violation: getByRole('button', { name: 'Prepare Round 2 · 3 scores pending' }) resolved to 2 elements:
    1) <button data-dynamic-content="true" data-collection-item-field="advanceActionLabel" data-source-location="src/components/clubchallenge/ClubChallengeView.jsx:2479:20" class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary…>Prepare Round 2 · 3 scores pending</button> aka getByTestId('cc-sticky-host-bar').getByRole('button', { name: 'Prepare Round 2 · 3 scores' })
    2) <button data-dynamic-content="true" data-collection-item-field="advanceActionLabel" data-source-location="src/components/clubchallenge/ClubChallengeView.jsx:2527:1193" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground sh…>Prepare Round 2 · 3 scores pending</button> aka getByRole('button', { name: 'Prepare Round 2 · 3 scores' }).nth(1)

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'Prepare Round 2 · 3 scores pending' }) with timeout 1800ms
  - waiting for getByRole('button', { name: 'Prepare Round 2 · 3 scores pending' })

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - main [ref=f1e3]:
    - generic [ref=f1e4]:
      - generic [ref=f1e5]:
        - generic [ref=f1e11]:
          - paragraph [ref=f1e12]: RallyHub Interclub
          - paragraph [ref=f1e13]: "Interclub Challenge · Status: in progress"
        - generic [ref=f1e14]:
          - generic [ref=f1e15]:
            - generic [ref=f1e16]:
              - generic [ref=f1e17]: CL
              - generic [ref=f1e18]: Clare Blue
            - generic [ref=f1e19]: vs
            - generic [ref=f1e20]:
              - generic [ref=f1e21]: CL
              - generic [ref=f1e22]: Clare Gold
          - button "Live Event View" [ref=f1e23] [cursor=pointer]
          - button "Player Link / QR" [ref=f1e24] [cursor=pointer]
          - button "Print Sheets · OUT OF DATE" [ref=f1e25] [cursor=pointer]
      - generic [ref=f1e27]:
        - button [ref=f1e28] [cursor=pointer]
        - button [ref=f1e33] [cursor=pointer]
        - button [ref=f1e38] [cursor=pointer]
        - button "4 Live Event" [active] [ref=f1e43] [cursor=pointer]:
          - generic [ref=f1e44]: "4"
          - text: Live Event
        - button "5 Simulator" [ref=f1e45] [cursor=pointer]:
          - generic [ref=f1e46]: "5"
          - text: Simulator
        - button "6 Results" [ref=f1e47] [cursor=pointer]:
          - generic [ref=f1e48]: "6"
          - text: Results
      - generic [ref=f1e50]:
        - generic [ref=f1e53]:
          - generic [ref=f1e54]: Round 1/12
          - generic [ref=f1e55]: 00:00
          - generic [ref=f1e56]:
            - strong [ref=f1e57]: 1/4
            - text: current scores saved
          - generic [ref=f1e58]:
            - button "Audio ON" [ref=f1e59] [cursor=pointer]
            - button "PA" [ref=f1e60] [cursor=pointer]
            - button "Reserve / Player Change" [ref=f1e61] [cursor=pointer]
            - button "Prepare Round 2 · 3 scores pending" [ref=f1e62] [cursor=pointer]
        - generic [ref=f1e63]:
          - generic [ref=f1e64]:
            - generic [ref=f1e65]:
              - generic [ref=f1e66]:
                - paragraph [ref=f1e67]: Finish-on-Time Guide
                - generic [ref=f1e68]: RECOVERY NEEDED
              - paragraph [ref=f1e69]: Booked finish 09:08 AM · projected finish 10:10 AM · started 91 min late
            - generic [ref=f1e70]:
              - paragraph [ref=f1e71]: 63 min over
              - paragraph [ref=f1e72]: Recalculates throughout the event
          - generic [ref=f1e73]:
            - paragraph [ref=f1e74]: Recommended recovery
            - paragraph [ref=f1e75]: Use 1-minute changeovers (saves up to 11 min) · Shorten the remaining break to 10 min (saves 10 min) · Reduce remaining rounds to about 6 min · Treat the Showcase Final as optional unless time is recovered
        - generic [ref=f1e77]:
          - generic [ref=f1e78]:
            - paragraph [ref=f1e79]: Live Event
            - paragraph [ref=f1e80]: Round 1 of 12
            - paragraph [ref=f1e81]: Clare Blue 2 – 0 Clare Gold
          - generic [ref=f1e82]:
            - generic [ref=f1e83]: 1W
            - generic [ref=f1e84]: 0D
            - generic [ref=f1e85]: 0W
        - generic [ref=f1e86]:
          - generic [ref=f1e87]:
            - generic [ref=f1e88]:
              - paragraph [ref=f1e89]: Round at a Glance
              - paragraph [ref=f1e90]: On court, resting and up next — all in one place.
            - generic [ref=f1e91]: R1
          - generic [ref=f1e92]:
            - generic [ref=f1e93]:
              - paragraph [ref=f1e94]: Court 1 · NOW
              - paragraph [ref=f1e95]: Club A Test 02 & Club A Test 01
              - paragraph [ref=f1e96]: vs
              - paragraph [ref=f1e97]: Club B Test 01 & Club B Test 02
            - generic [ref=f1e98]:
              - paragraph [ref=f1e99]: Court 2 · NOW
              - paragraph [ref=f1e100]: Club A Test 03 & Club A Test 04
              - paragraph [ref=f1e101]: vs
              - paragraph [ref=f1e102]: Club B Test 03 & Club B Test 04
            - generic [ref=f1e103]:
              - paragraph [ref=f1e104]: Court 3 · NOW
              - paragraph [ref=f1e105]: Club A Test 05 & Club A Test 06
              - paragraph [ref=f1e106]: vs
              - paragraph [ref=f1e107]: Club B Test 05 & Club B Test 06
            - generic [ref=f1e108]:
              - paragraph [ref=f1e109]: Court 4 · NOW
              - paragraph [ref=f1e110]: Club A Test 07 & Club A Test 08
              - paragraph [ref=f1e111]: vs
              - paragraph [ref=f1e112]: Club B Test 07 & Club B Test 08
          - generic [ref=f1e113]:
            - paragraph [ref=f1e114]: Resting this round
            - generic [ref=f1e115]:
              - generic [ref=f1e116]:
                - paragraph [ref=f1e117]: Clare Blue
                - generic [ref=f1e118]:
                  - generic [ref=f1e119]: Replacement Test
                  - generic [ref=f1e120]: Club A Test 09
                  - generic [ref=f1e121]: Club A Test 10
                  - generic [ref=f1e122]: Club A Test 11
                  - generic [ref=f1e123]: Club A Test 12
                  - generic [ref=f1e124]: Club A Test 13
                  - generic [ref=f1e125]: Club A Test 14
                  - generic [ref=f1e126]: Club A Test 15
                  - generic [ref=f1e127]: Club A Test 16
              - generic [ref=f1e128]:
                - paragraph [ref=f1e129]: Clare Gold
                - generic [ref=f1e130]:
                  - generic [ref=f1e131]: Club B Test 09
                  - generic [ref=f1e132]: Club B Test 10
                  - generic [ref=f1e133]: Club B Test 11
                  - generic [ref=f1e134]: Club B Test 12
                  - generic [ref=f1e135]: Club B Test 13
                  - generic [ref=f1e136]: Club B Test 14
                  - generic [ref=f1e137]: Club B Test 15
                  - generic [ref=f1e138]: Club B Test 16
          - generic [ref=f1e139]:
            - paragraph [ref=f1e140]: Up next · Round 2
            - generic [ref=f1e141]:
              - generic [ref=f1e142]:
                - paragraph [ref=f1e143]: Court 1 · NEXT
                - paragraph [ref=f1e144]: Club A Test 09 & Club A Test 10
                - paragraph [ref=f1e145]: vs
                - paragraph [ref=f1e146]: Club B Test 09 & Club B Test 10
              - generic [ref=f1e147]:
                - paragraph [ref=f1e148]: Court 2 · NEXT
                - paragraph [ref=f1e149]: Club A Test 11 & Club A Test 12
                - paragraph [ref=f1e150]: vs
                - paragraph [ref=f1e151]: Club B Test 11 & Club B Test 12
              - generic [ref=f1e152]:
                - paragraph [ref=f1e153]: Court 3 · NEXT
                - paragraph [ref=f1e154]: Club A Test 13 & Club A Test 14
                - paragraph [ref=f1e155]: vs
                - paragraph [ref=f1e156]: Club B Test 13 & Club B Test 14
              - generic [ref=f1e157]:
                - paragraph [ref=f1e158]: Court 4 · NEXT
                - paragraph [ref=f1e159]: Club A Test 15 & Club A Test 16
                - paragraph [ref=f1e160]: vs
                - paragraph [ref=f1e161]: Club B Test 15 & Club B Test 16
        - generic [ref=f1e162]:
          - generic [ref=f1e163]:
            - generic [ref=f1e164]:
              - paragraph [ref=f1e165]: Round Timer
              - paragraph [ref=f1e166]: Round 1 of 12
            - generic [ref=f1e167]: play
          - paragraph [ref=f1e169]: 00:00
          - generic [ref=f1e170]:
            - generic [ref=f1e171]:
              - paragraph [ref=f1e172]: This round
              - paragraph [ref=f1e173]: Adjust before play or while paused.
            - generic [ref=f1e174]:
              - button "Reduce this round by one minute" [ref=f1e175] [cursor=pointer]
              - paragraph [ref=f1e176]: 10:00
              - button "Add one minute to this round" [ref=f1e177] [cursor=pointer]
          - generic [ref=f1e178]:
            - button "Start Changeover" [ref=f1e179] [cursor=pointer]
            - button "Changeover" [disabled]
            - button "+1 minute" [disabled]
            - group [ref=f1e180]:
              - generic "Round options" [ref=f1e181] [cursor=pointer]
        - generic [ref=f1e182]:
          - generic [ref=f1e183]:
            - generic [ref=f1e184]:
              - paragraph [ref=f1e185]: Round 1 Scores
              - paragraph [ref=f1e186]: Enter each court result as it comes in — you do not need to wait for the timer to finish.
            - generic [ref=f1e187]: 1/4 saved
          - generic [ref=f1e188]:
            - generic [ref=f1e189]:
              - generic [ref=f1e190]:
                - generic [ref=f1e191]: Court 1
                - generic [ref=f1e192]: R1
              - generic [ref=f1e193]:
                - generic [ref=f1e194]:
                  - generic [ref=f1e195]:
                    - paragraph [ref=f1e196]: Clare Blue
                    - paragraph [ref=f1e197]: Club A Test 02 & Club A Test 01
                  - textbox "Clare Blue score" [ref=f1e198]: "11"
                - generic [ref=f1e199]:
                  - generic [ref=f1e200]:
                    - paragraph [ref=f1e201]: Clare Gold
                    - paragraph [ref=f1e202]: Club B Test 01 & Club B Test 02
                  - textbox "Clare Gold score" [ref=f1e203]: "8"
              - button "Update Result" [ref=f1e204] [cursor=pointer]
              - paragraph [ref=f1e205]: Saved · Clare Blue win
            - generic [ref=f1e206]:
              - generic [ref=f1e207]:
                - generic [ref=f1e208]: Court 2
                - generic [ref=f1e209]: R1
              - generic [ref=f1e210]:
                - generic [ref=f1e211]:
                  - generic [ref=f1e212]:
                    - paragraph [ref=f1e213]: Clare Blue
                    - paragraph [ref=f1e214]: Club A Test 03 & Club A Test 04
                  - textbox "Clare Blue score" [ref=f1e215]
                - generic [ref=f1e216]:
                  - generic [ref=f1e217]:
                    - paragraph [ref=f1e218]: Clare Gold
                    - paragraph [ref=f1e219]: Club B Test 03 & Club B Test 04
                  - textbox "Clare Gold score" [ref=f1e220]
              - button "Save Result" [disabled]
            - generic [ref=f1e221]:
              - generic [ref=f1e222]:
                - generic [ref=f1e223]: Court 3
                - generic [ref=f1e224]: R1
              - generic [ref=f1e225]:
                - generic [ref=f1e226]:
                  - generic [ref=f1e227]:
                    - paragraph [ref=f1e228]: Clare Blue
                    - paragraph [ref=f1e229]: Club A Test 05 & Club A Test 06
                  - textbox "Clare Blue score" [ref=f1e230]
                - generic [ref=f1e231]:
                  - generic [ref=f1e232]:
                    - paragraph [ref=f1e233]: Clare Gold
                    - paragraph [ref=f1e234]: Club B Test 05 & Club B Test 06
                  - textbox "Clare Gold score" [ref=f1e235]
              - button "Save Result" [disabled]
            - generic [ref=f1e236]:
              - generic [ref=f1e237]:
                - generic [ref=f1e238]: Court 4
                - generic [ref=f1e239]: R1
              - generic [ref=f1e240]:
                - generic [ref=f1e241]:
                  - generic [ref=f1e242]:
                    - paragraph [ref=f1e243]: Clare Blue
                    - paragraph [ref=f1e244]: Club A Test 07 & Club A Test 08
                  - textbox "Clare Blue score" [ref=f1e245]
                - generic [ref=f1e246]:
                  - generic [ref=f1e247]:
                    - paragraph [ref=f1e248]: Clare Gold
                    - paragraph [ref=f1e249]: Club B Test 07 & Club B Test 08
                  - textbox "Clare Gold score" [ref=f1e250]
              - button "Save Result" [disabled]
          - button "Prepare Round 2 · 3 scores pending" [ref=f1e251] [cursor=pointer]
        - group [ref=f1e252]:
          - generic "PA & Announcements Open only when you need the microphone or an announcement. NOT TESTED" [ref=f1e253] [cursor=pointer]:
            - generic [ref=f1e254]:
              - paragraph [ref=f1e255]: PA & Announcements
              - paragraph [ref=f1e256]: Open only when you need the microphone or an announcement.
            - generic [ref=f1e257]: NOT TESTED
        - group [ref=f1e261]:
          - generic [ref=f1e263] [cursor=pointer]:
            - paragraph [ref=f1e264]: Player Changes & Reserves
            - paragraph [ref=f1e265]: Quick reserve handover, injury, withdrawal, replacement or late arrival.
        - group [ref=f1e268]:
          - generic [ref=f1e270] [cursor=pointer]:
            - paragraph [ref=f1e271]: Court & Time Changes
            - paragraph [ref=f1e272]: Use this if you lose or gain a court, or if less event time remains than planned.
  - region "Notifications alt+T"
```

# Test source

```ts
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
  238 | function metric(report,name,value,max){report[name]=value;expect(value,`${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);}
  239 | async function expectNoHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,'mobile page should not require horizontal body scrolling').toBeLessThanOrEqual(1);}
  240 | 
  241 | test.use({ viewport:{width:390,height:844} });
  242 | 
  243 | test('Club Challenge mobile host robot: setup → practice → draw → live → full result',async({page},testInfo)=>{
  244 |   const model=createClubChallengeModel();const report={};await installHallDeviceMocks(page);await installClubChallengeBackend(page,model);page.on('dialog',d=>d.accept());
  245 |   await page.goto('/e2e/clubChallengeHarness.html');
  246 |   await expect(page.getByTestId('cc-root')).toBeVisible();
  247 |   await expect(page.getByText('Estimated event duration')).toBeVisible();
  248 |   await expect(page.getByText('2h 44m')).toBeVisible();
  249 |   await expectNoHorizontalOverflow(page);
  250 |   const lateStartClock=new Date(Date.now()-90*60000);const lateStartHHMM=`${String(lateStartClock.getHours()).padStart(2,'0')}:${String(lateStartClock.getMinutes()).padStart(2,'0')}`;await page.getByTestId('cc-scheduled-start-time').fill(lateStartHHMM);
  251 | 
  252 |   let started=Date.now();await page.getByTestId('cc-save-setup').click();await expect(page.getByTestId('cc-load-practice')).toBeVisible({timeout:1800});metric(report,'setup_to_teams_ms',Date.now()-started,1500);
  253 |   expect(model.event?.status).toBe('draft');
  254 | 
  255 |   started=Date.now();await page.getByTestId('cc-load-practice').click();await expect(page.getByText('Club A Test 01')).toBeVisible({timeout:1800});metric(report,'practice_roster_ms',Date.now()-started,1500);expect(model.participants.length).toBe(32);
  256 |   await expect(page.getByText('12').first()).toBeVisible();await expectNoHorizontalOverflow(page);
  257 | 
  258 |   await expect(page.getByText('Build the two teams')).toBeVisible();await expect(page.getByText('Unassigned Player Pool',{exact:true})).toBeHidden();await page.getByRole('button',{name:/^Unassigned Pool/}).click();await expect(page.getByText('Unassigned Player Pool',{exact:true})).toBeVisible();report.unassigned_pool_on_demand=true;
  259 |   const organiseBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='organise_teams').length;
  260 |   await page.getByTestId('cc-team-name-club_a').fill('Clare Blue');await page.getByTestId('cc-team-name-club_b').fill('Clare Gold');
  261 |   const drag=page.getByTestId('cc-team-drag-cc-a-2');await drag.focus();await drag.press('Space');await drag.press('ArrowUp');await drag.press('Space');
  262 |   started=Date.now();await page.getByTestId('cc-save-team-builder').click();await expect(page.getByText('Saving teams and rankings… one command sent')).toBeVisible({timeout:300});metric(report,'team_builder_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-team-builder-status')).toContainText('Teams saved',{timeout:1800});
  263 |   expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='organise_teams').length-organiseBefore).toBe(1);expect(model.participants.find(p=>p.id==='cc-a-2')?.event_rank).toBe(1);expect(model.event.club_a_name).toBe('Clare Blue');expect(model.event.club_b_name).toBe('Clare Gold');report.team_builder_browser_calls=1;report.drag_ranking_saved=true;
  264 | 
  265 |   const drawBefore=model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length;
  266 |   started=Date.now();await page.getByTestId('cc-generate-draw').click();await expect(page.getByText('Generating draw and fairness report… one command sent')).toBeVisible({timeout:300});metric(report,'draw_ack_ms',Date.now()-started,600);await expect(page.getByText('Fairness checks passed')).toBeVisible({timeout:2200});metric(report,'draw_to_review_ms',Date.now()-started,1800);expect(model.matches.filter(m=>!m.is_showcase).length).toBe(48);expect(new Set(model.matches.map(m=>m.round_number)).size).toBe(12);expect(model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length-drawBefore).toBe(1);report.draw_browser_calls=1;
  267 | 
  268 |   const approveBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length;
  269 |   started=Date.now();await page.getByTestId('cc-approve-draw').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Approving and locking draw… command sent')).toBeVisible({timeout:300});metric(report,'approve_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-prestart-sound-check')).toBeVisible({timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length-approveBefore).toBe(1);report.approve_double_tap_calls=1;
  270 | 
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
> 289 |   await page.reload();await expect(page.getByTestId('cc-root')).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByRole('button',{name:'Prepare Round 2 · 3 scores pending'})).toBeVisible({timeout:1800});
      |                                                                                                                                                                                                                ^ Error: expect(locator).toBeVisible() failed
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
  371 |   await page.getByTestId('cc-sticky-host-bar').getByRole('button',{name:/^Start 20-min Break/}).click();await expect(page.getByText('Break now',{exact:false}).first()).toBeVisible({timeout:1600});await expect(page.getByText('20:00').first()).toBeVisible();
  372 |   const fiveButtons=page.getByRole('button',{name:'5 min'});await expect(fiveButtons).toHaveCount(4);await fiveButtons.nth(0).click();await expect(page.getByText('15:00').first()).toBeVisible({timeout:1200});await fiveButtons.nth(1).click();await expect(page.getByText('20:00').first()).toBeVisible({timeout:1200});
  373 |   await page.getByRole('button',{name:/End Break Early/}).first().click();await expect(page.getByText('Round 7/12',{exact:true})).toBeVisible({timeout:1600});await expect(page.getByText('Up next · Round 8')).toBeVisible();await expectNoHorizontalOverflow(page);
  374 |   const report={historic_refresh_silent:true,recovery_guide:true,break_minus:true,break_plus:true,end_break_to_next_round:true};console.log(`LIVE RECOVERY ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('live-recovery-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  375 | });
```