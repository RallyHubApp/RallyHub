import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

const resolved = new Set(['completed','draw','retired','forfeit','abandoned','not_played']);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const body = await req.json().catch(() => ({}));
    const { eventId, method = 'none' } = body;
    if (!['none','metrics','overall_draw','showcase_final'].includes(method)) return Response.json({ error:'Invalid finalisation method.' }, { status:400 });
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:eventId });
    const event = events?.[0];
    if (!event) return Response.json({ error:'Club Challenge event not found' }, { status:404 });

    let allowed = user.role === 'admin';
    if (!allowed) {
      const ta = await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, user_id:user.id, status:'active' });
      const ca = await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, user_id:user.id, active:true });
      allowed = ta.some(a => ['event_manager','event_host'].includes(a.role)) || ca.some(a => a.can_finalise || ['owner','organiser'].includes(a.role));
    }
    if (!allowed) return Response.json({ error:'Finalisation permission required' }, { status:403 });
    if (event.pot_enabled && event.pot_status === 'open') return Response.json({ error:'Player of Tournament voting is still open.' }, { status:409 });

    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 200);
    const normal = matches.filter((m:any) => !m.is_showcase);
    const unresolved = normal.filter((m:any) => !resolved.has(m.status));
    if (unresolved.length) return Response.json({ error:`${unresolved.length} normal result(s) are unresolved.` }, { status:409 });

    let clubA = 0, clubB = 0, gameA = 0, gameB = 0;
    for (const m of normal) {
      if (typeof m.score_a === 'number') gameA += Number(m.score_a || 0);
      if (typeof m.score_b === 'number') gameB += Number(m.score_b || 0);
      if (m.winner === 'club_a') clubA += Number(event.win_points ?? 2), clubB += Number(event.loss_points ?? 0);
      else if (m.winner === 'club_b') clubB += Number(event.win_points ?? 2), clubA += Number(event.loss_points ?? 0);
      else if (m.winner === 'draw') clubA += Number(event.draw_points ?? 1), clubB += Number(event.draw_points ?? 1);
    }

    let winner = clubA === clubB ? 'draw' : clubA > clubB ? 'club_a' : 'club_b';
    let overallA = clubA, overallB = clubB;
    if (method === 'none' && winner === 'draw') return Response.json({ error:'Normal Club Challenge points are tied; choose an approved tie resolution.' }, { status:409 });
    if (method === 'metrics') {
      if (clubA !== clubB) return Response.json({ error:'Metrics tiebreak is only valid when normal Club Challenge points are tied.' }, { status:409 });
      const diff = gameA - gameB;
      if (!diff) return Response.json({ error:'Cumulative point differential is also tied.' }, { status:409 });
      winner = diff > 0 ? 'club_a' : 'club_b';
    } else if (method === 'overall_draw') {
      if (!event.allow_overall_draw || clubA !== clubB) return Response.json({ error:'Overall draw is not valid for this event state.' }, { status:409 });
      winner = 'draw';
    } else if (method === 'showcase_final') {
      if (clubA !== clubB || !event.showcase_enabled) return Response.json({ error:'Showcase Final is only valid for an enabled tied event.' }, { status:409 });
      const showcase = matches.find((m:any) => m.is_showcase);
      if (!showcase || showcase.status !== 'completed' || !['club_a','club_b'].includes(showcase.winner)) return Response.json({ error:'Completed Showcase Final result required.' }, { status:409 });
      winner = showcase.winner;
      if (winner === 'club_a') overallA += Number(event.showcase_points || 0); else overallB += Number(event.showcase_points || 0);
    }

    const now = new Date().toISOString();
    const updated = await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, { status:'completed', finalised_at:now, showcase_resolution_method:method, showcase_resolved_winner:winner });
    await base44.asServiceRole.entities.Tournament.update(event.tournament_id, { status:'Completed', finalised_at:now });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({ tenant_id:event.tenant_id, challenge_event_id:event.id, action:'event_finalised', user_id:user.id, occurred_at:now, new_value_json:JSON.stringify({winner,method,normal_score_a:clubA,normal_score_b:clubB,overall_score_a:overallA,overall_score_b:overallB,game_points_a:gameA,game_points_b:gameB}) });
    return Response.json({ success:true, event:updated, winner, clubA:overallA, clubB:overallB });
  } catch (error) {
    return Response.json({ error:error?.message || 'Unexpected finalisation error' }, { status:500 });
  }
});
