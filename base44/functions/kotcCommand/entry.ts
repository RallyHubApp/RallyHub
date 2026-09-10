import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const STRUCTURAL = new Set(['confirm_round','start_round','start_proposed_round','undo_start_round','generate_next_round','adjust_proposed_round','set_pair_lock','set_participant_status','update_timer_settings','pause_session','resume_session','finish_after_round','finish_session_now','abandon_session','takeover_host']);
const RESOLVED = new Set(['completed','retired','abandoned','not_played']);

function nowIso() { return new Date().toISOString(); }
function int0(v:any) { const n = Number(v); return Number.isInteger(n) && n >= 0 ? n : null; }
function stableHash(value:any){const text=String(value??'');let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function sleep(ms:number){return new Promise(resolve=>setTimeout(resolve,ms));}
function isRateLimit(error:any){return /rate limit|too many requests|\b429\b/i.test(String(error?.message||error||''));}
async function withRateLimitRetry<T>(label:string,fn:()=>Promise<T>,attempts=5){let last:any;for(let i=0;i<attempts;i++){try{return await fn();}catch(error){last=error;if(!isRateLimit(error)||i===attempts-1)throw error;const delay=Math.min(2200,300*Math.pow(2,i))+Math.floor(Math.random()*120);console.warn('KOTC Base44 rate limit — retrying',{label,attempt:i+1,delay});await sleep(delay);}}throw last;}
function pairKey(a:string,b:string){return [a,b].sort().join('|');}
function keepsLocks(teams:string[][],locks:any[]){return (locks||[]).every((l:any)=>{const a=String(l.participant1_id),b=String(l.participant2_id);const present=teams.flat().includes(a)&&teams.flat().includes(b);return !present||teams.some(t=>t.includes(a)&&t.includes(b));});}
function splitFour(ids:string[],partnerCounts:any,seed:string,locks:any[]=[]){const [a,b,c,d]=ids;let opts=[[[a,b],[c,d]],[[a,c],[b,d]],[[a,d],[b,c]]].filter((x:any)=>keepsLocks(x,locks)).map((x:any)=>({teamA:x[0],teamB:x[1],pen:(partnerCounts[pairKey(x[0][0],x[0][1])]||0)+(partnerCounts[pairKey(x[1][0],x[1][1])]||0),key:`${x[0].join(',')}|${x[1].join(',')}`}));if(!opts.length)throw new Error('Locked-pair constraints cannot be satisfied on this court.');return opts.sort((x:any,y:any)=>x.pen-y.pen||stableHash(`${seed}|${x.key}`)-stableHash(`${seed}|${y.key}`)||x.key.localeCompare(y.key))[0];}
function crossSplit(pairOne:string[],pairTwo:string[],partnerCounts:any,seed:string,locks:any[]=[]){const [a,b]=pairOne,[c,d]=pairTwo;let raw=[[[a,c],[b,d]],[[a,d],[b,c]],[[a,b],[c,d]]];const opts=raw.filter((x:any)=>keepsLocks(x,locks)).map((x:any)=>({teamA:x[0],teamB:x[1],pen:(partnerCounts[pairKey(x[0][0],x[0][1])]||0)+(partnerCounts[pairKey(x[1][0],x[1][1])]||0),key:`${x[0].join(',')}|${x[1].join(',')}`}));if(!opts.length)throw new Error('Locked-pair constraints cannot be satisfied on this court.');return opts.sort((x:any,y:any)=>x.pen-y.pen||stableHash(`${seed}|${x.key}`)-stableHash(`${seed}|${y.key}`)||x.key.localeCompare(y.key))[0];}
function enforcePersistentLocks(slots:any[],locks:any[],eligibleIds:Set<string>){
  const out=slots.map((s:any)=>({...s}));
  const lockedIds=new Set((locks||[]).flatMap((l:any)=>[String(l.participant1_id),String(l.participant2_id)]));
  const sameTeam=(a:string,b:string)=>{const sa=out.find((s:any)=>String(s.participant_id)===a),sb=out.find((s:any)=>String(s.participant_id)===b);return !!sa&&!!sb&&Number(sa.ladder_court_rank)===Number(sb.ladder_court_rank)&&String(sa.team_side)===String(sb.team_side);};
  for(const lock of locks||[]){
    const a=String(lock.participant1_id),b=String(lock.participant2_id);const ia=out.findIndex((s:any)=>String(s.participant_id)===a),ib=out.findIndex((s:any)=>String(s.participant_id)===b);
    const bothAvailable=eligibleIds.has(a)&&eligibleIds.has(b);
    if(bothAvailable&&((ia<0)!==(ib<0)))throw new Error(`Locked pair ${lock.pair_name||''} was split between court and bench.`);
    if(ia<0||ib<0||sameTeam(a,b))continue;
    if(Number(out[ia].ladder_court_rank)!==Number(out[ib].ladder_court_rank))throw new Error(`Locked pair ${lock.pair_name||''} reached different destination courts. The round was not saved.`);
    // Repair only inside the same earned court. Never drag a locked player to a
    // different court merely to make the visual pairing look correct.
    const candidates:any[]=[];
    for(const [anchorIndex,otherIndex] of [[ia,ib],[ib,ia]] as any){
      const anchor=out[anchorIndex];
      const mateIndex=out.findIndex((s:any,idx:number)=>idx!==anchorIndex&&Number(s.ladder_court_rank)===Number(anchor.ladder_court_rank)&&String(s.team_side)===String(anchor.team_side));
      if(mateIndex<0)continue;const mateId=String(out[mateIndex].participant_id);if(lockedIds.has(mateId))continue;
      candidates.push({anchorIndex,otherIndex,mateIndex});
    }
    if(!candidates.length)throw new Error(`Locked pair ${lock.pair_name||''} could not be kept together on their earned court.`);
    const chosen=candidates.sort((x:any,y:any)=>x.anchorIndex-y.anchorIndex)[0];
    const movedLocked=out[chosen.otherIndex].participant_id,movedSingle=out[chosen.mateIndex].participant_id;
    out[chosen.mateIndex]={...out[chosen.mateIndex],participant_id:movedLocked,assignment_type:'locked_pair_override'};
    out[chosen.otherIndex]={...out[chosen.otherIndex],participant_id:movedSingle,assignment_type:'locked_pair_override'};
    if(!sameTeam(a,b))throw new Error(`Locked pair ${lock.pair_name||''} could not be kept together.`);
  }
  return out;
}
function sportingDestinations(courts:any[],results:any){const n=courts.length,w:any={},l:any={};for(const c of courts){const side=results[c.courtRank];w[c.courtRank]=side==='A'?[...c.teamA]:[...c.teamB];l[c.courtRank]=side==='A'?[...c.teamB]:[...c.teamA];}const d:any={};if(n===1){d[1]={pairOne:w[1],pairTwo:l[1]};return d;}for(let r=1;r<=n;r++){if(r===1)d[r]={pairOne:w[1],pairTwo:w[2]};else if(r===n)d[r]={pairOne:l[n-1],pairTwo:l[n]};else d[r]={pairOne:l[r-1],pairTwo:w[r+1]};}return d;}
function allowedAccess(a:any, tenantId:string, sessionId:string) {
  if (!a || a.status !== 'active') return false;
  if (String(a.tenant_id || '') !== String(tenantId || '')) return false;
  if (String(a.session_id || '') !== String(sessionId || '')) return false;
  if (!['session_host','assistant_host'].includes(a.role)) return false;
  const now = Date.now();
  if (a.starts_at && Date.parse(a.starts_at) > now) return false;
  if (a.ends_at && Date.parse(a.ends_at) < now) return false;
  return true;
}

function validateFinalScore(body:any, session:any) {
  const a = int0(body.teamAScore), b = int0(body.teamBScore);
  if (a == null || b == null) return { error: 'Scores must be non-negative whole numbers.' };
  if (a > 99 || b > 99) return { error: 'KOTC scores cannot exceed 99.' };
  if (session.scoring_mode === 'timed') {
    if (a === b) {
      if (!['A','B'].includes(body.servingSideAtHorn)) return { error: 'A tied timed match requires the serving side at the horn.' };
      return { a, b, winner:'B' === body.servingSideAtHorn ? 'B' : 'A', method:'timed_serving_tiebreak' };
    }
    return { a, b, winner:a > b ? 'A' : 'B', method:'normal' };
  }
  if (session.scoring_mode !== 'first_to') return { error:'Unknown KOTC scoring mode.' };
  if (a === b) return { error:'First-to scoring requires a winner.' };
  const target = Number(session.score_target || 11), cap = Number(session.score_cap || 0), winner = Math.max(a,b), loser = Math.min(a,b);
  if (!Number.isInteger(target) || target < 1) return { error:'Invalid score target.' };
  if (winner < target) return { error:`Winner must reach at least ${target}.` };
  if (cap > 0 && winner > cap) return { error:`Score cannot exceed cap of ${cap}.` };
  if (session.win_by_two && winner - loser < 2 && !(cap > 0 && winner === cap)) return { error:'Winner must lead by 2 unless the score cap is reached.' };
  if (!session.win_by_two && winner > target && !(cap > 0 && winner === cap)) return { error:`Match should finish when a team reaches ${target}.` };
  return { a, b, winner:a > b ? 'A' : 'B', method:'normal' };
}

function sessionStandings(matches:any[],participants:any[]){const s:any=Object.fromEntries((participants||[]).map((p:any)=>[p.id,{id:p.id,player_id:p.player_id,name:p.display_name,w:0,l:0,pf:0,pa:0,played:0,c1:0}]));for(const m of (matches||[]).filter((x:any)=>x.status==='completed')){const a=m.team_a_participant_ids||[],b=m.team_b_participant_ids||[];for(const id of [...a,...b])if(s[id]){s[id].played++;if(Number(m.ladder_court_rank)===1)s[id].c1++;}for(const id of a)if(s[id]){s[id].pf+=Number(m.team_a_score||0);s[id].pa+=Number(m.team_b_score||0);m.winner_side==='A'?s[id].w++:s[id].l++;}for(const id of b)if(s[id]){s[id].pf+=Number(m.team_b_score||0);s[id].pa+=Number(m.team_a_score||0);m.winner_side==='B'?s[id].w++:s[id].l++;}}return Object.values(s).sort((x:any,y:any)=>y.w-x.w||((y.pf-y.pa)-(x.pf-x.pa))||y.c1-x.c1||String(x.name).localeCompare(String(y.name))).map((x:any,i:number)=>({...x,rank:i+1}));}
async function refreshKotcAggregates(base44:any,session:any){
 const [participants,matches]=await Promise.all([base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id}),base44.asServiceRole.entities.KotcMatch.filter({session_id:session.id})]);
 const standing=sessionStandings(matches||[],participants||[]);for(const row of standing)await base44.asServiceRole.entities.KotcSessionParticipant.update(row.id,{final_rank:row.rank});
 const clubSessions=(await base44.asServiceRole.entities.KotcSession.filter({tenant_id:session.tenant_id,club_id:session.club_id})).filter((s:any)=>['completed','finalised'].includes(s.status)&&s.exclude_from_aggregates!==true);const validSessionIds=new Set(clubSessions.map((s:any)=>String(s.id)));
 for(const p of participants||[]){if(!p.player_id)continue;if(p.participant_type&&p.participant_type!=='member')continue;const records=(await base44.asServiceRole.entities.KotcSessionParticipant.filter({player_id:p.player_id})).filter((x:any)=>validSessionIds.has(String(x.session_id))&&(!x.participant_type||x.participant_type==='member'));let wins=0,losses=0,matchesPlayed=0,pf=0,pa=0,c1=0,bestRank:any=null;for(const rec of records){const ms=(await base44.asServiceRole.entities.KotcMatch.filter({session_id:rec.session_id,status:'completed'}));for(const m of ms){const inA=(m.team_a_participant_ids||[]).includes(rec.id),inB=(m.team_b_participant_ids||[]).includes(rec.id);if(!inA&&!inB)continue;matchesPlayed++;if(Number(m.ladder_court_rank)===1)c1++;if(inA){pf+=Number(m.team_a_score||0);pa+=Number(m.team_b_score||0);m.winner_side==='A'?wins++:losses++;}else{pf+=Number(m.team_b_score||0);pa+=Number(m.team_a_score||0);m.winner_side==='B'?wins++:losses++;}}if(rec.final_rank!=null)bestRank=bestRank==null?Number(rec.final_rank):Math.min(bestRank,Number(rec.final_rank));}
  const existing=(await base44.asServiceRole.entities.KotcPlayerAggregate.filter({tenant_id:session.tenant_id,club_id:session.club_id,player_id:p.player_id}))?.[0];const payload={sessions_played:records.length,wins,losses,matches_played:matchesPlayed,points_for:pf,points_against:pa,court1_rounds:c1,best_session_rank:bestRank??undefined,last_session_id:session.id,updated_at:nowIso()};if(existing)await base44.asServiceRole.entities.KotcPlayerAggregate.update(existing.id,payload);else await base44.asServiceRole.entities.KotcPlayerAggregate.create({tenant_id:session.tenant_id,club_id:session.club_id,player_id:p.player_id,...payload});
 }
}

