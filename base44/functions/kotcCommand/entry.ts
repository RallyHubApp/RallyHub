import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

const STRUCTURAL = new Set(['confirm_round','start_round','generate_next_round','pause_session','resume_session','finish_after_round','finish_session_now','abandon_session','takeover_host']);
const RESOLVED = new Set(['completed','retired','abandoned','not_played']);

function nowIso() { return new Date().toISOString(); }
function int0(v:any) { const n = Number(v); return Number.isInteger(n) && n >= 0 ? n : null; }
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

async function createSnapshot(base44:any, session:any, commandId:string, checkpointType:string, userId:string) {
  const [participants, rounds, slots, matches, events, courts, prior] = await Promise.all([
    base44.asServiceRole.entities.KotcSessionParticipant.filter({ session_id:session.id }),
    base44.asServiceRole.entities.KotcRound.filter({ session_id:session.id }),
    base44.asServiceRole.entities.KotcRoundSlot.filter({ session_id:session.id }),
    base44.asServiceRole.entities.KotcMatch.filter({ session_id:session.id }),
    base44.asServiceRole.entities.KotcParticipationEvent.filter({ session_id:session.id }),
    base44.asServiceRole.entities.KotcSessionCourt.filter({ session_id:session.id }),
    base44.asServiceRole.entities.KotcRecoveryCheckpoint.filter({ session_id:session.id }),
  ]);
  const sequence = Math.max(0, ...(prior || []).map((x:any) => Number(x.sequence || 0))) + 1;
  const snapshot = { schemaVersion:1, session, participants, rounds, slots, matches, participationEvents:events, sessionCourts:courts };
  return await base44.asServiceRole.entities.KotcRecoveryCheckpoint.create({
    tenant_id:session.tenant_id, club_id:session.club_id, session_id:session.id,
    sequence, session_revision:Number(session.revision || 0), current_round_number:Number(session.current_round_number || 0),
    checkpoint_type:checkpointType, snapshot_json:JSON.stringify(snapshot), command_id:commandId,
    created_by_user_id:userId, created_at:nowIso(),
  });
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
    if (!allowed) {
      const grants = await base44.asServiceRole.entities.KotcSessionAccess.filter({ session_id:session.id, user_id:user.id, status:'active' });
      allowed = (grants || []).some((a:any) => allowedAccess(a, session.tenant_id, session.id));
    }
    if (!allowed) return Response.json({ error:'KOTC session host permission required' }, { status:403 });
    if (session.status === 'finalised') return Response.json({ error:'Finalised KOTC sessions are read-only.' }, { status:409 });

    const duplicates = await base44.asServiceRole.entities.KotcCommandLog.filter({ session_id:session.id, command_id:commandId });
    if (duplicates?.length) {
      const existing = duplicates[0];
      return Response.json({ duplicate:true, commandId, status:existing.status, result:existing.result_json ? JSON.parse(existing.result_json) : null });
    }

    const currentSessionRevision = Number(session.revision || 0);
    if (STRUCTURAL.has(commandType) && Number(body.expectedSessionRevision) !== currentSessionRevision) {
      return Response.json({ conflict:true, error:'Session changed since you opened it.', currentSessionRevision, expectedSessionRevision:Number(body.expectedSessionRevision) }, { status:409 });
    }

    commandLog = await base44.asServiceRole.entities.KotcCommandLog.create({
      tenant_id:session.tenant_id, club_id:session.club_id, session_id:session.id,
      command_id:commandId, command_type:commandType, expected_session_revision:Number(body.expectedSessionRevision ?? currentSessionRevision),
      status:'received', payload_json:JSON.stringify(body), issued_by_user_id:user.id, issued_at:nowIso(),
    });

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
      const update:any = { team_a_score:score.a, team_b_score:score.b, winner_side:score.winner, result_method:score.method, serving_side_at_horn:score.method === 'timed_serving_tiebreak' ? body.servingSideAtHorn : undefined, status:'completed', completed_at:match.completed_at || now, revision:current + 1, command_id:commandId, scored_by_user_id:match.scored_by_user_id || user.id };
      if (isCorrection) Object.assign(update, { correction_count:Number(match.correction_count || 0) + 1, last_corrected_at:now, last_corrected_by_user_id:user.id, last_correction_reason:String(body.reason).trim(), original_result_json:original });
      const updated = await base44.asServiceRole.entities.KotcMatch.update(match.id, update);
      if (isCorrection) {
        await base44.asServiceRole.entities.AuditLog.create({ tenant_id:session.tenant_id, club_id:session.club_id, user_id:user.id, action:'kotc_score_corrected', entity_type:'KotcMatch', entity_id:match.id, scope_type:'KotcSession', scope_id:session.id, before_state:JSON.stringify({ team_a_score:match.team_a_score, team_b_score:match.team_b_score, winner_side:match.winner_side, revision:current }), after_state:JSON.stringify({ team_a_score:score.a, team_b_score:score.b, winner_side:score.winner, revision:current + 1 }), reason:String(body.reason).trim() });
      }
      result = { success:true, match:updated, correction:isCorrection };
      await createSnapshot(base44, session, commandId, 'score_saved', user.id);
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
          if (unresolved.length) return Response.json({ error:`${unresolved.length} match result(s) unresolved. Resolve them before finishing the session.` }, { status:409 });
        }
        const transition = allowedTransitions[commandType];
        if (!transition.from.includes(session.status)) return Response.json({ error:`Invalid session transition for ${commandType}` }, { status:409 });
        const update:any = { status:transition.to, revision:currentSessionRevision + 1, last_command_id:commandId };
        if (['completed','abandoned'].includes(transition.to)) update.actual_session_end = now;
        if (transition.to === 'abandoned') update.abandonment_reason = String(body.reason || '').trim();
        session = await base44.asServiceRole.entities.KotcSession.update(session.id, update);
      }
      result = { success:true, session };
      await createSnapshot(base44, session, commandId, commandType === 'pause_session' ? 'session_paused' : commandType === 'finish_session_now' ? 'session_completed' : 'command', user.id);
    } else if (commandType === 'confirm_round' || commandType === 'start_round') {
      const rounds = await base44.asServiceRole.entities.KotcRound.filter({ id:body.roundId, session_id:session.id });
      const round = rounds?.[0];
      if (!round) throw new Error('Round not found');
      if (Number(body.expectedProposalRevision) !== Number(round.proposal_revision || 1)) return Response.json({ conflict:true, error:'Round proposal changed since you opened it.', currentProposalRevision:Number(round.proposal_revision || 1) }, { status:409 });
      const target = commandType === 'confirm_round' ? 'confirmed' : 'started';
      const valid = commandType === 'confirm_round' ? round.status === 'proposed' : round.status === 'confirmed';
      if (!valid) return Response.json({ error:`Round cannot transition ${round.status} -> ${target}` }, { status:409 });
      const roundUpdate:any = { status:target };
      if (target === 'confirmed') { roundUpdate.confirmed_at = now; roundUpdate.confirmed_by_user_id = user.id; }
      if (target === 'started') roundUpdate.started_at = now;
      const updatedRound = await base44.asServiceRole.entities.KotcRound.update(round.id, roundUpdate);
      const sessionUpdate:any = { revision:currentSessionRevision + 1, last_command_id:commandId, current_round_number:round.round_number, current_round_id:round.id };
      if (target === 'started' && !session.actual_first_round_start) sessionUpdate.actual_first_round_start = now;
      session = await base44.asServiceRole.entities.KotcSession.update(session.id, sessionUpdate);
      result = { success:true, session, round:updatedRound };
      await createSnapshot(base44, session, commandId, target === 'confirmed' ? 'round_confirmed' : 'round_started', user.id);
    } else {
      return Response.json({ error:`Command ${commandType} is not wired in Gate 2.4 yet.` }, { status:400 });
    }

    await base44.asServiceRole.entities.KotcCommandLog.update(commandLog.id, { status:'applied', applied_session_revision:Number(session.revision || currentSessionRevision), result_json:JSON.stringify(result), applied_at:nowIso() });
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
