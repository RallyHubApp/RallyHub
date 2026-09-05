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

const TERMINAL = new Set(['completed','draw','retired','forfeit','abandoned','not_played']);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { eventId, courts, availableMinutes, changes = [], dropIds = [] } = body;
    if (!eventId) return Response.json({ error: 'eventId required' }, { status: 400 });
    const nextCourts = Number(courts), nextMinutes = Number(availableMinutes);
    if (!Number.isInteger(nextCourts) || nextCourts < 1 || !Number.isFinite(nextMinutes) || nextMinutes < 1) {
      return Response.json({ error: 'Valid courts and available minutes are required.' }, { status: 400 });
    }

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id: eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error: 'Club Challenge event not found' }, { status: 404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const tournamentAccess = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id: event.tournament_id, user_id: user.id, status: 'active' })).filter((a:any) => validTournamentEventGrant(a, event.tenant_id));
      const ccAccess = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id: event.id, user_id: user.id, active: true })).filter((a:any) => validClubChallengeGrant(a, event.tenant_id));
      allowed = tournamentAccess.some((a:any) => ['event_manager','event_host'].includes(a.role)) || ccAccess.some((a:any) => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error: 'Event manager permission required' }, { status: 403 });

    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id: event.id }, 'round_number', 300);
    const normal = matches.filter((m:any) => !m.is_showcase);
    const byId = new Map(normal.map((m:any) => [m.id, m]));
    const currentRound = Math.max(1, Number(event.current_round || 1));
    const changeIds = new Set<string>();
    const dropSet = new Set((dropIds || []).map(String));

    for (const c of changes || []) {
      const id = String(c?.id || '');
      const m:any = byId.get(id);
      if (!m) return Response.json({ error: 'Proposal contains a match outside this event.' }, { status: 400 });
      if (TERMINAL.has(m.status) || Number(m.round_number) < currentRound) return Response.json({ error: 'Completed or historical fixtures cannot be changed.' }, { status: 409 });
      const newRound = Number(c.newRound), newCourt = Number(c.newCourt);
      if (!Number.isInteger(newRound) || newRound < currentRound || !Number.isInteger(newCourt) || newCourt < 1 || newCourt > nextCourts) {
        return Response.json({ error: 'Proposal contains an invalid future round/court position.' }, { status: 400 });
      }
      changeIds.add(id);
    }
    for (const id of dropSet) {
      const m:any = byId.get(id);
      if (!m) return Response.json({ error: 'Proposal contains a match outside this event.' }, { status: 400 });
      if (TERMINAL.has(m.status) || Number(m.round_number) < currentRound) return Response.json({ error: 'Completed or historical fixtures cannot be dropped.' }, { status: 409 });
    }
    if ([...changeIds].some(id => dropSet.has(id))) return Response.json({ error: 'A match cannot be both moved and dropped.' }, { status: 400 });

    const proposed = normal
      .filter((m:any) => !dropSet.has(m.id))
      .map((m:any) => {
        const c = (changes || []).find((x:any) => String(x.id) === String(m.id));
        return c ? { ...m, round_number: Number(c.newRound), court_number: Number(c.newCourt) } : m;
      });
    const slotKeys = new Set<string>();
    const playersByRound = new Map<number, Set<string>>();
    for (const m:any of proposed.filter((x:any) => Number(x.round_number) >= currentRound && !TERMINAL.has(x.status))) {
      const slot = `${m.round_number}:${m.court_number}`;
      if (slotKeys.has(slot)) return Response.json({ error: 'Proposal puts two matches in the same round/court slot.' }, { status: 409 });
      slotKeys.add(slot);
      const seen = playersByRound.get(Number(m.round_number)) || new Set<string>();
      for (const pid of [...(m.club_a_participant_ids || []), ...(m.club_b_participant_ids || [])]) {
        if (seen.has(String(pid))) return Response.json({ error: `Proposal schedules a player twice in Round ${m.round_number}.` }, { status: 409 });
        seen.add(String(pid));
      }
      playersByRound.set(Number(m.round_number), seen);
    }

    for (const c of changes || []) {
      const m:any = byId.get(String(c.id));
      await base44.asServiceRole.entities.ClubChallengeMatch.update(m.id, {
        round_number: Number(c.newRound), court_number: Number(c.newCourt), revision: Number(m.revision || 0) + 1,
      });
    }
    for (const id of dropSet) {
      const m:any = byId.get(id);
      await base44.asServiceRole.entities.ClubChallengeMatch.update(m.id, {
        status: 'not_played', winner: 'none', revision: Number(m.revision || 0) + 1,
      });
    }

    const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, {
      courts: nextCourts, available_minutes: nextMinutes, event_pack_stale: true,
    });
    const now = new Date().toISOString();
    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id: event.tenant_id, challenge_event_id: event.id, action: 'event_day_schedule_adjusted', user_id: user.id, occurred_at: now,
      old_value_json: JSON.stringify({ courts: event.courts, available_minutes: event.available_minutes }),
      new_value_json: JSON.stringify({ courts: nextCourts, available_minutes: nextMinutes, changes, dropIds: [...dropSet] }),
      note: 'Organiser confirmed court/time disruption proposal; completed fixtures preserved.',
    });
    return Response.json({ success: true, event: updated, changed: (changes || []).length, dropped: dropSet.size });
  } catch (error) {
    return Response.json({ error: error?.message || 'Unexpected schedule adjustment error' }, { status: 500 });
  }
});
