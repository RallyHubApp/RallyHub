import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

function inWindow(access:any) {
  const now = Date.now();
  if (!access || access.status !== 'active') return false;
  if (access.starts_at && Date.parse(access.starts_at) > now) return false;
  if (access.ends_at && Date.parse(access.ends_at) < now) return false;
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const body = await req.json().catch(() => ({}));
    const { eventId, fixtures, fairness } = body;
    if (!eventId || !Array.isArray(fixtures) || !fixtures.length) return Response.json({ error:'Event and generated fixtures are required.' }, { status:400 });

    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Club Challenge event not found' }, { status:404 });
    if (!['draft','draw_generated'].includes(event.status)) return Response.json({ error:'A full draw can only be generated before approval.' }, { status:409 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, tenant_id:event.tenant_id, user_id:user.id, status:'active' })).filter(inWindow);
      const ca = await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, tenant_id:event.tenant_id, user_id:user.id, active:true });
      allowed = ta.some((a:any)=>['event_manager','event_host'].includes(a.role)) || ca.some((a:any)=>['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required' }, { status:403 });

    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 120);
    const pmap = new Map(participants.map((p:any)=>[String(p.id),p]));
    const clubA = participants.filter((p:any)=>p.side==='club_a' && !['replaced','withdrawn','injured'].includes(p.status));
    const clubB = participants.filter((p:any)=>p.side==='club_b' && !['replaced','withdrawn','injured'].includes(p.status));
    if (!clubA.length || clubA.length !== clubB.length) return Response.json({ error:'Both clubs require equal playable rosters before generating a draw.' }, { status:409 });

    const roundSeen = new Map<number, Set<string>>();
    const gamesA = new Map(clubA.map((p:any)=>[String(p.id),0]));
    const gamesB = new Map(clubB.map((p:any)=>[String(p.id),0]));
    const cleaned:any[] = [];
    for (let i=0;i<fixtures.length;i++) {
      const f:any = fixtures[i] || {};
      const round = Number(f.round_number), court = Number(f.court_number);
      const aIds = (f.club_a_participant_ids || []).map(String), bIds = (f.club_b_participant_ids || []).map(String);
      if (!Number.isInteger(round) || round < 1 || !Number.isInteger(court) || court < 1 || aIds.length !== 2 || bIds.length !== 2) return Response.json({ error:`Invalid fixture at position ${i+1}.` }, { status:400 });
      const all = [...aIds,...bIds];
      if (new Set(all).size !== 4) return Response.json({ error:`A player appears twice in Round ${round}, Court ${court}.` }, { status:409 });
      if (aIds.some(id=>pmap.get(id)?.side!=='club_a') || bIds.some(id=>pmap.get(id)?.side!=='club_b')) return Response.json({ error:`Club-side integrity failed in Round ${round}, Court ${court}.` }, { status:409 });
      const seen = roundSeen.get(round) || new Set<string>();
      if (all.some(id=>seen.has(id))) return Response.json({ error:`A player appears on more than one court in Round ${round}.` }, { status:409 });
      all.forEach(id=>seen.add(id)); roundSeen.set(round,seen);
      aIds.forEach(id=>gamesA.set(id,Number(gamesA.get(id)||0)+1)); bIds.forEach(id=>gamesB.set(id,Number(gamesB.get(id)||0)+1));
      cleaned.push({
        tenant_id:event.tenant_id, challenge_event_id:event.id, tournament_id:event.tournament_id,
        draw_version:Number(event.draw_version||0)+1, round_number:round, court_number:court,
        match_number:Number(f.match_number || i+1), club_a_participant_ids:aIds, club_b_participant_ids:bIds,
        club_a_names:aIds.map(id=>pmap.get(id)?.display_name || 'Player'), club_b_names:bIds.map(id=>pmap.get(id)?.display_name || 'Player'),
        status:'scheduled', winner:'none', revision:0, correction_count:0, is_showcase:false,
      });
    }
    const aCounts=[...gamesA.values()], bCounts=[...gamesB.values()];
    if (Math.min(...aCounts)!==Math.max(...aCounts) || Math.min(...bCounts)!==Math.max(...bCounts)) return Response.json({ error:'Generated draw does not give equal games to every player.' }, { status:409 });
    if (!fairness || fairness.duplicatePlayerRoundIssues || fairness.sameClubIntegrityIssues || fairness.equalGames !== true) return Response.json({ error:'Hard fairness checks must pass before the draw can be stored.' }, { status:409 });

    const existing = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 300);
    if (existing.some((m:any)=>['completed','draw','retired','forfeit','abandoned'].includes(m.status))) return Response.json({ error:'Completed match history exists. Rebalance remaining fixtures instead of replacing the full draw.' }, { status:409 });
    for (const m of existing) await base44.asServiceRole.entities.ClubChallengeMatch.delete(m.id);
    await base44.asServiceRole.entities.ClubChallengeMatch.bulkCreate(cleaned);
    const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { status:'draw_generated', fairness_json:JSON.stringify(fairness), current_round:0, event_pack_stale:true });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'draw_generated', user_id:user.id, occurred_at:new Date().toISOString(), new_value_json:JSON.stringify({match_count:cleaned.length,round_count:roundSeen.size,next_draw_version:Number(event.draw_version||0)+1}) });
    return Response.json({ success:true, event:updated, match_count:cleaned.length, round_count:roundSeen.size });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected draw-generation error' }, { status:500 });
  }
});