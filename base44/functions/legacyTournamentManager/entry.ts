import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

function activeNow(access:any) {
  if (!access || access.status !== 'active') return false;
  const now = Date.now();
  if (access.starts_at && Date.parse(access.starts_at) > now) return false;
  if (access.ends_at && Date.parse(access.ends_at) < now) return false;
  return true;
}

function clean(value:any, max = 200) {
  return String(value ?? '').trim().slice(0, max);
}

async function canManageTournament(base44:any, user:any, tournament:any) {
  if (user?.role === 'admin') return true;
  if (!user || user.approval_status !== 'approved') return false;

  const grants = await base44.asServiceRole.entities.TournamentUserAccess.filter({
    tournament_id: tournament.id,
    user_id: user.id,
    status: 'active',
  });
  if ((grants || []).some((g:any) => activeNow(g) && ['event_manager', 'event_host'].includes(g.role))) {
    return true;
  }

  const tenantAccess = await base44.asServiceRole.entities.TenantUserAccess.filter({
    tenant_id: tournament.tenant_id,
    user_id: user.id,
    status: 'active',
  });
  if ((tenantAccess || []).some((g:any) => activeNow(g) && ['owner', 'admin'].includes(g.role))) {
    return true;
  }

  if (tournament.host_club_id) {
    const clubAccess = await base44.asServiceRole.entities.ClubUserAccess.filter({
      tenant_id: tournament.tenant_id,
      club_id: tournament.host_club_id,
      user_id: user.id,
      status: 'active',
    });
    if ((clubAccess || []).some((g:any) => activeNow(g) && g.permission_bundle === 'club_admin')) {
      return true;
    }
  }

  return false;
}

