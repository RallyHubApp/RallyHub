import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email, tempPassword, newPassword, action } = body;

    if (!email || !tempPassword) {
      return Response.json({ error: 'Email and temp password are required' }, { status: 400 });
    }

    // Find player by email using service role
    const players = await base44.asServiceRole.entities.Player.list();
    const player = players.find(p => p.email?.toLowerCase() === email.toLowerCase());

    if (!player) {
      return Response.json({ error: 'No account found for this email' }, { status: 404 });
    }

    // Extract temp password from notes field
    const match = (player.notes || '').match(/\[TEMP:(.*?)\]/);
    if (!match) {
      return Response.json({ error: 'No temporary password set for this account. Please contact your admin.' }, { status: 400 });
    }

    const storedTemp = match[1];
    if (storedTemp !== tempPassword) {
      return Response.json({ error: 'Invalid temporary password' }, { status: 401 });
    }

    // ── VERIFY ONLY (check temp password is valid) ─────────────────────────────
    if (action === 'verify') {
      return Response.json({ valid: true, playerName: player.full_name, email: player.email });
    }

    // ── VALIDATED — clear temp token, send password reset email ──────────────
    if (action === 'change_password') {
      // Clear the temp password now that it's been validated
      const cleanedNotes = (player.notes || '').replace(/\[TEMP:.*?\]/g, '').trim();
      await base44.asServiceRole.entities.Player.update(player.id, { notes: cleanedNotes || null });

      // Trigger password reset email via platform
      await base44.auth.resetPasswordRequest(email);

      return Response.json({ success: true, email: player.email });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});