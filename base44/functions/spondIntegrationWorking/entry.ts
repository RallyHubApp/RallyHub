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

async function fetchEventOccurrence(groupId, eventId, token, hintStart='', hintHeading='') {
  try {
    return await spondRequest(`/sponds/${eventId}`, token);
  } catch (directError) {
    const hintTime = hintStart ? new Date(hintStart).getTime() : NaN;
    const centre = Number.isFinite(hintTime) ? hintTime : Date.now();
    const minStart = new Date(centre - 2 * 24 * 60 * 60 * 1000).toISOString();
    const maxStart = new Date(centre + 2 * 24 * 60 * 60 * 1000).toISOString();
    const params = new URLSearchParams({groupId:String(groupId),minStartTimestamp:minStart,maxStartTimestamp:maxStart,max:'200',scheduled:'true',includeComments:'false',includeHidden:'false',addProfileInfo:'true'});
    const listed = await spondRequest(`/sponds?${params.toString()}`, token);
    const events = Array.isArray(listed) ? listed : [];
    const exactId = events.find(e => String(e.id) === String(eventId));
    if (exactId) return exactId;
    const exactHint = events.find(e => {
      const sameTime = hintStart && eventStart(e) && Math.abs(new Date(eventStart(e)).getTime() - new Date(hintStart).getTime()) < 60000;
      const sameHeading = hintHeading && String(e.heading||'').trim().toLowerCase() === String(hintHeading).trim().toLowerCase();
      return sameTime && sameHeading;
    });
    if (exactHint) return exactHint;
    throw new Error(`Spond occurrence could not be opened. ${directError?.message || ''}`.trim());
  }
}

async function fetchGroupForAttendees(groupId, token) {
  try {
    return await spondRequest(`/groups/${groupId}`, token);
  } catch (directError) {
    const groups = await spondRequest('/groups', token);
    const group = (Array.isArray(groups) ? groups : []).find(g => String(g.id) === String(groupId));
    if (group) return group;
    throw new Error(`Spond group details could not be loaded. ${directError?.message || ''}`.trim());
  }
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

function eventStart(event){return event?._resolvedStartTimestamp||event?.meetupTimestamp||event?.startTimestamp||event?.start_time||'';}
function occurrenceStartInWindow(event,minMs,maxMs){
  const candidates=[event?.meetupTimestamp,event?.startTimestamp,event?.start_time].filter(Boolean);
  const valid=candidates.map(value=>({value,t:new Date(value).getTime()})).filter(x=>Number.isFinite(x.t)&&x.t>=minMs&&x.t<=maxMs).sort((a,b)=>a.t-b.t);
  return valid[0]?.value||'';
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
function attendeeFromMember(memberId,member){const profile=member?.profile||{};const firstName=profile.firstName||member?.firstName||'';const lastName=profile.lastName||member?.lastName||'';const fullName=`${firstName} ${lastName}`.trim();if(!fullName)return null;return {spondId:memberId,firstName,lastName,fullName,email:profile.email||member.email||'',phoneNumber:profile.phoneNumber||member.phoneNumber||'',avatarUrl:profile.pictureUrl||null,gender:profile.gender||member?.gender||''};}
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

const clean = (value, max=500) => String(value ?? '').trim().slice(0, max);
const slugPart = value => clean(value, 180).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'spond';

async function directoryAccessAllowed(base44, user, listingSlug) {
  if (user.role === 'admin') return true;
  if (!listingSlug) return false;
  const access = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug: listingSlug, user_id: user.id, status: 'active' });
  return !!access?.length;
}

async function interclubManagerAllowed(base44, user, eventId) {
  if (user.role === 'admin') return true;
  if (!eventId) return false;
  const events = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:String(eventId) });
  const event = events?.[0];
  if (!event) return false;
  const now = Date.now();
  const inWindow = row => row && row.status === 'active' && (!row.starts_at || Date.parse(row.starts_at) <= now) && (!row.ends_at || Date.parse(row.ends_at) >= now);
  const [tournamentAccess, challengeAccess] = await Promise.all([
    base44.asServiceRole.entities.TournamentUserAccess.filter({ tournament_id:event.tournament_id, tenant_id:event.tenant_id, user_id:user.id, status:'active' }),
    base44.asServiceRole.entities.ClubChallengeScorer.filter({ challenge_event_id:event.id, tenant_id:event.tenant_id, user_id:user.id, active:true }),
  ]);
  return (tournamentAccess || []).filter(inWindow).some(row => ['event_manager','event_host'].includes(row.role)) ||
    (challengeAccess || []).some(row => ['owner','organiser'].includes(row.role));
}

