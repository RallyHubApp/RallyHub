import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SPOND_API_BASE = 'https://api.spond.com/core/v1';

async function spondLogin() {
  const email = Deno.env.get('SPOND_EMAIL');
  const password = Deno.env.get('SPOND_PASSWORD');

  if (!email || !password) {
    throw new Error('SPOND_EMAIL and SPOND_PASSWORD secrets are required');
  }

  const response = await fetch(`${SPOND_API_BASE}/auth2/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spond login failed ${response.status}: ${text}`);
  }

  const data = await response.json();
  const token = data.accessToken?.token || data.loginToken || data.token;

  if (!token) {
    throw new Error('Spond login did not return an access token');
  }

  return token;
}

async function spondRequest(path, token) {
  const response = await fetch(`${SPOND_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spond API error ${response.status}: ${text}`);
  }

  return response.json();
}

function collectAcceptedIds(event) {
  const ids = new Set();
  (event.responses?.acceptedIds || []).forEach(id => ids.add(id));
  (event.responses?.waitinglistIds || []).forEach(id => ids.add(id));
  (event.responses?.members || [])
    .filter(member => member.status === 'accepted' || member.status === 'waitinglist')
    .forEach(member => ids.add(member.uid || member.id));
  (event.responses?.responses || [])
    .filter(response => response.status === 'accepted' || response.status === 'attending')
    .forEach(response => ids.add(response.memberId || response.uid || response.id));
  return ids;
}

function buildMemberMap(group) {
  const memberMap = {};
  (group.members || []).forEach(member => {
    memberMap[member.id] = member;
  });
  (group.subGroups || []).forEach(subGroup => {
    (subGroup.members || []).forEach(member => {
      memberMap[member.id] = member;
    });
  });
  return memberMap;
}

function getAttendees(event, group) {
  const acceptedIds = collectAcceptedIds(event);
  const memberMap = buildMemberMap(group);

  return [...acceptedIds]
    .map(memberId => {
      const member = memberMap[memberId];
      if (!member) return null;

      const profile = member.profile || {};
      const firstName = profile.firstName || member.firstName || '';
      const lastName = profile.lastName || member.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();

      if (!fullName) return null;

      return {
        fullName,
        email: profile.email || member.email || '',
        phone: profile.phoneNumber || member.phoneNumber || '',
        avatarUrl: profile.pictureUrl || '',
      };
    })
    .filter(Boolean);
}

function findPlayer(attendee, players) {
  if (attendee.email) {
    const emailMatch = players.find(player => player.email && player.email.toLowerCase() === attendee.email.toLowerCase());
    if (emailMatch) return emailMatch;
  }

  return players.find(player => player.full_name && player.full_name.toLowerCase() === attendee.fullName.toLowerCase()) || null;
}

async function importTournament(base44, tournament, token, players) {
  const [event, group] = await Promise.all([
    spondRequest(`/sponds/${tournament.kotc_spond_event_id}`, token),
    spondRequest(`/groups/${tournament.kotc_spond_group_id}`, token),
  ]);

  const attendees = getAttendees(event, group);
  const playerIds = new Set(tournament.player_ids || []);
  let created = 0;
  let matched = 0;

  for (const attendee of attendees) {
    let player = findPlayer(attendee, players);

    if (!player) {
      player = await base44.asServiceRole.entities.Player.create({
        full_name: attendee.fullName,
        email: attendee.email,
        phone: attendee.phone,
        avatar_url: attendee.avatarUrl,
        status: 'Active',
        skill_rating: 3.0,
        wins: 0,
        losses: 0,
        matches_played: 0,
      });
      players.push(player);
      created += 1;
    } else {
      matched += 1;
    }

    playerIds.add(player.id);
  }

  const message = `Imported ${attendees.length} Spond attendees (${created} new, ${matched} matched).`;

  await base44.asServiceRole.entities.Tournament.update(tournament.id, {
    player_ids: [...playerIds],
    kotc_last_import_message: message,
    kotc_last_imported_at: new Date().toISOString(),
  });

  return {
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    attendees: attendees.length,
    created,
    matched,
    totalPlayers: playerIds.size,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;

    const tournaments = await base44.asServiceRole.entities.Tournament.list();
    const linkedTournaments = tournaments.filter(tournament =>
      tournament.kotc_spond_group_id &&
      tournament.kotc_spond_event_id &&
      !['Completed', 'Cancelled'].includes(tournament.status)
    );

    if (dryRun) {
      return Response.json({ success: true, dryRun: true, linkedTournamentCount: linkedTournaments.length });
    }

    if (linkedTournaments.length === 0) {
      return Response.json({ success: true, imported: 0, message: 'No linked active KOTC tournaments found.' });
    }

    const token = await spondLogin();
    const players = await base44.asServiceRole.entities.Player.list();
    const results = [];

    for (const tournament of linkedTournaments) {
      results.push(await importTournament(base44, tournament, token, players));
    }

    return Response.json({ success: true, imported: results.length, results });
  } catch (error) {
    console.error('[autoImportSpondAttendees]', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});