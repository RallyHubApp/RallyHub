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

    // Fetch all completed matches for this tournament
    const matches = await base44.asServiceRole.entities.Match.filter({
      tournament_id: tournamentId,
      status: 'Completed'
    });

    if (matches.length === 0) {
      return Response.json({ success: true, message: 'No completed matches to process', updated: 0 });
    }

    // Tally wins/losses per player
    const playerStats = {}; // playerId -> { wins, losses }

    const addStat = (playerId, isWin) => {
      if (!playerStats[playerId]) playerStats[playerId] = { wins: 0, losses: 0 };
      if (isWin) playerStats[playerId].wins++;
      else playerStats[playerId].losses++;
    };

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

    // Fetch all affected players and update their stats
    const playerIds = Object.keys(playerStats);
    if (playerIds.length === 0) {
      return Response.json({ success: true, message: 'No player IDs found in matches', updated: 0 });
    }

    // Fetch players in batches
    const allPlayers = await base44.asServiceRole.entities.Player.list('-created_date', 500);
    const relevantPlayers = allPlayers.filter(p => playerIds.includes(p.id));

    // Update each player's stats
    const updatePromises = relevantPlayers.map(player => {
      const delta = playerStats[player.id];
      const newWins = (player.wins || 0) + delta.wins;
      const newLosses = (player.losses || 0) + delta.losses;
      const newMatchesPlayed = (player.matches_played || 0) + delta.wins + delta.losses;

      // Append rating history entry if skill_rating exists
      const ratingHistory = player.rating_history || [];
      const newRatingEntry = player.skill_rating
        ? [...ratingHistory, { date: new Date().toISOString().split('T')[0], rating: player.skill_rating }]
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
      matchesProcessed: matches.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});