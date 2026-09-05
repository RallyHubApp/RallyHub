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
    const { eventId, action, phase, expectedRevision } = body;
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id: eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error: 'Club Challenge event not found' }, { status: 404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const tournamentAccess = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id: event.tournament_id, user_id: user.id, status: 'active' })).filter((a:any) => validTournamentEventGrant(a, event.tenant_id));
      const ccAccess = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id: event.id, user_id: user.id, active: true })).filter((a:any) => validClubChallengeGrant(a, event.tenant_id));
      allowed = tournamentAccess.some(a => ['event_manager', 'event_host'].includes(a.role)) || ccAccess.some(a => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error: 'Event manager permission required' }, { status: 403 });

    const revision = Number(event.timer_revision || 0);
    if (expectedRevision !== undefined && Number(expectedRevision) !== revision) {
      return Response.json({ conflict: true, error: 'Timer changed on another device.', timer_revision: revision, timer_state_json: event.timer_state_json || '' }, { status: 409 });
    }
    let current: any = {};
    try { current = event.timer_state_json ? JSON.parse(event.timer_state_json) : {}; } catch { current = {}; }
    const now = new Date();
    const elapsed = current.running && current.started_at ? Math.max(0, Math.floor((now.getTime() - new Date(current.started_at).getTime()) / 1000)) : 0;
    const remainingNow = Math.max(0, Number(current.remaining_seconds || 0) - elapsed);
    let next: any = current;

    if (action === 'start') {
      const seconds = phase === 'play' ? Number(event.play_minutes || 10) * 60 : phase === 'changeover' ? Number(event.changeover_minutes || 2) * 60 : phase === 'break' ? Number(event.break_minutes || 20) * 60 : 0;
      if (!seconds) return Response.json({ error: 'Invalid timer phase' }, { status: 400 });
      next = { phase, running: true, remaining_seconds: seconds, started_at: now.toISOString(), round: Number(event.current_round || 1) };
    } else if (action === 'pause') {
      next = { ...current, running: false, remaining_seconds: remainingNow, started_at: null };
    } else if (action === 'resume') {
      if (remainingNow <= 0) return Response.json({ error: 'Timer has finished.' }, { status: 400 });
      next = { ...current, running: true, remaining_seconds: remainingNow, started_at: now.toISOString() };
    } else if (action === 'add_minute') {
      next = { ...current, running: !!current.running, remaining_seconds: remainingNow + 60, started_at: current.running ? now.toISOString() : null, phase: current.phase || 'play', round: Number(event.current_round || 1) };
    } else if (action === 'reset') {
      next = { phase: 'idle', running: false, remaining_seconds: 0, started_at: null, round: Number(event.current_round || 1) };
    } else {
      return Response.json({ error: 'Unknown timer action' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, {
      timer_state_json: JSON.stringify(next), timer_revision: revision + 1,
      ...(action === 'pause' ? { status: 'paused' } : action === 'resume' && event.status === 'paused' ? { status: 'in_progress' } : {}),
    });
    return Response.json({ success: true, timer_revision: revision + 1, timer_state: next, event: updated, server_now: now.toISOString() });
  } catch (error) {
    return Response.json({ error: error?.message || 'Unexpected timer error' }, { status: 500 });
  }
});