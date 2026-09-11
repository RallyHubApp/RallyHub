import { test, expect } from '@playwright/test';

const APP_ID = process.env.VITE_BASE44_APP_ID || '6a01dc00702b7dd2a2978c28';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

function createClubChallengeModel() {
  const model = {
    user: { id:'e2e-admin', email:'admin@example.test', role:'admin', active_tenant_id:'tenant-clare-e2e', active_club_id:'club-clare-e2e' },
    club: { id:'club-clare-e2e', name:'Clare Pickleball Club', logo_url:'', primary_colour:'#2563eb', secondary_colour:'#facc15' },
    tournament: { id:'e2e-club-challenge-tournament', status:'Draft', tenant_id:'tenant-clare-e2e', host_club_id:'club-clare-e2e', format:'Club Challenge', inter_club:true },
    event: null,
    participants: [],
    matches: [],
    votes: [],
    calls: [],
    entityWrites: [],
    nextId: 1,
  };

  const id = prefix => `${prefix}-${String(model.nextId++).padStart(4,'0')}`;
  const now = () => new Date().toISOString();

  model.entityList = entity => {
    if (entity === 'Club') return [model.club];
    if (entity === 'ClubChallengeEvent') return model.event ? [model.event] : [];
    if (entity === 'ClubChallengeParticipant') return [...model.participants].sort((a,b)=>Number(a.event_rank||0)-Number(b.event_rank||0));
    if (entity === 'ClubChallengeMatch') return [...model.matches].sort((a,b)=>Number(a.round_number)-Number(b.round_number)||Number(a.court_number)-Number(b.court_number));
    if (entity === 'ClubChallengeVote') return [...model.votes];
    if (entity === 'Tournament') return [model.tournament];
    return [];
  };

  model.createEntity = (entity, body) => {
    model.entityWrites.push({ op:'create', entity, body });
    if (entity === 'ClubChallengeEvent') {
      model.event = { id:'cc-event-e2e', ...body, timer_revision:Number(body.timer_revision||0), timer_state_json:body.timer_state_json||'' };
      return model.event;
    }
    const record = { id:id(entity.toLowerCase()), ...body };
    if (entity === 'ClubChallengeParticipant') model.participants.push(record);
    if (entity === 'ClubChallengeMatch') model.matches.push(record);
    if (entity === 'ClubChallengeVote') model.votes.push(record);
    return record;
  };

  model.updateEntity = (entity, recordId, body) => {
    model.entityWrites.push({ op:'update', entity, recordId, body });
    if (entity === 'ClubChallengeEvent' && model.event?.id === recordId) return Object.assign(model.event, body);
    if (entity === 'Tournament') return Object.assign(model.tournament, body);
    const list = entity === 'ClubChallengeParticipant' ? model.participants : entity === 'ClubChallengeMatch' ? model.matches : entity === 'ClubChallengeVote' ? model.votes : [];
    const rec = list.find(x=>x.id===recordId); if (rec) Object.assign(rec, body); return rec || {};
  };

  model.handleFunction = async (name, body) => {
    model.calls.push({ name, body, at:Date.now() });

    if (name === 'loadClubChallengePracticeRoster') {
      await sleep(220);
      model.participants = [];
      model.matches = [];
      for (let i=1;i<=16;i++) {
        model.participants.push({ id:`cc-a-${i}`, tenant_id:model.event.tenant_id, challenge_event_id:model.event.id, tournament_id:model.event.tournament_id, side:'club_a', display_name:`Club A Test ${String(i).padStart(2,'0')}`, event_rank:i, gender:i%2?'Male':'Female', status:'active', available_from_round:1, unique_identity_key:`gate3-club-a-${i}`, guest_access_token:`A${String(i).padStart(7,'0')}` });
        model.participants.push({ id:`cc-b-${i}`, tenant_id:model.event.tenant_id, challenge_event_id:model.event.id, tournament_id:model.event.tournament_id, side:'club_b', display_name:`Club B Test ${String(i).padStart(2,'0')}`, event_rank:i, gender:i%2?'Male':'Female', status:'active', available_from_round:1, unique_identity_key:`gate3-club-b-${i}`, guest_access_token:`B${String(i).padStart(7,'0')}` });
      }
      Object.assign(model.event,{status:'draft',fairness_json:'',current_round:0,event_pack_stale:true,draw_approved_at:null,draw_approved_by:null});
      return { success:true, player_count:32 };
    }

    if (name === 'manageClubChallengeParticipant') {
      await sleep(320);
      if (body.action === 'reorder') {
        body.orderedParticipantIds.forEach((pid,index)=>{const p=model.participants.find(x=>x.id===pid);if(p)p.event_rank=index+1;});
        Object.assign(model.event,{fairness_json:'',status:model.event.status==='draw_generated'?'draft':model.event.status,event_pack_stale:true});
        return { success:true, changed:2 };
      }
      if (body.action === 'add_manual') {
        const sidePlayers=model.participants.filter(p=>p.side===body.side);
        const p={id:id('cc-player'),tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,tournament_id:model.event.tournament_id,side:body.side,display_name:body.displayName,event_rank:sidePlayers.length+1,status:'active',available_from_round:1,unique_identity_key:`manual-${id('key')}`};
        model.participants.push(p); return {success:true,participant:p};
      }
      return { success:true };
    }

    if (name === 'replaceClubChallengeDraw') {
      await sleep(520);
      model.matches = body.fixtures.map((m,index)=>({ ...m, id:`cc-match-${String(index+1).padStart(3,'0')}`, status:'scheduled', winner:'none', revision:0, correction_count:0, is_showcase:false }));
      Object.assign(model.event,{status:'draw_generated',fairness_json:JSON.stringify(body.fairness),current_round:0,event_pack_stale:true});
      return { success:true, event:model.event, match_count:model.matches.length, round_count:new Set(model.matches.map(m=>m.round_number)).size };
    }

    if (name === 'manageClubChallengeEvent') {
      await sleep(520);
      if (body.action === 'approve_draw') {
        const next=Number(model.event.draw_version||0)+1;
        Object.assign(model.event,{status:'draw_approved',draw_version:next,draw_approved_at:now(),draw_approved_by:model.user.id,event_pack_stale:false,event_pack_version:next,event_pack_generated_at:now()});
      } else if (body.action === 'start') {
        Object.assign(model.event,{status:'in_progress',current_round:1}); model.tournament.status='In Progress';
      } else if (body.action === 'set_round_label') {
        let labels={};try{labels=model.event.round_labels_json?JSON.parse(model.event.round_labels_json):{};}catch{}
        if(body.label)labels[String(body.round)]=body.label;else delete labels[String(body.round)];model.event.round_labels_json=JSON.stringify(labels);
      } else if (body.action === 'archive') model.event.status='archived';
      else if (body.action === 'reopen') model.event.status='completed';
      return { success:true, event:model.event };
    }

    if (name === 'updateClubChallengeTimer') {
      await sleep(480);
      const current = (()=>{try{return model.event.timer_state_json?JSON.parse(model.event.timer_state_json):{};}catch{return {};}})();
      if (Number(body.expectedRevision||0)!==Number(model.event.timer_revision||0)) return { conflict:true, error:'Timer revision conflict' };
      let next=current;
      if (body.action === 'start') {
        const seconds = body.phase === 'changeover' ? Number(model.event.changeover_minutes||2)*60 : body.phase === 'break' ? Number(model.event.break_minutes||20)*60 : Number(current.remaining_seconds||0)>0&&current.phase==='play'&&!current.running?Number(current.remaining_seconds):Number(model.event.play_minutes||10)*60;
        next={phase:body.phase||'play',running:true,remaining_seconds:seconds,started_at:now(),round:Number(model.event.current_round||1)};
      } else if (body.action === 'pause') {
        next={...current,running:false,started_at:null};
      } else if (body.action === 'resume') {
        next={...current,running:true,started_at:now()};
      } else if (body.action === 'reset') {
        next={phase:'play',running:false,remaining_seconds:Number(model.event.play_minutes||10)*60,started_at:null,round:Number(model.event.current_round||1)};
      } else if (body.action === 'set_round_minutes') {
        next={phase:'play',running:false,remaining_seconds:Number(body.minutes)*60,started_at:null,round:Number(model.event.current_round||1)};
      } else if (body.action === 'add_minute') {
        next={...current,remaining_seconds:Number(current.remaining_seconds||0)+60};
      }
      model.event.timer_revision=Number(model.event.timer_revision||0)+1;
      model.event.timer_state_json=JSON.stringify(next);
      return { success:true, event:model.event, state:next, server_now:now() };
    }

    if (name === 'saveClubChallengeScore') {
      await sleep(260);
      const match=model.matches.find(m=>m.id===body.matchId); if(!match)return {error:'Match not found'};
      if(Number(body.expectedRevision||0)!==Number(match.revision||0))return {conflict:true,error:'Revision conflict',match};
      const a=Number(body.scoreA),b=Number(body.scoreB);Object.assign(match,{score_a:a,score_b:b,winner:a===b?'draw':a>b?'club_a':'club_b',status:a===b?'draw':'completed',revision:Number(match.revision||0)+1,scored_by_user_id:model.user.id,scored_at:now()});
      return {success:true,match};
    }

    if (name === 'populateClubChallengePracticeScenario') {
      await sleep(650);
      const normal=model.matches.filter(m=>!m.is_showcase).sort((a,b)=>a.round_number-b.round_number||a.court_number-b.court_number);
      normal.forEach((m,i)=>Object.assign(m,{status:'completed',score_a:i%2===0?11:8,score_b:i%2===0?8:11,winner:i%2===0?'club_a':'club_b',revision:Number(m.revision||0)+1,scored_by_user_id:model.user.id,scored_at:now()}));
      if(model.event.showcase_enabled){const a=model.participants.filter(p=>p.side==='club_a'),b=model.participants.filter(p=>p.side==='club_b');model.matches.push({id:'cc-showcase',tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,tournament_id:model.event.tournament_id,draw_version:model.event.draw_version,round_number:13,court_number:1,match_number:49,club_a_participant_ids:[a[0].id,a[1].id],club_b_participant_ids:[b[0].id,b[1].id],club_a_names:[a[0].display_name,a[1].display_name],club_b_names:[b[0].display_name,b[1].display_name],status:'completed',score_a:15,score_b:13,winner:'club_a',revision:1,correction_count:0,is_showcase:true,scored_by_user_id:model.user.id,scored_at:now()});}
      const winner=model.participants[0];model.votes=model.participants.filter(p=>p.id!==winner.id).slice(0,8).map((p,i)=>({id:`vote-${i+1}`,tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,voter_identity_key:`practice:${p.id}`,voter_participant_id:p.id,nominee_participant_id:winner.id,access_route:'guest',cast_at:now(),valid:true}));
      const maxRound=Math.max(...normal.map(m=>Number(m.round_number||0)));Object.assign(model.event,{status:'completed',current_round:maxRound,finalised_at:now(),showcase_resolution_method:'showcase_final',showcase_resolved_winner:'club_a',pot_status:'revealed',pot_winner_participant_ids:[winner.id],pot_revealed_at:now(),timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:0,started_at:null,round:maxRound}),timer_revision:Number(model.event.timer_revision||0)+1});model.tournament.status='Completed';
      return {success:true,normalMatches:normal.length,showcase:true,practiceVotes:model.votes.length,winner:'club_a'};
    }

    if (name === 'updateClubChallengePot') {
      await sleep(180); if(body.action==='open')model.event.pot_status='open';if(body.action==='close')model.event.pot_status='closed';return {success:true,event:model.event};
    }
    if (name === 'castClubChallengePotVote') {
      await sleep(180); if(body.voterParticipantId===body.nomineeParticipantId)return {error:'Players cannot vote for themselves.'};if(model.votes.some(v=>v.voter_participant_id===body.voterParticipantId&&v.valid!==false))return {error:'This player has already voted.'};const v={id:id('vote'),tenant_id:model.event.tenant_id,challenge_event_id:model.event.id,voter_identity_key:`participant:${body.voterParticipantId}`,voter_participant_id:body.voterParticipantId,nominee_participant_id:body.nomineeParticipantId,access_route:'logged_in',cast_at:now(),valid:true};model.votes.push(v);return {success:true,vote:v};
    }

    if (name === 'manageClubChallengePublicLinks') {
      return {success:true,displayToken:'e2e-display-token',votingToken:'e2e-vote-token',voterCodes:model.participants.map(p=>({participantId:p.id,displayName:p.display_name,code:p.guest_access_token||'TESTCODE'}))};
    }

    return { success:true };
  };

  return model;
}