async function audit(base44:any, user:any, tournament:any, action:string, after:any) {
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      tenant_id: tournament.tenant_id || 'platform',
      club_id: tournament.host_club_id || undefined,
      user_id: user.id,
      action,
      entity_type: 'Tournament',
      entity_id: tournament.id,
      scope_type: 'tournament',
      scope_id: tournament.id,
      after_state: JSON.stringify(after),
      reason: 'legacy_tournament_manager',
    });
  } catch (error) {
    console.warn('legacyTournamentManager audit failed', error?.message || error);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const tournamentId = clean(body.tournamentId, 100);
    const action = clean(body.action, 40);
    if (!tournamentId || !action) {
      return Response.json({ error: 'tournamentId and action are required' }, { status: 400 });
    }

    const tournaments = await base44.asServiceRole.entities.Tournament.filter({ id: tournamentId });
    const tournament = tournaments?.[0];
    if (!tournament) return Response.json({ error: 'Tournament not found' }, { status: 404 });

    if (!(await canManageTournament(base44, user, tournament))) {
      return Response.json({ error: 'Forbidden: tournament management access required' }, { status: 403 });
    }

    if (action === 'get_state') {
      const playerIds = Array.isArray(tournament.player_ids) ? tournament.player_ids : [];
      let players:any[] = [];
      if (playerIds.length) {
        const tenantPlayers = await base44.asServiceRole.entities.Player.filter({ tenant_id: tournament.tenant_id });
        players = (tenantPlayers || [])
          .filter((p:any) => playerIds.includes(p.id))
          .map((p:any) => ({ id: p.id, full_name: p.full_name, skill_rating: p.skill_rating, avatar_url: p.avatar_url }));
      }
      return Response.json({ success: true, tournament, players });
    }

    if (action === 'register_player') {
      const fullName = clean(body.full_name, 120);
      const email = clean(body.email, 200).toLowerCase();
      const phone = clean(body.phone, 50);
      if (!fullName) return Response.json({ error: 'Player name is required' }, { status: 400 });

      let player:any = null;
      if (email) {
        const existing = await base44.asServiceRole.entities.Player.filter({ email, tenant_id: tournament.tenant_id });
        player = existing?.[0] || null;
      }
      if (!player) {
        player = await base44.asServiceRole.entities.Player.create({
          full_name: fullName,
          email: email || undefined,
          phone: phone || undefined,
          status: 'Active',
          tenant_id: tournament.tenant_id,
          club_id: tournament.host_club_id || undefined,
          relationship_type: 'guest',
          relationship_status: 'active',
        });
      }

      const current = Array.isArray(tournament.player_ids) ? tournament.player_ids : [];
      if (!current.includes(player.id)) {
        const next = [...current, player.id];
        if (next.length > 200) return Response.json({ error: 'Tournament roster limit reached' }, { status: 400 });
        await base44.asServiceRole.entities.Tournament.update(tournament.id, { player_ids: next });
        await audit(base44, user, tournament, 'legacy_tournament_player_added', { player_id: player.id, player_count: next.length });
      }
      return Response.json({ success: true, player: { id: player.id, full_name: player.full_name } });
    }

    if (action === 'update_kotc' || action === 'start_kotc') {
      const updateData:any = {};

      if (body.kotc_state !== undefined) {
        const state = String(body.kotc_state);
        if (state.length > 1_000_000) return Response.json({ error: 'Session state is too large' }, { status: 400 });
        try { JSON.parse(state); } catch { return Response.json({ error: 'Invalid session state' }, { status: 400 }); }
        updateData.kotc_state = state;
      }
      if (body.kotc_current_round !== undefined) {
        const value = Number(body.kotc_current_round);
        if (!Number.isInteger(value) || value < 0 || value > 200) return Response.json({ error: 'Invalid current round' }, { status: 400 });
        updateData.kotc_current_round = value;
      }
      if (body.kotc_num_courts !== undefined) {
        const value = Number(body.kotc_num_courts);
        if (!Number.isInteger(value) || value < 1 || value > 16) return Response.json({ error: 'Invalid number of courts' }, { status: 400 });
        updateData.kotc_num_courts = value;
      }
      if (body.kotc_num_rounds !== undefined) {
        const value = Number(body.kotc_num_rounds);
        if (!Number.isInteger(value) || value < 1 || value > 100) return Response.json({ error: 'Invalid number of rounds' }, { status: 400 });
        updateData.kotc_num_rounds = value;
      }
      if (body.kotc_score_format !== undefined) {
        updateData.kotc_score_format = clean(body.kotc_score_format, 50);
      }
      if (body.status !== undefined) {
        const requested = clean(body.status, 40);
        const mapped = requested === 'Group Complete' ? 'In Progress' : requested;
        if (!['Draft', 'Registration Open', 'In Progress', 'Completed', 'Cancelled'].includes(mapped)) {
          return Response.json({ error: 'Invalid tournament status' }, { status: 400 });
        }
        updateData.status = mapped;
      }
      if (body.player_ids !== undefined) {
        if (!Array.isArray(body.player_ids) || body.player_ids.length > 200 || body.player_ids.some((id:any) => typeof id !== 'string')) {
          return Response.json({ error: 'Invalid player roster' }, { status: 400 });
        }
        const tenantPlayers = await base44.asServiceRole.entities.Player.filter({ tenant_id: tournament.tenant_id });
        const validIds = new Set((tenantPlayers || []).map((p:any) => p.id));
        const guestIds = new Set((tournament.kotc_guest_roster || []).map((g:any) => g.guest_id));
        if (body.player_ids.some((id:string) => !validIds.has(id) && !guestIds.has(id))) {
          return Response.json({ error: 'Roster contains a player outside this tournament tenant' }, { status: 400 });
        }
        updateData.player_ids = [...new Set(body.player_ids)];
      }

      if (!Object.keys(updateData).length) {
        return Response.json({ error: 'No permitted tournament fields supplied' }, { status: 400 });
      }

      await base44.asServiceRole.entities.Tournament.update(tournament.id, updateData);
      await audit(base44, user, tournament, action === 'start_kotc' ? 'legacy_tournament_started' : 'legacy_tournament_updated', updateData);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('legacyTournamentManager error', error?.message || error);
    return Response.json({ error: 'Unable to process the tournament request right now.' }, { status: 500 });
  }
});
