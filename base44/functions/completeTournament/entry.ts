import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { tournamentId } = await req.json();
    if (!tournamentId) return Response.json({ error: 'Missing tournamentId' }, { status: 400 });

    const tournaments = await base44.asServiceRole.entities.Tournament.filter({ id: tournamentId });
    const tournament = tournaments[0];
    if (!tournament) return Response.json({ error: 'Tournament not found' }, { status: 404 });

    const playerStats = {}; // playerId -> { wins, losses }

    const addStat = (playerId, isWin) => {
      if (!playerId) return;
      if (!playerStats[playerId]) playerStats[playerId] = { wins: 0, losses: 0 };
      if (isWin) playerStats[playerId].wins++;
      else playerStats[playerId].losses++;
    };

    // ── KOTC: parse results from kotc_state ──────────────────────────────────
    if (tournament.format === 'King of the Court' && tournament.kotc_state) {
      const state = typeof tournament.kotc_state === 'string'
        ? JSON.parse(tournament.kotc_state)
        : tournament.kotc_state;

      const results = state.results || {};
      const rounds = state.rounds || [];

      for (const round of rounds) {
        const roundNum = String(round.roundNumber);
        const roundResults = results[roundNum];
        if (!roundResults) continue; // round not yet played

        for (const court of round.courts) {
          const courtNum = String(court.courtNumber);
          const winner = roundResults[courtNum]; // "A" or "B"
          if (!winner) continue;

          const winners = winner === 'A' ? court.teamA : court.teamB;
          const losers = winner === 'A' ? court.teamB : court.teamA;
          winners.forEach(id => addStat(id, true));
          losers.forEach(id => addStat(id, false));
        }
      }
    }

    // ── Standard formats: parse from Match entities ──────────────────────────
    const matches = await base44.asServiceRole.entities.Match.filter({
      tournament_id: tournamentId,
      status: 'Completed'
    });

    for (const match of matches) {
      const team1Ids = match.team1_player_ids || [];
      const team2Ids = match.team2_player_ids || [];
      if (match.winner_team === 'team1') {
        team1Ids.forEach(id => addStat(id, true));
        team2Ids.forEach(id => addStat(id, false));
      } else if (match.winner_team === 'team2') {
        team2Ids.forEach(id => addStat(id, true));
        team1Ids.forEach(id => addStat(id, false));
      }
    }

    const playerIds = Object.keys(playerStats);
    if (playerIds.length === 0) {
      // Still mark completed
      await base44.asServiceRole.entities.Tournament.update(tournamentId, { status: 'Completed' });
      return Response.json({ success: true, message: 'No player stats to update', updated: 0 });
    }

    // Fetch all players and update stats
    const allPlayers = await base44.asServiceRole.entities.Player.list('-created_date', 500);
    const relevantPlayers = allPlayers.filter(p => playerIds.includes(p.id));

    const today = new Date().toISOString().split('T')[0];

    const updatePromises = relevantPlayers.map(player => {
      const delta = playerStats[player.id];
      const newWins = (player.wins || 0) + delta.wins;
      const newLosses = (player.losses || 0) + delta.losses;
      const newMatchesPlayed = (player.matches_played || 0) + delta.wins + delta.losses;

      const ratingHistory = player.rating_history || [];
      const newRatingEntry = player.skill_rating
        ? [...ratingHistory, { date: today, rating: player.skill_rating }]
        : ratingHistory;

      return base44.asServiceRole.entities.Player.update(player.id, {
        wins: newWins,
        losses: newLosses,
        matches_played: newMatchesPlayed,
        rating_history: newRatingEntry
      });
    });

    await Promise.all(updatePromises);

    // Mark tournament as Completed
    await base44.asServiceRole.entities.Tournament.update(tournamentId, { status: 'Completed' });

    return Response.json({
      success: true,
      updated: relevantPlayers.length,
      matchesProcessed: matches.length + (tournament.format === 'King of the Court' ? Object.keys((typeof tournament.kotc_state === 'string' ? JSON.parse(tournament.kotc_state) : tournament.kotc_state).results || {}).length * 4 : 0),
      playerStats
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});