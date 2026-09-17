import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const tenantId = String(user.active_tenant_id || '');
    const clubId = String(user.active_club_id || '');
    if (!tenantId || !clubId) {
      return Response.json({ error: 'No active RallyHub club context.' }, { status: 400 });
    }

    const [aggregates, players] = await Promise.all([
      base44.asServiceRole.entities.KotcPlayerAggregate.filter({ tenant_id: tenantId, club_id: clubId }),
      base44.asServiceRole.entities.Player.filter({ tenant_id: tenantId, club_id: clubId }),
    ]);
    const byPlayer = new Map((players || []).map((p:any) => [String(p.id), p]));
    const rows = (aggregates || [])
      .filter((a:any) => Number(a.matches_played || 0) > 0 && byPlayer.has(String(a.player_id)))
      .map((a:any) => {
        const p:any = byPlayer.get(String(a.player_id));
        const played = Number(a.matches_played || 0);
        const wins = Number(a.wins || 0);
        const losses = Number(a.losses || 0);
        const pf = Number(a.points_for || 0);
        const pa = Number(a.points_against || 0);
        return {
          player_id: a.player_id,
          full_name: p?.full_name || 'Player',
          club: p?.club || '',
          sessions_played: Number(a.sessions_played || 0),
          wins,
          losses,
          matches_played: played,
          win_rate: played ? wins / played : 0,
          points_for: pf,
          points_against: pa,
          score_difference: pf - pa,
          court1_rounds: Number(a.court1_rounds || 0),
          best_session_rank: a.best_session_rank == null ? null : Number(a.best_session_rank),
          last_session_id: a.last_session_id || null,
          updated_at: a.updated_at || null,
        };
      })
      // Use the same historical signal already used by KOTC's "Previous KOTC"
      // seeding option: win rate first, then Court 1 experience and best session rank.
      .sort((a:any,b:any) =>
        b.win_rate - a.win_rate ||
        b.wins - a.wins ||
        b.score_difference - a.score_difference ||
        b.court1_rounds - a.court1_rounds ||
        Number(a.best_session_rank ?? 999) - Number(b.best_session_rank ?? 999) ||
        String(a.full_name).localeCompare(String(b.full_name))
      )
      .map((row:any,index:number) => ({ ...row, rank:index + 1 }));

    return Response.json({ rows, playerCount: rows.length, tenantId, clubId });
  } catch (error) {
    return Response.json({ error: (error as any)?.message || 'Could not load KOTC leaderboard.' }, { status: 500 });
  }
});
