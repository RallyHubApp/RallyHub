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

function validateScore(scoreA, scoreB, event, match) {
  const a = Number(scoreA), b = Number(scoreB);
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return 'Scores must be non-negative whole numbers.';
  if (a > 99 || b > 99) return 'Scores must be between 0 and 99.';
  if (match?.is_showcase) {
    const target = Number(match.showcase_target_points || 11);
    const winBy = Number(match.showcase_win_by || 1);
    if (![11,15].includes(target) || ![1,2].includes(winBy)) return 'Invalid Showcase Final format.';
    if (a === b) return 'Showcase Final requires a winner.';
    const winner = Math.max(a,b), loser = Math.min(a,b);
    if (winner < target) return `Winner must reach at least ${target}.`;
    if (winner - loser < winBy) return `Winner must win by ${winBy}.`;
    if (winBy === 1 && winner !== target) return `First to ${target}, win by 1, must finish when a team reaches ${target}.`;
    if (winBy === 2 && winner > target && winner - loser !== 2) return 'Extended Showcase play must finish as soon as a team leads by 2.';
    return null;
  }
  if (event.normal_match_type === 'timed') {
    if (a === b && event.timed_draws_allowed === false) return 'This timed format requires a winner.';
    return null;
  }
  const target = Number(event.normal_target_points || 11);
  const winBy = Number(event.normal_win_by || 1);
  if (a === b) return 'Point-based matches require a winner.';
  const winner = Math.max(a, b), loser = Math.min(a, b);
  if (winner < target) return `Winner must reach at least ${target}.`;
  if (winner - loser < winBy) return `Winner must win by ${winBy}.`;
  if (winBy === 1 && winner > target && loser < target) return `Match should finish when a team reaches ${target}.`;
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { matchId, expectedRevision, scoreA, scoreB } = body;
    if (!matchId) return Response.json({ error: 'matchId required' }, { status: 400 });

    const matches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ id: matchId });
    const match = matches?.[0];
    if (!match) return Response.json({ error: 'Match not found' }, { status: 404 });
    const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id: match.challenge_event_id });
    const event = events?.[0];
    if (!event) return Response.json({ error: 'Interclub Challenge event not found' }, { status: 404 });
    if (event.status === 'archived') return Response.json({ error: 'Archived Interclub Challenge results are read-only.' }, { status: 409 });
    if (event.status === 'completed' && !['completed','draw'].includes(match.status)) return Response.json({ error: 'A completed Interclub Challenge only allows correction of an existing saved result.' }, { status: 409 });

    let accessRole = user.role === 'admin' ? 'admin' : '';
    let canCorrect = user.role === 'admin';
    if (!accessRole) {
      const tournamentAccess = (await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id: match.tournament_id, user_id: user.id, status: 'active' })).filter((a:any) => validTournamentEventGrant(a, event.tenant_id));
      const ccAccess = (await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id: event.id, user_id: user.id, active: true })).filter((a:any) => validClubChallengeGrant(a, event.tenant_id));
      const tournamentRole = tournamentAccess.find(a => ['event_manager', 'event_host', 'scorer'].includes(a.role))?.role || '';
      const ccRole = ccAccess.find(a => a.can_score)?.role || '';
      accessRole = tournamentRole || ccRole;
      canCorrect = tournamentRole === 'event_manager' || tournamentRole === 'event_host' || ccAccess.some(a => a.can_correct_score);
    }
    if (!accessRole) return Response.json({ error: 'Scoring permission required' }, { status: 403 });

    const currentRevision = Number(match.revision || 0);
    if (Number(expectedRevision) !== currentRevision) {
      return Response.json({
        conflict: true,
        error: 'Result changed since you opened it.',
        current: { id: match.id, score_a: match.score_a, score_b: match.score_b, winner: match.winner, status: match.status, revision: currentRevision },
        attempted: { score_a: Number(scoreA), score_b: Number(scoreB), expectedRevision: Number(expectedRevision) }
      }, { status: 409 });
    }

    const validationError = validateScore(scoreA, scoreB, event, match);
    if (validationError) return Response.json({ error: validationError }, { status: 400 });
    const a = Number(scoreA), b = Number(scoreB);
    const winner = a === b ? 'draw' : a > b ? 'club_a' : 'club_b';
    const isCorrection = ['completed', 'draw'].includes(match.status);
    if (isCorrection && !canCorrect) return Response.json({ error: 'Score correction permission required' }, { status: 403 });
    const now = new Date().toISOString();
    const update = {
      score_a: a,
      score_b: b,
      winner,
      status: winner === 'draw' ? 'draw' : 'completed',
      revision: currentRevision + 1,
      scored_by_user_id: match.scored_by_user_id || user.id,
      scored_at: match.scored_at || now,
      ...(isCorrection ? {
        last_corrected_by_user_id: user.id,
        last_corrected_at: now,
        correction_count: Number(match.correction_count || 0) + 1,
      } : {})
    };
    const updated = await base44.asServiceRole.entities.ClubChallengeMatch.update(match.id, update);

    let postCorrectionWinner = event.showcase_resolved_winner || 'none';
    if (isCorrection) {
      const eventUpdate:any = { event_pack_stale:true };
      if (event.status === 'completed') {
        const eventMatches = await base44.asServiceRole.entities.ClubChallengeMatch.filter({ challenge_event_id:event.id }, 'round_number', 300);
        const effectiveMatches = (eventMatches || []).map((m:any) => m.id === updated.id ? updated : m);
        const normal = effectiveMatches.filter((m:any) => !m.is_showcase && ['completed','draw','retired','forfeit','abandoned','not_played'].includes(m.status));
        let pointsA = 0, pointsB = 0, scoredA = 0, scoredB = 0;
        for (const m of normal) {
          if (typeof m.score_a === 'number') scoredA += Number(m.score_a || 0);
          if (typeof m.score_b === 'number') scoredB += Number(m.score_b || 0);
          if (m.winner === 'club_a') { pointsA += Number(event.win_points ?? 2); pointsB += Number(event.loss_points ?? 0); }
          else if (m.winner === 'club_b') { pointsB += Number(event.win_points ?? 2); pointsA += Number(event.loss_points ?? 0); }
          else if (m.winner === 'draw') { pointsA += Number(event.draw_points ?? 1); pointsB += Number(event.draw_points ?? 1); }
        }
        if (pointsA !== pointsB) postCorrectionWinner = pointsA > pointsB ? 'club_a' : 'club_b';
        else if (event.showcase_resolution_method === 'overall_draw') postCorrectionWinner = 'draw';
        else if (event.showcase_resolution_method === 'metrics') postCorrectionWinner = scoredA === scoredB ? 'draw' : scoredA > scoredB ? 'club_a' : 'club_b';
        else if (event.showcase_resolution_method === 'showcase_final') {
          const showcase = effectiveMatches.find((m:any) => m.is_showcase && m.status === 'completed' && ['club_a','club_b'].includes(m.winner));
          postCorrectionWinner = showcase?.winner || 'draw';
        } else postCorrectionWinner = 'draw';
        eventUpdate.showcase_resolved_winner = postCorrectionWinner;
      }
      await base44.asServiceRole.entities.ClubChallengeEvent.update(event.id, eventUpdate);
      await base44.asServiceRole.entities.ClubChallengeAudit.create({
        tenant_id: match.tenant_id,
        challenge_event_id: match.challenge_event_id,
        match_id: match.id,
        action: 'score_corrected',
        user_id: user.id,
        occurred_at: now,
        old_value_json: JSON.stringify({ score_a: match.score_a, score_b: match.score_b, winner: match.winner, revision: currentRevision }),
        new_value_json: JSON.stringify({ score_a: a, score_b: b, winner, revision: currentRevision + 1, post_correction_event_winner:postCorrectionWinner }),
        note:event.status === 'completed' ? 'Post-event result correction. Event remained completed; final winner was recalculated from authoritative match data.' : undefined,
      });
    }

    return Response.json({ success: true, match: updated, correction: isCorrection, postCorrectionWinner:isCorrection ? postCorrectionWinner : undefined });
  } catch (error) {
    return Response.json({ error: error?.message || 'Unexpected scoring error' }, { status: 500 });
  }
});