async function directorySpondToken(user, body) {
  if (body.spondToken) return body.spondToken;
  if (user.role !== 'admin') return null;
  const email = Deno.env.get('SPOND_EMAIL');
  const password = Deno.env.get('SPOND_PASSWORD');
  if (!email || !password) return null;
  return await spondLogin(email, password);
}

function dublinParts(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-IE', {
    timeZone: 'Europe/Dublin', weekday:'long', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23'
  }).formatToParts(date);
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return { day:p.weekday, date:`${p.year}-${p.month}-${p.day}`, time:`${p.hour}:${p.minute}` };
}

function directoryEventPreview(events) {
  const patterns = new Map();
  const venues = new Map();
  for (const event of events || []) {
    const startRaw = eventStart(event);
    const start = dublinParts(startRaw);
    if (!start) continue;
    const end = dublinParts(event?.endTimestamp || '');
    const locationName = clean(event?.location?.feature || event?.location?.name || event?.location?.address || 'Spond venue', 220);
    const address = clean(event?.location?.address || '', 320);
    const venueKey = normaliseName(`${locationName}|${address}`);
    if (!venues.has(venueKey)) {
      venues.set(venueKey, {
        id:`spond-${slugPart(locationName)}-${venues.size+1}`,
        name:locationName,
        shortName:locationName,
        address:address || null,
        eircode:null,
        indoor:null,
        courts:null,
        latitude:null,
        longitude:null,
        mapUrl:null,
        websiteUrl:null,
        playType:'Contact club',
        source:'Spond',
      });
    }
    const venue = venues.get(venueKey);
    const heading = clean(event?.heading || 'Club Session', 180);
    const key = [heading,start.day,start.time,end?.time||'',venue.id].join('|');
    if (!patterns.has(key)) {
      patterns.set(key, {
        id:`spond-session-${patterns.size+1}`,
        venueId:venue.id,
        day:start.day,
        meetTime:'',
        start:start.time,
        end:end?.time || null,
        level:heading,
        price:null,
        paymentMethod:null,
        capacity:Number(event?.maxAccepted || event?.maxParticipants || 0) || null,
        host:null,
        showPublicJoinLink:false,
        publicJoinUrl:null,
        occurrences:0,
        nextDate:start.date,
        source:'Spond',
      });
    }
    const row = patterns.get(key);
    row.occurrences += 1;
    if (!row.nextDate || start.date < row.nextDate) row.nextDate = start.date;
  }
  return { venues:[...venues.values()], sessions:[...patterns.values()].sort((a,b)=>`${a.nextDate}${a.start}`.localeCompare(`${b.nextDate}${b.start}`)) };
}

