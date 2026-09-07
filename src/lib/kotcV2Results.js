import { DEFAULT_LEADERBOARD_POLICY, podiumGroupForRank } from './kotcV2Domain.js';

function idOf(participant) {
  return participant?.id ?? participant?.participant_id;
}

function numeric(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function resolvedCompletedMatches(matches = []) {
  return matches.filter((match) => match?.status === 'completed' && ['A', 'B'].includes(match?.winner_side));
}

export function computeKotcV2Leaderboard({ participants = [], matches = [], policy = DEFAULT_LEADERBOARD_POLICY, winPoints = 2, lossPoints = 0 } = {}) {
  const rows = new Map();
  for (const participant of participants) {
    const id = idOf(participant);
    if (!id) throw new Error('Every leaderboard participant requires an id or participant_id');
    rows.set(id, {
      participant_id: id,
      display_name: participant.display_name ?? participant.name ?? id,
      points: 0,
      wins: 0,
      losses: 0,
      points_for: 0,
      points_against: 0,
      score_difference: 0,
      court1_wins: 0,
      court1_rounds: 0,
      final_court_rank: Number.POSITIVE_INFINITY,
      seed_rank: numeric(participant.seed_rank, Number.MAX_SAFE_INTEGER),
    });
  }

  const orderedMatches = resolvedCompletedMatches(matches).sort((a, b) =>
    numeric(a.round_number) - numeric(b.round_number) || numeric(a.ladder_court_rank) - numeric(b.ladder_court_rank),
  );

  for (const match of orderedMatches) {
    const teamA = match.team_a_participant_ids ?? [];
    const teamB = match.team_b_participant_ids ?? [];
    if (teamA.length !== 2 || teamB.length !== 2) continue;
    const scoreA = numeric(match.team_a_score);
    const scoreB = numeric(match.team_b_score);
    const winners = match.winner_side === 'A' ? teamA : teamB;
    const losers = match.winner_side === 'A' ? teamB : teamA;
    const courtRank = numeric(match.ladder_court_rank, Number.MAX_SAFE_INTEGER);

    for (const id of teamA) {
      const row = rows.get(id);
      if (!row) continue;
      row.points_for += scoreA;
      row.points_against += scoreB;
      row.final_court_rank = courtRank;
      if (courtRank === 1) row.court1_rounds += 1;
    }
    for (const id of teamB) {
      const row = rows.get(id);
      if (!row) continue;
      row.points_for += scoreB;
      row.points_against += scoreA;
      row.final_court_rank = courtRank;
      if (courtRank === 1) row.court1_rounds += 1;
    }
    for (const id of winners) {
      const row = rows.get(id);
      if (!row) continue;
      row.wins += 1;
      row.points += winPoints;
      if (courtRank === 1) row.court1_wins += 1;
    }
    for (const id of losers) {
      const row = rows.get(id);
      if (!row) continue;
      row.losses += 1;
      row.points += lossPoints;
    }
  }

  const rankingFields = policy?.rankingFields ?? DEFAULT_LEADERBOARD_POLICY.rankingFields;
  const direction = {
    points: -1,
    wins: -1,
    score_difference: -1,
    points_for: -1,
    court1_wins: -1,
    final_court_rank: 1,
    court1_rounds: -1,
    seed_rank: 1,
  };

  const output = [...rows.values()].map((row) => ({
    ...row,
    score_difference: row.points_for - row.points_against,
  })).sort((a, b) => {
    for (const field of rankingFields) {
      const av = numeric(a[field], field === 'final_court_rank' || field === 'seed_rank' ? Number.MAX_SAFE_INTEGER : 0);
      const bv = numeric(b[field], field === 'final_court_rank' || field === 'seed_rank' ? Number.MAX_SAFE_INTEGER : 0);
      if (av !== bv) return (direction[field] ?? -1) * (av - bv);
    }
    return String(a.participant_id).localeCompare(String(b.participant_id));
  });

  return output.map((row, index) => ({
    ...row,
    final_rank: index + 1,
    podium_group: podiumGroupForRank(index + 1, 'rotating_doubles'),
  }));
}

export function resolveCourt1Champions({ matches = [], enabled = true } = {}) {
  if (!enabled) return { awarded: false, reason: 'disabled', participantIds: [] };
  const completed = resolvedCompletedMatches(matches);
  if (!completed.length) return { awarded: false, reason: 'no_completed_matches', participantIds: [] };
  const finalCompletedRound = Math.max(...completed.map((match) => numeric(match.round_number)));
  const court1 = completed.find((match) => numeric(match.round_number) === finalCompletedRound && numeric(match.ladder_court_rank) === 1);
  if (!court1) return { awarded: false, reason: 'final_completed_round_has_no_completed_court1_match', participantIds: [] };
  const participantIds = court1.winner_side === 'A' ? [...(court1.team_a_participant_ids ?? [])] : [...(court1.team_b_participant_ids ?? [])];
  if (participantIds.length !== 2) return { awarded: false, reason: 'invalid_court1_winning_pair', participantIds: [] };
  return {
    awarded: true,
    reason: 'winning_pair_final_completed_court1_match',
    roundNumber: numeric(court1.round_number),
    matchId: court1.id ?? null,
    participantIds,
  };
}
