# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: club-challenge-browser-robot.spec.mjs >> Club Challenge mobile host robot: setup → practice → draw → live → full result
- Location: e2e/club-challenge-browser-robot.spec.mjs:240:1

# Error details

```
Error: practice_roster_ms should be <= 1500ms but was 1539ms

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 1500
Received:    1539
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e11]:
          - paragraph [ref=e12]: RallyHub Interclub
          - paragraph [ref=e13]: "Interclub Challenge · Status: draft"
        - generic [ref=e14]:
          - generic [ref=e15]:
            - generic [ref=e16]:
              - generic [ref=e17]: CL
              - generic [ref=e18]: Clare Pickleball Club
            - generic [ref=e19]: vs
            - generic [ref=e20]:
              - generic [ref=e21]: GA
              - generic [ref=e22]: Galway Pickleball
          - button "Public Links / QR" [ref=e23] [cursor=pointer]
      - generic [ref=e25]:
        - button [ref=e26] [cursor=pointer]
        - button "2 Teams" [ref=e31] [cursor=pointer]:
          - generic [ref=e32]: "2"
          - text: Teams
        - button "3 Draw" [ref=e33] [cursor=pointer]:
          - generic [ref=e34]: "3"
          - text: Draw
        - button "4 Live Event" [ref=e35] [cursor=pointer]:
          - generic [ref=e36]: "4"
          - text: Live Event
        - button "5 Simulator" [ref=e37] [cursor=pointer]:
          - generic [ref=e38]: "5"
          - text: Simulator
        - button "6 Results" [ref=e39] [cursor=pointer]:
          - generic [ref=e40]: "6"
          - text: Results
      - generic [ref=e42]:
        - generic [ref=e43]:
          - generic [ref=e44]:
            - paragraph [ref=e45]: Participants
            - paragraph [ref=e46]: Event ranks are independent of permanent RallyHub skill ratings.
          - button "Practice with 32 Test Players" [ref=e47] [cursor=pointer]
        - generic [ref=e48]:
          - generic [ref=e50]:
            - generic [ref=e51]:
              - paragraph [ref=e52]: Build the two teams
              - paragraph [ref=e53]: Drag players into the teams, rank them, then mark each team member as Rotation or Reserve. Rotation players are included in the draw; Reserves travel with the team but stay outside the scheduled rotation until activated.
            - generic [ref=e54]:
              - generic [ref=e55]: 32 players
              - generic [ref=e56]: "A: 16 rotation · 0 reserve"
              - generic [ref=e57]: "B: 16 rotation · 0 reserve"
              - generic [ref=e58]: Rotation squads balanced
          - generic [ref=e59]:
            - generic [ref=e60]:
              - generic [ref=e61]:
                - generic [ref=e62]:
                  - paragraph [ref=e63]: Player Pool
                  - paragraph [ref=e64]: Import both Spond events here, then drag players into the teams.
                - generic [ref=e65]: "0"
              - generic [ref=e66]:
                - button "Import Spond Event" [ref=e67] [cursor=pointer]
                - generic [ref=e68]:
                  - textbox "Add player manually" [ref=e69]
                  - button [disabled]
              - generic [ref=e70]: Import Spond attendees here
            - generic [ref=e72]:
              - generic [ref=e73]:
                - generic [ref=e74]:
                  - text: Team name
                  - textbox [ref=e75]: Clare Pickleball Club
                  - button "Import a Spond event directly to this team" [ref=e76] [cursor=pointer]
                - generic [ref=e77]: "16"
              - generic [ref=e78]:
                - generic [ref=e79]:
                  - button [ref=e80] [cursor=pointer]
                  - generic [ref=e88]: "1"
                  - generic [ref=e89]: Club A Test 01
                  - combobox [ref=e90] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e93]: Male
                - generic [ref=e94]:
                  - button [ref=e95] [cursor=pointer]
                  - generic [ref=e103]: "2"
                  - generic [ref=e104]: Club A Test 02
                  - combobox [ref=e105] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e108]: Female
                - generic [ref=e109]:
                  - button [ref=e110] [cursor=pointer]
                  - generic [ref=e118]: "3"
                  - generic [ref=e119]: Club A Test 03
                  - combobox [ref=e120] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e123]: Male
                - generic [ref=e124]:
                  - button [ref=e125] [cursor=pointer]
                  - generic [ref=e133]: "4"
                  - generic [ref=e134]: Club A Test 04
                  - combobox [ref=e135] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e138]: Female
                - generic [ref=e139]:
                  - button [ref=e140] [cursor=pointer]
                  - generic [ref=e148]: "5"
                  - generic [ref=e149]: Club A Test 05
                  - combobox [ref=e150] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e153]: Male
                - generic [ref=e154]:
                  - button [ref=e155] [cursor=pointer]
                  - generic [ref=e163]: "6"
                  - generic [ref=e164]: Club A Test 06
                  - combobox [ref=e165] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e168]: Female
                - generic [ref=e169]:
                  - button [ref=e170] [cursor=pointer]
                  - generic [ref=e178]: "7"
                  - generic [ref=e179]: Club A Test 07
                  - combobox [ref=e180] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e183]: Male
                - generic [ref=e184]:
                  - button [ref=e185] [cursor=pointer]
                  - generic [ref=e193]: "8"
                  - generic [ref=e194]: Club A Test 08
                  - combobox [ref=e195] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e198]: Female
                - generic [ref=e199]:
                  - button [ref=e200] [cursor=pointer]
                  - generic [ref=e208]: "9"
                  - generic [ref=e209]: Club A Test 09
                  - combobox [ref=e210] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e213]: Male
                - generic [ref=e214]:
                  - button [ref=e215] [cursor=pointer]
                  - generic [ref=e223]: "10"
                  - generic [ref=e224]: Club A Test 10
                  - combobox [ref=e225] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e228]: Female
                - generic [ref=e229]:
                  - button [ref=e230] [cursor=pointer]
                  - generic [ref=e238]: "11"
                  - generic [ref=e239]: Club A Test 11
                  - combobox [ref=e240] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e243]: Male
                - generic [ref=e244]:
                  - button [ref=e245] [cursor=pointer]
                  - generic [ref=e253]: "12"
                  - generic [ref=e254]: Club A Test 12
                  - combobox [ref=e255] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e258]: Female
                - generic [ref=e259]:
                  - button [ref=e260] [cursor=pointer]
                  - generic [ref=e268]: "13"
                  - generic [ref=e269]: Club A Test 13
                  - combobox [ref=e270] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e273]: Male
                - generic [ref=e274]:
                  - button [ref=e275] [cursor=pointer]
                  - generic [ref=e283]: "14"
                  - generic [ref=e284]: Club A Test 14
                  - combobox [ref=e285] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e288]: Female
                - generic [ref=e289]:
                  - button [ref=e290] [cursor=pointer]
                  - generic [ref=e298]: "15"
                  - generic [ref=e299]: Club A Test 15
                  - combobox [ref=e300] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e303]: Male
                - generic [ref=e304]:
                  - button [ref=e305] [cursor=pointer]
                  - generic [ref=e313]: "16"
                  - generic [ref=e314]: Club A Test 16
                  - combobox [ref=e315] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e318]: Female
            - generic [ref=e319]:
              - generic [ref=e320]:
                - generic [ref=e321]:
                  - text: Team name
                  - textbox [ref=e322]: Galway Pickleball
                  - button "Import a Spond event directly to this team" [ref=e323] [cursor=pointer]
                - generic [ref=e324]: "16"
              - generic [ref=e325]:
                - generic [ref=e326]:
                  - button [ref=e327] [cursor=pointer]
                  - generic [ref=e335]: "1"
                  - generic [ref=e336]: Club B Test 01
                  - combobox [ref=e337] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e340]: Male
                - generic [ref=e341]:
                  - button [ref=e342] [cursor=pointer]
                  - generic [ref=e350]: "2"
                  - generic [ref=e351]: Club B Test 02
                  - combobox [ref=e352] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e355]: Female
                - generic [ref=e356]:
                  - button [ref=e357] [cursor=pointer]
                  - generic [ref=e365]: "3"
                  - generic [ref=e366]: Club B Test 03
                  - combobox [ref=e367] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e370]: Male
                - generic [ref=e371]:
                  - button [ref=e372] [cursor=pointer]
                  - generic [ref=e380]: "4"
                  - generic [ref=e381]: Club B Test 04
                  - combobox [ref=e382] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e385]: Female
                - generic [ref=e386]:
                  - button [ref=e387] [cursor=pointer]
                  - generic [ref=e395]: "5"
                  - generic [ref=e396]: Club B Test 05
                  - combobox [ref=e397] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e400]: Male
                - generic [ref=e401]:
                  - button [ref=e402] [cursor=pointer]
                  - generic [ref=e410]: "6"
                  - generic [ref=e411]: Club B Test 06
                  - combobox [ref=e412] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e415]: Female
                - generic [ref=e416]:
                  - button [ref=e417] [cursor=pointer]
                  - generic [ref=e425]: "7"
                  - generic [ref=e426]: Club B Test 07
                  - combobox [ref=e427] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e430]: Male
                - generic [ref=e431]:
                  - button [ref=e432] [cursor=pointer]
                  - generic [ref=e440]: "8"
                  - generic [ref=e441]: Club B Test 08
                  - combobox [ref=e442] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e445]: Female
                - generic [ref=e446]:
                  - button [ref=e447] [cursor=pointer]
                  - generic [ref=e455]: "9"
                  - generic [ref=e456]: Club B Test 09
                  - combobox [ref=e457] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e460]: Male
                - generic [ref=e461]:
                  - button [ref=e462] [cursor=pointer]
                  - generic [ref=e470]: "10"
                  - generic [ref=e471]: Club B Test 10
                  - combobox [ref=e472] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e475]: Female
                - generic [ref=e476]:
                  - button [ref=e477] [cursor=pointer]
                  - generic [ref=e485]: "11"
                  - generic [ref=e486]: Club B Test 11
                  - combobox [ref=e487] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e490]: Male
                - generic [ref=e491]:
                  - button [ref=e492] [cursor=pointer]
                  - generic [ref=e500]: "12"
                  - generic [ref=e501]: Club B Test 12
                  - combobox [ref=e502] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e505]: Female
                - generic [ref=e506]:
                  - button [ref=e507] [cursor=pointer]
                  - generic [ref=e515]: "13"
                  - generic [ref=e516]: Club B Test 13
                  - combobox [ref=e517] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e520]: Male
                - generic [ref=e521]:
                  - button [ref=e522] [cursor=pointer]
                  - generic [ref=e530]: "14"
                  - generic [ref=e531]: Club B Test 14
                  - combobox [ref=e532] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e535]: Female
                - generic [ref=e536]:
                  - button [ref=e537] [cursor=pointer]
                  - generic [ref=e545]: "15"
                  - generic [ref=e546]: Club B Test 15
                  - combobox [ref=e547] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e550]: Male
                - generic [ref=e551]:
                  - button [ref=e552] [cursor=pointer]
                  - generic [ref=e560]: "16"
                  - generic [ref=e561]: Club B Test 16
                  - combobox [ref=e562] [cursor=pointer]:
                    - generic: Rotation
                  - generic [ref=e565]: Female
          - generic [ref=e566]:
            - generic [ref=e567]: "Ready: 16 rotation players per club."
            - button "Save Teams & Rankings" [disabled]
        - generic [ref=e568]:
          - generic [ref=e569]:
            - paragraph [ref=e570]: "12"
            - paragraph [ref=e571]: Rounds
          - generic [ref=e572]:
            - paragraph [ref=e573]: "48"
            - paragraph [ref=e574]: Matches
          - generic [ref=e575]:
            - paragraph [ref=e576]: 6–6
            - paragraph [ref=e577]: Games/player
          - generic [ref=e578]:
            - paragraph [ref=e579]: "164"
            - paragraph [ref=e580]: Structured min
          - generic [ref=e581]:
            - paragraph [ref=e582]: "16"
            - paragraph [ref=e583]: Contingency min
        - button "Generate Draw & Fairness Report" [ref=e584] [cursor=pointer]
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e585]:
        - generic [ref=e589]: 32 practice players loaded. You can now rehearse the full setup and draw journey.
      - listitem [ref=e591]:
        - generic [ref=e595]: Interclub Challenge setup saved
```

