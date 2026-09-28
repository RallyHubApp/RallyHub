import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

const PUBLIC_FIELDS = [
  'id','name','format','status','start_date','end_date','location','venue_id','description','host_club_id','inter_club',
  'event_category','event_slug','event_start_time','event_end_time','event_image_url','event_image_position_x','event_image_position_y','event_image_zoom',
  'event_card_image_url','event_card_position_x','event_card_position_y','event_card_zoom','event_image_original_url','event_image_source_type','event_public_summary','event_registration_url','event_registration_mode',
  'event_registration_open_at','event_registration_close_at','event_fee_text','event_fee_amount','event_currency','event_capacity','event_waitlist_enabled',
  'event_county','event_country','event_indoor_outdoor','event_levels','event_age_groups','event_disciplines','event_tags','event_schedule',
  'event_eligibility','event_player_info','event_fees_cancellation','event_contact','event_contact_phone_hidden_until','event_status_override','event_source_url','event_map_url','event_latitude','event_longitude',
  'event_featured_public','event_verified_organiser','event_published_at','updated_date'
];

function publicEvent(event:any, host:any=null) {
  const out:any = {};
  for (const key of PUBLIC_FIELDS) if (event?.[key] !== undefined) out[key] = event[key];
  const phoneHiddenUntil = event?.event_contact_phone_hidden_until ? new Date(event.event_contact_phone_hidden_until) : null;
  const phoneUnlocked = !event?.event_contact_phone_keep_private && (!phoneHiddenUntil || Number.isNaN(phoneHiddenUntil.getTime()) || Date.now() >= phoneHiddenUntil.getTime());
  if (phoneUnlocked && event?.event_contact_phone) out.event_contact_phone = event.event_contact_phone;
  out.host = host ? {
    id: host.id,
    name: host.name || 'Event organiser',
    slug: host.slug || '',
    logo_url: host.logo_url || '',
    primary_colour: host.primary_colour || '',
    secondary_colour: host.secondary_colour || '',
    public_contact_email: host.public_contact_email || '',
  } : null;
  return out;
}

async function retry<T>(fn:()=>Promise<T>, attempts=2):Promise<T> {
  let lastError:any;
  for (let attempt=0; attempt<attempts; attempt++) {
    try { return await fn(); }
    catch (error) {
      lastError=error;
      if (attempt < attempts-1) await new Promise(resolve=>setTimeout(resolve,150));
    }
  }
  throw lastError;
}

async function loadHosts(base44:any, events:any[]) {
  const ids = [...new Set((events || []).map((e:any)=>String(e.host_club_id || '')).filter(Boolean))];
  const hostMap = new Map<string,any>();
  await Promise.all(ids.map(async id => {
    const rows = await base44.asServiceRole.entities.Club.filter({ id }, '-updated_date', 1).catch(()=>[]);
    if (rows?.[0]) hostMap.set(id, rows[0]);
  }));
  return hostMap;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'list');

    if (action === 'list') {
      const rows = await retry(()=>base44.asServiceRole.entities.Tournament.filter({
        event_public_visible: true,
        event_publish_status: 'published',
      }, 'start_date', 500));
      const visible = (rows || []).filter((event:any) => event.status !== 'Archived');
      const hostMap = await loadHosts(base44, visible);
      return Response.json({
        success: true,
        events: visible.map((event:any)=>publicEvent(event, hostMap.get(String(event.host_club_id || '')) || null)),
      });
    }

    if (action === 'detail') {
      const slug = String(body.slug || '').trim();
      const id = String(body.id || '').trim();
      if (!slug && !id) return Response.json({ error:'Event identifier required' }, { status:400 });
      const query:any = { event_public_visible:true, event_publish_status:'published' };
      if (id) query.id = id; else query.event_slug = slug;
      const rows = await retry(()=>base44.asServiceRole.entities.Tournament.filter(query, '-updated_date', 2));
      const event = (rows || []).find((row:any)=>row.status !== 'Archived');
      if (!event) return Response.json({ error:'Public event not found' }, { status:404 });
      const hostRows = event.host_club_id ? await base44.asServiceRole.entities.Club.filter({id:event.host_club_id}, '-updated_date', 1).catch(()=>[]) : [];
      return Response.json({ success:true, event:publicEvent(event, hostRows?.[0] || null) });
    }

    return Response.json({ error:'Unknown public Events action' }, { status:400 });
  } catch (error) {
    return Response.json({ error:error?.message || 'Could not load public events' }, { status:500 });
  }
});
