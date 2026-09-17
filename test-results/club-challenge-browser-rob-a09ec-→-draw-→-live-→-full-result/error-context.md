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

Locator: getByText(/0 would be marked Not Played/)
Expected: visible
Error: strict mode violation: getByText(/0 would be marked Not Played/) resolved to 2 elements:
    1) <p data-dynamic-content="true" data-source-location="src/components/clubchallenge/ClubChallengeView.jsx:1502:105">…</p> aka getByText('Proposed change: 44 future')
    2) <div class="" data-title="">44 future matches fit; 0 would be marked Not Play…</div> aka getByText('44 future matches fit; 0')

Call log:
  - Expect "toBeVisible" getByText(/0 would be marked Not Played/) with timeout 3000ms
  - waiting for getByText(/0 would be marked Not Played/)

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
              - generic [ref=e18]: Clare Pickleball Club
            - generic [ref=e19]: vs
            - generic [ref=e20]:
              - generic [ref=e21]: GA
              - generic [ref=e22]: Galway Pickleball
          - button "Hall Display" [ref=e23] [cursor=pointer]
          - button "Public Links / QR" [ref=e24] [cursor=pointer]
          - button "Print Event Pack · OUT OF DATE" [ref=e25] [cursor=pointer]
      - generic [ref=e27]:
        - button [ref=e28] [cursor=pointer]
        - button [ref=e33] [cursor=pointer]
        - button [ref=e38] [cursor=pointer]
        - button "4 Live Event" [ref=e43] [cursor=pointer]:
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
          - generic [ref=e54]: Round 2/12
          - generic [ref=e55]: 10:00
          - generic [ref=e56]:
            - strong [ref=e57]: 0/4
            - text: scores saved
          - generic [ref=e58]:
            - button "PA" [ref=e59] [cursor=pointer]
            - button "Players" [ref=e60] [cursor=pointer]
            - button "4 scores to save" [disabled]
        - generic [ref=e62]:
          - generic [ref=e63]:
            - paragraph [ref=e64]: Live Event
            - paragraph [ref=e65]: Round 2 of 12
            - paragraph [ref=e66]: Clare Pickleball Club 8 – 0 Galway Pickleball
          - generic [ref=e67]:
            - generic [ref=e68]: 4W
            - generic [ref=e69]: 0D
            - generic [ref=e70]: 0W
        - generic [ref=e71]:
          - generic [ref=e72]:
            - generic [ref=e73]:
              - paragraph [ref=e74]: Round at a Glance
              - paragraph [ref=e75]: On court, resting and up next — all in one place.
            - generic [ref=e76]: R2
          - generic [ref=e77]:
            - generic [ref=e78]:
              - paragraph [ref=e79]: Court 1 · NOW
              - paragraph [ref=e80]: Club A Test 09 & Club A Test 10
              - paragraph [ref=e81]: vs
              - paragraph [ref=e82]: Club B Test 09 & Club B Test 10
            - generic [ref=e83]:
              - paragraph [ref=e84]: Court 2 · NOW
              - paragraph [ref=e85]: Club A Test 11 & Club A Test 12
              - paragraph [ref=e86]: vs
              - paragraph [ref=e87]: Club B Test 11 & Club B Test 12
            - generic [ref=e88]:
              - paragraph [ref=e89]: Court 3 · NOW
              - paragraph [ref=e90]: Club A Test 13 & Club A Test 14
              - paragraph [ref=e91]: vs
              - paragraph [ref=e92]: Club B Test 13 & Club B Test 14
            - generic [ref=e93]:
              - paragraph [ref=e94]: Court 4 · NOW
              - paragraph [ref=e95]: Club A Test 15 & Club A Test 16
              - paragraph [ref=e96]: vs
              - paragraph [ref=e97]: Club B Test 15 & Club B Test 16
          - generic [ref=e98]:
            - paragraph [ref=e99]: Resting this round
            - generic [ref=e100]:
              - generic [ref=e101]:
                - paragraph [ref=e102]: Clare Pickleball Club
                - generic [ref=e103]:
                  - generic [ref=e104]: Replacement Test
                  - generic [ref=e105]: Club A Test 01
                  - generic [ref=e106]: Club A Test 03
                  - generic [ref=e107]: Club A Test 04
                  - generic [ref=e108]: Club A Test 05
                  - generic [ref=e109]: Club A Test 06
                  - generic [ref=e110]: Club A Test 07
                  - generic [ref=e111]: Club A Test 08
              - generic [ref=e112]:
                - paragraph [ref=e113]: Galway Pickleball
                - generic [ref=e114]:
                  - generic [ref=e115]: Club B Test 01
                  - generic [ref=e116]: Club B Test 02
                  - generic [ref=e117]: Club B Test 03
                  - generic [ref=e118]: Club B Test 04
                  - generic [ref=e119]: Club B Test 05
                  - generic [ref=e120]: Club B Test 06
                  - generic [ref=e121]: Club B Test 07
                  - generic [ref=e122]: Club B Test 08
          - generic [ref=e123]:
            - paragraph [ref=e124]: Up next · Round 3
            - generic [ref=e125]:
              - generic [ref=e126]:
                - paragraph [ref=e127]: Court 1 · NEXT
                - paragraph [ref=e128]: Replacement Test & Club A Test 03
                - paragraph [ref=e129]: vs
                - paragraph [ref=e130]: Club B Test 05 & Club B Test 07
              - generic [ref=e131]:
                - paragraph [ref=e132]: Court 2 · NEXT
                - paragraph [ref=e133]: Club A Test 01 & Club A Test 04
                - paragraph [ref=e134]: vs
                - paragraph [ref=e135]: Club B Test 06 & Club B Test 08
              - generic [ref=e136]:
                - paragraph [ref=e137]: Court 3 · NEXT
                - paragraph [ref=e138]: Club A Test 05 & Club A Test 07
                - paragraph [ref=e139]: vs
                - paragraph [ref=e140]: Club B Test 01 & Club B Test 03
              - generic [ref=e141]:
                - paragraph [ref=e142]: Court 4 · NEXT
                - paragraph [ref=e143]: Club A Test 06 & Club A Test 08
                - paragraph [ref=e144]: vs
                - paragraph [ref=e145]: Club B Test 02 & Club B Test 04
        - generic [ref=e146]:
          - generic [ref=e147]:
            - generic [ref=e148]:
              - paragraph [ref=e149]: Round Timer
              - paragraph [ref=e150]: Round 2 of 12
            - generic [ref=e151]: ready
          - paragraph [ref=e153]: 10:00
          - generic [ref=e154]:
            - generic [ref=e155]:
              - paragraph [ref=e156]: This round
              - paragraph [ref=e157]: Adjust before play or while paused.
            - generic [ref=e158]:
              - button "Reduce this round by one minute" [ref=e159] [cursor=pointer]
              - paragraph [ref=e160]: 10:00
              - button "Add one minute to this round" [ref=e161] [cursor=pointer]
          - generic [ref=e162]:
            - button "Start Play" [ref=e163] [cursor=pointer]
            - button "Changeover" [disabled]
            - button "+1 minute" [disabled]
            - group [ref=e164]:
              - generic "Round options" [ref=e165] [cursor=pointer]
        - generic [ref=e166]:
          - generic [ref=e167]:
            - generic [ref=e168]:
              - paragraph [ref=e169]: Round 2 Scores
              - paragraph [ref=e170]: Enter each court result as it comes in — you do not need to wait for the timer to finish.
            - generic [ref=e171]: 0/4 saved
          - generic [ref=e172]:
            - generic [ref=e173]:
              - generic [ref=e174]:
                - generic [ref=e175]: Court 1
                - generic [ref=e176]: R2
              - generic [ref=e177]:
                - generic [ref=e178]:
                  - generic [ref=e179]:
                    - paragraph [ref=e180]: Clare Pickleball Club
                    - paragraph [ref=e181]: Club A Test 09 & Club A Test 10
                  - textbox "Clare Pickleball Club score" [ref=e182]
                - generic [ref=e183]:
                  - generic [ref=e184]:
                    - paragraph [ref=e185]: Galway Pickleball
                    - paragraph [ref=e186]: Club B Test 09 & Club B Test 10
                  - textbox "Galway Pickleball score" [ref=e187]
              - button "Save Result" [disabled]
            - generic [ref=e188]:
              - generic [ref=e189]:
                - generic [ref=e190]: Court 2
                - generic [ref=e191]: R2
              - generic [ref=e192]:
                - generic [ref=e193]:
                  - generic [ref=e194]:
                    - paragraph [ref=e195]: Clare Pickleball Club
                    - paragraph [ref=e196]: Club A Test 11 & Club A Test 12
                  - textbox "Clare Pickleball Club score" [ref=e197]
                - generic [ref=e198]:
                  - generic [ref=e199]:
                    - paragraph [ref=e200]: Galway Pickleball
                    - paragraph [ref=e201]: Club B Test 11 & Club B Test 12
                  - textbox "Galway Pickleball score" [ref=e202]
              - button "Save Result" [disabled]
            - generic [ref=e203]:
              - generic [ref=e204]:
                - generic [ref=e205]: Court 3
                - generic [ref=e206]: R2
              - generic [ref=e207]:
                - generic [ref=e208]:
                  - generic [ref=e209]:
                    - paragraph [ref=e210]: Clare Pickleball Club
                    - paragraph [ref=e211]: Club A Test 13 & Club A Test 14
                  - textbox "Clare Pickleball Club score" [ref=e212]
                - generic [ref=e213]:
                  - generic [ref=e214]:
                    - paragraph [ref=e215]: Galway Pickleball
                    - paragraph [ref=e216]: Club B Test 13 & Club B Test 14
                  - textbox "Galway Pickleball score" [ref=e217]
              - button "Save Result" [disabled]
            - generic [ref=e218]:
              - generic [ref=e219]:
                - generic [ref=e220]: Court 4
                - generic [ref=e221]: R2
              - generic [ref=e222]:
                - generic [ref=e223]:
                  - generic [ref=e224]:
                    - paragraph [ref=e225]: Clare Pickleball Club
                    - paragraph [ref=e226]: Club A Test 15 & Club A Test 16
                  - textbox "Clare Pickleball Club score" [ref=e227]
                - generic [ref=e228]:
                  - generic [ref=e229]:
                    - paragraph [ref=e230]: Galway Pickleball
                    - paragraph [ref=e231]: Club B Test 15 & Club B Test 16
                  - textbox "Galway Pickleball score" [ref=e232]
              - button "Save Result" [disabled]
          - button "Save all 4 results to complete Round 2" [disabled]
        - group [ref=e233]:
          - generic "PA & Announcements Open only when you need the microphone or an announcement. AUDIO READY" [ref=e234] [cursor=pointer]:
            - generic [ref=e235]:
              - paragraph [ref=e236]: PA & Announcements
              - paragraph [ref=e237]: Open only when you need the microphone or an announcement.
            - generic [ref=e238]: AUDIO READY
        - group [ref=e242]:
          - generic [ref=e244] [cursor=pointer]:
            - paragraph [ref=e245]: Player Controls
            - paragraph [ref=e246]: Injury, withdrawal, replacement or late arrival.
          - generic [ref=e249]:
            - generic [ref=e250]:
              - generic [ref=e251]:
                - paragraph [ref=e252]: Replace / Withdraw a Player
                - paragraph [ref=e253]: Completed results stay unchanged. RallyHub updates future unplayed fixtures only.
              - generic [ref=e254]:
                - generic [ref=e255]:
                  - text: Player leaving
                  - combobox [ref=e256] [cursor=pointer]:
                    - generic: Choose player
                - generic [ref=e259]:
                  - text: Registered reserve / available player
                  - combobox [disabled] [ref=e260]:
                    - generic: Type a replacement manually
                - generic [ref=e263]:
                  - text: Replacement name
                  - textbox "Name" [ref=e264]
                - generic [ref=e265]:
                  - text: Reason
                  - combobox [ref=e266] [cursor=pointer]:
                    - generic: Withdrawn / unavailable
                - generic [ref=e269]:
                  - text: Gender
                  - combobox [ref=e270] [cursor=pointer]:
                    - generic: Inherit outgoing player
                - generic [ref=e273]:
                  - text: Note
                  - textbox "Optional note" [ref=e274]
              - generic [ref=e275]:
                - button "Replace from Round 2" [disabled]
                - button "Continue Short · No Replacement" [disabled]
              - generic [ref=e276]: Club A Test 02 replaced by Replacement Test from Round 1. 5 future fixtures updated; completed results unchanged.
            - generic [ref=e277]:
              - generic [ref=e278]:
                - paragraph [ref=e279]: Late Arrival
                - paragraph [ref=e280]: Set the first round a player is available. RallyHub will flag that the remaining draw may need review.
              - generic [ref=e281]:
                - combobox [ref=e282] [cursor=pointer]:
                  - generic: Player
                - spinbutton [ref=e285]: "1"
                - button "Set Round" [disabled]
        - group [ref=e286]:
          - generic [ref=e288] [cursor=pointer]:
            - paragraph [ref=e289]: Court & Time Changes
            - paragraph [ref=e290]: Use this if you lose or gain a court, or if less event time remains than planned.
          - generic [ref=e294]:
            - generic [ref=e295]:
              - paragraph [ref=e296]: Preview the impact before changing anything
              - paragraph [ref=e297]: Enter the courts actually available now and the minutes remaining. RallyHub will show how many future matches still fit, which matches would move, and whether any would have to be marked Not Played. Completed results are never changed.
            - generic [ref=e298]:
              - generic [ref=e299]:
                - text: Courts available now
                - spinbutton "4" [ref=e300]: "3"
              - generic [ref=e301]:
                - text: Minutes remaining
                - spinbutton "e.g. 60" [ref=e302]: "180"
              - button "Preview Impact" [active] [ref=e303] [cursor=pointer]
            - generic [ref=e304]:
              - paragraph [ref=e305]:
                - strong [ref=e306]: "Proposed change:"
                - text: 44 future matches can still be played · 41 move to a different round/court · 0 would be marked Not Played.
              - paragraph [ref=e307]: Nothing changes until you press Confirm Changes. Completed results remain locked, and the existing Event Pack will be marked out of date.
              - generic [ref=e308]:
                - button "Confirm Changes" [ref=e309] [cursor=pointer]
                - button "Cancel" [ref=e310] [cursor=pointer]
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e311]:
        - generic [ref=e315]: 44 future matches fit; 0 would be marked Not Played. Review before confirming.
      - listitem [ref=e317]:
        - generic [ref=e321]: Round 2 ready · 4 courts · 16 players resting
      - listitem [ref=e323]:
        - generic [ref=e327]: Score saved
      - listitem:
        - generic: Score saved
      - listitem:
        - generic: Score saved
      - listitem:
        - generic: Club A Test 02 replaced by Replacement Test from Round 1. 5 future fixtures updated; completed results unchanged.
      - listitem:
        - generic: Score saved