async function createSnapshot(base44:any, session:any, commandId:string, checkpointType:string, userId:string) {
  // Base44 has strict practical payload/rate limits. The entity records themselves are
  // the authoritative recoverable sporting state, so a recovery checkpoint must remain
  // a tiny marker rather than re-reading and duplicating the entire live session.
  try {
    const prior=await base44.asServiceRole.entities.KotcRecoveryCheckpoint.filter({session_id:session.id});
    const sequence=Math.max(0,...(prior||[]).map((x:any)=>Number(x.sequence||0)))+1;
    const snapshotJson=JSON.stringify({
      schemaVersion:2,
      recoveryModel:'authoritative_entities',
      sessionId:session.id,
      sessionRevision:Number(session.revision||0),
      status:session.status,
      currentRoundId:session.current_round_id||null,
      currentRoundNumber:Number(session.current_round_number||0),
      lastCommandId:session.last_command_id||commandId,
      checkpointType,
    });
    return await base44.asServiceRole.entities.KotcRecoveryCheckpoint.create({
      tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,
      sequence,session_revision:Number(session.revision||0),current_round_number:Number(session.current_round_number||0),
      checkpoint_type:checkpointType,snapshot_json:snapshotJson,command_id:commandId,
      created_by_user_id:userId,created_at:nowIso(),
    });
  } catch(error) {
    // Supporting recovery telemetry can never turn a successful sporting write into
    // a host-visible failure. State recovery comes from the authoritative entities.
    console.warn('KOTC recovery checkpoint skipped',{sessionId:session.id,commandId,checkpointType,error:String((error as any)?.message||error)});
    return null;
  }
}

