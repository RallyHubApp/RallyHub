import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { eventId, nextRound } = body;
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id: eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error: 'Club Challenge event not found' }, { status: 404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const tournamentAccess = await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id: event.tournament_id, user_id: user.id, status: 'active' });
      const ccAccess = await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id: event.id, user_id: user.id, active: true });
      allowed = tournamentAccess.some(a => ['event_manager','event_host'].includes(a.role)) || ccAccess.some(a => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error: 'Event manager permission required' }, { status: 403 });

    const round = Number(nextRound);
    if (!Number.isInteger(round) || round < 1) return Response.json({ error: 'Invalid round' }, { status: 400 });
    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id: event.id }, 'round_number', 200);
    const normal = matches.filter((m:any) => !m.is_showcase);
    const maxRound = Math.max(0, ...normal.map((m:any) => Number(m.round_number || 0)));
    if (round > maxRound) return Response.json({ error: 'Round exceeds approved schedule' }, { status: 400 });
    const previousRound = Math.max(1, round - 1);
    const unresolved = normal.filter((m:any) => Number(m.round_number) === previousRound && !['completed','draw','retired','forfeit','abandoned','not_played'].includes(m.status));
    if (round > Number(event.current_round || 0) && unresolved.length) return Response.json({ error: `${unresolved.length} result(s) still unresolved in Round ${previousRound}` }, { status: 409 });

    const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { current_round: round });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'round_advanced', user_id:user.id, occurred_at:new Date().toISOString(), old_value_json:JSON.stringify({current_round:event.current_round}), new_value_json:JSON.stringify({current_round:round}) });
    return Response.json({ success:true, event:updated });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected round update error' }, { status:500 });
  }
});
