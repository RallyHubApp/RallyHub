// publicRegister — handles both public registration AND public tournament management
// (start round, save results, next round) via service role so no login required
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { tournamentId, full_name, email, phone, _probe, action, kotc_state, kotc_current_round, status, player_ids,
            kotc_num_courts, kotc_num_rounds, kotc_score_format } = body;

    if (!tournamentId) {
      return Response.json({ error: 'Missing tournamentId' }, { status: 400 });
    }

    // Fetch tournament using service role (bypasses RLS for public access)
    const tournaments = await base44.asServiceRole.entities.Tournament.filter({ id: tournamentId });
    const tournament = tournaments[0];
    if (!tournament) {
      return Response.json({ error: 'Tournament not found' }, { status: 404 });
    }

    const tournamentInfo = {
      id: tournament.id,
      name: tournament.name,
      format: tournament.format,
      start_date: tournament.start_date,
      location: tournament.location,
      player_count: tournament.player_ids?.length || 0,
    };

    // Probe: just return tournament info without registering
    if (_probe) {
      const playerIds = tournament.player_ids || [];
      let players = [];
      if (playerIds.length > 0) {
        players = await base44.asServiceRole.entities.Player.list(undefined, 200);
        players = players.filter(p => playerIds.includes(p.id));
      }
      return Response.json({ success: true, tournament, players });
    }

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update tournament state (admin-only)
    if (action === 'update_kotc' || action === 'start_kotc') {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }

      const updateData = {};
      if (kotc_state !== undefined) updateData.kotc_state = kotc_state;
      if (kotc_current_round !== undefined) updateData.kotc_current_round = kotc_current_round;
      if (status !== undefined) updateData.status = status;
      if (player_ids !== undefined) updateData.player_ids = player_ids;
      if (kotc_num_courts !== undefined) updateData.kotc_num_courts = kotc_num_courts;
      if (kotc_num_rounds !== undefined) updateData.kotc_num_rounds = kotc_num_rounds;
      if (kotc_score_format !== undefined) updateData.kotc_score_format = kotc_score_format;
      await base44.asServiceRole.entities.Tournament.update(tournamentId, updateData);
      return Response.json({ success: true });
    }

    if (!full_name?.trim()) {
      return Response.json({ error: 'Missing full_name' }, { status: 400 });
    }

    // Find or create player
    let player = null;
    if (email?.trim()) {
      const existing = await base44.asServiceRole.entities.Player.filter({ email: email.trim() });
      player = existing[0] || null;
    }

    if (!player) {
      player = await base44.asServiceRole.entities.Player.create({
        full_name: full_name.trim(),
        email: email?.trim() || undefined,
        phone: phone?.trim() || undefined,
        status: 'Active',
      });
    }

    // Add to tournament if not already registered
    const alreadyIn = tournament.player_ids?.includes(player.id);
    if (!alreadyIn) {
      const newIds = [...(tournament.player_ids || []), player.id];
      await base44.asServiceRole.entities.Tournament.update(tournament.id, { player_ids: newIds });
    }

    return Response.json({
      success: true,
      alreadyRegistered: alreadyIn,
      tournament: { ...tournamentInfo, player_count: tournamentInfo.player_count + (alreadyIn ? 0 : 1) },
    });

  } catch (error) {
    console.error('publicRegister error:', error?.message, error?.stack);
    return Response.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
});