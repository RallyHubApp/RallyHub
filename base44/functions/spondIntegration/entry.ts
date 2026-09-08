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
  const token = data.accessToken?.token || data.loginToken || data.token;
  if (!token) throw new Error('Spond login did not return an access token');
  return token;
}

function irelandDate(value) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Dublin', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date(value));
    const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day}`;
  } catch { return ''; }
}
function normaliseName(v=''){return String(v).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();}
function normaliseEmail(v=''){return String(v).trim().toLowerCase();}
function normalisePhone(v=''){return String(v).replace(/\D/g,'').replace(/^3530?/,'353');}
function collectResponseIds(event) {
  const accepted = new Set(); const waiting = new Set();
  (event.responses?.acceptedIds || []).forEach(id => accepted.add(id));
  (event.responses?.waitinglistIds || event.responses?.waitingListIds || []).forEach(id => waiting.add(id));
  (event.responses?.members || []).forEach(m => {
    const id=m.uid||m.id||m.memberId; const status=String(m.status||'').toLowerCase();
    if(['accepted','attending','going'].includes(status)) accepted.add(id);
    if(['waitinglist','waiting_list','waitlist'].includes(status)) waiting.add(id);
  });
  (event.responses?.responses || []).forEach(r => {
    const id=r.memberId||r.uid||r.id; const status=String(r.status||'').toLowerCase();
    if(['accepted','attending','going'].includes(status)) accepted.add(id);
    if(['waitinglist','waiting_list','waitlist'].includes(status)) waiting.add(id);
  });
  return {accepted,waiting};
}
function buildMemberMap(group){const map={};(group.members||[]).forEach(m=>{map[m.id]=m;});(group.subGroups||[]).forEach(sg=>(sg.members||[]).forEach(m=>{if(!map[m.id])map[m.id]=m;}));return map;}
function attendeeFromMember(memberId,member){const profile=member?.profile||{};const firstName=profile.firstName||member?.firstName||'';const lastName=profile.lastName||member?.lastName||'';const fullName=`${firstName} ${lastName}`.trim();if(!fullName)return null;return {spondId:memberId,firstName,lastName,fullName,email:profile.email||member.email||'',phoneNumber:profile.phoneNumber||member.phoneNumber||'',avatarUrl:profile.pictureUrl||null};}
function matchAttendee(attendee,players){
  const email=normaliseEmail(attendee.email),phone=normalisePhone(attendee.phoneNumber),name=normaliseName(attendee.fullName);
  const scored=new Map();
  for(const p of players){let score=0;if(email&&normaliseEmail(p.email)===email)score+=100;if(phone&&phone.length>=7&&normalisePhone(p.phone)===phone)score+=80;if(name&&normaliseName(p.full_name)===name)score+=40;if(score>0)scored.set(p.id,{player:p,score});}
  const ranked=[...scored.values()].sort((a,b)=>b.score-a.score);
  if(!ranked.length)return {status:'new',matched:null,candidates:[]};
  const top=ranked[0]; const tied=ranked.filter(x=>x.score===top.score);
  if(tied.length>1)return {status:'ambiguous',matched:null,candidates:tied.map(x=>({id:x.player.id,name:x.player.full_name,email:x.player.email||'',phone:x.player.phone||''}))};
  return {status:'matched',matched:top.player,candidates:[{id:top.player.id,name:top.player.full_name,email:top.player.email||'',phone:top.player.phone||''}]};
}

Deno.serve(async (req) => {
  try {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action, spondEmail, spondPassword, spondToken, groupId, eventId, targetDate } = body;

  const kotcRole = user.kotc_role || (user.role === 'admin' ? 'super_admin' : 'player');
  const isSpondManager = user.role === 'admin' || ['super_admin', 'admin', 'host'].includes(kotcRole);
  if (!isSpondManager) {
    return Response.json({ error: 'Forbidden: Spond host/admin access required' }, { status: 403 });
  }
  const activeTenantId = user.active_tenant_id || null;
  const activeClubId = user.active_club_id || null;
  if (user.role !== 'admin' && (!activeTenantId || !activeClubId)) {
    return Response.json({ error: 'Forbidden: active tenant/club context required' }, { status: 403 });
  }

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

    // KOTC is normally attached to a dated RallyHub tournament. When that date is
    // available, ask Spond only for that occurrence window instead of dumping months
    // of a recurring series into the picker. If no date is supplied, show only the
    // near-term window. Spond's consumer API uses `scheduled=true` to include recurring
    // occurrences whose invitations are queued but not yet sent.
    let minStart;
    let maxStart;
    const exactDate = typeof targetDate === 'string' ? (targetDate.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '') : '';
    if (exactDate) {
      // Fetch a slightly wider UTC window, then enforce the exact Ireland-local calendar date below.
      // This avoids recurring-event drift while also handling BST/UTC day-boundary offsets safely.
      const day = new Date(`${exactDate}T00:00:00.000Z`);
      minStart = new Date(day.getTime() - 6 * 60 * 60 * 1000).toISOString();
      maxStart = new Date(day.getTime() + 30 * 60 * 60 * 1000).toISOString();
    } else {
      const day = new Date();
      day.setUTCHours(0, 0, 0, 0);
      minStart = day.toISOString();
      maxStart = new Date(day.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    }

    const params = new URLSearchParams({
      groupId,
      minStartTimestamp: minStart,
      maxStartTimestamp: maxStart,
      max: '100',
      scheduled: 'true',
      includeComments: 'false',
      includeHidden: 'false',
      addProfileInfo: 'true',
    });
    const events = await spondRequest(`/sponds?${params.toString()}`, spondToken);
    const irelandDate = (value) => {
      try {
        const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Dublin', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date(value));
        const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
        return `${p.year}-${p.month}-${p.day}`;
      } catch { return ''; }
    };
    const simplified = (Array.isArray(events) ? events : [])
      .filter(e => e?.startTimestamp && new Date(e.startTimestamp) >= new Date(minStart) && new Date(e.startTimestamp) <= new Date(maxStart))
      .filter(e => !exactDate || irelandDate(e.startTimestamp) === exactDate)
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

    // Fetch event and group in parallel
    const [event, group] = await Promise.all([
      spondRequest(`/sponds/${eventId}`, spondToken),
      spondRequest(`/groups/${groupId}`, spondToken),
    ]);

    console.log('[DEBUG] event.responses keys:', Object.keys(event.responses || {}));
    console.log('[DEBUG] event.responses sample:', JSON.stringify(event.responses).substring(0, 500));

    // Handle all known Spond response formats. Only confirmed/accepted attendees belong
    // on the KOTC playing roster. Waiting-list members are intentionally excluded until
    // Spond promotes them to accepted, otherwise RallyHub could overbook the session.
    const acceptedIds = new Set();
    const waitingIds = new Set();
    // Format 1: flat id arrays
    (event.responses?.acceptedIds || []).forEach(id => acceptedIds.add(id));
    (event.responses?.waitinglistIds || []).forEach(id => waitingIds.add(id));
    // Format 2: members array with status per member
    (event.responses?.members || []).forEach(m => {
      if (m.status === 'accepted' || m.status === 'attending') acceptedIds.add(m.uid || m.id);
      if (m.status === 'waitinglist') waitingIds.add(m.uid || m.id);
    });
    // Format 3: responses array with memberId + status
    (event.responses?.responses || []).forEach(r => {
      if (r.status === 'accepted' || r.status === 'attending') acceptedIds.add(r.memberId || r.uid || r.id);
      if (r.status === 'waitinglist') waitingIds.add(r.memberId || r.uid || r.id);
    });

    // Build member map from group — include subgroup members too
    const memberMap = {};
    (group.members || []).forEach(m => { memberMap[m.id] = m; });
    (group.subGroups || []).forEach(sg => {
      (sg.members || []).forEach(m => { if (!memberMap[m.id]) memberMap[m.id] = m; });
    });
    console.log('[DEBUG] memberMap size:', Object.keys(memberMap).length);
    console.log('[DEBUG] acceptedIds count:', acceptedIds.size);

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

    // Match only against players the signed-in host is authorised to see.
    const existingPlayers = user.role === 'admin'
      ? await base44.asServiceRole.entities.Player.list()
      : await base44.asServiceRole.entities.Player.filter({ tenant_id: activeTenantId, club_id: activeClubId });
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

    return Response.json({ attendees: matchResults, waitingListCount: waitingIds.size });
  }

  // ── Action: import_attendees ──
  if (action === 'import_attendees') {
    const { attendees, tournamentId, replaceRoster } = body;
    if (!attendees || !tournamentId) {
      return Response.json({ error: 'attendees and tournamentId required' }, { status: 400 });
    }

    const tournaments = await base44.asServiceRole.entities.Tournament.filter({ id: tournamentId });
    const tournament = tournaments[0];
    if (!tournament) return Response.json({ error: 'Tournament not found' }, { status: 404 });
    if (user.role !== 'admin' && (tournament.tenant_id !== activeTenantId || tournament.host_club_id !== activeClubId)) {
      return Response.json({ error: 'Forbidden: tournament belongs to another tenant/club' }, { status: 403 });
    }

    const tournamentTenantId = tournament.tenant_id || activeTenantId;
    const tournamentClubId = tournament.host_club_id || activeClubId;
    const authorisedPlayers = await base44.asServiceRole.entities.Player.filter({ tenant_id: tournamentTenantId, club_id: tournamentClubId });
    const authorisedPlayerIds = new Set(authorisedPlayers.map(p => p.id));
    // For KOTC a Spond "Refresh" should be a true roster sync, not an additive import:
    // people often decline or move off/on the list shortly before play. Other tournament
    // flows can still request additive behaviour by omitting replaceRoster.
    const existingPlayerIds = new Set(replaceRoster === true ? [] : (tournament.player_ids || []).filter(id => authorisedPlayerIds.has(id)));
    const createdPlayers = [];
    const matchedPlayers = [];

    for (const attendee of attendees) {
      if (attendee.existingPlayerId) {
        // Never trust a client-supplied Player ID outside this tournament's tenant/club.
        if (!authorisedPlayerIds.has(attendee.existingPlayerId)) {
          return Response.json({ error: 'Forbidden: player belongs to another tenant/club' }, { status: 403 });
        }
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
          tenant_id: tournamentTenantId,
          club_id: tournamentClubId,
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
  } catch (error) {
    console.error('[ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});