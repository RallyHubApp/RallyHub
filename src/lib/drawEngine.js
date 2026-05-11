/**
 * Draw Engine — generates match fixtures for various tournament formats.
 * Supports Singles and Fixed Partners modes.
 * Each "entry" is an object: { id, name, club, seed, player1_id, player2_id }
 */

/** Pad bracket to next power-of-2 with byes */
function nextPow2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/** Standard seeded placement for elimination brackets (1v16,8v9, etc.) */
function seededSlots(size) {
  if (size === 1) return [1];
  const half = size / 2;
  const top = seededSlots(half);
  const bottom = top.map(s => size + 1 - s);
  const result = [];
  for (let i = 0; i < top.length; i++) {
    result.push(top[i]);
    result.push(bottom[i]);
  }
  return result;
}

function buildEntry(pair, players) {
  if (pair) {
    const p1 = players.find(p => p.id === pair.player1_id);
    const p2 = players.find(p => p.id === pair.player2_id);
    return {
      id: `pair_${pair.player1_id}_${pair.player2_id}`,
      name: pair.pair_name || `${p1?.full_name || '?'} / ${p2?.full_name || '?'}`,
      club: pair.club || '',
      seed: pair.seed || null,
      player1_id: pair.player1_id,
      player2_id: pair.player2_id,
      is_pair: true
    };
  }
  return null;
}

function buildSingleEntry(player) {
  return {
    id: player.id,
    name: player.full_name,
    club: player.club || '',
    seed: null,
    player1_id: player.id,
    player2_id: null,
    is_pair: false
  };
}

function makeMatch(tournamentId, entry1, entry2, round, matchNumber, section = 'Main') {
  const isBye = !entry2;
  return {
    tournament_id: tournamentId,
    team1_player_ids: [entry1.player1_id, entry1.player2_id].filter(Boolean),
    team2_player_ids: entry2 ? [entry2.player1_id, entry2.player2_id].filter(Boolean) : [],
    team1_names: entry1.name,
    team2_names: entry2 ? entry2.name : 'BYE',
    status: isBye ? 'Completed' : 'Scheduled',
    winner_team: isBye ? 'team1' : undefined,
    round,
    match_number: matchNumber,
    scores: [],
    section, // 'Main', 'Consolation', 'North', 'South', 'East', 'West'
    club_team1: entry1.club,
    club_team2: entry2?.club || ''
  };
}

/** ── Single Elimination ── */
export function generateSingleElimination(tournamentId, entries) {
  const seeded = [...entries].sort((a, b) => (a.seed || 999) - (b.seed || 999));
  const size = nextPow2(seeded.length);
  const slots = seededSlots(size);
  const padded = [...seeded];
  while (padded.length < size) padded.push(null); // byes

  // Rearrange by seeded slots
  const slotted = slots.map(s => padded[s - 1] || null);

  const matches = [];
  let mNum = 1;
  for (let i = 0; i < slotted.length; i += 2) {
    const e1 = slotted[i];
    const e2 = slotted[i + 1];
    if (e1) {
      matches.push(makeMatch(tournamentId, e1, e2, 1, mNum++, 'Main'));
    }
  }
  return matches;
}

/** ── Double Elimination ── */
export function generateDoubleElimination(tournamentId, entries) {
  // Winners bracket (same as single elim R1)
  const mainMatches = generateSingleElimination(tournamentId, entries).map(m => ({
    ...m, section: 'Winners'
  }));
  // Consolation bracket placeholder matches (filled in as losers drop)
  // For now generate R1 consolation slots = half the field
  const consolationCount = Math.floor(entries.length / 2);
  const consolationMatches = [];
  for (let i = 0; i < consolationCount; i += 2) {
    if (i + 1 < consolationCount) {
      consolationMatches.push({
        tournament_id: tournamentId,
        team1_player_ids: [],
        team2_player_ids: [],
        team1_names: 'TBD (L-R1)',
        team2_names: 'TBD (L-R1)',
        status: 'Scheduled',
        round: 2,
        match_number: i / 2 + 1,
        scores: [],
        section: 'Losers'
      });
    }
  }
  return [...mainMatches, ...consolationMatches];
}

/** ── Consolation / First Round Loser Consolation (FRLC) ── */
export function generateConsolation(tournamentId, entries) {
  // Main draw (SE) + all first-round losers go into consolation bracket
  const mainMatches = generateSingleElimination(tournamentId, entries).map(m => ({
    ...m, section: 'Main'
  }));
  // Consolation bracket — same number of matches as R1, TBD opponents
  const consMatches = mainMatches.filter(m => m.round === 1).map((m, i) => ({
    tournament_id: tournamentId,
    team1_player_ids: [],
    team2_player_ids: [],
    team1_names: 'TBD (L-Main R1)',
    team2_names: 'TBD (L-Main R1)',
    status: 'Scheduled',
    round: 2,
    match_number: i + 1,
    scores: [],
    section: 'Consolation'
  }));
  return [...mainMatches, ...consMatches];
}

