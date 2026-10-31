/**
 * Shared, side-effect-free sporting fixture preflight for RallyHub.
 * Advisory only: never starts fixtures, allocates courts or sends DUPR results.
 */
const validId = id => typeof id === 'string' && id.trim().length > 0;
const allPlayers = match => [...(Array.isArray(match.teamA) ? match.teamA : []), ...(Array.isArray(match.teamB) ? match.teamB : [])];

export function inspectSportingFixtures(matches, {
  courts = 4,
  checkedInIds = null,
  requireCheckIn = true,
  allowIncomplete = false,
} = {}) {
  const issues = [];
  const add = (code, matchId, detail = '') => issues.push({code, matchId, detail});
  if (!Number.isInteger(courts) || courts < 1 || courts > 64) add('invalid_court_count', null);
  if (!Array.isArray(matches) || !matches.length) {
    add('fixtures_missing', null);
    return {valid:false,issues,fixtureCount:0,activeCount:0,playerCount:0,requiresReview:true};
  }
  const checked = checkedInIds == null ? null : new Set(checkedInIds);
  const matchIds = new Set();
  const activeCourts = new Set();
  const activePlayers = new Set();
  const participants = new Set();
  let activeCount = 0;
  for (const [index, match] of matches.entries()) {
    const id = validId(match?.id) ? match.id : `index:${index}`;
    if (!validId(match?.id)) add('match_id_missing', id);
    else if (matchIds.has(id)) add('duplicate_match_id', id);
    matchIds.add(id);
    const players = allPlayers(match || {});
    if (!allowIncomplete && (!Array.isArray(match?.teamA) || !Array.isArray(match?.teamB) || match.teamA.length !== 2 || match.teamB.length !== 2))
      add('invalid_doubles_teams', id);
    if (!Array.isArray(match?.teamA) || !Array.isArray(match?.teamB)) add('invalid_team_structure', id);
    if (players.some(p => !validId(p))) add('invalid_player_id', id);
    if (new Set(players).size !== players.length) add('duplicate_player_in_match', id);
    for (const player of players) if (validId(player)) participants.add(player);
    if (requireCheckIn && checked === null) add('check_in_evidence_missing', id);
    else if (requireCheckIn && players.some(p => !checked.has(p))) add('unchecked_player', id);
    if (match?.status === 'playing') {
      activeCount++;
      if (!Number.isInteger(match.court) || match.court < 1 || match.court > courts || activeCourts.has(match.court))
        add('active_court_collision', id);
      else activeCourts.add(match.court);
      if (players.some(p => activePlayers.has(p))) add('overlapping_active_player', id);
      players.forEach(p => activePlayers.add(p));
    }
    if (match?.status === 'completed' && !match.result) add('completed_result_missing', id);
    if (!['waiting','playing','completed','cancelled'].includes(match?.status))
      add('invalid_match_status', id);
  }
  return {valid:issues.length === 0,issues,fixtureCount:matches.length,activeCount,playerCount:participants.size,requiresReview:issues.length > 0};
}
