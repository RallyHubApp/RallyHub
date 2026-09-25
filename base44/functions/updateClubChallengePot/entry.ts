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

function secureRandomIndex(length:number) {
  if (length <= 1) return 0;
  const range = 0x100000000;
  const limit = Math.floor(range / length) * length;
  const values = new Uint32Array(1);
  let value = range;
  while (value >= limit) { crypto.getRandomValues(values); value = values[0]; }
  return value % length;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });

    const body = await req.json().catch(() => ({}));
    const { eventId, action } = body;
    if (!['open','close','reveal','extend','reset','tiebreak','calculate_points'].includes(action)) return Response.json({ error:'Invalid player-award action.' }, { status:400 });

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
      const currentPotStatus = event.pot_status || 'closed';
      if (currentPotStatus !== 'closed') return Response.json({ error:'Voting can only be opened from Closed.' }, { status:409 });
      const rawDuration = body.durationMinutes;
      const manual = rawDuration === null || rawDuration === undefined || rawDuration === '' || rawDuration === 'manual';
      const durationMinutes = manual ? null : Math.max(1, Math.min(60, Number(rawDuration)));
      if (!manual && !Number.isFinite(durationMinutes)) return Response.json({ error:'Voting duration is invalid.' }, { status:400 });
      update = {
        pot_method:'vote',
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
    } else if (action === 'tiebreak') {
      if (event.pot_status !== 'closed') return Response.json({ error:'Voting must be closed before a tie-break.' }, { status:409 });
      const side = String(body.side || '');
      if (!['club_a','club_b'].includes(side)) return Response.json({ error:'Tie-break team is invalid.' }, { status:400 });
      const [votes, participants] = await Promise.all([
        base44.asServiceRole.entities.ClubChallengeVote.filter({ challenge_event_id:event.id }, '-cast_at', 500),
        base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100)
      ]);
      const byId = new Map(participants.map((p:any) => [p.id, p]));
      const sideCounts:any = {};
      for (const vote of votes) {
        if (vote.valid === false) continue;
        const nominee:any = byId.get(vote.nominee_participant_id);
        const voteSide = vote.ballot_side || nominee?.side;
        if (!nominee || voteSide !== side) continue;
        sideCounts[nominee.id] = (sideCounts[nominee.id] || 0) + 1;
      }
      const max = Math.max(0, ...Object.values(sideCounts).map(Number));
      const tiedIds = Object.keys(sideCounts).filter(id => max > 0 && sideCounts[id] === max);
      if (tiedIds.length < 2) return Response.json({ error:'There is no tied top vote to resolve for this team.' }, { status:409 });
      const selectedId = tiedIds[secureRandomIndex(tiedIds.length)];
      const existingIds = Array.isArray(event.pot_winner_participant_ids) ? event.pot_winner_participant_ids : [];
      const keepOtherSide = existingIds.filter((id:string) => (byId.get(id) as any)?.side !== side);
      update = { pot_status:'closed', pot_winner_participant_ids:[...keepOtherSide, selectedId], pot_revealed_at:null };
      winnerCount = 1;
      winnerSides = { [side]:[selectedId], candidates:tiedIds };
    } else if (action === 'reset') {
      const votes = await base44.asServiceRole.entities.ClubChallengeVote.filter({ challenge_event_id:event.id }, '-cast_at', 500);
      let invalidated = 0;
      for (const vote of votes) {
        if (vote.valid === false) continue;
        await base44.asServiceRole.entities.ClubChallengeVote.update(vote.id, { valid:false, rejection_reason:'Voting reset by host' });
        invalidated += 1;
      }
      update = {
        pot_method:'none',
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
    } else if (action === 'calculate_points') {
      if (!['completed','archived'].includes(event.status)) return Response.json({ error:'Highest scorers can only be calculated after the event is completed.' }, { status:409 });
      const [matches, participants] = await Promise.all([
        base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 300),
        base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100)
      ]);
      const byId = new Map(participants.map((p:any) => [p.id, p]));
      const stats:any = {};
      const ensure = (id:string, side:string) => {
        if (!stats[id]) stats[id] = { participantId:id, side, gamesPlayed:0, pointsFor:0, pointsAgainst:0, wins:0, draws:0, losses:0, pointDiff:0 };
        return stats[id];
      };
      const terminal = new Set(['completed','draw','retired','forfeit']);
      for (const match of matches) {
        if (match.is_showcase || !terminal.has(match.status)) continue;
        const scoreA = Number(match.score_a || 0), scoreB = Number(match.score_b || 0);
        for (const id of (match.club_a_participant_ids || [])) {
          const p:any = byId.get(id); if (!p || p.side !== 'club_a') continue;
          const s = ensure(id, 'club_a'); s.gamesPlayed++; s.pointsFor += scoreA; s.pointsAgainst += scoreB; if (match.winner === 'club_a') s.wins++; else if (match.winner === 'draw') s.draws++; else s.losses++;
        }
        for (const id of (match.club_b_participant_ids || [])) {
          const p:any = byId.get(id); if (!p || p.side !== 'club_b') continue;
          const s = ensure(id, 'club_b'); s.gamesPlayed++; s.pointsFor += scoreB; s.pointsAgainst += scoreA; if (match.winner === 'club_b') s.wins++; else if (match.winner === 'draw') s.draws++; else s.losses++;
        }
      }
      for (const s of Object.values(stats) as any[]) s.pointDiff = s.pointsFor - s.pointsAgainst;
      const sortedFor = (side:string) => (Object.values(stats) as any[]).filter(s => s.side === side && s.gamesPlayed > 0).sort((a,b) => b.pointsFor-a.pointsFor || b.wins-a.wins || b.pointDiff-a.pointDiff || a.participantId.localeCompare(b.participantId));
      const a = sortedFor('club_a'), b = sortedFor('club_b');
      if (!a.length || !b.length) return Response.json({ error:'Not enough completed match data to calculate both team awards.' }, { status:409 });
      const clubAWinner = a[0], clubBWinner = b[0];
      const winners = [clubAWinner.participantId, clubBWinner.participantId];
      winnerCount = winners.length;
      winnerSides = { club_a:[clubAWinner.participantId], club_b:[clubBWinner.participantId] };
      update = { pot_method:'points', pot_status:'revealed', pot_winner_participant_ids:winners, pot_revealed_at:nowIso, pot_vote_opened_at:null, pot_vote_closes_at:null, pot_vote_duration_minutes:null };
      const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, update);
      const publicStats = [clubAWinner, clubBWinner].map(s => ({ ...s, display_name:(byId.get(s.participantId) as any)?.display_name || 'Player' }));
      await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'pot_calculate_points', user_id:user.id, occurred_at:nowIso, old_value_json:JSON.stringify({ pot_method:event.pot_method || 'none', pot_status:event.pot_status }), new_value_json:JSON.stringify({ pot_method:'points', pot_status:'revealed', winners:publicStats }), note:'Highest-scoring player selected for each team from normal-round points scored while that player was on court. Tie-break order: match wins, then point differential.' });
      return Response.json({ success:true, event:updated, winnerCount, winnerSides, stats:publicStats });
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
      const clubATop = winnersFor('club_a');
      const clubBTop = winnersFor('club_b');
      const savedIds = Array.isArray(event.pot_winner_participant_ids) ? event.pot_winner_participant_ids : [];
      const unresolved:string[] = [];
      const resolveSide = (side:string, topIds:string[]) => {
        if (topIds.length <= 1) return topIds;
        const saved = savedIds.filter((id:string) => topIds.includes(id) && (byId.get(id) as any)?.side === side);
        if (saved.length === 1) return saved;
        unresolved.push(side);
        return [];
      };
      const clubAWinners = resolveSide('club_a', clubATop);
      const clubBWinners = resolveSide('club_b', clubBTop);
      if (unresolved.length) return Response.json({ error:'A tied Player of the Tournament vote needs a coin toss before reveal.', code:'POT_TIEBREAK_REQUIRED', tiedSides:unresolved }, { status:409 });
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
      new_value_json:JSON.stringify({ pot_status:updated.pot_status, pot_vote_closes_at:updated.pot_vote_closes_at || null, winner_count:winnerCount, winner_sides:winnerSides }),
      note:action === 'tiebreak' ? 'Random POT tie-break resolved server-side and saved before public reveal.' : undefined,
    });

    if (action === 'tiebreak') {
      const selectedId = Object.values(winnerSides || {}).flat().find((v:any) => typeof v === 'string') as string | undefined;
      const selected = selectedId ? (await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ id:selectedId }))?.[0] : null;
      return Response.json({ success:true, event:updated, winnerCount, winnerSides, selectedWinner:selected ? { id:selected.id, side:selected.side, display_name:selected.display_name } : null });
    }
    return Response.json({ success:true, event:updated, winnerCount, winnerSides });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected POT update error' }, { status:500 });
  }
});