Deno.serve(async (req) => {
  try {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action, spondEmail, spondPassword, spondToken, groupId, eventId, targetDate, selectedStartTimestamp, selectedHeading, listingSlug, interclubEventId, interclubSide } = body;

  if (String(action || '').startsWith('directory_')) {
    const slug = clean(listingSlug, 180);
    if (!slug) return Response.json({ error:'listingSlug required' }, { status:400 });
    if (!await directoryAccessAllowed(base44, user, slug)) return Response.json({ error:'Forbidden: directory editor access required' }, { status:403 });

    if (action === 'directory_connection_status') {
      const rows = await base44.asServiceRole.entities.DirectorySpondConnection.filter({ listing_slug: slug, status:'active' }, '-last_synced_at', 5);
      return Response.json({ connection: rows?.[0] || null });
    }

    if (action === 'directory_disconnect') {
      const existing = await base44.asServiceRole.entities.DirectorySpondConnection.filter({ listing_slug:slug, status:'active' }, '-last_synced_at', 5);
      if (existing?.[0]) await base44.asServiceRole.entities.DirectorySpondConnection.update(existing[0].id, { status:'disconnected', last_synced_at:new Date().toISOString(), last_sync_summary:'Spond directory connection disconnected.' });
      return Response.json({ success:true });
    }

    let token = null;
    try { token = await directorySpondToken(user, body); } catch (error) {
      return Response.json({ error:`Could not connect to Spond: ${error?.message || 'login failed'}` }, { status:502 });
    }
    if (!token) return Response.json({ error:'Connect a Spond account first.' }, { status:401 });

    if (action === 'directory_get_groups') {
      const groups = await spondRequest('/groups', token);
      const simplified = (Array.isArray(groups) ? groups : []).map(g => ({ id:g.id, name:g.name, memberCount:g.members?.length || 0 })).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
      return Response.json({ groups:simplified, connectionMode:user.role === 'admin' && !spondToken ? 'platform_admin' : 'club_account' });
    }

    if (action === 'directory_get_events') {
      if (!groupId) return Response.json({ error:'groupId required' }, { status:400 });
      const now = new Date();
      const minStart = new Date(now.getTime() - 7*24*60*60*1000).toISOString();
      const maxStart = new Date(now.getTime() + 120*24*60*60*1000).toISOString();
      const params = new URLSearchParams({ groupId:String(groupId), minStartTimestamp:minStart, maxStartTimestamp:maxStart, max:'300', scheduled:'true', includeComments:'false', includeHidden:'false', addProfileInfo:'false' });
      const raw = await spondRequest(`/sponds?${params.toString()}`, token);
      const minMs=new Date(minStart).getTime(),maxMs=new Date(maxStart).getTime();
      const bounded=(Array.isArray(raw)?raw:[]).map(e=>({...e,_resolvedStartTimestamp:occurrenceStartInWindow(e,minMs,maxMs)})).filter(e=>e._resolvedStartTimestamp);
      const preview = directoryEventPreview(bounded);
      const events = bounded.sort((a,b)=>new Date(eventStart(a)).getTime()-new Date(eventStart(b)).getTime()).map(e=>({ id:e.id, heading:e.heading||'Club Session', startTimestamp:eventStart(e), endTimestamp:e.endTimestamp||null, location:e.location?.feature||e.location?.address||'', address:e.location?.address||'' }));
      return Response.json({ events, preview, rawCount:bounded.length, windowStart:minStart, windowEnd:maxStart });
    }

    if (action === 'directory_sync_events') {
      if (!groupId) return Response.json({ error:'groupId required' }, { status:400 });
      const now = new Date();
      const minStart = new Date(now.getTime() - 24*60*60*1000).toISOString();
      const maxStart = new Date(now.getTime() + 120*24*60*60*1000).toISOString();
      const params = new URLSearchParams({ groupId:String(groupId), minStartTimestamp:minStart, maxStartTimestamp:maxStart, max:'300', scheduled:'true', includeComments:'false', includeHidden:'false', addProfileInfo:'false' });
      const raw = await spondRequest(`/sponds?${params.toString()}`, token);
      const minMs=new Date(minStart).getTime(),maxMs=new Date(maxStart).getTime();
      const bounded=(Array.isArray(raw)?raw:[]).map(e=>({...e,_resolvedStartTimestamp:occurrenceStartInWindow(e,minMs,maxMs)})).filter(e=>e._resolvedStartTimestamp);
      const existing = await base44.asServiceRole.entities.DirectorySpondEvent.filter({ listing_slug:slug }, '-last_synced_at', 500);
      const byKey = new Map((existing || []).map(row => [String(row.occurrence_key || ''), row]));
      const seen = new Set();
      let created=0, updated=0;
      const syncedAt = new Date().toISOString();
      for (const event of bounded) {
        const start = eventStart(event);
        if (!start) continue;
        const key = `${String(event.id)}::${String(start)}`;
        seen.add(key);
        const payload = {
          listing_slug:slug,
          spond_group_id:String(groupId),
          spond_event_id:String(event.id),
          occurrence_key:key,
          heading:clean(event.heading || 'Club Session', 220),
          start_timestamp:new Date(start).toISOString(),
          ...(event.endTimestamp ? { end_timestamp:new Date(event.endTimestamp).toISOString() } : {}),
          venue_name:clean(event.location?.feature || event.location?.name || event.location?.address || '', 220),
          venue_address:clean(event.location?.address || '', 320),
          status:'active',
          last_synced_at:syncedAt,
        };
        const row = byKey.get(key);
        if (row) { await base44.asServiceRole.entities.DirectorySpondEvent.update(row.id, payload); updated++; }
        else { await base44.asServiceRole.entities.DirectorySpondEvent.create(payload); created++; }
      }
      let stale=0;
      for (const row of existing || []) {
        if (row.status === 'active' && !seen.has(String(row.occurrence_key || ''))) {
          await base44.asServiceRole.entities.DirectorySpondEvent.update(row.id, { status:'stale', last_synced_at:syncedAt });
          stale++;
        }
      }
      return Response.json({ success:true, created, updated, stale, active:seen.size, syncedAt });
    }

    if (action === 'directory_save_connection') {
      if (!groupId) return Response.json({ error:'groupId required' }, { status:400 });
      const groups = await spondRequest('/groups', token);
      const group = (Array.isArray(groups)?groups:[]).find(g=>String(g.id)===String(groupId));
      if (!group) return Response.json({ error:'Spond group not found' }, { status:404 });
      const existing = await base44.asServiceRole.entities.DirectorySpondConnection.filter({ listing_slug:slug }, '-last_synced_at', 5);
      const now = new Date().toISOString();
      const data = { listing_slug:slug, spond_group_id:String(group.id), spond_group_name:String(group.name||'Spond group'), connected_by_user_id:user.id, connection_mode:user.role === 'admin' && !spondToken ? 'platform_admin' : 'club_account', last_synced_at:now, last_sync_summary:clean(body.summary || 'Spond directory connection updated.', 500), status:'active' };
      const saved = existing?.[0] ? await base44.asServiceRole.entities.DirectorySpondConnection.update(existing[0].id, data) : await base44.asServiceRole.entities.DirectorySpondConnection.create(data);
      return Response.json({ success:true, connection:saved });
    }

    return Response.json({ error:`Unknown directory Spond action: ${action}` }, { status:400 });
  }

  const kotcRole = user.kotc_role || (user.role === 'admin' ? 'super_admin' : 'player');
  const hasInterclubManagerAccess = interclubEventId ? await interclubManagerAllowed(base44, user, interclubEventId) : false;
  const isSpondManager = user.role === 'admin' || ['super_admin', 'admin', 'host'].includes(kotcRole) || hasInterclubManagerAccess;
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

  // ── Action: import_interclub_attendees ──
  if (action === 'import_interclub_attendees') {
    const challengeId = String(interclubEventId || '').trim();
    const side = String(interclubSide || '').trim();
    if (!challengeId || !['club_a','club_b'].includes(side)) return Response.json({ error:'interclubEventId and valid interclubSide required' }, { status:400 });
    if (!groupId || !eventId) return Response.json({ error:'groupId and eventId required' }, { status:400 });
    if (!await interclubManagerAllowed(base44, user, challengeId)) return Response.json({ error:'Interclub event manager permission required' }, { status:403 });

    const challenge = (await base44.asServiceRole.entities.ClubChallengeEvent.filter({ id:challengeId }))?.[0];
    if (!challenge) return Response.json({ error:'Interclub Challenge event not found' }, { status:404 });
    if (!['draft','draw_generated'].includes(challenge.status)) return Response.json({ error:'Spond players can only be imported before the draw is approved.' }, { status:409 });

    const [event, group] = await Promise.all([
      fetchEventOccurrence(groupId,eventId,spondToken,selectedStartTimestamp,selectedHeading),
      fetchGroupForAttendees(groupId,spondToken),
    ]);
    const {accepted,waiting}=collectResponseIds(event);
    const memberMap=buildMemberMap(group);
    const sourceAttendees=[...accepted].map(id=>attendeeFromMember(id,memberMap[id])).filter(Boolean);
    if (!sourceAttendees.length) return Response.json({ error:'No Spond attendees marked Going were found for this event.' }, { status:409 });

    const existing = await base44.asServiceRole.entities.ClubChallengeParticipant.filter({ challenge_event_id:challenge.id }, 'event_rank', 200);
    const normaliseIdentity = value => normaliseName(value || '');
    const activeExisting = existing.filter(p => !['replaced','withdrawn','injured'].includes(p.status));
    const existingKeys = new Set(activeExisting.map(p => String(p.unique_identity_key || '')).filter(Boolean));
    const existingNames = new Map(activeExisting.map(p => [normaliseIdentity(p.display_name), p]));
    const sideExisting = existing.filter(p => p.side === side && p.status !== 'replaced');
    let nextRank = sideExisting.reduce((max,p)=>Math.max(max,Number(p.event_rank||0)),0)+1;

    let scopedPlayers = [];
    if (challenge.tenant_id && challenge.host_club_id) {
      scopedPlayers = await base44.asServiceRole.entities.Player.filter({ tenant_id:challenge.tenant_id, club_id:challenge.host_club_id });
    }

    let created=0, skipped=0;
    const skippedNames=[];
    const createdNames=[];
    for (const attendee of sourceAttendees) {
      const identityKey=`spond-${String(groupId)}-${String(attendee.spondId)}`;
      const nameKey=normaliseIdentity(attendee.fullName);
      if (existingKeys.has(identityKey) || (nameKey && existingNames.has(nameKey))) {
        skipped++;
        skippedNames.push(attendee.fullName);
        continue;
      }
      const match=matchAttendee(attendee,scopedPlayers);
      const matchedPlayer=match.status==='matched' ? match.matched : null;
      const participant=await base44.asServiceRole.entities.ClubChallengeParticipant.create({
        tenant_id:challenge.tenant_id,
        challenge_event_id:challenge.id,
        tournament_id:challenge.tournament_id,
        side,
        display_name:String(attendee.fullName).trim().slice(0,120),
        gender:String(attendee.gender || '').trim().slice(0,40),
        ...(matchedPlayer?.id ? { source_player_id:matchedPlayer.id } : {}),
        participant_type:matchedPlayer ? (matchedPlayer.relationship_type || 'member') : 'guest',
        event_rank:nextRank++,
        status:'active',
        available_from_round:1,
        unique_identity_key:identityKey,
      });
      existingKeys.add(identityKey);
      existingNames.set(nameKey,participant);
      created++;
      createdNames.push(participant.display_name);
    }

    const now=new Date().toISOString();
    await base44.asServiceRole.entities.ClubChallengeEvent.update(challenge.id, {
      fairness_json:'',
      status:challenge.status === 'draw_generated' ? 'draft' : challenge.status,
      event_pack_stale:true,
    });
    await base44.asServiceRole.entities.ClubChallengeAudit.create({
      tenant_id:challenge.tenant_id,
      challenge_event_id:challenge.id,
      action:'participants_imported_spond',
      user_id:user.id,
      occurred_at:now,
      new_value_json:JSON.stringify({ side, group_id:String(groupId), group_name:String(group?.name||''), event_id:String(eventId), event_heading:String(event?.heading||''), created, skipped, waiting_list_excluded:waiting.size, created_names:createdNames }),
      note:`Imported Spond attendees into ${side === 'club_a' ? challenge.club_a_name : challenge.club_b_name}.`,
    });
    return Response.json({ success:true, created, skipped, waitingListCount:waiting.size, createdNames, skippedNames, sourceGroupName:String(group?.name||''), event:{ id:event.id, heading:event.heading, startTimestamp:selectedStartTimestamp||eventStart(event), location:event.location?.address||event.location?.feature||'' } });
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

    // Host workflow: show a bounded list of upcoming occurrences and let the host
    // choose the exact Spond event. This supports preparing Thursday's session on
    // Tuesday while still preventing distant recurring-series anchors (e.g. 2027)
    // from leaking into the picker.
    const now = new Date();
    const minStart = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
    const maxStart = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const preferredDate = typeof targetDate === 'string' ? (targetDate.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '') : '';
    const params = new URLSearchParams({
      groupId,
      minStartTimestamp: minStart,
      maxStartTimestamp: maxStart,
      max: '200',
      scheduled: 'true',
      includeComments: 'false',
      includeHidden: 'false',
      addProfileInfo: 'true',
    });
    const events = await spondRequest(`/sponds?${params.toString()}`, spondToken);
    const minMs=new Date(minStart).getTime(),maxMs=new Date(maxStart).getTime();
    const bounded=(Array.isArray(events)?events:[]).map(e=>({...e,_resolvedStartTimestamp:occurrenceStartInWindow(e,minMs,maxMs)})).filter(e=>e._resolvedStartTimestamp);
    const simplified = bounded
      .sort((a, b) => {
        const ad = irelandDate(a._resolvedStartTimestamp), bd = irelandDate(b._resolvedStartTimestamp);
        const ap = preferredDate && ad === preferredDate ? 0 : 1;
        const bp = preferredDate && bd === preferredDate ? 0 : 1;
        return ap - bp || new Date(a._resolvedStartTimestamp).getTime() - new Date(b._resolvedStartTimestamp).getTime();
      })
      .map(e => ({
        id: e.id,
        heading: e.heading,
        startTimestamp: e._resolvedStartTimestamp,
        sourceStartTimestamp: e.startTimestamp || '',
        meetupTimestamp: e.meetupTimestamp || '',
        endTimestamp: e.endTimestamp,
        location: e.location?.address || e.location?.feature || '',
        attendingCount: (e.responses?.acceptedIds || []).length,
        declinedCount: (e.responses?.declinedIds || []).length,
        unansweredCount: (e.responses?.unansweredIds || []).length,
      }));
    return Response.json({ events: simplified, preferredDate: preferredDate || null, windowStart:minStart, windowEnd:maxStart, rawCount: Array.isArray(events) ? events.length : 0 });
  }

  // ── Action: get_attendees ──
  if (action === 'get_attendees') {
    if (!groupId || !eventId) return Response.json({ error: 'groupId and eventId required' }, { status: 400 });
    const tournamentId=String(body.tournamentId||'');
    const [event, group] = await Promise.all([fetchEventOccurrence(groupId,eventId,spondToken,selectedStartTimestamp,selectedHeading),fetchGroupForAttendees(groupId,spondToken)]);
    const authoritativeStart=selectedStartTimestamp||eventStart(event);
    const selectedDate=irelandDate(authoritativeStart);
    if(!selectedDate)return Response.json({error:'Selected Spond event has no usable date/time.'},{status:409});
    let tournament=null;if(tournamentId)tournament=(await base44.asServiceRole.entities.Tournament.filter({id:tournamentId}))?.[0]||null;
    if(tournament&&user.role!=='admin'&&(tournament.tenant_id!==activeTenantId||tournament.host_club_id!==activeClubId))return Response.json({error:'Forbidden: tournament belongs to another tenant/club'},{status:403});
    const tenantId=tournament?.tenant_id||activeTenantId;const clubId=tournament?.host_club_id||activeClubId;
    const existingPlayers=tenantId&&clubId?await base44.asServiceRole.entities.Player.filter({tenant_id:tenantId,club_id:clubId}):[];
    const {accepted,waiting}=collectResponseIds(event);const memberMap=buildMemberMap(group);
    const sourceGroupName=String(group?.name||'').trim();
    const sourceMembershipTrusted=normaliseName(sourceGroupName)==='clare pickleball members';
    const attendees=[...accepted].map(id=>attendeeFromMember(id,memberMap[id])).filter(Boolean).map(attendee=>{const match=matchAttendee(attendee,existingPlayers);return {...attendee,existingPlayerId:match.matched?.id||null,existingPlayerName:match.matched?.full_name||null,duprRating:match.matched?.dupr_rating??null,status:match.status,candidates:match.candidates};});
    const playerDirectory=existingPlayers.map(p=>({id:p.id,name:p.full_name||'',email:p.email||'',phone:p.phone||''})).sort((a,b)=>a.name.localeCompare(b.name));
    return Response.json({attendees,playerDirectory,waitingListCount:waiting.size,sourceMembershipTrusted,sourceGroupName,event:{id:event.id,heading:event.heading,startTimestamp:authoritativeStart,location:event.location?.address||event.location?.feature||''}});
  }

  // ── Action: import_attendees ──
  if (action === 'import_attendees') {
    const tournamentId=String(body.tournamentId||''); const replaceRoster=body.replaceRoster===true;
    if(!tournamentId||!groupId||!eventId)return Response.json({error:'tournamentId, groupId and eventId required'},{status:400});
    const tournament=(await base44.asServiceRole.entities.Tournament.filter({id:tournamentId}))?.[0];
    if(!tournament)return Response.json({error:'Tournament not found'},{status:404});
    if(user.role!=='admin'&&(tournament.tenant_id!==activeTenantId||tournament.host_club_id!==activeClubId))return Response.json({error:'Forbidden: tournament belongs to another tenant/club'},{status:403});
    const [event,group]=await Promise.all([fetchEventOccurrence(groupId,eventId,spondToken,selectedStartTimestamp,selectedHeading),fetchGroupForAttendees(groupId,spondToken)]);
    const authoritativeStart=selectedStartTimestamp||eventStart(event);
    const selectedDate=irelandDate(authoritativeStart);
    if(!selectedDate)return Response.json({error:'Refusing roster sync: selected Spond event has no usable date/time.'},{status:409});
    const tenantId=tournament.tenant_id||activeTenantId; const clubId=tournament.host_club_id||activeClubId;
    if(!tenantId||!clubId)return Response.json({error:'Tournament is missing tenant/club ownership.'},{status:409});
    const scopedPlayers=await base44.asServiceRole.entities.Player.filter({tenant_id:tenantId,club_id:clubId}); const scopedIds=new Set(scopedPlayers.map(p=>p.id));
    const {accepted,waiting}=collectResponseIds(event); const memberMap=buildMemberMap(group);
    const sourceGroupName=String(group?.name||'').trim();
    const sourceMembershipTrusted=normaliseName(sourceGroupName)==='clare pickleball members';
    const sourceAttendees=[...accepted].map(id=>attendeeFromMember(id,memberMap[id])).filter(Boolean);
    const clientChoices=Object.fromEntries((body.matchChoices||[]).map(x=>[String(x.spondId),String(x.playerId||'')]));
    const allowedGuests=new Set((body.allowGuestSpondIds||[]).map(x=>String(x)));
    const rosterIds=new Set(replaceRoster?[]:(tournament.player_ids||[]).filter(id=>scopedIds.has(id))); let created=0,matched=0; const ambiguous=[]; const unresolved=[];
    for(const attendee of sourceAttendees){
      const match=matchAttendee(attendee,scopedPlayers); let player=null;
      const chosenId=clientChoices[String(attendee.spondId)]||'';
      if(chosenId){if(!scopedIds.has(chosenId))return Response.json({error:'Selected player match is outside this club.'},{status:403});player=scopedPlayers.find(p=>p.id===chosenId)||null;}
      else if(match.status==='matched') player=match.matched;
      else if(match.status==='ambiguous'){ambiguous.push({spondId:attendee.spondId,fullName:attendee.fullName,candidates:match.candidates});continue;}
      if(!player){
        if(!sourceMembershipTrusted&&!allowedGuests.has(String(attendee.spondId))){unresolved.push({spondId:attendee.spondId,fullName:attendee.fullName});continue;}
        player=await base44.asServiceRole.entities.Player.create({full_name:attendee.fullName,email:attendee.email||'',phone:attendee.phoneNumber||'',avatar_url:attendee.avatarUrl||'',status:'Active',relationship_type:sourceMembershipTrusted?'member':'guest',relationship_status:'active',tenant_id:tenantId,club_id:clubId,wins:0,losses:0,matches_played:0});scopedPlayers.push(player);scopedIds.add(player.id);created++;
      }else matched++;
      rosterIds.add(player.id);
    }
    if(ambiguous.length||unresolved.length)return Response.json({error:'Resolve all unmatched player identities before refreshing the roster.',ambiguous,unresolved},{status:409});
    const now=new Date().toISOString(); const createdLabel=sourceMembershipTrusted?'new members':'new guests'; const message=`Spond refresh: ${rosterIds.size} confirmed players (${matched} matched, ${created} ${createdLabel}, ${waiting.size} waiting-list excluded).`;
    await base44.asServiceRole.entities.Tournament.update(tournamentId,{player_ids:[...rosterIds],start_date:selectedDate,kotc_spond_group_id:String(groupId),kotc_spond_event_id:String(eventId),kotc_last_import_message:message,kotc_last_imported_at:now});
    return Response.json({success:true,created,matched,total:rosterIds.size,waitingListCount:waiting.size,sourceMembershipTrusted,sourceGroupName,event:{id:event.id,heading:event.heading,startTimestamp:authoritativeStart,location:event.location?.address||event.location?.feature||''},message});
  }

  return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});