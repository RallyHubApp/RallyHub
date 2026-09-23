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
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });

    const body = await req.json().catch(() => ({}));
    const { eventId, action } = body;
    if (!['open','close','reveal','extend','reset'].includes(action)) return Response.json({ error:'Invalid POT action.' }, { status:400 });

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Interclub Challenge event not found' }, { status:404 });
    if (!event.pot_enabled) return Response.json({ error:'Player of Tournament voting is not enabled.' }, { status:409 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, user_id:user.id, status:'active' })).filter((a:any) => validTournamentEventGrant(a, event.tenant_id));
      const ca = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, user_id:user.id, active:true })).filter((a:any) => validClubChallengeGrant(a, event.tenant_id));
      allowed = ta.some((a:any) => ['event_manager','event_host'].includes(a.role)) || ca.some((a:any) => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required' }, { status:403 });

    const now = new Date();
    const nowIso = now.toISOString();
    let update:any = {};
    let winnerCount = 0;
    let winnerSides:any = null;

    if (action === 'open') {
      if (event.pot_status !== 'closed') return Response.json({ error:'Voting can only be opened from Closed.' }, { status:409 });
      const rawDuration = body.durationMinutes;
      const manual = rawDuration === null || rawDuration === undefined || rawDuration === '' || rawDuration === 'manual';
      const durationMinutes = manual ? null : Math.max(1, Math.min(60, Number(rawDuration)));
      if (!manual && !Number.isFinite(durationMinutes)) return Response.json({ error:'Voting duration is invalid.' }, { status:400 });
      update = {
        pot_status:'open',
        pot_winner_participant_ids:[],
        pot_revealed_at:null,
        pot_vote_opened_at:nowIso,
        pot_vote_duration_minutes:durationMinutes,
        pot_vote_closes_at:durationMinutes ? new Date(now.getTime() + durationMinutes * 60000).toISOString() : null
      };
    } else if (action === 'close') {
      if (event.pot_status !== 'open') return Response.json({ error:'Voting is not currently open.' }, { status:409 });
      update = { pot_status:'closed', pot_vote_closes_at:nowIso };
    } else if (action === 'extend') {
      if (event.pot_status !== 'open') return Response.json({ error:'Voting is not currently open.' }, { status:409 });
      if (!event.pot_vote_closes_at) return Response.json({ error:'Manual voting has no countdown to extend.' }, { status:409 });
      const extraMinutes = Math.max(1, Math.min(30, Number(body.extraMinutes || 5)));
      if (!Number.isFinite(extraMinutes)) return Response.json({ error:'Extension is invalid.' }, { status:400 });
      const currentClose = Math.max(Date.now(), Date.parse(event.pot_vote_closes_at));
      update = { pot_vote_closes_at:new Date(currentClose + extraMinutes * 60000).toISOString() };
    } else if (action === 'reset') {
      const votes = await base44.asServiceRole.entities.ClubChallengeVote.filter({ challenge_event_id:event.id }, '-cast_at', 500);
      let invalidated = 0;
      for (const vote of votes) {
        if (vote.valid === false) continue;
        await base44.asServiceRole.entities.ClubChallengeVote.update(vote.id, { valid:false, rejection_reason:'Voting reset by host' });
        invalidated += 1;
      }
      update = {
        pot_status:'closed',
        pot_winner_participant_ids:[],
        pot_revealed_at:null,
        pot_vote_opened_at:null,
        pot_vote_closes_at:null,
        pot_vote_duration_minutes:null
      };
      const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, update);
      await base44.asServiceRole.entities.ClubChallengeAudit.create({
        tenant_id:event.tenant_id,
        challenge_event_id:event.id,
        action:'pot_reset',
        user_id:user.id,
        occurred_at:nowIso,
        old_value_json:JSON.stringify({ pot_status:event.pot_status }),
        new_value_json:JSON.stringify({ pot_status:'closed', invalidated_votes:invalidated }),
        note:'Voting reset by host. Previous ballots retained as invalid audit records.'
      });
      return Response.json({ success:true, event:updated, invalidatedVotes:invalidated });
    } else {
      if (event.pot_status !== 'closed') return Response.json({ error:'Voting must be closed before reveal.' }, { status:409 });
      const [votes, participants] = await Promise.all([
        base44.asServiceRole.entities.ClubChallengeVote.filter({ challenge_event_id:event.id }, '-cast_at', 500),
        base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100)
      ]);
      const byId = new Map(participants.map((p:any) => [p.id, p]));
      const counts:any = { club_a:{}, club_b:{} };
      for (const vote of votes) {
        if (vote.valid === false) continue;
        const nominee:any = byId.get(vote.nominee_participant_id);
        const side = vote.ballot_side || nominee?.side;
        if (!nominee || !['club_a','club_b'].includes(side)) continue;
        counts[side][nominee.id] = (counts[side][nominee.id] || 0) + 1;
      }
      const winnersFor = (side:string) => {
        const sideCounts = counts[side] || {};
        const max = Math.max(0, ...Object.values(sideCounts).map(Number));
        return Object.keys(sideCounts).filter(id => max > 0 && sideCounts[id] === max);
      };
      const clubAWinners = winnersFor('club_a');
      const clubBWinners = winnersFor('club_b');
      const winners = [...clubAWinners, ...clubBWinners];
      winnerCount = winners.length;
      winnerSides = { club_a:clubAWinners, club_b:clubBWinners };
      update = { pot_status:'revealed', pot_winner_participant_ids:winners, pot_revealed_at:nowIso };
    }

    const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, update);
    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:event.tenant_id,
      challenge_event_id:event.id,
      action:`pot_${action}`,
      user_id:user.id,
      occurred_at:nowIso,
      old_value_json:JSON.stringify({ pot_status:event.pot_status, pot_vote_closes_at:event.pot_vote_closes_at || null }),
      new_value_json:JSON.stringify({ pot_status:updated.pot_status, pot_vote_closes_at:updated.pot_vote_closes_at || null, winner_count:winnerCount }),
    });

    return Response.json({ success:true, event:updated, winnerCount, winnerSides });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected POT update error' }, { status:500 });
  }
});