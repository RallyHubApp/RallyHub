import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SPOND_API_BASE = 'https://api.spond.com/core/v1';

async function spondRequest(path, token) {
  const res = await fetch(`${SPOND_API_BASE}${path}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spond API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function spondLogin(username, password) {
  const res = await fetch(`${SPOND_API_BASE}/auth2/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: username, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spond login failed ${res.status}: ${text}`);
  }
  const data = await res.json();
  // New endpoint returns { accessToken: { token, expiration }, refreshToken, passwordToken }
  return data.accessToken?.token || data.loginToken || data.token;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action, spondEmail, spondPassword, spondToken, groupId, eventId } = body;

  // ── Action: login ──
  if (action === 'login') {
    if (!spondEmail || !spondPassword) {
      return Response.json({ error: 'Email and password required' }, { status: 400 });
    }
    const token = await spondLogin(spondEmail, spondPassword);
    return Response.json({ token });
  }

  // All other actions require a token
  if (!spondToken) {
    return Response.json({ error: 'spondToken required' }, { status: 400 });
  }

  // ── Action: get_groups ──
  if (action === 'get_groups') {
    const groups = await spondRequest('/groups', spondToken);
    const simplified = groups.map(g => ({
      id: g.id,
      name: g.name,
      memberCount: g.members?.length || 0,
    }));
    return Response.json({ groups: simplified });
  }

  // ── Action: get_events ──
  if (action === 'get_events') {
    if (!groupId) return Response.json({ error: 'groupId required' }, { status: 400 });
    const now = new Date().toISOString();
    const future = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const events = await spondRequest(
      `/sponds?groupId=${groupId}&minEndTimestamp=${now}&maxEndTimestamp=${future}&includeComments=false&includeHidden=false&addProfileInfo=true`,
      spondToken
    );
    const simplified = (Array.isArray(events) ? events : [])
      .sort((a, b) => new Date(a.startTimestamp) - new Date(b.startTimestamp))
      .map(e => ({
        id: e.id,
        heading: e.heading,
        startTimestamp: e.startTimestamp,
        endTimestamp: e.endTimestamp,
        location: e.location?.address || e.location?.feature || '',
        attendingCount: (e.responses?.acceptedIds || []).length,
        declinedCount: (e.responses?.declinedIds || []).length,
        unansweredCount: (e.responses?.unansweredIds || []).length,
      }));
    return Response.json({ events: simplified });
  }

  // ── Action: get_attendees ──
  if (action === 'get_attendees') {
    if (!groupId || !eventId) {
      return Response.json({ error: 'groupId and eventId required' }, { status: 400 });
    }

    // Fetch the specific event with full member info
    const event = await spondRequest(`/sponds/${eventId}`, spondToken);
    const group = await spondRequest(`/groups/${groupId}`, spondToken);

    const acceptedIds = new Set([
      ...(event.responses?.acceptedIds || []),
      ...(event.responses?.waitinglistIds || []),
    ]);

    // Build member map from group
    const memberMap = {};
    (group.members || []).forEach(m => {
      memberMap[m.id] = m;
    });

    const attendees = [];
    for (const memberId of acceptedIds) {
      const member = memberMap[memberId];
      if (!member) continue;
      const profile = member.profile || {};
      attendees.push({
        spondId: memberId,
        firstName: profile.firstName || member.firstName || '',
        lastName: profile.lastName || member.lastName || '',
        fullName: `${profile.firstName || member.firstName || ''} ${profile.lastName || member.lastName || ''}`.trim(),
        email: profile.email || member.email || '',
        phoneNumber: profile.phoneNumber || member.phoneNumber || '',
        avatarUrl: profile.pictureUrl || null,
      });
    }

    // Now match against existing players in DB
    const existingPlayers = await base44.asServiceRole.entities.Player.list();
    const matchResults = attendees.map(attendee => {
      // 1. Match by email
      let matched = existingPlayers.find(
        p => p.email && attendee.email && p.email.toLowerCase() === attendee.email.toLowerCase()
      );
      // 2. Match by name similarity
      if (!matched && attendee.fullName) {
        matched = existingPlayers.find(
          p => p.full_name && p.full_name.toLowerCase() === attendee.fullName.toLowerCase()
        );
      }
      return {
        ...attendee,
        existingPlayerId: matched?.id || null,
        existingPlayerName: matched?.full_name || null,
        skillRating: matched?.skill_rating || null,
        status: matched ? 'matched' : 'new',
      };
    });

    return Response.json({ attendees: matchResults });
  }

  // ── Action: import_attendees ──
  if (action === 'import_attendees') {
    const { attendees, tournamentId } = body;
    if (!attendees || !tournamentId) {
      return Response.json({ error: 'attendees and tournamentId required' }, { status: 400 });
    }

    const tournaments = await base44.asServiceRole.entities.Tournament.filter({ id: tournamentId });
    const tournament = tournaments[0];
    if (!tournament) return Response.json({ error: 'Tournament not found' }, { status: 404 });

    const existingPlayerIds = new Set(tournament.player_ids || []);
    const createdPlayers = [];
    const matchedPlayers = [];

    for (const attendee of attendees) {
      if (attendee.existingPlayerId) {
        // Use existing
        if (!existingPlayerIds.has(attendee.existingPlayerId)) {
          existingPlayerIds.add(attendee.existingPlayerId);
          matchedPlayers.push(attendee.existingPlayerId);
        }
      } else {
        // Create new player
        const newPlayer = await base44.asServiceRole.entities.Player.create({
          full_name: attendee.fullName,
          email: attendee.email || '',
          phone: attendee.phoneNumber || '',
          avatar_url: attendee.avatarUrl || '',
          status: 'Active',
          skill_rating: 3.0,
          wins: 0,
          losses: 0,
          matches_played: 0,
        });
        existingPlayerIds.add(newPlayer.id);
        createdPlayers.push(newPlayer.id);
      }
    }

    // Update tournament
    await base44.asServiceRole.entities.Tournament.update(tournamentId, {
      player_ids: [...existingPlayerIds],
    });

    return Response.json({
      success: true,
      created: createdPlayers.length,
      matched: matchedPlayers.length,
      total: existingPlayerIds.size,
    });
  }

  return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
});