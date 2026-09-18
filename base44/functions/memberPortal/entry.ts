import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const clean = (value:any, max=500) => String(value ?? '').trim().slice(0, max);
const lower = (value:any) => clean(value, 240).toLowerCase();
const dateKey = (value:any) => clean(value, 40);

async function firstBy(base44:any, entity:string, filters:Array<Record<string, any>>) {
  for (const filter of filters) {
    const usable = Object.fromEntries(Object.entries(filter).filter(([,v]) => v !== undefined && v !== null && String(v).trim() !== ''));
    if (!Object.keys(usable).length) continue;
    const rows = await base44.asServiceRole.entities[entity].filter(usable, '-updated_date', 10);
    if (rows?.[0]) return rows[0];
  }
  return null;
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
    profile_type: member.profile_type || null,
    club_membership_id: member.club_membership_id || null,
    membership_type: member.membership_type || null,
    payment_status: member.payment_status || null,
    payment_date: member.payment_date || null,
    membership_amount: member.membership_amount ?? null,
    emergency_contact: member.emergency_contact || null,
    emergency_mobile: member.emergency_mobile || null,
    tenant_id: member.tenant_id || null,
    club_id: member.club_id || null,
    player_id: member.player_id || null,
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

  let member = await firstBy(base44, 'Member', [
    { player_id: player?.id, tenant_id: tenantHint, club_id: clubHint },
    { primary_email: email, tenant_id: tenantHint, club_id: clubHint },
    { player_id: player?.id },
    { primary_email: email },
  ]);

  if (!player && member?.player_id) {
    player = await firstBy(base44, 'Player', [{ id: member.player_id }]);
  }
  if (!person && player?.person_id) {
    person = await firstBy(base44, 'Person', [{ id: player.person_id }]);
  }

  const tenantId = clean(tenantHint || player?.tenant_id || member?.tenant_id, 180);
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
    club: club ? { id: club.id, name: club.name, logo_url: club.logo_url || null } : null,
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
      if (user.role !== 'admin' && user.approval_status !== 'approved') {
        return Response.json({ error: 'Approved RallyHub member access required' }, { status: 403 });
      }
      return Response.json({ success: true, snapshot: await buildSnapshot(base44, user) });
    }

    if (action === 'self_update') {
      if (user.role !== 'admin' && user.approval_status !== 'approved') {
        return Response.json({ error: 'Approved RallyHub member access required' }, { status: 403 });
      }

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

        const ageGroup = trim(profile.age_group, 80);
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

    if (action === 'admin_preview') {
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
      return Response.json({ success: true, preview: true, snapshot: await buildSnapshot(base44, target, previewContext) });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('memberPortal error', error);
    return Response.json({ error: error?.message || 'Could not load member portal data.' }, { status: 500 });
  }
});
