import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const clean = (value:any, max=500) => String(value ?? '').trim().slice(0, max);
const lower = (value:any) => clean(value, 240).toLowerCase();
const dateKey = (value:any) => clean(value, 40);
const SPOND_API_BASE = 'https://api.spond.com/core/v1';

const normalisePhone = (value:any) => clean(value, 80).replace(/\D/g, '').replace(/^3530?/, '353');

async function spondLoginFromSecrets() {
  const email = Deno.env.get('SPOND_EMAIL');
  const password = Deno.env.get('SPOND_PASSWORD');
  if (!email || !password) return null;
  const response = await fetch(`${SPOND_API_BASE}/auth2/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`Spond login failed ${response.status}`);
  const data = await response.json();
  return data.accessToken?.token || data.loginToken || data.token || null;
}

async function spondRequest(path:string, token:string) {
  const response = await fetch(`${SPOND_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Spond API error ${response.status}`);
  return response.json();
}

function spondEventStart(event:any) {
  return event?.startTimestamp || event?.meetupTimestamp || event?.start_time || event?.startTime || '';
}

function collectSpondInviteIds(event:any) {
  const ids = new Set<string>();
  const add = (value:any) => { if (value !== undefined && value !== null && String(value).trim()) ids.add(String(value)); };
  const addMany = (values:any) => (Array.isArray(values) ? values : []).forEach(add);
  const addMember = (row:any) => add(row?.memberId || row?.uid || row?.id);
  // Only event-specific invitation/response signals belong here. The wider
  // recipients.group.members collection can include people who can see the
  // group/event but were not actually invited to that session.
  addMany(event?.responses?.acceptedIds);
  addMany(event?.responses?.declinedIds);
  addMany(event?.responses?.unansweredIds);
  addMany(event?.responses?.unconfirmedIds);
  addMany(event?.responses?.waitinglistIds);
  addMany(event?.responses?.waitingListIds);
  addMany(event?.invitedMemberIds);
  addMany(event?.memberIds);
  (event?.responses?.members || []).forEach(addMember);
  (event?.responses?.responses || []).forEach(addMember);
  (event?.recipients?.members || []).forEach(addMember);
  return ids;
}

function spondRowMatchesCandidates(row:any, candidates:{ emails:string[], phones:string[], names:string[] }, memberId:string) {
  if (!row) return false;
  const rowId = String(row?.memberId || row?.uid || row?.id || '');
  if (rowId && rowId === String(memberId || '')) return true;
  const profile = row?.profile || {};
  const emailSet = new Set(candidates.emails.map(lower).filter(Boolean));
  const phoneSet = new Set(candidates.phones.map(normalisePhone).filter(value => value.length >= 7));
  const nameSet = new Set(candidates.names.map(lower).filter(Boolean));
  const rowEmails = [profile.email, row?.email].map(lower).filter(Boolean);
  if (rowEmails.some((email:string) => emailSet.has(email))) return true;
  const rowPhones = [profile.phoneNumber, row?.phoneNumber].map(normalisePhone).filter((value:string) => value.length >= 7);
  if (rowPhones.some((phone:string) => phoneSet.has(phone))) return true;
  const rowName = lower(`${profile.firstName || row?.firstName || ''} ${profile.lastName || row?.lastName || ''}`);
  return !!rowName && nameSet.has(rowName);
}

function memberSubgroupIds(group:any, memberId:string) {
  const ids = new Set<string>();
  const add = (value:any) => { const id=String(value?.id ?? value?.uid ?? value?.subGroupId ?? value ?? '').trim(); if(id) ids.add(id); };
  const sameMember = (row:any) => String(row?.memberId ?? row?.uid ?? row?.id ?? row ?? '') === String(memberId || '');
  for (const sub of group?.subGroups || group?.subgroups || []) {
    const members=[...(sub?.members || []), ...(sub?.memberIds || [])];
    if (members.some(sameMember)) add(sub?.id || sub?.uid || sub?.subGroupId);
  }
  const member = groupMembers(group).find((row:any) => sameMember(row));
  for (const value of member?.subGroups || member?.subgroups || member?.subGroupIds || member?.subgroupIds || []) add(value);
  const groupId=String(group?.id || group?.uid || '');
  for (const membership of member?.groups || []) {
    if (groupId && String(membership?.groupId || membership?.id || '') !== groupId) continue;
    for (const value of membership?.subGroups || membership?.subgroups || membership?.subGroupIds || membership?.subgroupIds || []) add(value);
  }
  return ids;
}

function eventSubgroupIds(event:any) {
  const ids = new Set<string>();
  const add = (value:any) => { const id=String(value?.id ?? value?.uid ?? value?.subGroupId ?? value ?? '').trim(); if(id) ids.add(id); };
  const addMany = (values:any) => (Array.isArray(values) ? values : []).forEach(add);
  add(event?.subGroupId); add(event?.subgroupId); addMany(event?.subGroupIds); addMany(event?.subgroupIds); add(event?.subGroup); add(event?.subgroup);
  const recipients=event?.recipients || {}, groupRecipients=recipients?.group || {};
  add(groupRecipients?.subGroupId); add(groupRecipients?.subgroupId); addMany(groupRecipients?.subGroupIds); addMany(groupRecipients?.subgroupIds); addMany(groupRecipients?.subGroups); addMany(groupRecipients?.subgroups);
  addMany(recipients?.subGroupIds); addMany(recipients?.subgroupIds); addMany(recipients?.subGroups); addMany(recipients?.subgroups);
  return ids;
}

function memberIsInvitedToSpondEvent(event:any, candidates:{ emails:string[], phones:string[], names:string[] }, memberId:string, subgroupIds:Set<string>) {
  if (collectSpondInviteIds(event).has(String(memberId))) return true;
  const rows = [...(event?.responses?.members || []), ...(event?.responses?.responses || []), ...(event?.recipients?.members || [])];
  if (rows.some((row:any) => spondRowMatchesCandidates(row, candidates, memberId))) return true;
  const targetSubgroups=eventSubgroupIds(event);
  if (targetSubgroups.size && [...targetSubgroups].some(id => subgroupIds.has(id))) return true;
  const groupRows=event?.recipients?.group?.members || [];
  return groupRows.some((row:any) => spondRowMatchesCandidates({ ...row, id:'' }, candidates, ''));
}

function spondResponseStatus(event:any, memberId:string) {
  const id = String(memberId || '');
  const includes = (values:any) => (Array.isArray(values) ? values : []).some(value => String(value) === id);
  if (includes(event?.responses?.acceptedIds)) return 'accepted';
  if (includes(event?.responses?.waitinglistIds) || includes(event?.responses?.waitingListIds)) return 'waiting';
  if (includes(event?.responses?.declinedIds)) return 'declined';
  if (includes(event?.responses?.unansweredIds)) return 'unanswered';
  if (includes(event?.responses?.unconfirmedIds)) return 'unconfirmed';
  const row = [...(event?.responses?.members || []), ...(event?.responses?.responses || [])].find((item:any) => String(item?.memberId || item?.uid || item?.id) === id);
  return lower(row?.status || 'invited') || 'invited';
}

function groupMembers(group:any) {
  const rows:any[] = [];
  const seen = new Set<string>();
  const add = (member:any) => {
    const id = String(member?.id || member?.uid || member?.memberId || '');
    if (!id || seen.has(id)) return;
    seen.add(id);
    rows.push(member);
  };
  (group?.members || []).forEach(add);
  (group?.subGroups || []).forEach((sub:any) => (sub?.members || []).forEach(add));
  return rows;
}

function matchSpondMemberId(group:any, candidates:{ emails:string[], phones:string[], explicitIds:string[] }) {
  const members = groupMembers(group);
  for (const explicitId of candidates.explicitIds) {
    const found = members.find(member => String(member?.id || member?.uid || member?.memberId || '') === String(explicitId));
    if (found) return String(found?.id || found?.uid || found?.memberId);
  }
  const emails = new Set(candidates.emails.map(lower).filter(Boolean));
  const phones = new Set(candidates.phones.map(normalisePhone).filter(value => value.length >= 7));
  for (const member of members) {
    const profile = member?.profile || {};
    const memberEmails = [profile.email, member?.email].map(lower).filter(Boolean);
    if (memberEmails.some((email:string) => emails.has(email))) return String(member?.id || member?.uid || member?.memberId);
    const memberPhones = [profile.phoneNumber, member?.phoneNumber].map(normalisePhone).filter((value:string) => value.length >= 7);
    if (memberPhones.some((phone:string) => phones.has(phone))) return String(member?.id || member?.uid || member?.memberId);
  }
  return null;
}

async function loadPersonalSpondSessions(base44:any, context:any) {
  const clubSlug = clean(context?.club?.slug, 180);
  if (!clubSlug || !context?.tenantId || !context?.clubId) return { status:'not_configured', sessions:[] };
  const connections = await base44.asServiceRole.entities.DirectorySpondConnection.filter({ listing_slug: clubSlug, status:'active' }, '-last_synced_at', 10);
  const connection = connections?.[0];
  if (!connection?.spond_group_id) return { status:'not_configured', sessions:[] };

  const identities = await base44.asServiceRole.entities.SpondIdentity.filter({ tenant_id: context.tenantId, club_id: context.clubId, match_status:'matched' }, '-last_verified_at', 100);
  const relevantIdentities = (identities || []).filter((row:any) =>
    (context?.player?.id && String(row.player_id || '') === String(context.player.id)) ||
    (context?.member?.id && String(row.member_id || '') === String(context.member.id))
  );
  const explicitIds = relevantIdentities.map((row:any) => clean(row.spond_member_id, 180)).filter(Boolean);
  const emails = [context?.person?.primary_email, context?.player?.email, context?.member?.primary_email, context?.user?.email].map(lower).filter(Boolean);
  const phones = [context?.person?.mobile, context?.player?.phone, context?.member?.mobile].map(clean).filter(Boolean);
  const names = [context?.person?.full_name, context?.player?.full_name, context?.member?.full_name, context?.user?.full_name, context?.user?.display_name].map(lower).filter(Boolean);

  try {
    const token = await spondLoginFromSecrets();
    if (!token) return { status:'credentials_unavailable', sessions:[] };
    let group:any = null;
    try {
      group = await spondRequest(`/groups/${connection.spond_group_id}`, token);
    } catch {
      const groups = await spondRequest('/groups', token);
      group = (Array.isArray(groups) ? groups : []).find((row:any) => String(row.id) === String(connection.spond_group_id));
    }
    if (!group) return { status:'group_unavailable', sessions:[] };
    const memberId = matchSpondMemberId(group, { emails, phones, explicitIds });
    if (!memberId) return { status:'identity_not_matched', sessions:[] };
    const subgroupIds = memberSubgroupIds(group, memberId);

    const now = new Date();
    const maxStart = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      groupId:String(connection.spond_group_id),
      minStartTimestamp:now.toISOString(),
      maxStartTimestamp:maxStart.toISOString(),
      max:'300',
      scheduled:'true',
      includeComments:'false',
      includeHidden:'false',
      addProfileInfo:'true',
    });
    const raw = await spondRequest(`/sponds?${params.toString()}`, token);
    const sessions = (Array.isArray(raw) ? raw : [])
      .filter((event:any) => memberIsInvitedToSpondEvent(event, { emails, phones, names }, memberId, subgroupIds))
      .map((event:any) => {
        const location = event?.location || {};
        return {
          id:`spond:${event.id}:${spondEventStart(event)}`,
          source_id:String(event.id),
          source:'spond',
          title:clean(event?.heading || 'Club session', 180),
          start:spondEventStart(event) || null,
          end:event?.endTimestamp || null,
          venue:clean(location?.feature || location?.name || location?.address || '', 220) || null,
          address:clean(location?.address || '', 320) || null,
          latitude:Number(location?.latitude ?? location?.lat ?? location?.geometry?.coordinates?.[1]) || null,
          longitude:Number(location?.longitude ?? location?.lng ?? location?.lon ?? location?.geometry?.coordinates?.[0]) || null,
          response_status:spondResponseStatus(event, memberId),
        };
      })
      .filter((row:any) => row.start)
      .sort((a:any,b:any) => String(a.start).localeCompare(String(b.start)));
    return { status:'connected', connection:{ group_id:String(connection.spond_group_id), group_name:connection.spond_group_name || null }, sessions };
  } catch (error) {
    console.error('memberPortal Spond feed error', error?.message || error);
    return { status:'temporarily_unavailable', sessions:[] };
  }
}

function ageFromDob(value:any, onDate = new Date()) {
  const s = clean(value, 20);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y,m,d] = s.split('-').map(Number);
  let age = onDate.getFullYear() - y;
  const beforeBirthday = (onDate.getMonth() + 1 < m) || ((onDate.getMonth() + 1 === m) && onDate.getDate() < d);
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

function ageGroupFromAge(age:any) {
  if (age == null) return null;
  if (age < 18) return 'Junior (U18)';
  if (age < 35) return 'Open (18-34)';
  if (age < 50) return 'Adult (35-49)';
  if (age < 65) return 'Senior (50-64)';
  return 'Super Senior (65+)';
}

async function firstBy(base44:any, entity:string, filters:Array<Record<string, any>>) {
  for (const filter of filters) {
    const usable = Object.fromEntries(Object.entries(filter).filter(([,v]) => v !== undefined && v !== null && String(v).trim() !== ''));
    if (!Object.keys(usable).length) continue;
    const rows = await base44.asServiceRole.entities[entity].filter(usable, '-updated_date', 10);
    if (rows?.[0]) return rows[0];
  }
  return null;
}

function activeAccess(row:any) {
  if (!row || row.status !== 'active') return false;
  const now = Date.now();
  if (row.starts_at && Date.parse(row.starts_at) > now) return false;
  if (row.ends_at && Date.parse(row.ends_at) < now) return false;
  return true;
}

async function requireRallyHubClubAccess(base44:any, user:any) {
  if (user.role === 'admin') return;
  if (user.approval_status !== 'approved') {
    throw Object.assign(new Error('Approved RallyHub Club access required'), { status: 403 });
  }
  const rows = await base44.asServiceRole.entities.ClubUserAccess.filter({ user_id: user.id, status: 'active' });
  if (!(rows || []).some(activeAccess)) {
    throw Object.assign(new Error('No RallyHub Club access. Directory access does not grant member or club-management access.'), { status: 403 });
  }
}

function safePlayer(player:any) {
  if (!player) return null;
  return {
    id: player.id,
    person_id: player.person_id || null,
    full_name: player.full_name || null,
    email: player.email || null,
    phone: player.phone || null,
    gender: player.gender || null,
    skill_rating: player.skill_rating ?? null,
    dupr_id: player.dupr_id || null,
    dupr_rating: player.dupr_rating ?? null,
    dupr_last_synced: player.dupr_last_synced || null,
    age_group: player.age_group || null,
    club: player.club || null,
    preferred_position: player.preferred_position || null,
    avatar_url: player.avatar_url || null,
    status: player.status || null,
    relationship_type: player.relationship_type || null,
    relationship_status: player.relationship_status || null,
    tenant_id: player.tenant_id || null,
    club_id: player.club_id || null,
  };
}

function safePerson(person:any) {
  if (!person) return null;
  return {
    id: person.id,
    full_name: person.full_name || null,
    preferred_name: person.preferred_name || null,
    primary_email: person.primary_email || null,
    mobile: person.mobile || null,
    date_of_birth: person.date_of_birth || null,
    age: ageFromDob(person.date_of_birth),
    derived_age_group: ageGroupFromAge(ageFromDob(person.date_of_birth)),
    gender: person.gender || null,
    profile_photo_url: person.profile_photo_url || null,
    full_postal_address: person.full_postal_address || null,
    address_line1: person.address_line1 || null,
    address_line2: person.address_line2 || null,
    town_city: person.town_city || null,
    county_region: person.county_region || null,
    postal_code: person.postal_code || null,
    country: person.country || null,
    preferred_language: person.preferred_language || null,
    communication_preference: person.communication_preference || null,
    emergency_contact_name: person.emergency_contact_name || null,
    emergency_contact_relationship: person.emergency_contact_relationship || null,
    emergency_mobile: person.emergency_mobile || null,
    secondary_emergency_contact_name: person.secondary_emergency_contact_name || null,
    secondary_emergency_contact_mobile: person.secondary_emergency_contact_mobile || null,
    profile_visibility: person.profile_visibility || null,
    photo_visibility: person.photo_visibility || null,
  };
}

function safeMember(member:any) {
  if (!member) return null;
  return {
    id: member.id,
    full_name: member.full_name || null,
    primary_email: member.primary_email || null,
    mobile: member.mobile || null,
    date_of_birth: member.date_of_birth || null,
    membership_season: member.membership_season || null,
    membership_status: member.membership_status || null,
    profile_type: member.profile_type || member.relationship_type || null,
    club_membership_id: member.club_membership_id || member.member_id || null,
    membership_type: member.membership_type || null,
    payment_status: member.payment_status || null,
    payment_date: member.payment_date || null,
    membership_amount: member.membership_amount ?? member.membership_fee ?? null,
    emergency_contact: member.emergency_contact || null,
    emergency_mobile: member.emergency_mobile || null,
    tenant_id: member.tenant_id || null,
    club_id: member.club_id || null,
    player_id: member.player_id || null,
    person_id: member.person_id || null,
    relationship_type: member.relationship_type || null,
    join_date: member.join_date || null,
    renewal_date: member.renewal_date || null,
    expiry_date: member.expiry_date || null,
  };
}

async function buildSnapshot(base44:any, targetUser:any, forcedContext:any = {}) {
  const email = lower(targetUser?.email);
  const tenantHint = clean(forcedContext?.tenant_id || targetUser?.active_tenant_id, 180);
  const clubHint = clean(forcedContext?.club_id || targetUser?.active_club_id, 180);
  let player = await firstBy(base44, 'Player', [
    { user_id: targetUser?.id, tenant_id: tenantHint, club_id: clubHint },
    { linked_user_email: email, tenant_id: tenantHint, club_id: clubHint },
    { email, tenant_id: tenantHint, club_id: clubHint },
    { user_id: targetUser?.id },
    { linked_user_email: email },
    { email },
  ]);

  let person = await firstBy(base44, 'Person', [
    { linked_user_id: targetUser?.id },
    { id: player?.person_id },
    { primary_email: email },
  ]);

  if (!person && player?.person_id) {
    person = await firstBy(base44, 'Person', [{ id: player.person_id }]);
  }

  // ClubMembership is the authoritative current membership relationship.
  // Keep the older Member lookup only as a backwards-compatible fallback.
  let member = await firstBy(base44, 'ClubMembership', [
    { person_id: person?.id, tenant_id: tenantHint, club_id: clubHint },
    { person_id: person?.id, club_id: clubHint },
    { person_id: person?.id },
  ]);

  if (!member) {
    member = await firstBy(base44, 'Member', [
      { player_id: player?.id, tenant_id: tenantHint, club_id: clubHint },
      { primary_email: email, tenant_id: tenantHint, club_id: clubHint },
      { player_id: player?.id },
      { primary_email: email },
    ]);
  }

  if (!player && member?.player_id) {
    player = await firstBy(base44, 'Player', [{ id: member.player_id }]);
  }

  const tenantId = clean(tenantHint || player?.tenant_id || person?.tenant_id || member?.tenant_id, 180);
  const clubId = clean(clubHint || player?.club_id || member?.club_id, 180);

  let club:any = null;
  if (clubId) club = await firstBy(base44, 'Club', [{ id: clubId }]);

  let playerDirectory:any[] = [];
  if (tenantId && clubId) {
    const rows = await base44.asServiceRole.entities.Player.filter({ tenant_id: tenantId, club_id: clubId }, 'full_name', 500);
    playerDirectory = (rows || [])
      .filter((p:any) => String(p.status || 'Active').toLowerCase() === 'active')
      .map((p:any) => ({
        id: p.id,
        full_name: p.full_name || 'Player',
        avatar_url: p.avatar_url || null,
        dupr_rating: p.dupr_rating ?? null,
        skill_rating: p.skill_rating ?? null,
        preferred_position: p.preferred_position || null,
      }));
  }

  let tournaments:any[] = [];
  if (tenantId) {
    tournaments = await base44.asServiceRole.entities.Tournament.filter({ tenant_id: tenantId }, 'start_date', 500);
    tournaments = (tournaments || []).filter((t:any) => !clubId || !t.host_club_id || String(t.host_club_id) === clubId);
  }

  let participantTournamentIds = new Set<string>();
  if (player?.id && tenantId) {
    const participantRows = await base44.asServiceRole.entities.TournamentParticipant.filter({ tenant_id: tenantId, source_player_id: player.id }, '-created_date', 500);
    participantTournamentIds = new Set((participantRows || []).filter((p:any) => p.status !== 'withdrawn').map((p:any) => String(p.tournament_id)));
  }

  const today = new Date().toISOString().slice(0,10);
  const isEntered = (t:any) => participantTournamentIds.has(String(t.id)) || (Array.isArray(t.player_ids) && player?.id && t.player_ids.includes(player.id));
  const publicTournament = (t:any) => ({
    id: t.id,
    name: t.name,
    format: t.format || null,
    status: t.status || null,
    start_date: t.start_date || null,
    end_date: t.end_date || null,
    location: t.location || null,
    description: t.description || null,
    entered: isEntered(t),
  });

  const myCompetitions = tournaments
    .filter((t:any) => isEntered(t) && !['Completed','Cancelled'].includes(String(t.status || '')))
    .map(publicTournament)
    .sort((a:any,b:any) => dateKey(a.start_date).localeCompare(dateKey(b.start_date)));

  const clubCalendar = tournaments
    .filter((t:any) => t.status !== 'Cancelled' && (!t.start_date || String(t.start_date) >= today))
    .map(publicTournament)
    .sort((a:any,b:any) => dateKey(a.start_date).localeCompare(dateKey(b.start_date)))
    .slice(0, 40);

  const profileFields = [
    person?.full_name || player?.full_name || targetUser?.full_name,
    person?.mobile || player?.phone,
    person?.date_of_birth || member?.date_of_birth,
    person?.address_line1 || person?.full_postal_address,
    person?.town_city,
    person?.county_region,
    person?.emergency_contact_name || member?.emergency_contact,
    player?.dupr_id,
  ];
  const completion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  return {
    user: {
      id: targetUser?.id,
      full_name: targetUser?.full_name || targetUser?.display_name || null,
      email: targetUser?.email || null,
      approval_status: targetUser?.approval_status || null,
      active_tenant_id: targetUser?.active_tenant_id || tenantId || null,
      active_club_id: targetUser?.active_club_id || clubId || null,
      active_club_role: targetUser?.active_club_role || null,
    },
    club: club ? {
      id: club.id,
      name: club.name,
      slug: club.slug || null,
      logo_url: club.logo_url || null,
      primary_colour: club.primary_colour || null,
      secondary_colour: club.secondary_colour || null,
      timezone: club.timezone || 'Europe/Dublin',
    } : null,
    person: safePerson(person),
    member: safeMember(member),
    player: safePlayer(player),
    profileCompletion: completion,
    playerDirectory,
    myCompetitions,
    clubCalendar,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'self');

    if (action === 'self') {
      await requireRallyHubClubAccess(base44, user);
      return Response.json({ success: true, snapshot: await buildSnapshot(base44, user) });
    }

    if (action === 'play') {
      await requireRallyHubClubAccess(base44, user);
      const snapshot = await buildSnapshot(base44, user);
      const spond = await loadPersonalSpondSessions(base44, {
        club:snapshot.club,
        tenantId:snapshot.user?.active_tenant_id,
        clubId:snapshot.user?.active_club_id,
        person:snapshot.person,
        player:snapshot.player,
        member:snapshot.member,
        user:snapshot.user,
      });
      const competitionItems = (snapshot.myCompetitions || []).map((event:any) => ({
        id:`rallyhub:${event.id}`,
        source_id:String(event.id),
        source:'rallyhub',
        title:event.name,
        start:event.start_date ? `${event.start_date}T12:00:00` : null,
        end:event.end_date ? `${event.end_date}T12:00:00` : null,
        venue:event.location || null,
        address:null,
        latitude:null,
        longitude:null,
        response_status:'entered',
        competition_format:event.format || null,
        competition_status:event.status || null,
      }));
      const items = [...(spond.sessions || []), ...competitionItems]
        .filter((item:any) => item.start)
        .sort((a:any,b:any) => String(a.start).localeCompare(String(b.start)));
      return Response.json({ success:true, play:{ items, spond, club:snapshot.club } });
    }

    if (action === 'clubhouse') {
      await requireRallyHubClubAccess(base44, user);
      const snapshot = await buildSnapshot(base44, user);
      const tenantId = snapshot.user?.active_tenant_id;
      const clubId = snapshot.user?.active_club_id;
      if (!tenantId || !clubId) return Response.json({ success:true, clubhouse:{ posts:[], playerDirectory:[], club:snapshot.club } });
      const rows = await base44.asServiceRole.entities.ClubBulletinPost.filter({ tenant_id:tenantId, club_id:clubId, status:'published' }, '-published_at', 200);
      const now = Date.now();
      const identityIds = new Set([user.id, snapshot.person?.id, snapshot.player?.id, snapshot.member?.id].filter(Boolean).map(String));
      const posts = (rows || [])
        .filter((post:any) => !post.expires_at || Date.parse(post.expires_at) >= now)
        .filter((post:any) => {
          if (post.audience_scope === 'club') return true;
          if (post.audience_scope === 'member') return (post.audience_ids || []).some((id:any) => identityIds.has(String(id)));
          return false;
        })
        .map((post:any) => ({
          id:post.id,
          post_type:post.post_type,
          title:post.title,
          body:post.body || '',
          image_url:post.image_url || null,
          link_url:post.link_url || null,
          comments_enabled:post.comments_enabled !== false,
          is_pinned:post.is_pinned === true,
          published_at:post.published_at || post.created_date || null,
        }))
        .sort((a:any,b:any) => Number(b.is_pinned) - Number(a.is_pinned) || String(b.published_at || '').localeCompare(String(a.published_at || '')));
      return Response.json({ success:true, clubhouse:{ posts, playerDirectory:snapshot.playerDirectory || [], club:snapshot.club } });
    }

    if (action === 'learn') {
      await requireRallyHubClubAccess(base44, user);
      const snapshot = await buildSnapshot(base44, user);
      const tenantId = snapshot.user?.active_tenant_id;
      const clubId = snapshot.user?.active_club_id;
      if (!tenantId || !clubId) return Response.json({ success:true, learn:{ resources:[], club:snapshot.club } });
      const rows = await base44.asServiceRole.entities.ClubResource.filter({ tenant_id:tenantId, club_id:clubId, status:'published' }, 'sort_order', 500);
      const resources = (rows || []).map((row:any) => ({
        id:row.id,
        title:row.title,
        description:row.description || '',
        category:row.category || 'Resources',
        resource_type:row.resource_type || 'link',
        url:row.url || null,
        image_url:row.image_url || null,
        sport_key:row.sport_key || null,
        sort_order:Number(row.sort_order || 0),
      }));
      return Response.json({ success:true, learn:{ resources, club:snapshot.club } });
    }

    if (action === 'self_update') {
      await requireRallyHubClubAccess(base44, user);

      const snapshot = await buildSnapshot(base44, user);
      const profile = body.profile && typeof body.profile === 'object' ? body.profile : {};
      const trim = (value:any, max=300) => String(value ?? '').trim().slice(0, max);

      const visibility = (value:any) => {
        const v = trim(value, 20);
        return ['private','club','public'].includes(v) ? v : undefined;
      };

      const personData:any = {
        full_name: trim(profile.full_name, 180),
        preferred_name: trim(profile.preferred_name, 120),
        primary_email: trim(profile.primary_email, 240),
        mobile: trim(profile.mobile, 80),
        gender: trim(profile.gender, 80),
        address_line1: trim(profile.address_line1, 240),
        address_line2: trim(profile.address_line2, 240),
        town_city: trim(profile.town_city, 160),
        county_region: trim(profile.county_region, 160),
        postal_code: trim(profile.postal_code, 40),
        country: trim(profile.country, 120),
        preferred_language: trim(profile.preferred_language, 80),
        communication_preference: trim(profile.communication_preference, 120),
        emergency_contact_name: trim(profile.emergency_contact_name, 180),
        emergency_contact_relationship: trim(profile.emergency_contact_relationship, 120),
        emergency_mobile: trim(profile.emergency_mobile, 80),
        secondary_emergency_contact_name: trim(profile.secondary_emergency_contact_name, 180),
        secondary_emergency_contact_mobile: trim(profile.secondary_emergency_contact_mobile, 80),
        profile_visibility: visibility(profile.profile_visibility),
        photo_visibility: visibility(profile.photo_visibility),
      };

      if (profile.date_of_birth) {
        const dob = trim(profile.date_of_birth, 20);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
          return Response.json({ error: 'Date of birth must use YYYY-MM-DD.' }, { status: 400 });
        }
        personData.date_of_birth = dob;
      }

      for (const key of Object.keys(personData)) {
        if (personData[key] === undefined) delete personData[key];
      }

      let personId = snapshot.person?.id || null;
      if (personId) {
        await base44.asServiceRole.entities.Person.update(personId, personData);
      } else if (snapshot.player?.tenant_id && personData.full_name) {
        const created = await base44.asServiceRole.entities.Person.create({
          tenant_id: snapshot.player.tenant_id,
          linked_user_id: user.id,
          ...personData,
          source_system: 'member_self_service',
          source_rows: [],
          data_quality_flags: [],
        });
        personId = created?.id || null;
      }

      if (snapshot.player?.id) {
        const playerData:any = {};
        if (personId && !snapshot.player.person_id) playerData.person_id = personId;
        if (personData.full_name) playerData.full_name = personData.full_name;
        if (personData.primary_email) {
          playerData.email = personData.primary_email;
          playerData.linked_user_email = String(user.email || personData.primary_email).toLowerCase();
        }
        if (personData.mobile) playerData.phone = personData.mobile;
        if (['Male','Female','Non-binary','Prefer not to say'].includes(personData.gender)) playerData.gender = personData.gender;

        const duprId = trim(profile.dupr_id, 120);
        if (duprId) playerData.dupr_id = duprId;

        const derivedAge = ageFromDob(personData.date_of_birth || snapshot.person?.date_of_birth);
        const derivedAgeGroup = ageGroupFromAge(derivedAge);
        const ageGroup = derivedAgeGroup || trim(profile.age_group, 80);
        if (['Junior (U18)','Open (18-34)','Adult (35-49)','Senior (50-64)','Super Senior (65+)'].includes(ageGroup)) {
          playerData.age_group = ageGroup;
        }

        const preferredPosition = trim(profile.preferred_position, 80);
        if (['Left Side','Right Side','No Preference'].includes(preferredPosition)) {
          playerData.preferred_position = preferredPosition;
        }

        await base44.asServiceRole.entities.Player.update(snapshot.player.id, playerData);
      }

      if (personData.full_name && personData.full_name !== user.full_name) {
        await base44.auth.updateMe({ full_name: personData.full_name });
      }

      return Response.json({
        success: true,
        message: 'Profile updated.',
        snapshot: await buildSnapshot(base44, user),
      });
    }

    if (action === 'admin_preview' || action === 'admin_preview_full') {
      if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const userId = clean(body.userId, 180);
      if (!userId) return Response.json({ error: 'userId required' }, { status: 400 });
      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      const target = users?.[0];
      if (!target) return Response.json({ error: 'User not found' }, { status: 404 });
      // Preview is read-only and does not change authentication or permissions, so an
      // administrator may also preview their own linked member identity as a normal member.
      const previewContext = {
        tenant_id: clean(body.tenantId || user.active_tenant_id, 180),
        club_id: clean(body.clubId || user.active_club_id, 180),
      };
      const snapshot = await buildSnapshot(base44, target, previewContext);
      if (action === 'admin_preview') return Response.json({ success: true, preview: true, snapshot });

      const tenantId = snapshot.user?.active_tenant_id;
      const clubId = snapshot.user?.active_club_id;
      const spond = await loadPersonalSpondSessions(base44, {
        club:snapshot.club,
        tenantId,
        clubId,
        person:snapshot.person,
        player:snapshot.player,
        member:snapshot.member,
        user:snapshot.user,
      });
      const competitionItems = (snapshot.myCompetitions || []).map((event:any) => ({
        id:`rallyhub:${event.id}`,
        source_id:String(event.id),
        source:'rallyhub',
        title:event.name,
        start:event.start_date ? `${event.start_date}T12:00:00` : null,
        end:event.end_date ? `${event.end_date}T12:00:00` : null,
        venue:event.location || null,
        address:null,
        latitude:null,
        longitude:null,
        response_status:'entered',
        competition_format:event.format || null,
        competition_status:event.status || null,
      }));
      const play = {
        items:[...(spond.sessions || []), ...competitionItems].filter((item:any) => item.start).sort((a:any,b:any) => String(a.start).localeCompare(String(b.start))),
        spond,
        club:snapshot.club,
      };

      let clubhouse = { posts:[], playerDirectory:snapshot.playerDirectory || [], club:snapshot.club };
      let learn = { resources:[], club:snapshot.club };
      if (tenantId && clubId) {
        const [postRows, resourceRows] = await Promise.all([
          base44.asServiceRole.entities.ClubBulletinPost.filter({ tenant_id:tenantId, club_id:clubId, status:'published' }, '-published_at', 200),
          base44.asServiceRole.entities.ClubResource.filter({ tenant_id:tenantId, club_id:clubId, status:'published' }, 'sort_order', 500),
        ]);
        const now = Date.now();
        const identityIds = new Set([target.id, snapshot.person?.id, snapshot.player?.id, snapshot.member?.id].filter(Boolean).map(String));
        clubhouse = {
          club:snapshot.club,
          playerDirectory:snapshot.playerDirectory || [],
          posts:(postRows || [])
            .filter((post:any) => !post.expires_at || Date.parse(post.expires_at) >= now)
            .filter((post:any) => post.audience_scope === 'club' || (post.audience_scope === 'member' && (post.audience_ids || []).some((id:any) => identityIds.has(String(id)))))
            .map((post:any) => ({ id:post.id, post_type:post.post_type, title:post.title, body:post.body || '', image_url:post.image_url || null, link_url:post.link_url || null, comments_enabled:post.comments_enabled !== false, is_pinned:post.is_pinned === true, published_at:post.published_at || post.created_date || null }))
            .sort((a:any,b:any) => Number(b.is_pinned) - Number(a.is_pinned) || String(b.published_at || '').localeCompare(String(a.published_at || ''))),
        };
        learn = {
          club:snapshot.club,
          resources:(resourceRows || []).map((row:any) => ({ id:row.id, title:row.title, description:row.description || '', category:row.category || 'Resources', resource_type:row.resource_type || 'link', url:row.url || null, image_url:row.image_url || null, sport_key:row.sport_key || null, sort_order:Number(row.sort_order || 0) })),
        };
      }

      return Response.json({ success:true, preview:true, snapshot, play, clubhouse, learn });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('memberPortal error', error);
    return Response.json({ error: error?.message || 'Could not load member portal data.' }, { status: 500 });
  }
});
