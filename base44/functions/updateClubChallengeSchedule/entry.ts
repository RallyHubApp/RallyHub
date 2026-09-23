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
    const { eventId, courts, availableMinutes, changes = [], dropIds = [], proposalKey = '' } = body;
    if (!eventId) return Response.json({ error: 'eventId required' }, { status: 400 });
    const nextCourts = Number(courts), nextMinutes = Number(availableMinutes);
    if (!Number.isInteger(nextCourts) || nextCourts < 1 || !Number.isFinite(nextMinutes) || nextMinutes < 1) {
      return Response.json({ error: 'Valid courts and available minutes are required.' }, { status: 400 });
    }

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id: eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error: 'Interclub Challenge event not found' }, { status: 404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const tournamentAccess = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id: event.tournament_id, user_id: user.id, status: 'active' })).filter((a:any) => validTournamentEventGrant(a, event.tenant_id));
      const ccAccess = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id: event.id, user_id: user.id, active: true })).filter((a:any) => validClubChallengeGrant(a, event.tenant_id));
      allowed = tournamentAccess.some((a:any) => ['event_manager','event_host'].includes(a.role)) || ccAccess.some((a:any) => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error: 'Event manager permission required' }, { status: 403 });

    const cleanProposalKey = String(proposalKey || '').trim().slice(0, 4000);
    if (cleanProposalKey && String(event.last_schedule_adjustment_key || '') === cleanProposalKey) {
      return Response.json({ success:true, event, changed:0, dropped:0, alreadyApplied:true });
    }
    const existingLockUntil = Date.parse(String(event.schedule_adjustment_lock_until || ''));
    if (event.schedule_adjustment_lock_token && Number.isFinite(existingLockUntil) && existingLockUntil > Date.now()) {
      return Response.json({ error:'Another court/time adjustment is already being applied. Refresh before trying again.' }, { status:409 });
    }

    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id: event.id }, 'round_number', 300);
    const normal = matches.filter((m:any) => !m.is_showcase);
    const byId = new Map(normal.map((m:any) => [m.id, m]));
    const currentRound = Math.max(1, Number(event.current_round || 1));
    const storedPlannedRounds = Number(event.planned_rounds || 0);
    const plannedRounds = storedPlannedRounds > 0 ? storedPlannedRounds : Math.max(currentRound, ...normal.map((m:any) => Number(m.round_number || 0)));
    const changeList = Array.isArray(changes) ? changes : [];
    const changeIds = new Set<string>();
    const dropSet = new Set((dropIds || []).map(String));

    // A repeated request after a successful apply must be harmless. The live host UI
    // also locks duplicate taps, but this server-side check protects retries/replays.
    const sameEventSettings = Number(event.courts) === nextCourts && Number(event.available_minutes) === nextMinutes && event.event_pack_stale === true;
    const changesAlreadyApplied = changeList.every((c:any) => {
      const m:any = byId.get(String(c?.id || ''));
      return !!m && Number(m.round_number) === Number(c?.newRound) && Number(m.court_number) === Number(c?.newCourt);
    });
    const dropsAlreadyApplied = [...dropSet].every(id => (byId.get(id) as any)?.status === 'not_played');
    if (sameEventSettings && changesAlreadyApplied && dropsAlreadyApplied) {
      return Response.json({ success:true, event, changed:0, dropped:0, alreadyApplied:true });
    }

    for (const c of changeList) {
      const id = String(c?.id || '');
      const m:any = byId.get(id);
      if (!m) return Response.json({ error: 'Proposal contains a match outside this event.' }, { status: 400 });
      if (TERMINAL.has(m.status) || Number(m.round_number) < currentRound) return Response.json({ error: 'Completed or historical fixtures cannot be changed.' }, { status: 409 });
      const newRound = Number(c.newRound), newCourt = Number(c.newCourt);
      if (!Number.isInteger(newRound) || newRound < currentRound || newRound > plannedRounds || !Number.isInteger(newCourt) || newCourt < 1 || newCourt > nextCourts) {
        return Response.json({ error: `Proposal contains an invalid future round/court position. The approved event ends at Round ${plannedRounds}.` }, { status: 400 });
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
    const beyondPlan = proposed.filter((m:any) => Number(m.round_number) > plannedRounds && !TERMINAL.has(m.status));
    if (beyondPlan.length) return Response.json({ error:`${beyondPlan.length} future fixture(s) would remain beyond approved Round ${plannedRounds}. Drop or reschedule them within the approved event.` }, { status:409 });

    const slotKeys = new Set<string>();
    const playersByRound = new Map<number, Set<string>>();
    for (const m:any of proposed.filter((x:any) => Number(x.round_number) >= currentRound && Number(x.round_number) <= plannedRounds && !TERMINAL.has(x.status))) {
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

    // Claim a short-lived server-side schedule lock only after the proposal has
    // passed validation. Overlapping requests race for this token; after a short
    // settle window only the request whose token remains authoritative may write.
    const lockToken = crypto.randomUUID();
    const lockUntil = new Date(Date.now() + 5000).toISOString();
    await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, {
      schedule_adjustment_lock_token: lockToken,
      schedule_adjustment_lock_until: lockUntil,
    });
    await new Promise(resolve => setTimeout(resolve, 75));
    const lockedRows = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:event.id });
    const lockedEvent = lockedRows?.[0];
    if (!lockedEvent || String(lockedEvent.schedule_adjustment_lock_token || '') !== lockToken) {
      return Response.json({ error:'Another court/time adjustment won the update race. Refresh to see the authoritative schedule.' }, { status:409 });
    }
    const releaseLock = async () => {
      await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, {
        schedule_adjustment_lock_token:'',
        schedule_adjustment_lock_until:'1970-01-01T00:00:00.000Z',
      });
    };
    if (Number(lockedEvent.current_round || 1) !== currentRound) {
      await releaseLock();
      return Response.json({ error:'The live round changed while this schedule proposal was being applied. Refresh and review again.' }, { status:409 });
    }
    if (cleanProposalKey && String(lockedEvent.last_schedule_adjustment_key || '') === cleanProposalKey) {
      await releaseLock();
      return Response.json({ success:true, event:lockedEvent, changed:0, dropped:0, alreadyApplied:true });
    }

    // Re-read fixtures after obtaining the lock. A score may have been saved while
    // the organiser was reviewing the proposal; completed history must never move.
    const freshMatches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 300);
    const freshById = new Map(freshMatches.filter((m:any) => !m.is_showcase).map((m:any) => [String(m.id),m]));
    for (const c of changeList) {
      const m:any = freshById.get(String(c.id));
      if (!m || TERMINAL.has(m.status) || Number(m.round_number) < currentRound) {
        await releaseLock();
        return Response.json({ error:'A fixture changed while this proposal was being confirmed. Refresh and review the schedule again.' }, { status:409 });
      }
    }
    for (const id of dropSet) {
      const m:any = freshById.get(String(id));
      if (!m || TERMINAL.has(m.status) || Number(m.round_number) < currentRound) {
        await releaseLock();
        return Response.json({ error:'A fixture changed while this proposal was being confirmed. Refresh and review the schedule again.' }, { status:409 });
      }
    }

    for (const c of changeList) {
      const m:any = freshById.get(String(c.id));
      await base44.asServiceRole.entities.ClubChallengeMatch.update(m.id, {
        round_number: Number(c.newRound), court_number: Number(c.newCourt), revision: Number(m.revision || 0) + 1,
      });
    }
    for (const id of dropSet) {
      const m:any = freshById.get(String(id));
      await base44.asServiceRole.entities.ClubChallengeMatch.update(m.id, {
        status:'not_played', winner:'none', revision:Number(m.revision || 0) + 1,
      });
    }

    const eventUpdate:any = {
      courts:nextCourts,
      available_minutes:nextMinutes,
      event_pack_stale:true,
      schedule_adjustment_lock_token:'',
      schedule_adjustment_lock_until:'1970-01-01T00:00:00.000Z',
    };
    if (cleanProposalKey) eventUpdate.last_schedule_adjustment_key = cleanProposalKey;
    const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, eventUpdate);
    const now = new Date().toISOString();
    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:event.tenant_id, challenge_event_id:event.id, action:'event_day_schedule_adjusted', user_id:user.id, occurred_at:now,
      old_value_json:JSON.stringify({ courts:event.courts, available_minutes:event.available_minutes, planned_rounds:plannedRounds }),
      new_value_json:JSON.stringify({ courts:nextCourts, available_minutes:nextMinutes, planned_rounds:plannedRounds, changes:changeList, dropIds:[...dropSet], proposalKey:cleanProposalKey || undefined }),
      note:'Organiser confirmed court/time disruption proposal; completed fixtures and approved round limit preserved.',
    });
    return Response.json({ success:true, event:updated, changed:changeList.length, dropped:dropSet.size, alreadyApplied:false });
  } catch (error) {
    return Response.json({ error: error?.message || 'Unexpected schedule adjustment error' }, { status: 500 });
  }
});
