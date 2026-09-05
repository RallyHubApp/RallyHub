import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

function validateScore(scoreA, scoreB, event) {
  const a = Number(scoreA), b = Number(scoreB);
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return 'Scores must be non-negative whole numbers.';
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
    if (!event) return Response.json({ error: 'Club Challenge event not found' }, { status: 404 });

    let accessRole = user.role === 'admin' ? 'admin' : '';
    let canCorrect = user.role === 'admin';
    if (!accessRole) {
      const tournamentAccess = await base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id: match.tournament_id, user_id: user.id, status: 'active' });
      const ccAccess = await base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id: event.id, user_id: user.id, active: true });
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

    const validationError = validateScore(scoreA, scoreB, event);
    if (validationError) return Response.json({ error: validationError }, { status: 400 });
    if (match.is_showcase && Number(scoreA) === Number(scoreB)) {
      return Response.json({ error: 'Showcase Final requires a winner.' }, { status: 400 });
    }

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

    if (isCorrection) {
      await base44.asServiceRole.entities.ClubChallengeAudit.create({
        tenant_id: match.tenant_id,
        challenge_event_id: match.challenge_event_id,
        match_id: match.id,
        action: 'score_corrected',
        user_id: user.id,
        occurred_at: now,
        old_value_json: JSON.stringify({ score_a: match.score_a, score_b: match.score_b, winner: match.winner, revision: currentRevision }),
        new_value_json: JSON.stringify({ score_a: a, score_b: b, winner, revision: currentRevision + 1 }),
      });
    }

    return Response.json({ success: true, match: updated, correction: isCorrection });
  } catch (error) {
    return Response.json({ error: error?.message || 'Unexpected scoring error' }, { status: 500 });
  }
});