# Test source

```ts
  135 |         next={...current,running:false,started_at:null};
  136 |       } else if (body.action === 'resume') {
  137 |         next={...current,running:true,started_at:now()};
  138 |       } else if (body.action === 'reset') {
  139 |         next={phase:'ready',running:false,remaining_seconds:Number(model.event.play_minutes||10)*60,started_at:null,round:Number(model.event.current_round||1)};
  140 |       } else if (body.action === 'set_round_minutes') {
  141 |         next={phase:'ready',running:false,remaining_seconds:Number(body.minutes)*60,started_at:null,round:Number(model.event.current_round||1)};
  142 |       } else if (body.action === 'add_minute') {
  143 |         next={...current,remaining_seconds:Number(current.remaining_seconds||0)+60};
  144 |       }
  145 |       model.event.timer_revision=Number(model.event.timer_revision||0)+1;
  146 |       model.event.timer_state_json=JSON.stringify(next);
  147 |       return { success:true, event:model.event, state:next, server_now:now() };
  148 |     }
  149 | 
  150 |     if (name === 'updateClubChallengeRound') {
  151 |       await sleep(260);
  152 |       const round=Number(body.nextRound);const nextTimer={phase:'ready',running:false,remaining_seconds:Number(model.event.play_minutes||10)*60,started_at:null,round};
  153 |       Object.assign(model.event,{current_round:round,status:'in_progress',timer_state_json:JSON.stringify(nextTimer),timer_revision:Number(model.event.timer_revision||0)+1});
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
> 235 | function metric(report,name,value,max){report[name]=value;expect(value,`${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);}
      |                                                                                                                            ^ Error: practice_roster_ms should be <= 1500ms but was 1539ms
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
  254 |   await expect(page.getByText('Build the two teams')).toBeVisible();await expect(page.getByText('Player Pool',{exact:true})).toBeVisible();
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
  275 |   started=Date.now();await page.getByTestId('cc-timer-start-play').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting play… command sent')).toBeVisible({timeout:300});metric(report,'timer_start_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-timer-pause')).toBeEnabled({timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length-timerBefore).toBe(1);const device=await page.evaluate(()=>window.__ccDevice);expect(device.wakeRequests).toBeGreaterThan(0);expect(device.speech.some(x=>/Start round/i.test(x.text))).toBe(true);report.timer_double_tap_calls=1;
  276 | 
  277 |   expect(await page.getByTestId('cc-score-r1-c1-a').getAttribute('maxlength')).toBe('2');await page.getByTestId('cc-score-r1-c1-a').fill('11');await page.getByTestId('cc-score-r1-c1-b').fill('8');started=Date.now();await page.getByTestId('cc-save-score-r1-c1').click();await expect(page.getByTestId('cc-score-card-r1-c1')).toContainText('Saved ·',{timeout:1500});metric(report,'single_score_save_ms',Date.now()-started,1200);
  278 | 
  279 |   const savedR1C1=model.matches.find(m=>m.round_number===1&&m.court_number===1);const outgoingName=savedR1C1.club_a_names[0];const historicalNames=[...savedR1C1.club_a_names];
  280 |   await page.getByRole('button',{name:'Players',exact:true}).click();await expect(page.getByText('Replace / Withdraw a Player')).toBeVisible();await page.getByTestId('cc-replacement-outgoing').click();await page.getByRole('option',{name:new RegExp(`^${outgoingName.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')} ·`)}).click();await page.getByTestId('cc-replacement-name').fill('Replacement Test');
  281 |   const replaceBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length;started=Date.now();await page.getByTestId('cc-replace-player').click();await expect(page.getByText('Applying player replacement from Round 1… command sent')).toBeVisible({timeout:300});metric(report,'replacement_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-player-control-status')).toContainText('replaced by Replacement Test',{timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='replace').length-replaceBefore).toBe(1);expect(savedR1C1.club_a_names).toEqual(historicalNames);expect(model.matches.some(m=>m.round_number>1&&(m.club_a_names||[]).includes('Replacement Test'))).toBe(true);report.replacement_future_only=true;
  282 | 
  283 |   for(const court of [2,3,4]){await page.getByTestId(`cc-score-r1-c${court}-a`).fill('11');await page.getByTestId(`cc-score-r1-c${court}-b`).fill('7');await page.getByTestId(`cc-save-score-r1-c${court}`).click();await expect(page.getByTestId(`cc-score-card-r1-c${court}`)).toContainText('Saved ·',{timeout:1500});}
  284 |   started=Date.now();await page.getByRole('button',{name:'Complete Round 1 & Go to Round 2'}).click();await expect(page.getByText('Preparing Round 2… command sent')).toBeVisible({timeout:300});metric(report,'round_advance_ack_ms',Date.now()-started,350);await expect(page.getByText('Round 2/12',{exact:true})).toBeVisible({timeout:1800});await expect(page.getByText('ready',{exact:true})).toBeVisible();await expect(page.getByText('10:00').first()).toBeVisible();await expect(page.getByText('0/4').first()).toBeVisible();report.round_transition_timer_reset=true;
  285 | 
  286 |   await page.locator('#cc-court-time-controls > summary').click();await page.getByTestId('cc-courts-now').fill('3');await page.getByTestId('cc-minutes-remaining').fill('180');await page.getByTestId('cc-preview-schedule-change').click();await expect(page.getByText(/Proposed change:.*0 would be marked Not Played/)).toBeVisible();const scheduleBefore=model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length;started=Date.now();await page.getByTestId('cc-confirm-schedule-change').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Applying court & time changes… command sent')).toBeVisible({timeout:300});metric(report,'schedule_change_ack_ms',Date.now()-started,350);await expect(page.getByTestId('cc-schedule-change-status')).toContainText('Schedule updated:',{timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeSchedule').length-scheduleBefore).toBe(1);expect(model.event.courts).toBe(3);expect(model.event.event_pack_stale).toBe(true);report.schedule_change_double_tap_calls=1;
  287 | 
  288 |   await page.getByRole('button',{name:'Hall Display'}).evaluate(el=>el.click());await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next')).toBeVisible();await expect(page.getByRole('button',{name:'Exit Display'})).toBeVisible();report.internal_hall_display=true;await page.getByRole('button',{name:'Exit Display'}).evaluate(el=>el.click());await expect(page.getByTestId('cc-tab-simulator')).toBeVisible({timeout:1500});
  289 | 
  290 |   await page.getByTestId('cc-tab-simulator').click();await expect(page.getByTestId('cc-populate-full')).toBeVisible();
  291 |   const populateBefore=model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length;started=Date.now();await page.getByTestId('cc-populate-full').click();await expect(page.getByText('Populating full TEST MODE event… one server command sent')).toBeVisible({timeout:300});metric(report,'full_test_ack_ms',Date.now()-started,250);await expect(page.getByText('Final Result')).toBeVisible({timeout:2200});metric(report,'full_test_to_results_ms',Date.now()-started,2000);expect(model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length-populateBefore).toBe(1);expect(model.matches.filter(m=>!m.is_showcase&&m.status==='completed').length).toBe(48);expect(model.matches.filter(m=>m.is_showcase&&m.status==='completed').length).toBe(1);expect(model.votes.length).toBe(8);report.full_population_browser_calls=1;
  292 |   await expect(page.getByText('Player of the Tournament',{exact:true}).first()).toBeVisible();await expect(page.getByText('Club A Test 01',{exact:true}).first()).toBeVisible();await expectNoHorizontalOverflow(page);
  293 | 
  294 |   await page.getByTestId('cc-tab-draw').click();await expect(page.getByText('Round 12',{exact:true})).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByText('Round at a Glance')).toBeVisible();report.revisit_populated_screens=true;
  295 | 
  296 |   report.total_function_calls=model.calls.length;report.normal_matches=model.matches.filter(m=>!m.is_showcase).length;report.participants=model.participants.length;
  297 |   console.log(`CLUB CHALLENGE HOST ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-host-robot-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  298 | });
  299 | 
  300 | test('Club Challenge public voter robot: simple identity → code → nominee → vote',async({page},testInfo)=>{
  301 |   const participants=[
  302 |     {id:'p1',display_name:'Aoife M.',can_vote:true},{id:'p2',display_name:'Brian K.',can_vote:true},{id:'p3',display_name:'Cara D.',can_vote:true},{id:'p4',display_name:'Declan R.',can_vote:true},
  303 |   ];
  304 |   const calls=[];
  305 |   await page.route('**/api/apps/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;if(path.includes('/analytics/'))return json(route,{});const marker=`/api/apps/${APP_ID}/functions/`;const i=path.indexOf(marker);if(i<0)return json(route,{});const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}calls.push({name,body});if(name==='getPublicClubChallengeVote')return json(route,{success:true,event:{club_a_name:'Clare',club_b_name:'Galway',pot_status:'open',junior_display_mode:true},participants});if(name==='castPublicClubChallengePotVote'){await sleep(420);if(body.voterCode!=='A1B2C3D4')return json(route,{error:'Participant access code is incorrect.'});if(body.voterParticipantId===body.nomineeParticipantId)return json(route,{error:'Players cannot vote for themselves.'});return json(route,{success:true,voteId:'vote-public-1'});}return json(route,{});});
  306 |   await page.goto('/e2e/clubChallengePublicVoteHarness.html');await expect(page.getByText('Clare vs Galway')).toBeVisible();await expect(page.getByText('One vote per participant · no self-voting · individual votes remain private.')).toBeVisible();
  307 |   const combos=page.getByRole('combobox');await combos.nth(0).click();await page.getByRole('option',{name:'Aoife M.'}).click();await page.getByPlaceholder('8-character code').fill('A1B2C3D4');await combos.nth(1).click();await expect(page.getByRole('option',{name:'Aoife M.'})).toHaveCount(0);await page.getByRole('option',{name:'Brian K.'}).click();
  308 |   const castBefore=calls.filter(c=>c.name==='castPublicClubChallengePotVote').length;const started=Date.now();const cast=page.getByRole('button',{name:'Cast Vote'});await cast.evaluate(el=>{el.click();el.click();});await expect(page.getByRole('button',{name:'Recording…'})).toBeVisible({timeout:250});await expect(page.getByText('Vote recorded')).toBeVisible({timeout:1500});expect(calls.filter(c=>c.name==='castPublicClubChallengePotVote').length-castBefore).toBe(1);const report={vote_ack_ms:Date.now()-started,cast_calls:1,self_nominee_hidden:true,privacy_copy:true};console.log(`CLUB CHALLENGE PUBLIC VOTE ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-vote-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  309 | });
  310 | 
  311 | test('Club Challenge public Hall Display robot: now/resting/next + disconnect truth',async({page},testInfo)=>{
  312 |   const participants=Array.from({length:20},(_,i)=>({id:`hp${i+1}`,display_name:`Player ${i+1}`}));
  313 |   const names=ids=>ids.map(id=>participants.find(p=>p.id===id)?.display_name||'Player');
  314 |   const current=[];for(let c=1;c<=4;c++){const ids=participants.slice((c-1)*4,c*4).map(p=>p.id);current.push({id:`h-r1-c${c}`,round_number:1,court_number:c,status:'scheduled',winner:'none',score_a:null,score_b:null,is_showcase:false,club_a_participant_ids:ids.slice(0,2),club_b_participant_ids:ids.slice(2),club_a_names:names(ids.slice(0,2)),club_b_names:names(ids.slice(2))});}
  315 |   const next=current.map((m,i)=>({...m,id:`h-r2-c${i+1}`,round_number:2,club_a_participant_ids:[participants[(i*4+1)%20].id,participants[(i*4+2)%20].id],club_b_participant_ids:[participants[(i*4+3)%20].id,participants[(i*4+4)%20].id,].filter(Boolean)})).map(m=>({...m,club_a_names:names(m.club_a_participant_ids),club_b_names:names(m.club_b_participant_ids)}));
  316 |   const payload={success:true,event:{id:'hall-event',status:'in_progress',club_a_name:'Clare',club_b_name:'Galway',current_round:1,timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:480,started_at:null,round:1}),timer_revision:1,junior_display_mode:true,win_points:2,draw_points:1,loss_points:0},participants,matches:[...current,...next]};
  317 |   await page.route('**/api/apps/**',async route=>{const path=new URL(route.request().url()).pathname;if(path.includes('/analytics/'))return json(route,{});if(path.includes('/functions/getPublicClubChallengeDisplay'))return json(route,payload);return json(route,{});});
  318 |   await page.goto('/e2e/clubChallengePublicDisplayHarness.html');await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next · Round 2')).toBeVisible();await expect(page.getByText('Player 17',{exact:true}).first()).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('online')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeHidden({timeout:1200});await expectNoHorizontalOverflow(page);const report={now:true,resting:true,next:true,disconnect_warning:true,reconnect:true};console.log(`CLUB CHALLENGE PUBLIC DISPLAY ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-display-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
  319 | });
```