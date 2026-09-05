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
    const { eventId, clubAMaleId, clubAFemaleId, clubBMaleId, clubBFemaleId } = body;
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Club Challenge event not found' }, { status:404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, user_id:user.id, status:'active' })).filter((a:any) => validTournamentEventGrant(a, event.tenant_id));
      const ca = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, user_id:user.id, active:true })).filter((a:any) => validClubChallengeGrant(a, event.tenant_id));
      allowed = ta.some(a => ['event_manager','event_host'].includes(a.role)) || ca.some(a => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required' }, { status:403 });
    if (!event.showcase_enabled) return Response.json({ error:'Showcase Final is not enabled.' }, { status:409 });
    if (Number(event.showcase_points || 0) <= 0) return Response.json({ error:'Showcase Final points must be greater than zero.' }, { status:409 });

    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 200);
    const normal = matches.filter((m:any) => !m.is_showcase);
    const unresolved = normal.filter((m:any) => !['completed','draw','retired','forfeit','abandoned','not_played'].includes(m.status));
    if (unresolved.length) return Response.json({ error:`${unresolved.length} normal result(s) are unresolved.` }, { status:409 });
    let clubA = 0, clubB = 0;
    for (const m of normal) {
      if (m.winner === 'club_a') { clubA += Number(event.win_points ?? 2); clubB += Number(event.loss_points ?? 0); }
      else if (m.winner === 'club_b') { clubB += Number(event.win_points ?? 2); clubA += Number(event.loss_points ?? 0); }
      else if (m.winner === 'draw') { clubA += Number(event.draw_points ?? 1); clubB += Number(event.draw_points ?? 1); }
    }
    if (clubA !== clubB) return Response.json({ error:'Showcase Final is only valid when normal Club Challenge points are tied.' }, { status:409 });

    const ids = [clubAMaleId, clubAFemaleId, clubBMaleId, clubBFemaleId];
    if (ids.some(id => !id) || new Set(ids).size !== 4) return Response.json({ error:'Nominate four distinct players: one male and one female from each club.' }, { status:400 });
    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100);
    const byId = Object.fromEntries(participants.map((p:any) => [p.id,p]));
    const gender = (v:any) => String(v || '').trim().toLowerCase();
    const eligible = (p:any) => p && !['withdrawn','injured','replaced'].includes(p.status);
    const aM:any = byId[clubAMaleId], aF:any = byId[clubAFemaleId], bM:any = byId[clubBMaleId], bF:any = byId[clubBFemaleId];
    if (![aM,aF,bM,bF].every(eligible)) return Response.json({ error:'All Showcase nominees must be eligible participants in this event.' }, { status:400 });
    if (aM.side !== 'club_a' || aF.side !== 'club_a' || bM.side !== 'club_b' || bF.side !== 'club_b') return Response.json({ error:'Showcase nominees must represent the correct club.' }, { status:400 });
    if (gender(aM.gender) !== 'male' || gender(aF.gender) !== 'female' || gender(bM.gender) !== 'male' || gender(bF.gender) !== 'female') return Response.json({ error:'Showcase requires one male and one female nominee from each club.' }, { status:400 });

    const existing = matches.find((m:any) => m.is_showcase);
    if (existing && ['completed','draw'].includes(existing.status)) return Response.json({ error:'The Showcase Final has already been scored.' }, { status:409 });
    if (existing) await base44.asServiceRole.entities.ClubChallengeMatch.delete(existing.id);
    const maxRound = normal.length ? Math.max(...normal.map((m:any) => Number(m.round_number || 0))) : 0;
    const created = await base44.asServiceRole.entities.ClubChallengeMatch.create({
      tenant_id:event.tenant_id, challenge_event_id:event.id, tournament_id:event.tournament_id,
      draw_version:event.draw_version || 0, round_number:maxRound + 1, court_number:1, match_number:normal.length + 1,
      club_a_participant_ids:[aM.id,aF.id], club_b_participant_ids:[bM.id,bF.id],
      club_a_names:[aM.display_name,aF.display_name], club_b_names:[bM.display_name,bF.display_name],
      status:'scheduled', winner:'none', revision:0, correction_count:0, is_showcase:true,
    });
    const now = new Date().toISOString();
    await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, {
      showcase_club_a_male_id:aM.id, showcase_club_a_female_id:aF.id,
      showcase_club_b_male_id:bM.id, showcase_club_b_female_id:bF.id,
      showcase_resolution_method:'showcase_final', showcase_resolved_winner:'none',
    });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:event.tenant_id, challenge_event_id:event.id, match_id:created.id,
      action:'showcase_final_created', user_id:user.id, occurred_at:now,
      new_value_json:JSON.stringify({ club_a:created.club_a_names, club_b:created.club_b_names, points:event.showcase_points }),
    });
    return Response.json({ success:true, match:created });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected Showcase Final error' }, { status:500 });
  }
});
