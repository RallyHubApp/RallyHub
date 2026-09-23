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
    const {
      eventId,
      clubAPlayer1Id = body.clubAMaleId,
      clubAPlayer2Id = body.clubAFemaleId,
      clubBPlayer1Id = body.clubBMaleId,
      clubBPlayer2Id = body.clubBFemaleId,
      mode = 'tiebreak',
      targetPoints = 11,
      winBy = 1,
    } = body;
    if (!['tiebreak','exhibition'].includes(mode)) return Response.json({ error:'Invalid Showcase mode.' }, { status:400 });
    if (![11,15].includes(Number(targetPoints)) || ![1,2].includes(Number(winBy))) return Response.json({ error:'Showcase Final format must be 11 or 15 points, win by 1 or 2.' }, { status:400 });
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Interclub Challenge event not found' }, { status:404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, user_id:user.id, status:'active' })).filter((a:any) => validTournamentEventGrant(a, event.tenant_id));
      const ca = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, user_id:user.id, active:true })).filter((a:any) => validClubChallengeGrant(a, event.tenant_id));
      allowed = ta.some(a => ['event_manager','event_host'].includes(a.role)) || ca.some(a => ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Event manager permission required' }, { status:403 });
    if (!event.showcase_enabled) return Response.json({ error:'Showcase Final is not enabled.' }, { status:409 });
    if (mode === 'tiebreak' && Number(event.showcase_points || 0) <= 0) return Response.json({ error:'Showcase Final points must be greater than zero.' }, { status:409 });

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
    if (mode === 'tiebreak' && clubA !== clubB) return Response.json({ error:'Tiebreak Showcase Final is only valid when normal Interclub points are tied.' }, { status:409 });
    if (mode === 'exhibition' && clubA === clubB) return Response.json({ error:'A tied Interclub result needs a tiebreak decision, not an exhibition Showcase.' }, { status:409 });

    const ids = [clubAPlayer1Id, clubAPlayer2Id, clubBPlayer1Id, clubBPlayer2Id];
    if (ids.some(id => !id) || new Set(ids).size !== 4) return Response.json({ error:'Select four distinct Showcase players: two from each club.' }, { status:400 });
    const participants = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:event.id }, 'event_rank', 100);
    const byId = Object.fromEntries(participants.map((p:any) => [p.id,p]));
    const eligible = (p:any) => p && !['withdrawn','injured','replaced'].includes(p.status);
    const a1:any = byId[clubAPlayer1Id], a2:any = byId[clubAPlayer2Id], b1:any = byId[clubBPlayer1Id], b2:any = byId[clubBPlayer2Id];
    if (![a1,a2,b1,b2].every(eligible)) return Response.json({ error:'All Showcase players must be eligible participants in this event.' }, { status:400 });
    if (a1.side !== 'club_a' || a2.side !== 'club_a' || b1.side !== 'club_b' || b2.side !== 'club_b') return Response.json({ error:'Showcase players must represent the correct club.' }, { status:400 });

    const existing = matches.find((m:any) => m.is_showcase);
    if (existing && ['completed','draw'].includes(existing.status)) return Response.json({ error:'The Showcase Final has already been scored.' }, { status:409 });
    if (existing) await base44.asServiceRole.entities.ClubChallengeMatch.delete(existing.id);
    const storedPlannedRounds = Number(event.planned_rounds || 0);
    const maxRound = storedPlannedRounds > 0 ? storedPlannedRounds : (normal.length ? Math.max(...normal.map((m:any) => Number(m.round_number || 0))) : 0);
    const created = await base44.asServiceRole.entities.ClubChallengeMatch.create({
      tenant_id:event.tenant_id, challenge_event_id:event.id, tournament_id:event.tournament_id,
      draw_version:event.draw_version || 0, round_number:maxRound + 1, court_number:1, match_number:normal.length + 1,
      club_a_participant_ids:[a1.id,a2.id], club_b_participant_ids:[b1.id,b2.id],
      club_a_names:[a1.display_name,a2.display_name], club_b_names:[b1.display_name,b2.display_name],
      status:'scheduled', winner:'none', revision:0, correction_count:0, is_showcase:true, showcase_mode:mode,
      showcase_target_points:Number(targetPoints), showcase_win_by:Number(winBy), score_a:0, score_b:0, side_change_announced:false,
    });
    const now = new Date().toISOString();
    await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, {
      showcase_club_a_player_1_id:a1.id, showcase_club_a_player_2_id:a2.id,
      showcase_club_b_player_1_id:b1.id, showcase_club_b_player_2_id:b2.id,
      showcase_resolution_method:mode === 'tiebreak' ? 'showcase_final' : 'none',
      showcase_resolved_winner:'none',
    });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:event.tenant_id, challenge_event_id:event.id, match_id:created.id,
      action:mode === 'exhibition' ? 'showcase_exhibition_created' : 'showcase_final_created', user_id:user.id, occurred_at:now,
      new_value_json:JSON.stringify({ club_a:created.club_a_names, club_b:created.club_b_names, mode, target_points:Number(targetPoints), win_by:Number(winBy), points_applied:mode === 'tiebreak' ? Number(event.showcase_points || 0) : 0 }),
      note:mode === 'exhibition' ? 'Optional Showcase Final created as an exhibition; it does not affect the Interclub result.' : 'Showcase Final created as the event tiebreak.',
    });
    return Response.json({ success:true, match:created, mode });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected Showcase Final error' }, { status:500 });
  }
});
