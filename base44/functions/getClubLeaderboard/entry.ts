import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

function ensure(stats:any, playerId:string) {
  if (!stats[playerId]) stats[playerId] = {
    player_id: playerId,
    events: new Set<string>(),
    wins: 0,
    draws: 0,
    losses: 0,
    matches_played: 0,
    points_for: 0,
    points_against: 0,
    leaderboard_points: 0,
  };
  return stats[playerId];
}

function addResult(row:any, result:'win'|'draw'|'loss', pf=0, pa=0) {
  row.matches_played += 1;
  row.points_for += Number(pf || 0);
  row.points_against += Number(pa || 0);
  if (result === 'win') { row.wins += 1; row.leaderboard_points += 2; }
  else if (result === 'draw') { row.draws += 1; row.leaderboard_points += 1; }
  else row.losses += 1;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const tenantId = String(user.active_tenant_id || '');
    const clubId = String(user.active_club_id || '');
    if (!tenantId || !clubId) return Response.json({ error: 'No active RallyHub club context.' }, { status: 400 });

    const [players, kotcAggregates, tournaments] = await Promise.all([
      base44.asServiceRole.entities.Player.filter({ tenant_id: tenantId, club_id: clubId }, 'full_name', 500),
      base44.asServiceRole.entities.KotcPlayerAggregate.filter({ tenant_id: tenantId, club_id: clubId }, '-updated_at', 500),
      base44.asServiceRole.entities.Tournament.filter({ tenant_id: tenantId }, '-created_date', 500),
    ]);

    const activePlayers = (players || []).filter((p:any) => String(p.status || 'Active').toLowerCase() === 'active');
    const byPlayer = new Map(activePlayers.map((p:any) => [String(p.id), p]));
    const stats:any = {};

    // KOTC historical aggregate remains authoritative for KOTC history. Test/demo sessions
    // are already excluded by the KOTC aggregate builder. New KOTC events can opt out via
    // Tournament.counts_toward_leaderboard; legacy pre-flag KOTC history remains intact.
    for (const a of (kotcAggregates || [])) {
      const pid = String(a.player_id || '');
      if (!byPlayer.has(pid) || Number(a.matches_played || 0) <= 0) continue;
      const row = ensure(stats, pid);
      row.wins += Number(a.wins || 0);
      row.losses += Number(a.losses || 0);
      row.matches_played += Number(a.matches_played || 0);
      row.points_for += Number(a.points_for || 0);
      row.points_against += Number(a.points_against || 0);
      row.leaderboard_points += Number(a.wins || 0) * 2;
      row.kotc_events = Number(a.sessions_played || 0);
    }

    const eligible = (tournaments || []).filter((t:any) =>
      t.counts_toward_leaderboard === true &&
      t.status === 'Completed' &&
      String(t.host_club_id || '') === clubId &&
      !String(t.description || '').includes('RALLYHUB_KOTC_SANDBOX_V1') &&
      t.format !== 'King of the Court'
    );
    const eligibleIds = new Set(eligible.map((t:any) => String(t.id)));
    const eligibleStandardIds = new Set(eligible.filter((t:any) => !['Club Challenge','Tournival','King of the Court'].includes(String(t.format || ''))).map((t:any) => String(t.id)));

    // Tournival stores its completed round results inside the Tournament state rather than Match rows.
    for (const t of eligible.filter((x:any) => x.format === 'Tournival' && x.kotc_state)) {
      let state:any = null;
      try { state = typeof t.kotc_state === 'string' ? JSON.parse(t.kotc_state) : t.kotc_state; } catch { state = null; }
      if (!state) continue;
      for (const round of (state.rounds || [])) {
        const roundResults = state.results?.[round.roundNumber] || {};
        for (const court of (round.courts || [])) {
          const result = roundResults?.[court.courtNumber];
          if (!result || !['A','B'].includes(result.winner)) continue;
          const teamA = court.teamA || [], teamB = court.teamB || [];
          for (const raw of teamA) {
            const pid = String(raw || ''); if (!pid || !byPlayer.has(pid)) continue;
            const row = ensure(stats, pid); row.events.add(String(t.id));
            addResult(row, result.winner === 'A' ? 'win' : 'loss', result.scoreA, result.scoreB);
          }
          for (const raw of teamB) {
            const pid = String(raw || ''); if (!pid || !byPlayer.has(pid)) continue;
            const row = ensure(stats, pid); row.events.add(String(t.id));
            addResult(row, result.winner === 'B' ? 'win' : 'loss', result.scoreB, result.scoreA);
          }
        }
      }
    }

    if (eligibleIds.size) {
      const [clubEvents, clubParticipants, clubMatches, tournamentParticipants, matches] = await Promise.all([
        base44.asServiceRole.entities.ClubChallengeEvent.filter({ tenant_id: tenantId }, '-created_date', 500),
        base44.asServiceRole.entities.ClubChallengeParticipant.filter({ tenant_id: tenantId }, 'display_name', 500),
        base44.asServiceRole.entities.ClubChallengeMatch.filter({ tenant_id: tenantId }, 'round_number', 500),
        base44.asServiceRole.entities.TournamentParticipant.filter({ tenant_id: tenantId }, 'display_name', 500),
        base44.asServiceRole.entities.Match.filter({ tenant_id: tenantId, status: 'Completed' }, '-created_date', 500),
      ]);

      const challengeEvents = (clubEvents || []).filter((e:any) => eligibleIds.has(String(e.tournament_id)) && e.status === 'completed');
      const challengeIds = new Set(challengeEvents.map((e:any) => String(e.id)));
      const cpById = new Map((clubParticipants || []).map((p:any) => [String(p.id), p]));

      for (const m of (clubMatches || []).filter((m:any) => challengeIds.has(String(m.challenge_event_id)) && ['completed','draw','retired','forfeit'].includes(m.status))) {
        const sides = [
          { ids: m.club_a_participant_ids || [], result: m.winner === 'club_a' ? 'win' : m.winner === 'draw' ? 'draw' : 'loss', pf: m.score_a, pa: m.score_b },
          { ids: m.club_b_participant_ids || [], result: m.winner === 'club_b' ? 'win' : m.winner === 'draw' ? 'draw' : 'loss', pf: m.score_b, pa: m.score_a },
        ];
        for (const side of sides) for (const participantId of side.ids) {
          const p:any = cpById.get(String(participantId));
          const pid = String(p?.source_player_id || '');
          if (!pid || !byPlayer.has(pid)) continue;
          const row = ensure(stats, pid);
          row.events.add(String(m.tournament_id));
          addResult(row, side.result as any, side.pf, side.pa);
        }
      }

      const tpById = new Map((tournamentParticipants || []).map((p:any) => [String(p.id), p]));
      for (const m of (matches || []).filter((m:any) => eligibleStandardIds.has(String(m.tournament_id)))) {
        const score1 = (m.scores || []).reduce((n:number, g:any) => n + Number(g.team1 || 0), 0);
        const score2 = (m.scores || []).reduce((n:number, g:any) => n + Number(g.team2 || 0), 0);
        const team1 = (m.team1_participant_ids?.length ? m.team1_participant_ids.map((id:string) => tpById.get(String(id))?.source_player_id) : m.team1_player_ids) || [];
        const team2 = (m.team2_participant_ids?.length ? m.team2_participant_ids.map((id:string) => tpById.get(String(id))?.source_player_id) : m.team2_player_ids) || [];
        for (const raw of team1) {
          const pid = String(raw || ''); if (!pid || !byPlayer.has(pid)) continue;
          const row = ensure(stats, pid); row.events.add(String(m.tournament_id));
          addResult(row, m.winner_team === 'team1' ? 'win' : 'loss', score1, score2);
        }
        for (const raw of team2) {
          const pid = String(raw || ''); if (!pid || !byPlayer.has(pid)) continue;
          const row = ensure(stats, pid); row.events.add(String(m.tournament_id));
          addResult(row, m.winner_team === 'team2' ? 'win' : 'loss', score2, score1);
        }
      }
    }

    const rows = Object.values(stats)
      .map((row:any) => {
        const p:any = byPlayer.get(String(row.player_id));
        const eventsPlayed = Number(row.kotc_events || 0) + row.events.size;
        const diff = Number(row.points_for || 0) - Number(row.points_against || 0);
        return {
          player_id: row.player_id,
          full_name: p?.full_name || 'Player',
          club: p?.club || '',
          events_played: eventsPlayed,
          wins: row.wins,
          draws: row.draws,
          losses: row.losses,
          matches_played: row.matches_played,
          win_rate: row.matches_played ? row.wins / row.matches_played : 0,
          points_for: row.points_for,
          points_against: row.points_against,
          score_difference: diff,
          avg_difference: row.matches_played ? diff / row.matches_played : 0,
          leaderboard_points: row.leaderboard_points,
        };
      })
      .filter((r:any) => r.matches_played > 0)
      .sort((a:any,b:any) =>
        b.leaderboard_points - a.leaderboard_points ||
        b.wins - a.wins ||
        b.score_difference - a.score_difference ||
        b.points_for - a.points_for ||
        String(a.full_name).localeCompare(String(b.full_name))
      )
      .map((row:any, index:number) => ({ ...row, rank:index + 1 }));

    return Response.json({ rows, playerCount: rows.length, tenantId, clubId, scoring: '2 points win · 1 draw · 0 loss' });
  } catch (error) {
    return Response.json({ error: (error as any)?.message || 'Could not load club leaderboard.' }, { status: 500 });
  }
});
