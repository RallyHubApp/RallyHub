// Authenticated self-registration for legacy tournament registration links.
// Privileged tournament management has been moved to legacyTournamentManager.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

function clean(value:any, max = 200) {
  return String(value ?? '').trim().slice(0, max);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized', auth_required: true }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const tournamentId = clean(body.tournamentId, 100);
    if (!tournamentId) return Response.json({ error: 'Missing tournamentId' }, { status: 400 });

    // Legacy privileged actions are intentionally unavailable from this endpoint.
    if (body._managerProbe || ['update_kotc', 'start_kotc'].includes(body.action)) {
      return Response.json({ error: 'Tournament management is not available from the registration endpoint.' }, { status: 410 });
    }

    const tournaments = await base44.asServiceRole.entities.Tournament.filter({ id: tournamentId });
    const tournament = tournaments?.[0];
    if (!tournament) return Response.json({ error: 'Tournament not found' }, { status: 404 });

    const tournamentInfo = {
      id: tournament.id,
      name: tournament.name,
      format: tournament.format,
      start_date: tournament.start_date,
      location: tournament.location,
      player_count: Array.isArray(tournament.player_ids) ? tournament.player_ids.length : 0,
      status: tournament.status,
    };
    const clubs = tournament.host_club_id ? await base44.asServiceRole.entities.Club.filter({ id:tournament.host_club_id }) : [];
    const club = clubs?.[0] || null;
    const clubBrand = club ? { id:club.id, name:club.name, logo_url:club.logo_url || '', primary_colour:club.primary_colour || '', secondary_colour:club.secondary_colour || '' } : null;

    if (body._probe) {
      return Response.json({ success: true, tournament: tournamentInfo, club_brand:clubBrand });
    }

    if (tournament.status !== 'Registration Open') {
      return Response.json({ error: 'Registration is not open for this event.' }, { status: 409 });
    }

    const currentIds = Array.isArray(tournament.player_ids) ? tournament.player_ids : [];
    if (tournament.max_players && currentIds.length >= Number(tournament.max_players)) {
      return Response.json({ error: 'This event is full.' }, { status: 409 });
    }

    const authEmail = clean(user.email, 200).toLowerCase();
    const authName = clean(user.full_name || user.display_name || authEmail.split('@')[0] || 'Player', 120);
    if (!authEmail) return Response.json({ error: 'Your RallyHub account needs an email address to register.' }, { status: 400 });

    let player:any = null;
    const linked = await base44.asServiceRole.entities.Player.filter({
      tenant_id: tournament.tenant_id,
      user_id: user.id,
    });
    player = linked?.[0] || null;

    if (!player) {
      const exactEmail = await base44.asServiceRole.entities.Player.filter({
        tenant_id: tournament.tenant_id,
        email: authEmail,
      });
      player = exactEmail?.[0] || null;
    }

    if (!player) {
      player = await base44.asServiceRole.entities.Player.create({
        full_name: authName,
        email: authEmail,
        phone: clean(body.phone, 50) || undefined,
        user_id: user.id,
        linked_user_email: authEmail,
        status: 'Active',
        tenant_id: tournament.tenant_id,
        club_id: tournament.host_club_id || undefined,
        relationship_type: 'guest',
        relationship_status: 'active',
      });
    }

    const alreadyIn = currentIds.includes(player.id);
    if (!alreadyIn) {
      const newIds = [...currentIds, player.id];
      await base44.asServiceRole.entities.Tournament.update(tournament.id, { player_ids: newIds });
    }

    return Response.json({
      success: true,
      alreadyRegistered: alreadyIn,
      tournament: { ...tournamentInfo, player_count: tournamentInfo.player_count + (alreadyIn ? 0 : 1) },
      club_brand:clubBrand,
    });
  } catch (error) {
    console.error('publicRegister error', error?.message || error);
    return Response.json({ error: 'Unable to register for this event right now.' }, { status: 500 });
  }
});
