import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action, playerId } = body;

    // ── SET TEMP PASSWORD ──────────────────────────────────────────────────────
    if (action === 'set_temp_password') {
      const players = await base44.asServiceRole.entities.Player.filter({ id: playerId });
      const player = players[0];
      if (!player) return Response.json({ error: 'Player not found' }, { status: 404 });

      const tempPassword = generateTempPassword();
      // Store it plaintext on the player record — only admins can read via service role
      await base44.asServiceRole.entities.Player.update(playerId, {
        notes: (player.notes ? player.notes.replace(/\[TEMP:.*?\]/g, '') + ' ' : '') + `[TEMP:${tempPassword}]`
      });

      return Response.json({ tempPassword, playerEmail: player.email, playerName: player.full_name });
    }

    // ── CLEAR TEMP PASSWORD ────────────────────────────────────────────────────
    if (action === 'clear_temp_password') {
      const players = await base44.asServiceRole.entities.Player.filter({ id: playerId });
      const player = players[0];
      if (!player) return Response.json({ error: 'Player not found' }, { status: 404 });
      const cleanedNotes = (player.notes || '').replace(/\[TEMP:.*?\]/g, '').trim();
      await base44.asServiceRole.entities.Player.update(playerId, { notes: cleanedNotes || null });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});