import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const body = await req.json();
  const { tournamentId, full_name, email, phone, _probe } = body;

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
    return Response.json({ success: true, tournament: tournamentInfo });
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
});