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
    if (!['open','close','reveal'].includes(action)) return Response.json({ error:'Invalid POT action.' }, { status:400 });
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Club Challenge event not found' }, { status:404 });
    if (!event.pot_enabled) return Response.json({ error:'Player of Tournament voting is not enabled.' }, { status:409 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, user_id:user.id, status:'active' })).filter((a:any) => validTournamentEventGrant(a, event.tenant_id));
      const ca = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, user_id:user.id, active:true })).filter((a:any) => validClubChallengeGrant(a, event.tenant_id));
      allowed = ta.some((a:any) => ['event_manager','event_host'].includes(a.role)) || ca.some((a:any) => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required' }, { status:403 });

    const now = new Date().toISOString();
    let update:any = {};
    if (action === 'open') {
      if (!['closed'].includes(event.pot_status)) return Response.json({ error:'Voting can only be opened from Closed.' }, { status:409 });
      update = { pot_status:'open', pot_winner_participant_ids:[], pot_revealed_at:null };
    } else if (action === 'close') {
      if (event.pot_status !== 'open') return Response.json({ error:'Voting is not currently open.' }, { status:409 });
      update = { pot_status:'closed' };
    } else {
      if (event.pot_status !== 'closed') return Response.json({ error:'Voting must be closed before reveal.' }, { status:409 });
      const votes = await base44.asServiceRole.entities.ClubChallengeVote.filter({ challenge_event_id:event.id }, '-cast_at', 500);
      const counts:any = {};
      for (const v of votes) if (v.valid !== false) counts[v.nominee_participant_id] = (counts[v.nominee_participant_id] || 0) + 1;
      const max = Math.max(0, ...Object.values(counts).map(Number));
      const winners = Object.keys(counts).filter(id => max > 0 && counts[id] === max);
      update = { pot_status:'revealed', pot_winner_participant_ids:winners, pot_revealed_at:now };
    }

    const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, update);
    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:event.tenant_id, challenge_event_id:event.id, action:`pot_${action}`, user_id:user.id,
      occurred_at:now, old_value_json:JSON.stringify({ pot_status:event.pot_status }),
      new_value_json:JSON.stringify({ pot_status:updated.pot_status, winner_count:(updated.pot_winner_participant_ids || []).length }),
    });
    return Response.json({ success:true, event:updated, winnerCount:(updated.pot_winner_participant_ids || []).length });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected POT update error' }, { status:500 });
  }
});