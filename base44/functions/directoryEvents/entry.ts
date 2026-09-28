import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const clean = (value:any, max=500) => String(value ?? '').trim().slice(0, max);
const parseJson = (value:any, fallback:any={}) => { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
const numOrNull = (value:any) => value === '' || value === null || value === undefined ? null : (Number.isFinite(Number(value)) ? Number(value) : null);

async function requireDirectoryAccess(base44:any, user:any, listingSlug:string) {
  if (!user) throw new Response(JSON.stringify({ error:'Authentication required.' }), { status:401, headers:{'content-type':'application/json'} });
  if (user.role === 'admin') return { role:'admin' };
  const rows = await base44.asServiceRole.entities.DirectoryListingAccess.filter({ listing_slug:listingSlug, user_id:user.id, status:'active' }, '-granted_at', 10);
  if (!rows?.length) throw new Response(JSON.stringify({ error:'You do not have permission to manage events for this Directory listing.' }), { status:403, headers:{'content-type':'application/json'} });
  return rows[0];
}

async function getListing(base44:any, listingSlug:string) {
  const rows = await base44.asServiceRole.entities.DirectoryListingRecord.filter({ slug:listingSlug, status:'active' }, '-updated_date', 5);
  const row = rows?.[0];
  if (!row) throw new Response(JSON.stringify({ error:'Directory listing not found.' }), { status:404, headers:{'content-type':'application/json'} });
  return row;
}

async function ensureHostIdentity(base44:any, listing:any) {
  const slug = clean(listing.slug, 160);
  const clubRows = await base44.asServiceRole.entities.Club.filter({ slug, status:'active' }, '-updated_date', 20);
  if (clubRows?.[0]) {
    const club = clubRows[0];
    const tenants = await base44.asServiceRole.entities.Tenant.filter({ id:club.tenant_id }, '-updated_date', 2);
    return { club, tenant:tenants?.[0] || null };
  }

  const tenantSlug = `directory-${slug}`.slice(0, 150);
  let tenant = (await base44.asServiceRole.entities.Tenant.filter({ slug:tenantSlug }, '-updated_date', 5))?.[0];
  if (!tenant) {
    tenant = await base44.asServiceRole.entities.Tenant.create({
      name: listing.name,
      slug: tenantSlug,
      status:'active',
      timezone:'Europe/Dublin',
      notes:`Directory-backed event host for ${listing.name}. Upgrade this same tenant if the organisation later adopts RallyHub Club.`
    });
  }
  const club = await base44.asServiceRole.entities.Club.create({
    tenant_id:tenant.id,
    name:listing.name,
    slug,
    status:'active',
    timezone:'Europe/Dublin',
    notes:`Internal event-host identity linked to Directory listing ${slug}. Do not create a second public Directory listing.`
  });
  return { club, tenant };
}

async function getDirectoryVenues(base44:any, listing:any) {
  const profiles = await base44.asServiceRole.entities.DirectoryListingProfile.filter({ listing_slug:listing.slug, status:'active' }, '-updated_at', 5);
  const base = parseJson(listing.base_json, {});
  const profile = parseJson(profiles?.[0]?.public_json, {});
  const venues = Array.isArray(profile.venues) ? profile.venues : (Array.isArray(base.venues) ? base.venues : []);
  return venues.map((v:any, index:number) => ({
    id: clean(v.id || `directory-venue-${index+1}`, 180),
    name: clean(v.name || v.shortName || `Venue ${index+1}`, 240),
    address: clean(v.address || '', 400),
    latitude:numOrNull(v.latitude),
    longitude:numOrNull(v.longitude),
    source:'directory'
  })).filter((v:any)=>v.name);
}

const EVENT_FIELDS = [
  'name','format','status','start_date','end_date','location','venue_id','description','event_category','event_slug','event_start_time','event_end_time',
  'event_image_url','event_image_position_x','event_image_position_y','event_image_zoom','event_card_image_url','event_card_position_x','event_card_position_y','event_card_zoom','event_image_original_url','event_image_source_type',
  'event_internal_info','event_contact','event_contact_phone','event_contact_phone_hidden_until','event_contact_phone_keep_private','event_status_override','event_registration_url','event_registration_mode','event_registration_open_at','event_registration_close_at','event_fee_text','event_fee_amount','event_currency','event_capacity','event_waitlist_enabled',
  'event_public_summary','event_county','event_country','event_indoor_outdoor','event_levels','event_age_groups','event_disciplines','event_tags','event_schedule','event_eligibility','event_player_info','event_fees_cancellation','event_source_url','event_map_url','event_latitude','event_longitude'
];

function eventPayload(body:any) {
  const source = body?.event || {};
  const out:any = {};
  for (const key of EVENT_FIELDS) if (Object.prototype.hasOwnProperty.call(source, key)) out[key] = source[key];
  out.name = clean(out.name, 240);
  out.event_slug = clean(out.event_slug, 160);
  out.event_category = clean(out.event_category, 80) || 'other';
  out.event_country = clean(out.event_country, 120) || 'Ireland';
  out.event_county = clean(out.event_county, 120);
  out.location = clean(out.location, 400);
  out.event_contact = clean(out.event_contact, 300);
  out.event_contact_phone = clean(out.event_contact_phone, 120);
  out.event_status_override = ['full','cancelled','postponed'].includes(clean(out.event_status_override,40)) ? clean(out.event_status_override,40) : '';
  out.event_contact_phone_keep_private = out.event_contact_phone_keep_private === true;
  out.event_contact_phone_hidden_until = out.event_contact_phone_hidden_until || null;
  out.event_registration_url = clean(out.event_registration_url, 1000);
  out.event_source_url = clean(out.event_source_url, 1000);
  out.event_map_url = clean(out.event_map_url, 1000);
  out.event_latitude = numOrNull(out.event_latitude);
  out.event_longitude = numOrNull(out.event_longitude);
  out.event_capacity = numOrNull(out.event_capacity);
  out.event_fee_amount = numOrNull(out.event_fee_amount);
  return out;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const body = await req.json().catch(()=>({}));
    const action = clean(body.action, 60);
    const listingSlug = clean(body.listingSlug, 180);
    if (!listingSlug) return Response.json({ error:'Directory listing is required.' }, { status:400 });
    const access = await requireDirectoryAccess(base44, user, listingSlug);
    const listing = await getListing(base44, listingSlug);
    const {club, tenant} = await ensureHostIdentity(base44, listing);

    if (action === 'list') {
      const [events, venues] = await Promise.all([
        base44.asServiceRole.entities.Tournament.filter({ tenant_id:tenant.id, host_club_id:club.id, status:{$ne:'Archived'} }, 'start_date', 200),
        getDirectoryVenues(base44, listing)
      ]);
      return Response.json({ success:true, canManage:true, role:access.role, listing:{slug:listing.slug,name:listing.name,county:listing.county}, host:club, tenant, events:events||[], venues });
    }

    if (action === 'save') {
      const mode = body.mode === 'draft' ? 'draft' : 'publish';
      const incoming = eventPayload(body);
      if (!incoming.name || !incoming.start_date) return Response.json({ error:'Event name and start date are required.' }, { status:400 });
      const eventId = clean(body.eventId, 180);
      let existing:any = null;
      if (eventId) {
        existing = (await base44.asServiceRole.entities.Tournament.filter({ id:eventId, tenant_id:tenant.id, host_club_id:club.id }, '-updated_date', 2))?.[0];
        if (!existing) return Response.json({ error:'Event not found or not editable from this Directory listing.' }, { status:404 });
      }
      const now = new Date().toISOString();
      const payload:any = {
        ...incoming,
        format: incoming.format || existing?.format || 'Event',
        status: existing?.status && existing.status !== 'Archived' ? existing.status : (mode === 'publish' ? 'Published' : 'Draft'),
        tenant_id:tenant.id,
        host_club_id:club.id,
        event_member_visible:false,
        event_public_visible:mode === 'publish',
        event_featured_member:false,
        event_featured_public:false,
        event_verified_organiser:true,
        event_publish_status:mode === 'publish' ? 'published' : 'draft',
        ...(mode === 'publish' ? {event_published_at:existing?.event_published_at || now} : {})
      };
      const saved = existing
        ? await base44.asServiceRole.entities.Tournament.update(existing.id, payload)
        : await base44.asServiceRole.entities.Tournament.create(payload);
      await base44.asServiceRole.entities.AuditLog.create({
        tenant_id:tenant.id, club_id:club.id, user_id:user.id, action:'directory_event_save', entity_type:'Tournament', entity_id:saved?.id || existing?.id || '', scope_type:'DirectoryListing', scope_id:listingSlug,
        after_state:JSON.stringify({ mode, event_name:incoming.name, public:mode==='publish' }), reason:'Directory owner/editor managed a public event.'
      }).catch(()=>{});
      return Response.json({ success:true, event:saved });
    }

    if (action === 'delete') {
      const eventId = clean(body.eventId, 180);
      const event = (await base44.asServiceRole.entities.Tournament.filter({ id:eventId, tenant_id:tenant.id, host_club_id:club.id }, '-updated_date', 2))?.[0];
      if (!event) return Response.json({ error:'Event not found.' }, { status:404 });
      const linked = await base44.asServiceRole.entities.ClubChallengeEvent.filter({ tournament_id:eventId }, '-updated_date', 2).catch(()=>[]);
      if (linked?.length) return Response.json({ error:'This event is connected to a live RallyHub Interclub competition and must be managed from its competition controls.' }, { status:409 });
      await base44.asServiceRole.entities.Tournament.delete(eventId);
      return Response.json({ success:true });
    }

    return Response.json({ error:'Unknown Directory event action.' }, { status:400 });
  } catch (error:any) {
    if (error instanceof Response) return error;
    console.error('directoryEvents failed', error);
    return Response.json({ error:'RallyHub could not complete that Directory event action.' }, { status:500 });
  }
});