Deno.serve(async (req) => {
  let commandLog:any = null;
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const body = await req.json().catch(() => ({}));
    const { sessionId, commandId, commandType } = body;
    if (!sessionId || !commandId || !commandType) return Response.json({ error:'sessionId, commandId and commandType are required' }, { status:400 });

    const sessions = await base44.asServiceRole.entities.KotcSession.filter({ id:sessionId });
    let session = sessions?.[0];
    if (!session) return Response.json({ error:'KOTC session not found' }, { status:404 });

    let allowed = user.role === 'admin';
    let accessRole = user.role === 'admin' ? 'admin' : null;
    if (!allowed) {
      const grants = await base44.asServiceRole.entities.KotcSessionAccess.filter({ session_id:session.id, user_id:user.id, status:'active' });
      const valid = (grants || []).filter((a:any) => allowedAccess(a, session.tenant_id, session.id));
      allowed = valid.length > 0;
      accessRole = valid[0]?.role || null;
    }
    if (!allowed) return Response.json({ error:'KOTC session host permission required' }, { status:403 });
    if (accessRole === 'assistant_host' && !['autosave_score','complete_match','correct_match'].includes(commandType)) return Response.json({ error:'Assistant hosts can enter and correct scores only.' }, { status:403 });
    if (session.status === 'finalised' && !(commandType === 'correct_match' && user.role === 'admin')) return Response.json({ error:'Finalised KOTC sessions are read-only except for audited Super Admin score corrections.' }, { status:409 });

    // A real host always has authority over a player-held scoring lease. Claiming a court
    // is deliberately non-structural and does not bump the match revision, so simply
    // focusing a host score box cannot create an artificial stale-score conflict.
    if (commandType === 'host_claim_score') {
      if (accessRole === 'assistant_host') return Response.json({ error:'Assistant hosts cannot take over player scorer locks.' }, { status:403 });
      if (!['in_progress','paused'].includes(session.status)) return Response.json({ error:'Host scoring takeover is only available during a live session.' }, { status:409 });
      const match=(await base44.asServiceRole.entities.KotcMatch.filter({id:body.matchId,session_id:session.id}))?.[0];
      if(!match)return Response.json({error:'Match not found'},{status:404});
      const displaced=String(match.scoring_lock_owner||'');
      const hostOwner=`host:${user.id}`; const now=nowIso(); const expires=new Date(Date.now()+5*60*1000).toISOString();
      await base44.asServiceRole.entities.KotcMatch.update(match.id,{scoring_lock_owner:hostOwner,scoring_lock_acquired_at:now,scoring_lock_expires_at:expires});
      if(displaced&&displaced!==hostOwner){
        try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:'kotc_host_took_over_scoring',entity_type:'KotcMatch',entity_id:match.id,scope_type:'KotcSession',scope_id:session.id,before_state:JSON.stringify({scoring_lock_owner:displaced}),after_state:JSON.stringify({scoring_lock_owner:hostOwner}),reason:'Host began entering the court score'});}catch{}
      }
      return Response.json({success:true,hostAuthority:true,displacedScorer:!!displaced&&displaced!==hostOwner,expires_at:expires});
    }

    // Fast paths for the host's most time-critical actions. Do not route START ROUND
    // or first-pass score completion through large recovery snapshots: those extra
    // entity reads can hit Base44 rate limits during live play.
    if (commandType === 'complete_match') {
      if (!['in_progress'].includes(session.status)) return Response.json({ error:`Scores can only be completed while the session is live. Current status: ${session.status}.` }, { status:409 });
      const matches = await base44.asServiceRole.entities.KotcMatch.filter({ id:body.matchId, session_id:session.id });
      const match = matches?.[0];
      if (!match) return Response.json({ error:'Match not found' }, { status:404 });
      const expected = Number(body.expectedMatchRevision), current = Number(match.revision || 0);
      if (RESOLVED.has(match.status) && String(match.command_id||'') === String(commandId)) return Response.json({ success:true, duplicate:true, match });
      if (expected !== current) return Response.json({ conflict:true, error:'Match changed since you opened it.', currentMatchRevision:current }, { status:409 });
      if (RESOLVED.has(match.status)) return Response.json({ error:'Match already resolved; use correction.' }, { status:409 });
      const score:any = validateFinalScore(body, session);
      if (score.error) return Response.json({ error:score.error }, { status:400 });
      const now = nowIso();
      const updated = await base44.asServiceRole.entities.KotcMatch.update(match.id, {
        team_a_score:score.a, team_b_score:score.b, winner_side:score.winner, result_method:score.method,
        serving_side_at_horn:score.method === 'timed_serving_tiebreak' ? body.servingSideAtHorn : undefined,
        status:'completed', completed_at:now, revision:current + 1, command_id:commandId, scored_by_user_id:user.id,
        scoring_lock_owner:null, scoring_lock_acquired_at:null, scoring_lock_expires_at:null,
      });
      try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:'kotc_score_completed',entity_type:'KotcMatch',entity_id:match.id,scope_type:'KotcSession',scope_id:session.id,after_state:JSON.stringify({team_a_score:score.a,team_b_score:score.b,winner_side:score.winner,revision:current+1})});}catch{}
      return Response.json({success:true,match:updated});
    }

    if (commandType === 'undo_start_round') {
      const currentRevision=Number(session.revision||0);
      if(Number(body.expectedSessionRevision)!==currentRevision)return Response.json({error:'Session changed since you opened it. Refresh and try again.',conflict:true,currentSessionRevision:currentRevision},{status:409});
      // Round state and score-touch validation are independent reads. Fetch both together so
      // the host gets an immediate response instead of waiting through sequential round-trips.
      const [roundRows,matches]=await Promise.all([
        base44.asServiceRole.entities.KotcRound.filter({id:body.roundId,session_id:session.id}),
        base44.asServiceRole.entities.KotcMatch.filter({round_id:body.roundId,session_id:session.id}),
      ]);
      const round=roundRows?.[0];
      if(!round)return Response.json({error:'Round not found.'},{status:404});
      if(round.status!=='started')return Response.json({error:'Only the current started round can be returned to setup.'},{status:409});
      if(Number(round.round_number)!==Number(session.current_round_number))return Response.json({error:'Only the current round can be returned to setup.'},{status:409});
      const touched=(matches||[]).filter((m:any)=>RESOLVED.has(m.status)||m.team_a_score!=null||m.team_b_score!=null||m.autosaved_at);
      if(touched.length)return Response.json({error:'A score has already been entered or saved. Use score correction instead of Undo Start.'},{status:409});
      const isRoundOne=Number(round.round_number)===1;
      const resetTimerState={roundId:round.id,roundNumber:Number(round.round_number||0),durationSeconds:Math.max(1,Number(session.play_minutes||8))*60,remainingSeconds:Math.max(1,Number(session.play_minutes||8))*60,running:false,deadlineAt:null,lastAction:'reset',updatedAt:nowIso(),updatedByUserId:user.id};
      const update:any={revision:currentRevision+1,last_command_id:commandId,status:session.status==='in_progress'&&isRoundOne?'ready':session.status,timer_state_json:JSON.stringify(resetTimerState)};
      if(isRoundOne)update.actual_first_round_start=null;
      // Base44 omits undefined fields on update, so explicit nulls are required to clear
      // stale start/confirm timestamps when a round is returned to setup.
      const roundReset:any={status:'proposed',started_at:null,confirmed_at:null,confirmed_by_user_id:null};
      // Once validation passes, reverting the round, session and tournament are independent.
      // Commit them together and return the authoritative state straight back to the UI.
      const [updatedRound,updatedSession]=await Promise.all([
        base44.asServiceRole.entities.KotcRound.update(round.id,roundReset),
        base44.asServiceRole.entities.KotcSession.update(session.id,update),
        isRoundOne&&session.tournament_id?base44.asServiceRole.entities.Tournament.update(session.tournament_id,{status:'Draft',finalised_at:null}):Promise.resolve(null),
      ]);
      session=updatedSession;
      try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:'kotc_round_start_undone',entity_type:'KotcRound',entity_id:round.id,scope_type:'KotcSession',scope_id:session.id,reason:'Host returned unscored round to setup'});}catch{}
      return Response.json({success:true,session,round:updatedRound});
    }

    if (commandType === 'start_proposed_round') {
      const currentRevision=Number(session.revision||0);
      const round=(await base44.asServiceRole.entities.KotcRound.filter({id:body.roundId,session_id:session.id}))?.[0];
      if(!round)return Response.json({error:'Round not found.'},{status:404});
      // START ROUND is deliberately tolerant of a stale session revision. Mobile hosts can
      // have an 8-second poll land between opening the editor and tapping Start. The round
      // id + proposal revision below are the authoritative sporting guards, so an unrelated
      // session revision must not strand a valid proposed round.
      if(round.status==='started'&&String(session.current_round_id||'')===String(round.id))return Response.json({success:true,alreadyStarted:true,session,round});
      if(round.status!=='proposed')return Response.json({error:`Round cannot start from ${round.status}.`},{status:409});
      if(Number(body.expectedProposalRevision)!==Number(round.proposal_revision||1))return Response.json({error:'Round proposal changed since you opened it. Refresh and try again.',conflict:true,currentProposalRevision:Number(round.proposal_revision||1)},{status:409});
      // These reads are independent. Run them together so START ROUND is not held up by
      // three sequential Base44 round-trips on a host's phone.
      const [slotRows,participants,lockRows]=await Promise.all([
        base44.asServiceRole.entities.KotcRoundSlot.filter({round_id:round.id,session_id:session.id}),
        base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id}),
        base44.asServiceRole.entities.KotcFixedPair.filter({session_id:session.id,status:'active'}),
      ]);
      const slots=(slotRows||[]).sort((a:any,b:any)=>Number(a.ladder_court_rank)-Number(b.ladder_court_rank)||String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number));
      const eligible=new Set((participants||[]).filter((p:any)=>['registered','confirmed','present','leaving_early'].includes(p.status)).map((p:any)=>String(p.id)));
      const requested=body.slotParticipantIds||{};const nextIds=slots.map((s:any)=>String(requested[s.id]||s.participant_id));const expected=Number(round.active_court_count||0)*4;
      if(slots.length!==expected||nextIds.length!==expected)return Response.json({error:`Round not ready: expected ${expected} court positions.`},{status:409});
      if(new Set(nextIds).size!==nextIds.length)return Response.json({error:'Round not ready: a player appears more than once.'},{status:409});
      if(nextIds.some((id:string)=>!eligible.has(id)))return Response.json({error:'Round not ready: an unavailable player is assigned.'},{status:409});
      const teams:any={};for(let i=0;i<slots.length;i++){const s=slots[i],key=`${s.ladder_court_rank}-${s.team_side}`;(teams[key]||(teams[key]=[])).push(nextIds[i]);}
      for(const team of Object.values(teams) as any[])if(team.length!==2)return Response.json({error:'Round not ready: every team must contain two players.'},{status:409});
      const locks=(lockRows||[]).filter((p:any)=>p.pair_source==='host_selected');
      for(const l of locks){const a=String(l.participant1_id),b=String(l.participant2_id);if(nextIds.includes(a)&&nextIds.includes(b)&&!Object.values(teams).some((t:any)=>t.includes(a)&&t.includes(b)))return Response.json({error:`Round not ready: locked pair ${l.pair_name||''} is split.`},{status:409});}
      const changedCourts=new Set<number>();for(let i=0;i<slots.length;i++){const s=slots[i],id=nextIds[i];if(id!==String(s.participant_id)){await base44.asServiceRole.entities.KotcRoundSlot.update(s.id,{participant_id:id,assignment_type:'manual_override',assignment_revision:Number(s.assignment_revision||1)+1});changedCourts.add(Number(s.ladder_court_rank));}}
      if(changedCourts.size){const ms=await base44.asServiceRole.entities.KotcMatch.filter({round_id:round.id,session_id:session.id});for(const m of ms){const rank=Number(m.ladder_court_rank);if(!changedCourts.has(rank))continue;const court=slots.map((s:any,i:number)=>({...s,participant_id:nextIds[i]})).filter((s:any)=>Number(s.ladder_court_rank)===rank);await base44.asServiceRole.entities.KotcMatch.update(m.id,{team_a_participant_ids:court.filter((s:any)=>s.team_side==='A').sort((a:any,b:any)=>Number(a.slot_number)-Number(b.slot_number)).map((s:any)=>s.participant_id),team_b_participant_ids:court.filter((s:any)=>s.team_side==='B').sort((a:any,b:any)=>Number(a.slot_number)-Number(b.slot_number)).map((s:any)=>s.participant_id),revision:Number(m.revision||0)+1,command_id:commandId});}}
      const startedAt=nowIso();
      const sessionUpdate:any={status:session.status==='ready'?'in_progress':session.status,revision:currentRevision+1,last_command_id:commandId,current_round_number:round.round_number,current_round_id:round.id};if(!session.actual_first_round_start)sessionUpdate.actual_first_round_start=startedAt;
      // The round, session and parent tournament updates are independent once validation
      // has passed. Commit them in parallel to minimise the host-visible START delay.
      const [updatedRound,updatedSession]=await Promise.all([
        base44.asServiceRole.entities.KotcRound.update(round.id,{status:'started',confirmed_at:startedAt,confirmed_by_user_id:user.id,started_at:startedAt}),
        base44.asServiceRole.entities.KotcSession.update(session.id,sessionUpdate),
        session.tournament_id?base44.asServiceRole.entities.Tournament.update(session.tournament_id,{status:'In Progress'}):Promise.resolve(null),
      ]);
      session=updatedSession;
      try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:'kotc_round_started',entity_type:'KotcRound',entity_id:round.id,scope_type:'KotcSession',scope_id:session.id,after_state:JSON.stringify({round_number:round.round_number,started_at:startedAt,manual_courts:[...changedCourts]})});}catch{}
      return Response.json({success:true,session,round:updatedRound});
    }

    const duplicates = await withRateLimitRetry('command duplicate check',()=>base44.asServiceRole.entities.KotcCommandLog.filter({ session_id:session.id, command_id:commandId }));
    if (duplicates?.length) {
      const existing = duplicates[0];
      return Response.json({ duplicate:true, commandId, status:existing.status, result:existing.result_json ? JSON.parse(existing.result_json) : null });
    }

    const currentSessionRevision = Number(session.revision || 0);
    if (STRUCTURAL.has(commandType) && Number(body.expectedSessionRevision) !== currentSessionRevision) {
      return Response.json({ conflict:true, error:'Session changed since you opened it.', currentSessionRevision, expectedSessionRevision:Number(body.expectedSessionRevision) }, { status:409 });
    }

    commandLog = await withRateLimitRetry('command log create',()=>base44.asServiceRole.entities.KotcCommandLog.create({
      tenant_id:session.tenant_id, club_id:session.club_id, session_id:session.id,
      command_id:commandId, command_type:commandType, expected_session_revision:Number(body.expectedSessionRevision ?? currentSessionRevision),
      status:'received', payload_json:JSON.stringify(body), issued_by_user_id:user.id, issued_at:nowIso(),
    }));

    let result:any = null;
    const now = nowIso();

    if (commandType === 'autosave_score') {
      const matches = await base44.asServiceRole.entities.KotcMatch.filter({ id:body.matchId, session_id:session.id });
      const match = matches?.[0];
      if (!match) throw new Error('Match not found');
      const expected = Number(body.expectedMatchRevision), current = Number(match.revision || 0);
      if (expected !== current) return Response.json({ conflict:true, error:'Match changed since you opened it.', currentMatchRevision:current }, { status:409 });
      if (RESOLVED.has(match.status)) return Response.json({ error:'Resolved matches require a correction command.' }, { status:409 });
      const a = int0(body.teamAScore), b = int0(body.teamBScore);
      if (a == null || b == null) return Response.json({ error:'Scores must be non-negative whole numbers.' }, { status:400 });
      if (a > 99 || b > 99) return Response.json({ error:'KOTC scores cannot exceed 99.' }, { status:400 });
      const updated = await base44.asServiceRole.entities.KotcMatch.update(match.id, { team_a_score:a, team_b_score:b, status:match.status === 'scheduled' ? 'in_progress' : match.status, revision:current + 1, command_id:commandId, autosaved_at:now });
      result = { success:true, match:updated };
      await createSnapshot(base44, session, commandId, 'score_saved', user.id);
    } else if (commandType === 'complete_match' || commandType === 'correct_match') {
      const matches = await base44.asServiceRole.entities.KotcMatch.filter({ id:body.matchId, session_id:session.id });
      const match = matches?.[0];
      if (!match) throw new Error('Match not found');
      const expected = Number(body.expectedMatchRevision), current = Number(match.revision || 0);
      if (expected !== current) return Response.json({ conflict:true, error:'Match changed since you opened it.', currentMatchRevision:current }, { status:409 });
      const isCorrection = commandType === 'correct_match';
      if (isCorrection && !RESOLVED.has(match.status)) return Response.json({ error:'Only resolved matches can be corrected.' }, { status:409 });
      if (!isCorrection && RESOLVED.has(match.status)) return Response.json({ error:'Match already resolved; use correction.' }, { status:409 });
      if (isCorrection && !String(body.reason || '').trim()) return Response.json({ error:'A correction reason is required.' }, { status:400 });
      const score:any = validateFinalScore(body, session);
      if (score.error) return Response.json({ error:score.error }, { status:400 });
      const original = isCorrection ? (match.original_result_json || JSON.stringify({ team_a_score:match.team_a_score, team_b_score:match.team_b_score, winner_side:match.winner_side, result_method:match.result_method, revision:current })) : undefined;
      const update:any = { team_a_score:score.a, team_b_score:score.b, winner_side:score.winner, result_method:score.method, serving_side_at_horn:score.method === 'timed_serving_tiebreak' ? body.servingSideAtHorn : undefined, status:'completed', completed_at:match.completed_at || now, revision:current + 1, command_id:commandId, scored_by_user_id:match.scored_by_user_id || user.id, scoring_lock_owner:null, scoring_lock_acquired_at:null, scoring_lock_expires_at:null, scorer_correction_owner_client_id:null };
      if (isCorrection) Object.assign(update, { correction_count:Number(match.correction_count || 0) + 1, last_corrected_at:now, last_corrected_by_user_id:user.id, last_correction_reason:String(body.reason).trim(), original_result_json:original });
      const updated = await base44.asServiceRole.entities.KotcMatch.update(match.id, update);
      if (isCorrection) {
        await base44.asServiceRole.entities.AuditLog.create({ tenant_id:session.tenant_id, club_id:session.club_id, user_id:user.id, action:'kotc_score_corrected', entity_type:'KotcMatch', entity_id:match.id, scope_type:'KotcSession', scope_id:session.id, before_state:JSON.stringify({ team_a_score:match.team_a_score, team_b_score:match.team_b_score, winner_side:match.winner_side, revision:current }), after_state:JSON.stringify({ team_a_score:score.a, team_b_score:score.b, winner_side:score.winner, revision:current + 1 }), reason:String(body.reason).trim() });
      }
      result = { success:true, match:updated, correction:isCorrection };
      if(isCorrection&&['completed','finalised'].includes(session.status))await refreshKotcAggregates(base44,session);
      await createSnapshot(base44, session, commandId, 'score_saved', user.id);
    } else if (commandType === 'generate_next_round') {
      // The host normally presses Prepare immediately after the fourth score save.
      // Give Base44's burst window a moment to clear, then retry provider 429s internally.
      await sleep(250);
      const rounds = await withRateLimitRetry('prepare rounds',()=>base44.asServiceRole.entities.KotcRound.filter({ session_id:session.id }));
      const currentRound = (rounds || []).filter((r:any)=>Number(r.round_number)===Number(session.current_round_number)).sort((a:any,b:any)=>Number(b.proposal_revision||0)-Number(a.proposal_revision||0))[0];
      if (!currentRound) return Response.json({ error:'Current round not found.' }, { status:404 });
      if (!['started','completed'].includes(currentRound.status)) return Response.json({ error:'Current round must be started before generating the next round.' }, { status:409 });
      const matches = (await withRateLimitRetry('prepare current matches',()=>base44.asServiceRole.entities.KotcMatch.filter({ round_id:currentRound.id, session_id:session.id }))).sort((a:any,b:any)=>Number(a.ladder_court_rank)-Number(b.ladder_court_rank));
      const unresolved = matches.filter((m:any)=>!RESOLVED.has(m.status));
      if (unresolved.length) return Response.json({ error:`${unresolved.length} current-round match result(s) unresolved.` }, { status:409 });
      const playableMatches = matches.filter((m:any)=>m.status==='completed');
      if (!playableMatches.length) return Response.json({ error:'No completed sporting results are available to generate movement.' }, { status:409 });
      const participants = await withRateLimitRetry('prepare participants',()=>base44.asServiceRole.entities.KotcSessionParticipant.filter({ session_id:session.id }));
      const fixedPairs=await withRateLimitRetry('prepare fixed pairs',()=>base44.asServiceRole.entities.KotcFixedPair.filter({session_id:session.id,status:'active'}));
      const activeLocks=(fixedPairs||[]).filter((p:any)=>p.pair_source==='host_selected');
      const nextNumber=Number(currentRound.round_number)+1;
      const eligible = participants.filter((p:any)=>{
        if(['injured','left','no_show','withdrawn','replaced'].includes(p.status)) return false;
        const effective=Number(p.availability_effective_from_round||0);
        const availableAgain=Number(p.available_again_from_round||0);
        if(['temporarily_unavailable','voluntary_rest'].includes(p.status)) return availableAgain>0 && nextNumber>=availableAgain;
        if(p.status==='leaving_early') return !(effective>0 && nextNumber>=effective);
        return ['registered','confirmed','present'].includes(p.status);
      });
      const activeCourts = Math.min(Number(session.available_court_limit||session.venue_court_limit||4), Math.floor(eligible.length/4));
      if(activeCourts<1)return Response.json({error:'Fewer than four available players remain. Finish or abandon the session rather than generating another round.'},{status:409});
      const currentActiveCourts=Number(currentRound.active_court_count||playableMatches.length);
      const courts = playableMatches.map((m:any)=>({courtRank:Number(m.ladder_court_rank),teamA:[...(m.team_a_participant_ids||[])],teamB:[...(m.team_b_participant_ids||[])]}));
      const results:any = Object.fromEntries(playableMatches.map((m:any)=>[Number(m.ladder_court_rank),m.winner_side]));
      const allCompleted = await withRateLimitRetry('prepare completed history',()=>base44.asServiceRole.entities.KotcMatch.filter({ session_id:session.id, status:'completed' }));
      const partnerCounts:any={}; for(const m of allCompleted){for(const pair of [m.team_a_participant_ids||[],m.team_b_participant_ids||[]])if(pair.length===2){const k=pairKey(pair[0],pair[1]);partnerCounts[k]=(partnerCounts[k]||0)+1;}}
      const currentCourtIds=new Set(courts.flatMap((c:any)=>[...c.teamA,...c.teamB])); const currentBenchIds=new Set(eligible.map((p:any)=>p.id).filter((id:string)=>!currentCourtIds.has(id))); const court1Ids=new Set(courts.find((c:any)=>c.courtRank===1)?[...courts.find((c:any)=>c.courtRank===1).teamA,...courts.find((c:any)=>c.courtRank===1).teamB]:[]);
      const currentCourtRank:any={};for(const c of courts)for(const id of [...c.teamA,...c.teamB])currentCourtRank[id]=c.courtRank;
      const destinationRank:any={};for(const c of courts){const side=results[c.courtRank];const winners=side==='A'?c.teamA:c.teamB;const losers=side==='A'?c.teamB:c.teamA;for(const id of winners)destinationRank[id]=Math.max(1,c.courtRank-1);for(const id of losers)destinationRank[id]=Math.min(currentActiveCourts,c.courtRank+1);}for(const p of eligible)if(destinationRank[p.id]==null)destinationRank[p.id]=currentActiveCourts;
      const projected=eligible.map((p:any)=>({...p,rounds_played:Number(p.rounds_played||0)+(currentCourtIds.has(p.id)?1:0),fairness_benches:Number(p.fairness_benches||0)+(currentBenchIds.has(p.id)?1:0),consecutive_rounds_played:currentCourtIds.has(p.id)?Number(p.consecutive_rounds_played||0)+1:0,consecutive_court1_rounds:currentCourtIds.has(p.id)&&court1Ids.has(p.id)?Number(p.consecutive_court1_rounds||0)+1:0,court1_rounds:Number(p.court1_rounds||0)+(currentCourtIds.has(p.id)&&court1Ids.has(p.id)?1:0),_previousBench:currentBenchIds.has(p.id)}));
      const benchPlaces=eligible.length-activeCourts*4;
      const lockedIds=new Set(activeLocks.flatMap((l:any)=>[String(l.participant1_id),String(l.participant2_id)]));
      const selected=[...projected].sort((a:any,b:any)=>Number(lockedIds.has(String(a.id)))-Number(lockedIds.has(String(b.id)))||Number(a.fairness_benches)-Number(b.fairness_benches)||Number(a._previousBench)-Number(b._previousBench)||Number(b.consecutive_rounds_played)-Number(a.consecutive_rounds_played)||Number(b.rounds_played)-Number(a.rounds_played)||Number(b.consecutive_court1_rounds)-Number(a.consecutive_court1_rounds)||Number(a.recent_fairness_burden||0)-Number(b.recent_fairness_burden||0)||Number(destinationRank[b.id]||99)-Number(destinationRank[a.id]||99)||stableHash(`${session.random_seed}|r${nextNumber}|${a.id}`)-stableHash(`${session.random_seed}|r${nextNumber}|${b.id}`)).slice(0,benchPlaces).map((p:any)=>p.id);
      const selectedSet=new Set(selected); let finalSlots:any[]=[];
      if(activeCourts===currentActiveCourts){
        const destinations=sportingDestinations(courts,results); const sportingSlots:any[]=[];
        for(const [rankText,d] of Object.entries(destinations) as any){const rank=Number(rankText);const split=crossSplit(d.pairOne,d.pairTwo,partnerCounts,`${session.random_seed}|r${nextNumber}|c${rank}`,activeLocks);for(const [side,ids] of [['A',split.teamA],['B',split.teamB]] as any){for(let i=0;i<2;i++)sportingSlots.push({participant_id:ids[i],ladder_court_rank:rank,team_side:side,slot_number:i+1,destination_from_prior_round:rank});}}
        const sportingSet=new Set(sportingSlots.map((s:any)=>s.participant_id)); const outgoing=sportingSlots.filter((s:any)=>selectedSet.has(s.participant_id)).sort((a:any,b:any)=>a.ladder_court_rank-b.ladder_court_rank||String(a.team_side).localeCompare(String(b.team_side))||a.slot_number-b.slot_number); const replacements=projected.filter((p:any)=>!sportingSet.has(p.id)&&!selectedSet.has(p.id)).map((p:any)=>p.id).sort((a:string,b:string)=>stableHash(`${session.random_seed}|r${nextNumber}|${a}`)-stableHash(`${session.random_seed}|r${nextNumber}|${b}`));
        if(outgoing.length!==replacements.length)return Response.json({ error:'Fairness substitution invariant failed while generating the next round.' }, { status:409 }); const replacementFor=new Map(outgoing.map((s:any,i:number)=>[s.participant_id,replacements[i]])); finalSlots=sportingSlots.map((s:any)=>replacementFor.has(s.participant_id)?{...s,replacement_for_participant_id:s.participant_id,participant_id:replacementFor.get(s.participant_id),assignment_type:'fairness_return'}:{...s,assignment_type:'sporting_movement'});
      }else{
        const activeIds=projected.filter((p:any)=>!selectedSet.has(p.id)).map((p:any)=>p.id).sort((a:string,b:string)=>Number(destinationRank[a]||99)-Number(destinationRank[b]||99)||Number(currentCourtRank[a]||99)-Number(currentCourtRank[b]||99)||stableHash(`${session.random_seed}|court-transition|r${nextNumber}|${a}`)-stableHash(`${session.random_seed}|court-transition|r${nextNumber}|${b}`));
        if(activeIds.length!==activeCourts*4)return Response.json({error:'Court transition did not produce exactly four players per active court.'},{status:409});
        for(let rank=1;rank<=activeCourts;rank++){const four=activeIds.slice((rank-1)*4,rank*4);const split=splitFour(four,partnerCounts,`${session.random_seed}|court-transition|r${nextNumber}|c${rank}`,activeLocks);for(const [side,ids] of [['A',split.teamA],['B',split.teamB]] as any)for(let i=0;i<2;i++)finalSlots.push({participant_id:ids[i],ladder_court_rank:rank,team_side:side,slot_number:i+1,assignment_type:'sporting_movement',destination_from_prior_round:destinationRank[ids[i]]});}
      }
      // Persistent host pair locks are a sporting invariant, not a warning preference.
      // Auto-repair the generated proposal before any RoundSlot/Match is persisted.
      finalSlots=enforcePersistentLocks(finalSlots,activeLocks,new Set(eligible.map((p:any)=>String(p.id))));
      for(const lock of activeLocks){const a=String(lock.participant1_id),b=String(lock.participant2_id);const sa=finalSlots.find((s:any)=>String(s.participant_id)===a),sb=finalSlots.find((s:any)=>String(s.participant_id)===b);if(sa&&sb&&(Number(sa.ladder_court_rank)!==Number(sb.ladder_court_rank)||String(sa.team_side)!==String(sb.team_side)))return Response.json({error:`Locked pair ${lock.pair_name||''} could not be kept together automatically.`},{status:409});}
      const existingNext=(rounds||[]).filter((r:any)=>Number(r.round_number)===nextNumber&&!['superseded','abandoned'].includes(r.status)).sort((a:any,b:any)=>Number(b.proposal_revision||0)-Number(a.proposal_revision||0))[0];
      if(existingNext){
        session=await withRateLimitRetry('prepare reconcile existing round',()=>base44.asServiceRole.entities.KotcSession.update(session.id,{revision:currentSessionRevision+1,last_command_id:commandId,current_round_number:nextNumber,current_round_id:existingNext.id}));
        result={success:true,duplicateGenerationPrevented:true,session,round:existingNext};
        await base44.asServiceRole.entities.KotcCommandLog.update(commandLog.id,{status:'applied',applied_session_revision:Number(session.revision||currentSessionRevision),result_json:JSON.stringify(result),applied_at:nowIso()});
        return Response.json(result);
      }
      const newRound=await withRateLimitRetry('prepare create round',()=>base44.asServiceRole.entities.KotcRound.create({tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,round_number:nextNumber,status:'proposed',proposal_revision:1,active_court_count:activeCourts,bench_count:benchPlaces,generated_by_command_id:commandId,engine_input_hash:String(stableHash(JSON.stringify({results,selected,currentActiveCourts,activeCourts}))),engine_output_hash:String(stableHash(JSON.stringify(finalSlots)))}));
      const slotCreates=finalSlots.map((s:any)=>({tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,round_id:newRound.id,round_number:nextNumber,ladder_court_rank:s.ladder_court_rank,team_side:s.team_side,slot_number:s.slot_number,participant_id:s.participant_id,assignment_type:s.assignment_type,assignment_revision:1,replacement_for_participant_id:s.replacement_for_participant_id,destination_from_prior_round:s.destination_from_prior_round}));
      const matchCreates=Array.from({length:activeCourts},(_,idx)=>{const rank=idx+1,ss=finalSlots.filter((s:any)=>s.ladder_court_rank===rank);return{tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,round_id:newRound.id,round_number:nextNumber,ladder_court_rank:rank,team_a_participant_ids:ss.filter((s:any)=>s.team_side==='A').sort((a:any,b:any)=>a.slot_number-b.slot_number).map((s:any)=>s.participant_id),team_b_participant_ids:ss.filter((s:any)=>s.team_side==='B').sort((a:any,b:any)=>a.slot_number-b.slot_number).map((s:any)=>s.participant_id),status:'scheduled',revision:0,correction_count:0};});
      const returningIds=new Set((participants||[]).filter((p:any)=>['temporarily_unavailable','voluntary_rest'].includes(p.status)&&Number(p.available_again_from_round||0)>0&&nextNumber>=Number(p.available_again_from_round)).map((p:any)=>String(p.id)));
      const participantUpdates=projected.map((p:any)=>({id:p.id,rounds_played:p.rounds_played,fairness_benches:p.fairness_benches,consecutive_rounds_played:p.consecutive_rounds_played,consecutive_court1_rounds:p.consecutive_court1_rounds,court1_rounds:p.court1_rounds,...(returningIds.has(String(p.id))?{status:'present',availability_effective_from_round:null,available_again_from_round:null}:{})}));
      const participationEvents=[...selected.map((id:string)=>({tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,participant_id:id,round_id:newRound.id,round_number:nextNumber,event_type:'fairness_bench',effective_from_round:nextNumber,effective_to_round:nextNumber,fairness_credit:true,command_id:commandId,recorded_by_user_id:user.id,occurred_at:now})),...[...returningIds].map((id:string)=>({tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,participant_id:id,round_id:newRound.id,round_number:nextNumber,event_type:'returned_available',effective_from_round:nextNumber,fairness_credit:false,command_id:commandId,recorded_by_user_id:user.id,occurred_at:now}))];
      // Base44 live-session rule: keep child writes batched, but do NOT fire the batches
      // concurrently. Concurrent provider calls can trip Base44's burst limit even when
      // the total request count is modest. Each batch retries 429s with backoff.
      if(slotCreates.length)await withRateLimitRetry('prepare round slots',()=>base44.asServiceRole.entities.KotcRoundSlot.bulkCreate(slotCreates));
      if(matchCreates.length)await withRateLimitRetry('prepare round matches',()=>base44.asServiceRole.entities.KotcMatch.bulkCreate(matchCreates));
      if(participantUpdates.length)await withRateLimitRetry('prepare participant counters',()=>base44.asServiceRole.entities.KotcSessionParticipant.bulkUpdate(participantUpdates));
      if(participationEvents.length)await withRateLimitRetry('prepare participation events',()=>base44.asServiceRole.entities.KotcParticipationEvent.bulkCreate(participationEvents));
      if(currentRound.status!=='completed')await withRateLimitRetry('prepare close current round',()=>base44.asServiceRole.entities.KotcRound.update(currentRound.id,{status:'completed',completed_at:now}));
      session=await withRateLimitRetry('prepare advance session',()=>base44.asServiceRole.entities.KotcSession.update(session.id,{revision:currentSessionRevision+1,last_command_id:commandId,current_round_number:nextNumber,current_round_id:newRound.id}));
      result={success:true,session,round:newRound,benchParticipantIds:selected};
      if(activeCourts!==currentActiveCourts){try{await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:'kotc_court_count_transition',entity_type:'KotcRound',entity_id:newRound.id,scope_type:'KotcSession',scope_id:session.id,before_state:JSON.stringify({activeCourts:currentActiveCourts,eligiblePlayers:currentCourtIds.size}),after_state:JSON.stringify({activeCourts,eligiblePlayers:eligible.length,benchPlaces}),reason:'Availability change required safe court-count remap'});}catch(error){console.warn('KOTC court transition audit skipped',{sessionId:session.id,error:String((error as any)?.message||error)});}}
      await createSnapshot(base44,session,commandId,'round_completed',user.id);
    } else if (commandType === 'set_participant_status') {
      const participants=await base44.asServiceRole.entities.KotcSessionParticipant.filter({id:body.participantId,session_id:session.id});
      const participant=participants?.[0]; if(!participant)return Response.json({error:'Participant not found.'},{status:404});
      const action=String(body.statusAction||''); const currentRoundNumber=Math.max(1,Number(session.current_round_number||1));
      const rounds=await base44.asServiceRole.entities.KotcRound.filter({id:session.current_round_id,session_id:session.id}); const round=rounds?.[0]||null;
      const effectiveRound=round&&['started','completed'].includes(round.status)?currentRoundNumber+1:currentRoundNumber;
      const update:any={}; let eventType='manual_override'; let reason=String(body.reason||'').trim();
      if(action==='voluntary_rest'){update.status='voluntary_rest';update.availability_effective_from_round=effectiveRound;update.available_again_from_round=effectiveRound+1;eventType='voluntary_rest';reason=reason||'Host marked one-round voluntary rest';}
      else if(action==='temporarily_unavailable'){update.status='temporarily_unavailable';update.availability_effective_from_round=effectiveRound;update.available_again_from_round=body.availableAgainFromRound?Number(body.availableAgainFromRound):undefined;eventType='temporary_absence';reason=reason||'Host marked temporarily unavailable';}
      else if(action==='injured'){update.status='injured';update.availability_effective_from_round=effectiveRound;eventType='injury';reason=reason||'Host marked injured';}
      else if(action==='leaving_early'){update.status='leaving_early';update.availability_effective_from_round=effectiveRound;update.left_after_round=Math.max(0,effectiveRound-1);eventType='leaving_early';reason=reason||'Host marked leaving early';}
      else if(action==='back_available'){update.status='present';update.availability_effective_from_round=undefined;update.available_again_from_round=undefined;update.left_after_round=undefined;eventType='returned_available';reason=reason||'Host returned player to available';}
      else return Response.json({error:'Unknown participant status action.'},{status:400});
      const updated=await base44.asServiceRole.entities.KotcSessionParticipant.update(participant.id,update);
      await base44.asServiceRole.entities.KotcParticipationEvent.create({tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,participant_id:participant.id,round_id:round?.id,round_number:effectiveRound,event_type:eventType,effective_from_round:effectiveRound,effective_to_round:action==='voluntary_rest'?effectiveRound:undefined,fairness_credit:false,reason,command_id:commandId,recorded_by_user_id:user.id,occurred_at:now});
      await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:'kotc_participant_status_changed',entity_type:'KotcSessionParticipant',entity_id:participant.id,scope_type:'KotcSession',scope_id:session.id,before_state:JSON.stringify({status:participant.status,availability_effective_from_round:participant.availability_effective_from_round,available_again_from_round:participant.available_again_from_round}),after_state:JSON.stringify(update),reason});
      session=await base44.asServiceRole.entities.KotcSession.update(session.id,{revision:currentSessionRevision+1,last_command_id:commandId});
      result={success:true,session,participant:updated,effectiveRound};
    } else if (commandType === 'adjust_proposed_round') {
      const rounds = await base44.asServiceRole.entities.KotcRound.filter({ id:body.roundId, session_id:session.id });
      const round = rounds?.[0];
      if (!round) return Response.json({ error:'Round not found.' }, { status:404 });
      if (round.status !== 'proposed') return Response.json({ error:'Only a proposed round can be manually adjusted.' }, { status:409 });
      const currentProposalRevision = Number(round.proposal_revision || 1);
      if (Number(body.expectedProposalRevision) !== currentProposalRevision) return Response.json({ conflict:true, error:'Round proposal changed since you opened it.', currentProposalRevision }, { status:409 });
      const slots = (await base44.asServiceRole.entities.KotcRoundSlot.filter({ round_id:round.id, session_id:session.id })).sort((a:any,b:any)=>Number(a.ladder_court_rank)-Number(b.ladder_court_rank)||String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number));
      if (!slots.length) return Response.json({ error:'Round has no slots to adjust.' }, { status:409 });
      const requested = body.slotParticipantIds || {};
      const originalIds = slots.map((s:any)=>String(s.participant_id));
      const nextIds = slots.map((s:any)=>String(requested[s.id] || s.participant_id));
      if (new Set(nextIds).size !== nextIds.length) return Response.json({ error:'A player cannot appear in more than one slot.' }, { status:400 });
      const participants = await base44.asServiceRole.entities.KotcSessionParticipant.filter({ session_id:session.id });
      const eligibleList=(participants||[]).filter((p:any)=>['registered','confirmed','present','leaving_early'].includes(p.status));
      const eligible = new Set(eligibleList.map((p:any)=>String(p.id)));
      if (nextIds.some((id:string)=>!eligible.has(id))) return Response.json({ error:'Unavailable, injured, left or withdrawn players cannot be placed on court.' }, { status:400 });
      if(nextIds.length!==Number(round.active_court_count||0)*4)return Response.json({error:'Round must have exactly four players on every active court.'},{status:400});
      const before = slots.map((s:any)=>({slotId:s.id,court:Number(s.ladder_court_rank),team:s.team_side,slot:Number(s.slot_number),participantId:String(s.participant_id)}));
      const changed:any[]=[];
      for (let i=0;i<slots.length;i++) {
        const slot=slots[i], participantId=nextIds[i];
        if (participantId !== String(slot.participant_id)) {
          const updated=await base44.asServiceRole.entities.KotcRoundSlot.update(slot.id,{participant_id:participantId,assignment_type:'manual_override',assignment_revision:Number(slot.assignment_revision||1)+1});
          changed.push({slotId:slot.id,fromParticipantId:String(slot.participant_id),toParticipantId:participantId,court:Number(slot.ladder_court_rank),team:slot.team_side,slot:Number(slot.slot_number)});
          slots[i]=updated;
        }
      }
      if (!changed.length) return Response.json({ success:true, noChange:true, session, round });
      const matches = await base44.asServiceRole.entities.KotcMatch.filter({ round_id:round.id, session_id:session.id });
      for (const match of matches) {
        const rank=Number(match.ladder_court_rank); const courtSlots=slots.filter((s:any)=>Number(s.ladder_court_rank)===rank);
        const teamA=courtSlots.filter((s:any)=>s.team_side==='A').sort((a:any,b:any)=>Number(a.slot_number)-Number(b.slot_number)).map((s:any)=>String(s.participant_id));
        const teamB=courtSlots.filter((s:any)=>s.team_side==='B').sort((a:any,b:any)=>Number(a.slot_number)-Number(b.slot_number)).map((s:any)=>String(s.participant_id));
        if(teamA.length!==2||teamB.length!==2)return Response.json({ error:`Court ${rank} is incomplete after adjustment.` }, { status:409 });
        await base44.asServiceRole.entities.KotcMatch.update(match.id,{team_a_participant_ids:teamA,team_b_participant_ids:teamB,revision:Number(match.revision||0)+1,command_id:commandId});
      }
      const updatedRound=await base44.asServiceRole.entities.KotcRound.update(round.id,{proposal_revision:currentProposalRevision+1,engine_output_hash:String(stableHash(JSON.stringify(slots.map((s:any)=>({court:s.ladder_court_rank,team:s.team_side,slot:s.slot_number,participant:s.participant_id})))))});
      session=await base44.asServiceRole.entities.KotcSession.update(session.id,{revision:currentSessionRevision+1,last_command_id:commandId});
      await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:'kotc_round_host_adjustment',entity_type:'KotcRound',entity_id:round.id,scope_type:'KotcSession',scope_id:session.id,before_state:JSON.stringify(before),after_state:JSON.stringify(changed),reason:String(body.reason||'Host adjusted proposed round').trim()});
      result={success:true,session,round:updatedRound,changes:changed};
      await createSnapshot(base44,session,commandId,'command',user.id);
    } else if (commandType === 'set_pair_lock') {
      const p1=String(body.participant1Id||''),p2=String(body.participant2Id||'');
      if(!p1||!p2||p1===p2)return Response.json({error:'Choose two different players for a pair lock.'},{status:400});
      const participants=await base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id});
      const byId=new Map((participants||[]).map((p:any)=>[String(p.id),p]));
      if(!byId.has(p1)||!byId.has(p2))return Response.json({error:'Pair-lock players are not in this session.'},{status:400});
      const existing=await base44.asServiceRole.entities.KotcFixedPair.filter({session_id:session.id,status:'active'});
      const hostLocks=(existing||[]).filter((p:any)=>p.pair_source==='host_selected');
      for(const lock of hostLocks){
        const overlaps=[String(lock.participant1_id),String(lock.participant2_id)].some(id=>id===p1||id===p2);
        if(overlaps)await base44.asServiceRole.entities.KotcFixedPair.update(lock.id,{status:'withdrawn'});
      }
      let pair=null;
      if(body.locked!==false){pair=await base44.asServiceRole.entities.KotcFixedPair.create({tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,pair_name:`${byId.get(p1)?.display_name||'Player'} / ${byId.get(p2)?.display_name||'Player'}`,participant1_id:p1,participant2_id:p2,pair_source:'host_selected',status:'active'});}
      session=await base44.asServiceRole.entities.KotcSession.update(session.id,{revision:currentSessionRevision+1,last_command_id:commandId});
      result={success:true,session,pair,locked:body.locked!==false};
    } else if (commandType === 'takeover_host') {
      if (!String(body.reason || '').trim()) return Response.json({ error:'Host takeover reason is required.' }, { status:400 });
      const leases = await base44.asServiceRole.entities.KotcHostLease.filter({ session_id:session.id, status:'active' });
      const activeLease = (leases || []).sort((a:any,b:any) => Number(b.lease_revision || 0) - Number(a.lease_revision || 0))[0] || null;
      const currentLeaseRevision = Number(activeLease?.lease_revision || 0);
      if (Number(body.expectedLeaseRevision) !== currentLeaseRevision) return Response.json({ conflict:true, error:'Host lease changed since you opened it.', currentLeaseRevision }, { status:409 });
      if (activeLease?.holder_user_id === user.id) {
        result = { success:true, alreadyHolder:true, lease:activeLease };
      } else {
        if (activeLease) await base44.asServiceRole.entities.KotcHostLease.update(activeLease.id, { status:'superseded', released_at:now, superseded_by_user_id:user.id, takeover_reason:String(body.reason).trim() });
        const lease = await base44.asServiceRole.entities.KotcHostLease.create({ tenant_id:session.tenant_id, club_id:session.club_id, session_id:session.id, holder_user_id:user.id, lease_revision:currentLeaseRevision + 1, status:'active', acquired_at:now, last_heartbeat_at:now, takeover_reason:String(body.reason).trim() });
        session = await base44.asServiceRole.entities.KotcSession.update(session.id, { revision:currentSessionRevision + 1, last_command_id:commandId });
        await base44.asServiceRole.entities.AuditLog.create({ tenant_id:session.tenant_id, club_id:session.club_id, user_id:user.id, action:'kotc_host_takeover', entity_type:'KotcSession', entity_id:session.id, scope_type:'KotcSession', scope_id:session.id, before_state:JSON.stringify(activeLease ? { holder_user_id:activeLease.holder_user_id, lease_revision:activeLease.lease_revision } : {}), after_state:JSON.stringify({ holder_user_id:user.id, lease_revision:currentLeaseRevision + 1 }), reason:String(body.reason).trim() });
        result = { success:true, lease, session };
        await createSnapshot(base44, session, commandId, 'command', user.id);
      }
    } else if (commandType === 'update_timer_settings') {
      const playMinutes = Number(body.playMinutes);
      const changeoverMinutes = Number(body.changeoverMinutes);
      if (!Number.isFinite(playMinutes) || playMinutes < 1 || playMinutes > 60) return Response.json({ error:'Play minutes must be between 1 and 60.' }, { status:400 });
      if (!Number.isFinite(changeoverMinutes) || changeoverMinutes < 0 || changeoverMinutes > 30) return Response.json({ error:'Changeover minutes must be between 0 and 30.' }, { status:400 });
      session = await base44.asServiceRole.entities.KotcSession.update(session.id, { play_minutes:playMinutes, changeover_minutes:changeoverMinutes, revision:currentSessionRevision + 1, last_command_id:commandId });
      result = { success:true, session };
      await base44.asServiceRole.entities.AuditLog.create({ tenant_id:session.tenant_id, club_id:session.club_id, user_id:user.id, action:'kotc_timer_settings_updated', entity_type:'KotcSession', entity_id:session.id, scope_type:'KotcSession', scope_id:session.id, after_state:JSON.stringify({ play_minutes:playMinutes, changeover_minutes:changeoverMinutes }) });
      await createSnapshot(base44, session, commandId, 'command', user.id);
    } else if (commandType === 'pause_session' || commandType === 'resume_session' || commandType === 'finish_session_now' || commandType === 'abandon_session' || commandType === 'finish_after_round') {
      const allowedTransitions:any = {
        pause_session:{ from:['in_progress'], to:'paused' },
        resume_session:{ from:['paused'], to:'in_progress' },
        finish_session_now:{ from:['in_progress','paused'], to:'completed' },
        abandon_session:{ from:['in_progress','paused'], to:'abandoned' },
      };
      if (commandType === 'finish_after_round') {
        session = await base44.asServiceRole.entities.KotcSession.update(session.id, { finish_after_current_round:true, revision:currentSessionRevision + 1, last_command_id:commandId });
      } else {
        if (commandType === 'finish_session_now') {
          const matches = await base44.asServiceRole.entities.KotcMatch.filter({ session_id:session.id });
          const unresolved = (matches || []).filter((m:any) => !RESOLVED.has(m.status));
          for(const m of unresolved)await base44.asServiceRole.entities.KotcMatch.update(m.id,{status:'not_played',result_method:'not_played',completed_at:now,revision:Number(m.revision||0)+1,command_id:commandId});
          const rounds=await base44.asServiceRole.entities.KotcRound.filter({session_id:session.id});
          for(const r of (rounds||[]).filter((r:any)=>['proposed','confirmed','started'].includes(r.status))){
            const rm=await base44.asServiceRole.entities.KotcMatch.filter({round_id:r.id,session_id:session.id});
            const played=(rm||[]).some((m:any)=>m.status==='completed');
            await base44.asServiceRole.entities.KotcRound.update(r.id,{status:played?'completed':'abandoned',completed_at:played?now:undefined,abandonment_reason:played?undefined:'Session finished before this round was played'});
          }
        }
        const transition = allowedTransitions[commandType];
        if (!transition.from.includes(session.status)) return Response.json({ error:`Invalid session transition for ${commandType}` }, { status:409 });
        const update:any = { status:transition.to, revision:currentSessionRevision + 1, last_command_id:commandId };
        if (['completed','abandoned'].includes(transition.to)) update.actual_session_end = now;
        if (transition.to === 'abandoned') update.abandonment_reason = String(body.reason || '').trim();
        session = await base44.asServiceRole.entities.KotcSession.update(session.id, update);
        if(commandType==='finish_session_now'){
          if(session.tournament_id)await base44.asServiceRole.entities.Tournament.update(session.tournament_id,{status:'Completed',finalised_at:now});
          await refreshKotcAggregates(base44,session);
        }
      }
      result = { success:true, session };
      await createSnapshot(base44, session, commandId, commandType === 'pause_session' ? 'session_paused' : commandType === 'finish_session_now' ? 'session_completed' : 'command', user.id);
    } else if (commandType === 'confirm_round' || commandType === 'start_round' || commandType === 'start_proposed_round') {
      const rounds = await base44.asServiceRole.entities.KotcRound.filter({ id:body.roundId, session_id:session.id });
      const round = rounds?.[0];
      if (!round) throw new Error('Round not found');
      if (Number(body.expectedProposalRevision) !== Number(round.proposal_revision || 1)) return Response.json({ conflict:true, error:'Round proposal changed since you opened it.', currentProposalRevision:Number(round.proposal_revision || 1) }, { status:409 });
      if(commandType==='start_proposed_round'&&body.slotParticipantIds){
        const slots=(await base44.asServiceRole.entities.KotcRoundSlot.filter({round_id:round.id,session_id:session.id})).sort((a:any,b:any)=>Number(a.ladder_court_rank)-Number(b.ladder_court_rank)||String(a.team_side).localeCompare(String(b.team_side))||Number(a.slot_number)-Number(b.slot_number));
        const participants=await base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id});const eligible=new Set((participants||[]).filter((p:any)=>['registered','confirmed','present','leaving_early'].includes(p.status)).map((p:any)=>String(p.id)));
        const nextIds=slots.map((s:any)=>String(body.slotParticipantIds[s.id]||s.participant_id));
        if(nextIds.length!==Number(round.active_court_count||0)*4||new Set(nextIds).size!==nextIds.length)return Response.json({error:'Round not ready: every active court needs four unique players.'},{status:409});
        if(nextIds.some((id:string)=>!eligible.has(id)))return Response.json({error:'Round not ready: an unavailable player is assigned to court.'},{status:409});
        const locks=(await base44.asServiceRole.entities.KotcFixedPair.filter({session_id:session.id,status:'active'})).filter((p:any)=>p.pair_source==='host_selected');
        const teams:any={};for(let i=0;i<slots.length;i++){const s=slots[i],id=nextIds[i];const key=`${s.ladder_court_rank}-${s.team_side}`;(teams[key]||(teams[key]=[])).push(id);if(id!==String(s.participant_id))await base44.asServiceRole.entities.KotcRoundSlot.update(s.id,{participant_id:id,assignment_type:'manual_override',assignment_revision:Number(s.assignment_revision||1)+1});}
        for(const l of locks){const a=String(l.participant1_id),b=String(l.participant2_id);const both=nextIds.includes(a)&&nextIds.includes(b);if(both&&!Object.values(teams).some((t:any)=>t.includes(a)&&t.includes(b)))return Response.json({error:`Round not ready: locked pair ${l.pair_name||''} is split.`},{status:409});}
        const matches=await base44.asServiceRole.entities.KotcMatch.filter({round_id:round.id,session_id:session.id});for(const m of matches){const rank=Number(m.ladder_court_rank);const court=slots.map((s:any,i:number)=>({...s,participant_id:nextIds[i]})).filter((s:any)=>Number(s.ladder_court_rank)===rank);await base44.asServiceRole.entities.KotcMatch.update(m.id,{team_a_participant_ids:court.filter((s:any)=>s.team_side==='A').sort((a:any,b:any)=>a.slot_number-b.slot_number).map((s:any)=>s.participant_id),team_b_participant_ids:court.filter((s:any)=>s.team_side==='B').sort((a:any,b:any)=>a.slot_number-b.slot_number).map((s:any)=>s.participant_id),revision:Number(m.revision||0)+1,command_id:commandId});}
      }
      const target = commandType === 'confirm_round' ? 'confirmed' : 'started';
      const valid = commandType === 'confirm_round' ? round.status === 'proposed' : commandType === 'start_proposed_round' ? round.status === 'proposed' : round.status === 'confirmed';
      if (!valid) return Response.json({ error:`Round cannot transition ${round.status} -> ${target}` }, { status:409 });
      if (target === 'started') {
        const slots = await base44.asServiceRole.entities.KotcRoundSlot.filter({ round_id:round.id, session_id:session.id });
        const ids=(slots||[]).map((s:any)=>String(s.participant_id));
        const expected=Number(round.active_court_count||0)*4;
        if(ids.length!==expected)return Response.json({error:`Round not ready: expected ${expected} court slots but found ${ids.length}.`},{status:409});
        if(new Set(ids).size!==ids.length)return Response.json({error:'Round not ready: a player appears more than once.'},{status:409});
      }
      const roundUpdate:any = { status:target };
      if (target === 'confirmed') { roundUpdate.confirmed_at = now; roundUpdate.confirmed_by_user_id = user.id; }
      if (target === 'started') { roundUpdate.started_at = now; if(commandType==='start_proposed_round'){roundUpdate.confirmed_at=now;roundUpdate.confirmed_by_user_id=user.id;} }
      const updatedRound = await base44.asServiceRole.entities.KotcRound.update(round.id, roundUpdate);
      const sessionUpdate:any = { revision:currentSessionRevision + 1, last_command_id:commandId, current_round_number:round.round_number, current_round_id:round.id };
      if (target === 'started' && session.status === 'ready') sessionUpdate.status = 'in_progress';
      if (target === 'started' && !session.actual_first_round_start) sessionUpdate.actual_first_round_start = now;
      session = await base44.asServiceRole.entities.KotcSession.update(session.id, sessionUpdate);
      if(target==='started'&&session.tournament_id)await base44.asServiceRole.entities.Tournament.update(session.tournament_id,{status:'In Progress'});
      result = { success:true, session, round:updatedRound };
      await createSnapshot(base44, session, commandId, target === 'confirmed' ? 'round_confirmed' : 'round_started', user.id);
    } else if (commandType === 'undo_start_round') {
      const rounds=await base44.asServiceRole.entities.KotcRound.filter({id:body.roundId,session_id:session.id}); const round=rounds?.[0];
      if(!round)return Response.json({error:'Round not found.'},{status:404});
      if(round.status!=='started')return Response.json({error:'Only the current started round can be returned to setup.'},{status:409});
      if(Number(round.round_number)!==Number(session.current_round_number))return Response.json({error:'Only the current round can be returned to setup.'},{status:409});
      const matches=await base44.asServiceRole.entities.KotcMatch.filter({round_id:round.id,session_id:session.id});
      const touched=(matches||[]).filter((m:any)=>RESOLVED.has(m.status)||m.team_a_score!=null||m.team_b_score!=null||m.autosaved_at);
      if(touched.length)return Response.json({error:'A score has already been entered or saved. Use score correction instead of Undo Start.'},{status:409});
      const updatedRound=await base44.asServiceRole.entities.KotcRound.update(round.id,{status:'proposed',started_at:undefined,confirmed_at:undefined,confirmed_by_user_id:undefined});
      session=await base44.asServiceRole.entities.KotcSession.update(session.id,{revision:currentSessionRevision+1,last_command_id:commandId,status:session.status==='in_progress'&&Number(round.round_number)===1?'ready':session.status});
      await base44.asServiceRole.entities.AuditLog.create({tenant_id:session.tenant_id,club_id:session.club_id,user_id:user.id,action:'kotc_round_start_undone',entity_type:'KotcRound',entity_id:round.id,scope_type:'KotcSession',scope_id:session.id,reason:'Host returned unscored round to setup'});
      result={success:true,session,round:updatedRound}; await createSnapshot(base44,session,commandId,'command',user.id);
    } else {
      return Response.json({ error:`Command ${commandType} is not wired in Gate 2.4 yet.` }, { status:400 });
    }

    try{await base44.asServiceRole.entities.KotcCommandLog.update(commandLog.id,{status:'applied',applied_session_revision:Number(session.revision||currentSessionRevision),result_json:JSON.stringify(result),applied_at:nowIso()});}catch(error){console.warn('KOTC command-log finalisation skipped after successful sporting write',{sessionId:session.id,commandId,error:String((error as any)?.message||error)});}
    return Response.json(result);
  } catch (error) {
    try {
      if (commandLog) {
        const base44 = createClientFromRequest(req);
        await base44.asServiceRole.entities.KotcCommandLog.update(commandLog.id, { status:'failed', error_message:error?.message || 'Unexpected KOTC command error', applied_at:nowIso() });
      }
    } catch (_) {}
    return Response.json({ error:error?.message || 'Unexpected KOTC command error' }, { status:500 });
  }
});