```

# Test source

```ts
  176 |     if (name === 'updateClubChallengePot') {
  177 |       await sleep(180); if(body.action==='open')model.event.pot_status='open';if(body.action==='close')model.event.pot_status='closed';return {success:true,event:model.event};
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
> 276 |   await page.locator('#cc-court-time-controls > summary').click();await page.getByTestId('cc-courts-now').fill('3');await page.getByTestId('cc-minutes-remaining').fill('180');await page.getByTestId('cc-preview-schedule-change').click();await expect(page.getByText(/0 would be marked Not Played/)).toBeVisible();const scheduleBefore=model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length;started=Date.now();await page.getByTestId('cc-confirm-schedule-change').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Applying court & time changes… command sent')).toBeVisible({timeout:300});metric(report,'schedule_change_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-schedule-change-status')).toContainText('Schedule updated:',{timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length-scheduleBefore).toBe(1);expect(model.event.courts).toBe(3);expect(model.event.event_pack_stale).toBe(true);report.schedule_change_double_tap_calls=1;
      |                                                                                                                                                                                                                                                                                                          ^ Error: expect(locator).toBeVisible() failed
  277 | 
  278 |   await page.getByRole('button',{name:'Hall Display'}).click();await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next')).toBeVisible();await expect(page.getByRole('button',{name:'Exit Display'})).toBeVisible();report.internal_hall_display=true;await page.getByRole('button',{name:'Exit Display'}).click();
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