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
    const { eventId } = await req.json().catch(() => ({}));
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Club Challenge event not found' }, { status:404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const tournamentAccess = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, user_id:user.id, status:'active' })).filter((a:any)=>validTournamentEventGrant(a,event.tenant_id));
      const ccAccess = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, user_id:user.id, active:true })).filter((a:any)=>validClubChallengeGrant(a,event.tenant_id));
      allowed = tournamentAccess.some((a:any)=>['event_manager','event_host'].includes(a.role)) || ccAccess.some((a:any)=>['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required' }, { status:403 });
    if (!['draft','draw_generated'].includes(event.status)) return Response.json({ error:'Practice players can only be loaded before the draw is approved.' }, { status:400 });

    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 200);
    if (matches.some((m:any)=>['completed','draw','retired','forfeit','abandoned'].includes(m.status))) return Response.json({ error:'Practice players cannot replace an event with recorded results.' }, { status:400 });
    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100);
    for (const m of matches) await base44.asServiceRole.entities.ClubChallengeMatch.delete(m.id);
    for (const p of participants) await base44.asServiceRole.entities.ClubChallengeParticipant.delete(p.id);

    const records:any[] = [];
    for (let i=1;i<=16;i++) {
      records.push({ tenant_id:event.tenant_id, challenge_event_id:event.id, tournament_id:event.tournament_id, side:'club_a', display_name:`Club A Test ${String(i).padStart(2,'0')}`, event_rank:i, gender:i%2?'Male':'Female', status:'active', available_from_round:1, unique_identity_key:`gate3-club-a-${i}` });
      records.push({ tenant_id:event.tenant_id, challenge_event_id:event.id, tournament_id:event.tournament_id, side:'club_b', display_name:`Club B Test ${String(i).padStart(2,'0')}`, event_rank:i, gender:i%2?'Male':'Female', status:'active', available_from_round:1, unique_identity_key:`gate3-club-b-${i}` });
    }
    await base44.asServiceRole.entities.ClubChallengeParticipant.bulkCreate(records);
    await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { status:'draft', fairness_json:'', current_round:0, draw_approved_at:null, draw_approved_by:null, event_pack_stale:true });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, tournament_id:event.tournament_id, action:'practice_roster_loaded', actor_user_id:user.id, new_value_json:JSON.stringify({ player_count:32 }), occurred_at:new Date().toISOString() });
    return Response.json({ success:true, player_count:32 });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected practice-roster error' }, { status:500 });
  }
});