async function installClubChallengeBackend(page, model) {
  await page.route('**/api/apps/**', async route => {
    const req=route.request(), url=new URL(req.url()), path=url.pathname;
    if(path.includes('/analytics/'))return json(route,{});
    if(path.endsWith('/entities/User/me'))return json(route,model.user);
    const fnMarker=`/api/apps/${APP_ID}/functions/`;
    const fnIndex=path.indexOf(fnMarker);
    if(fnIndex>=0){const name=decodeURIComponent(path.slice(fnIndex+fnMarker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}return json(route,await model.handleFunction(name,body));}
    const entityMarker=`/api/apps/${APP_ID}/entities/`;
    const entityIndex=path.indexOf(entityMarker);
    if(entityIndex>=0){const rest=path.slice(entityIndex+entityMarker.length);const [entity,recordId]=rest.split('/').map(decodeURIComponent);let body={};try{body=req.postDataJSON()||{};}catch{}
      if(req.method()==='GET')return json(route,model.entityList(entity));
      if(req.method()==='POST')return json(route,model.createEntity(entity,body));
      if(['PUT','PATCH'].includes(req.method()))return json(route,model.updateEntity(entity,recordId,body));
      if(req.method()==='DELETE')return json(route,{});
    }
    return json(route,{});
  });
}

async function installHallDeviceMocks(page){
  await page.addInitScript(()=>{
    window.__ccDevice={audioSignals:0,speech:[],wakeRequests:0,wakeReleases:0,vibrations:0};
    class FakeParam{setValueAtTime(){} exponentialRampToValueAtTime(){}}
    class FakeOsc{constructor(){this.frequency=new FakeParam();this.type='square';}connect(){}start(){window.__ccDevice.audioSignals++;}stop(){}}
    class FakeGain{constructor(){this.gain=new FakeParam();}connect(){}}
    class FakeAudioContext{constructor(){this.state='suspended';this.currentTime=0;this.destination={};}createOscillator(){return new FakeOsc();}createGain(){return new FakeGain();}async resume(){this.state='running';}}
    Object.defineProperty(window,'AudioContext',{configurable:true,writable:true,value:FakeAudioContext});Object.defineProperty(window,'webkitAudioContext',{configurable:true,writable:true,value:FakeAudioContext});
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:class{constructor(text){this.text=text;this.volume=1;this.lang='';this.rate=1;this.pitch=1;this.voice=null;}}});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,writable:true,value:{getVoices:()=>[{name:'Moira',lang:'en-IE'}],cancel(){},resume(){},speak(u){window.__ccDevice.speech.push({text:u.text,volume:u.volume,lang:u.lang});},addEventListener(){},removeEventListener(){}}});
    Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{window.__ccDevice.wakeRequests++;return{release:async()=>{window.__ccDevice.wakeReleases++;}};}}});
    Object.defineProperty(navigator,'vibrate',{configurable:true,value:()=>{window.__ccDevice.vibrations++;return true;}});
  });
}

