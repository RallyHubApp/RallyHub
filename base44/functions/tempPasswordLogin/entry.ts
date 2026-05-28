import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email, tempPassword, action } = body;

    if (!email || !tempPassword) {
      return Response.json({ error: 'Email and temp password are required' }, { status: 400 });
    }
    if (user.role !== 'admin' && user.email?.toLowerCase() !== email.toLowerCase()) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const players = await base44.asServiceRole.entities.Player.filter({ email: email.toLowerCase() });
    const player = players[0];

    if (!player) {
      return Response.json({ error: 'No account found for this email' }, { status: 404 });
    }

    const match = (player.notes || '').match(/\[TEMP:(.*?)\]/);
    if (!match) {
      return Response.json({ error: 'No temporary password set for this account. Please contact your admin.' }, { status: 400 });
    }

    const storedTemp = match[1];
    if (storedTemp !== tempPassword) {
      return Response.json({ error: 'Invalid temporary password' }, { status: 401 });
    }

    if (action === 'verify') {
      return Response.json({ valid: true, playerName: player.full_name, email: player.email });
    }

    if (action === 'change_password') {
      const cleanedNotes = (player.notes || '').replace(/\[TEMP:.*?\]/g, '').trim();
      await base44.asServiceRole.entities.Player.update(player.id, { notes: cleanedNotes || null });
      await base44.auth.resetPasswordRequest(email);

      return Response.json({ success: true, email: player.email });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});