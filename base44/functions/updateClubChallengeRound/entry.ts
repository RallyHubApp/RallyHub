import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

function validTournamentEventGrant(a:any, tenantId:string) {
  if (!a || a.status !== 'active' || String(a.tenant_id || '') !== String(tenantId || '')) return false;
  const now = Date.now();
  if (a.starts_at && Date.parse(a.starts_at) > now) return false;
  if (a.ends_at && Date.parse(a.ends_at) < now) return false;
  return true;
}

function validClubChallengeGrant(a:any, tenantId:string) {
  return !!a && a.active === true && String(a.tenant_id || '') === String(tenantId || '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { eventId, nextRound, skipBreak = false } = body;
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id: eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error: 'Interclub Challenge event not found' }, { status: 404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const tournamentAccess = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id: event.tournament_id, user_id: user.id, status: 'active' })).filter((a:any) => validTournamentEventGrant(a, event.tenant_id));
      const ccAccess = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id: event.id, user_id: user.id, active: true })).filter((a:any) => validClubChallengeGrant(a, event.tenant_id));
      allowed = tournamentAccess.some(a => ['event_manager','event_host'].includes(a.role)) || ccAccess.some(a => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error: 'Event manager permission required' }, { status: 403 });

    const round = Number(nextRound);
    if (!Number.isInteger(round) || round < 1) return Response.json({ error: 'Invalid round' }, { status: 400 });
    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id: event.id }, 'round_number', 200);
    const normal = matches.filter((m:any) => !m.is_showcase);
    const storedPlannedRounds = Number(event.planned_rounds || 0);
    const maxRound = storedPlannedRounds > 0 ? storedPlannedRounds : Math.max(0, ...normal.map((m:any) => Number(m.round_number || 0)));
    if (round > maxRound) return Response.json({ error: 'Round exceeds approved schedule' }, { status: 400 });
    const previousRound = Math.max(1, round - 1);
    const unresolved = normal.filter((m:any) => Number(m.round_number) === previousRound && !['completed','draw','retired','forfeit','abandoned','not_played'].includes(m.status));
    const currentRound = Number(event.current_round || 0);
    const advancing = round > currentRound;
    if (advancing && unresolved.length) return Response.json({ error: `${unresolved.length} result(s) still unresolved in Round ${previousRound}` }, { status: 409 });

    let timer:any = {};
    try { timer = event.timer_state_json ? JSON.parse(event.timer_state_json) : {}; } catch { timer = {}; }
    const scheduledBreakTransition = advancing
      && event.include_break === true
      && currentRound === Number(event.break_after_round || 0)
      && round === currentRound + 1;
    if (scheduledBreakTransition && !skipBreak) {
      const nowMs = Date.now();
      const elapsed = timer.running && timer.started_at ? Math.max(0, Math.floor((nowMs - Date.parse(timer.started_at)) / 1000)) : 0;
      const breakRemaining = Math.max(0, Number(timer.remaining_seconds || 0) - elapsed);
      if (String(timer.phase || '') !== 'break') {
        return Response.json({ breakRequired:true, error:`Scheduled ${Number(event.break_minutes || 20)}-minute break must start before Round ${round}.` }, { status:409 });
      }
      if (breakRemaining > 0) {
        return Response.json({ breakInProgress:true, remaining_seconds:breakRemaining, error:`Break still in progress (${Math.ceil(breakRemaining / 60)} min remaining).` }, { status:409 });
      }
    }

    const nextTimer = { phase:'ready', running:false, remaining_seconds:Number(event.play_minutes || 10) * 60, started_at:null, round };
    const nextTimerRevision = Number(event.timer_revision || 0) + 1;
    const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, {
      current_round: round,
      status: 'in_progress',
      timer_state_json: JSON.stringify(nextTimer),
      timer_revision: nextTimerRevision,
    });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:event.tenant_id,
      challenge_event_id:event.id,
      action:'round_advanced',
      user_id:user.id,
      occurred_at:new Date().toISOString(),
      old_value_json:JSON.stringify({current_round:event.current_round,status:event.status,timer_state_json:event.timer_state_json || ''}),
      new_value_json:JSON.stringify({current_round:round,status:'in_progress',timer_state:nextTimer,timer_revision:nextTimerRevision,break_skipped:!!skipBreak}),
    });
    return Response.json({ success:true, event:updated, timer_state:nextTimer, timer_revision:nextTimerRevision, break_skipped:!!skipBreak });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected round update error' }, { status:500 });
  }
});