function metric(report,name,value,max){report[name]=value;expect(value,`${name} should be <= ${max}ms but was ${value}ms`).toBeLessThanOrEqual(max);}
async function expectNoHorizontalOverflow(page){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);expect(overflow,'mobile page should not require horizontal body scrolling').toBeLessThanOrEqual(1);}

test.use({ viewport:{width:390,height:844} });

test('Club Challenge mobile host robot: setup → practice → draw → live → full result',async({page},testInfo)=>{
  const model=createClubChallengeModel();const report={};await installHallDeviceMocks(page);await installClubChallengeBackend(page,model);page.on('dialog',d=>d.accept());
  await page.goto('/e2e/clubChallengeHarness.html');
  await expect(page.getByTestId('cc-root')).toBeVisible();
  await expect(page.getByText('Estimated event duration')).toBeVisible();
  await expect(page.getByText('2h 44m')).toBeVisible();
  await expectNoHorizontalOverflow(page);

  let started=Date.now();await page.getByTestId('cc-save-setup').click();await expect(page.getByTestId('cc-load-practice')).toBeVisible({timeout:1800});metric(report,'setup_to_teams_ms',Date.now()-started,1500);
  expect(model.event?.status).toBe('draft');

  started=Date.now();await page.getByTestId('cc-load-practice').click();await expect(page.getByText('Club A Test 01')).toBeVisible({timeout:1800});metric(report,'practice_roster_ms',Date.now()-started,1500);expect(model.participants.length).toBe(32);
  await expect(page.getByText('12').first()).toBeVisible();await expectNoHorizontalOverflow(page);

  const reorderBefore=model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='reorder').length;
  started=Date.now();await page.getByRole('button',{name:'Move Club A Test 02 up'}).click();await expect(page.getByText('Saving player ranking… one command sent')).toBeVisible({timeout:300});metric(report,'ranking_ack_ms',Date.now()-started,350);await expect(page.getByText('Saving player ranking… one command sent')).toBeHidden({timeout:1800});
  expect(model.calls.filter(c=>c.name==='manageClubChallengeParticipant'&&c.body.action==='reorder').length-reorderBefore).toBe(1);report.ranking_browser_calls=1;

  const drawBefore=model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length;
  started=Date.now();await page.getByTestId('cc-generate-draw').click();await expect(page.getByText('Generating draw and fairness report… one command sent')).toBeVisible({timeout:300});metric(report,'draw_ack_ms',Date.now()-started,250);await expect(page.getByText('Hard checks PASS')).toBeVisible({timeout:2200});metric(report,'draw_to_review_ms',Date.now()-started,1800);expect(model.matches.filter(m=>!m.is_showcase).length).toBe(48);expect(new Set(model.matches.map(m=>m.round_number)).size).toBe(12);expect(model.calls.filter(c=>c.name==='replaceClubChallengeDraw').length-drawBefore).toBe(1);report.draw_browser_calls=1;

  const approveBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length;
  started=Date.now();await page.getByTestId('cc-approve-draw').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Approving and locking draw… command sent')).toBeVisible({timeout:300});metric(report,'approve_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-prestart-sound-check')).toBeVisible({timeout:1800});expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='approve_draw').length-approveBefore).toBe(1);report.approve_double_tap_calls=1;

  const fnBeforeSound=model.calls.length;await page.getByTestId('cc-prestart-sound-check').click();await expect(page.getByTestId('cc-prestart-sound-check')).toContainText('Test Sound Again ✓',{timeout:800});await expect.poll(async()=>await page.evaluate(()=>window.__ccDevice.speech.length)).toBeGreaterThan(0);expect(await page.evaluate(()=>window.__rallyhubAudioContext?.state)).toBe('running');expect(model.calls.length).toBe(fnBeforeSound);report.sound_check_base44_calls=0;report.local_audio_unlocked=true;

  const startBefore=model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length;
  started=Date.now();await page.getByTestId('cc-start-event').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting Club Challenge… command sent')).toBeVisible({timeout:300});metric(report,'event_start_ack_ms',Date.now()-started,250);await expect(page.getByText('Round at a Glance')).toBeVisible({timeout:2000});metric(report,'event_start_to_live_ms',Date.now()-started,1800);expect(model.calls.filter(c=>c.name==='manageClubChallengeEvent'&&c.body.action==='start').length-startBefore).toBe(1);report.start_double_tap_calls=1;
  await expect(page.getByText('Resting this round')).toBeVisible();await expect(page.getByText('Up next · Round 2')).toBeVisible();await expectNoHorizontalOverflow(page);

  const timerBefore=model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length;
  started=Date.now();await page.getByTestId('cc-timer-start-play').evaluate(el=>{el.click();el.click();});await expect(page.getByText('Starting play… command sent')).toBeVisible({timeout:300});metric(report,'timer_start_ack_ms',Date.now()-started,250);await expect(page.getByTestId('cc-timer-pause')).toBeEnabled({timeout:1800});expect(model.calls.filter(c=>c.name==='updateClubChallengeTimer'&&c.body.action==='start').length-timerBefore).toBe(1);const device=await page.evaluate(()=>window.__ccDevice);expect(device.wakeRequests).toBeGreaterThan(0);expect(device.speech.some(x=>/Start round/i.test(x.text))).toBe(true);report.timer_double_tap_calls=1;

  await page.getByTestId('cc-score-r1-c1-a').fill('11');await page.getByTestId('cc-score-r1-c1-b').fill('8');started=Date.now();await page.getByTestId('cc-save-score-r1-c1').click();await expect(page.getByTestId('cc-score-card-r1-c1')).toContainText('Revision 1',{timeout:1500});metric(report,'single_score_save_ms',Date.now()-started,1200);

  await page.getByRole('button',{name:'Hall Display'}).click();await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next')).toBeVisible();await expect(page.getByRole('button',{name:'Exit Display'})).toBeVisible();report.internal_hall_display=true;await page.getByRole('button',{name:'Exit Display'}).click();

  await page.getByTestId('cc-tab-simulator').click();await expect(page.getByTestId('cc-populate-full')).toBeVisible();
  const populateBefore=model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length;started=Date.now();await page.getByTestId('cc-populate-full').click();await expect(page.getByText('Populating full TEST MODE event… one server command sent')).toBeVisible({timeout:300});metric(report,'full_test_ack_ms',Date.now()-started,250);await expect(page.getByText('Final Result')).toBeVisible({timeout:2200});metric(report,'full_test_to_results_ms',Date.now()-started,2000);expect(model.calls.filter(c=>c.name==='populateClubChallengePracticeScenario').length-populateBefore).toBe(1);expect(model.matches.filter(m=>!m.is_showcase&&m.status==='completed').length).toBe(48);expect(model.matches.filter(m=>m.is_showcase&&m.status==='completed').length).toBe(1);expect(model.votes.length).toBe(8);report.full_population_browser_calls=1;
  await expect(page.getByText('Player of the Tournament')).toBeVisible();await expect(page.getByText('Club A Test 01')).toBeVisible();await expectNoHorizontalOverflow(page);

  await page.getByTestId('cc-tab-draw').click();await expect(page.getByText('Round 12',{exact:true})).toBeVisible();await page.getByTestId('cc-tab-live').click();await expect(page.getByText('Round at a Glance')).toBeVisible();report.revisit_populated_screens=true;

  report.total_function_calls=model.calls.length;report.normal_matches=model.matches.filter(m=>!m.is_showcase).length;report.participants=model.participants.length;
  console.log(`CLUB CHALLENGE HOST ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-host-robot-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
});

test('Club Challenge public voter robot: simple identity → code → nominee → vote',async({page},testInfo)=>{
  const participants=[
    {id:'p1',display_name:'Aoife M.',can_vote:true},{id:'p2',display_name:'Brian K.',can_vote:true},{id:'p3',display_name:'Cara D.',can_vote:true},{id:'p4',display_name:'Declan R.',can_vote:true},
  ];
  const calls=[];
  await page.route('**/api/apps/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;if(path.includes('/analytics/'))return json(route,{});const marker=`/api/apps/${APP_ID}/functions/`;const i=path.indexOf(marker);if(i<0)return json(route,{});const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);let body={};try{body=req.postDataJSON()||{};}catch{}calls.push({name,body});if(name==='getPublicClubChallengeVote')return json(route,{success:true,event:{club_a_name:'Clare',club_b_name:'Galway',pot_status:'open',junior_display_mode:true},participants});if(name==='castPublicClubChallengePotVote'){await sleep(420);if(body.voterCode!=='A1B2C3D4')return json(route,{error:'Participant access code is incorrect.'});if(body.voterParticipantId===body.nomineeParticipantId)return json(route,{error:'Players cannot vote for themselves.'});return json(route,{success:true,voteId:'vote-public-1'});}return json(route,{});});
  await page.goto('/e2e/clubChallengePublicVoteHarness.html');await expect(page.getByText('Clare vs Galway')).toBeVisible();await expect(page.getByText('One vote per participant · no self-voting · individual votes remain private.')).toBeVisible();
  const combos=page.getByRole('combobox');await combos.nth(0).click();await page.getByRole('option',{name:'Aoife M.'}).click();await page.getByPlaceholder('8-character code').fill('A1B2C3D4');await combos.nth(1).click();await expect(page.getByRole('option',{name:'Aoife M.'})).toHaveCount(0);await page.getByRole('option',{name:'Brian K.'}).click();
  const castBefore=calls.filter(c=>c.name==='castPublicClubChallengePotVote').length;const started=Date.now();const cast=page.getByRole('button',{name:'Cast Vote'});await cast.evaluate(el=>{el.click();el.click();});await expect(page.getByRole('button',{name:'Recording…'})).toBeVisible({timeout:250});await expect(page.getByText('Vote recorded')).toBeVisible({timeout:1500});expect(calls.filter(c=>c.name==='castPublicClubChallengePotVote').length-castBefore).toBe(1);const report={vote_ack_ms:Date.now()-started,cast_calls:1,self_nominee_hidden:true,privacy_copy:true};console.log(`CLUB CHALLENGE PUBLIC VOTE ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-vote-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
});