/** ── Round Robin ── */
export function generateRoundRobin(tournamentId, entries) {
  const matches = [];
  let mNum = 1;
  // If odd number, add a bye
  const list = entries.length % 2 !== 0 ? [...entries, { id: 'bye', name: 'BYE', player1_id: null }] : [...entries];
  const n = list.length;
  const rounds = n - 1;

  // Circle method rotation
  const fixed = list[0];
  const rotating = list.slice(1);

  for (let r = 0; r < rounds; r++) {
    const roundEntries = [fixed, ...rotating];
    for (let i = 0; i < n / 2; i++) {
      const e1 = roundEntries[i];
      const e2 = roundEntries[n - 1 - i];
      if (e1.id !== 'bye' && e2.id !== 'bye') {
        matches.push(makeMatch(tournamentId, e1, e2, r + 1, mNum++, 'Round Robin'));
      }
    }
    // Rotate: last goes to position 1, rest shift right
    rotating.unshift(rotating.pop());
  }
  return matches;
}

/** ── Compass Draw ── */
export function generateCompassDraw(tournamentId, entries) {
  // R1 — all play (East bracket)
  const seeded = [...entries].sort((a, b) => (a.seed || 999) - (b.seed || 999));
  const size = nextPow2(seeded.length);
  const padded = [...seeded];
  while (padded.length < size) padded.push(null);

  const matches = [];
  let mNum = 1;

  // Round 1 East (main)
  for (let i = 0; i < padded.length; i += 2) {
    const e1 = padded[i];
    const e2 = padded[i + 1];
    if (e1) {
      matches.push(makeMatch(tournamentId, e1, e2 || null, 1, mNum++, 'East'));
    }
  }

  // Round 2 placeholder: winners → North, losers → West
  const r1Count = matches.filter(m => m.round === 1).length;
  for (let i = 0; i < r1Count; i += 2) {
    if (i + 1 < r1Count) {
      matches.push({
        tournament_id: tournamentId,
        team1_player_ids: [], team2_player_ids: [],
        team1_names: 'W-E R1', team2_names: 'W-E R1',
        status: 'Scheduled', round: 2, match_number: i / 2 + 1, scores: [], section: 'North'
      });
      matches.push({
        tournament_id: tournamentId,
        team1_player_ids: [], team2_player_ids: [],
        team1_names: 'L-E R1', team2_names: 'L-E R1',
        status: 'Scheduled', round: 2, match_number: i / 2 + 1, scores: [], section: 'West'
      });
    }
  }

  // Round 3 placeholder: North losers → South
  const northCount = matches.filter(m => m.section === 'North').length;
  for (let i = 0; i < northCount; i += 2) {
    if (i + 1 < northCount) {
      matches.push({
        tournament_id: tournamentId,
        team1_player_ids: [], team2_player_ids: [],
        team1_names: 'L-North R2', team2_names: 'L-North R2',
        status: 'Scheduled', round: 3, match_number: i / 2 + 1, scores: [], section: 'South'
      });
    }
  }

  return matches;
}

/** Main entry point */
export function generateDraw(format, tournamentId, entries) {
  switch (format) {
    case 'Single Elimination': return generateSingleElimination(tournamentId, entries);
    case 'Double Elimination': return generateDoubleElimination(tournamentId, entries);
    case 'Round Robin': return generateRoundRobin(tournamentId, entries);
    case 'Compass Draw': return generateCompassDraw(tournamentId, entries);
    case 'Consolation (FRLC)': return generateConsolation(tournamentId, entries);
    default: return generateSingleElimination(tournamentId, entries);
  }
}

/** Build entries array from tournament data */
export function buildEntries(tournament, players) {
  if (tournament.partnership_type === 'Fixed Partners' && tournament.partner_pairs?.length) {
    return tournament.partner_pairs.map(pair => {
      const p1 = players.find(p => p.id === pair.player1_id);
      const p2 = players.find(p => p.id === pair.player2_id);
      return {
        id: `pair_${pair.player1_id}_${pair.player2_id}`,
        name: pair.pair_name || `${p1?.full_name || '?'} / ${p2?.full_name || '?'}`,
        club: pair.club || '',
        seed: pair.seed || null,
        player1_id: pair.player1_id,
        player2_id: pair.player2_id,
        is_pair: true
      };
    });
  }
  return (tournament.player_ids || [])
    .map(id => players.find(p => p.id === id))
    .filter(Boolean)
    .map(p => ({
      id: p.id,
      name: p.full_name,
      club: p.club || '',
      seed: null,
      player1_id: p.id,
      player2_id: null,
      is_pair: false
    }));
}