test('Club Challenge public Hall Display robot: now/resting/next + disconnect truth',async({page},testInfo)=>{
  const participants=Array.from({length:20},(_,i)=>({id:`hp${i+1}`,display_name:`Player ${i+1}`}));
  const names=ids=>ids.map(id=>participants.find(p=>p.id===id)?.display_name||'Player');
  const current=[];for(let c=1;c<=4;c++){const ids=participants.slice((c-1)*4,c*4).map(p=>p.id);current.push({id:`h-r1-c${c}`,round_number:1,court_number:c,status:'scheduled',winner:'none',score_a:null,score_b:null,is_showcase:false,club_a_participant_ids:ids.slice(0,2),club_b_participant_ids:ids.slice(2),club_a_names:names(ids.slice(0,2)),club_b_names:names(ids.slice(2))});}
  const next=current.map((m,i)=>({...m,id:`h-r2-c${i+1}`,round_number:2,club_a_participant_ids:[participants[(i*4+1)%20].id,participants[(i*4+2)%20].id],club_b_participant_ids:[participants[(i*4+3)%20].id,participants[(i*4+4)%20].id,].filter(Boolean)})).map(m=>({...m,club_a_names:names(m.club_a_participant_ids),club_b_names:names(m.club_b_participant_ids)}));
  const payload={success:true,event:{id:'hall-event',status:'in_progress',club_a_name:'Clare',club_b_name:'Galway',current_round:1,timer_state_json:JSON.stringify({phase:'play',running:false,remaining_seconds:480,started_at:null,round:1}),timer_revision:1,junior_display_mode:true,win_points:2,draw_points:1,loss_points:0},participants,matches:[...current,...next]};
  await page.route('**/api/apps/**',async route=>{const path=new URL(route.request().url()).pathname;if(path.includes('/analytics/'))return json(route,{});if(path.includes('/functions/getPublicClubChallengeDisplay'))return json(route,payload);return json(route,{});});
  await page.goto('/e2e/clubChallengePublicDisplayHarness.html');await expect(page.getByText('On Court Now')).toBeVisible();await expect(page.getByText('Resting This Round')).toBeVisible();await expect(page.getByText('Up Next · Round 2')).toBeVisible();await expect(page.getByText('Player 17',{exact:true}).first()).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('offline')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('online')));await expect(page.getByText(/Connection lost — showing last known state/)).toBeHidden({timeout:1200});await expectNoHorizontalOverflow(page);const report={now:true,resting:true,next:true,disconnect_warning:true,reconnect:true};console.log(`CLUB CHALLENGE PUBLIC DISPLAY ROBOT REPORT\n${JSON.stringify(report,null,2)}`);await testInfo.attach('club-challenge-public-display-report.json',{body:JSON.stringify(report,null,2),contentType:'application/json'});
});