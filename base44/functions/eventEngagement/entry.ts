import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';

function cleanEvent(event:any) {
  if (!event) return null;
  return {
    id:event.id,
    name:event.name,
    start_date:event.start_date,
    end_date:event.end_date,
    location:event.location,
    event_slug:event.event_slug,
    event_category:event.event_category,
    event_start_time:event.event_start_time,
    event_end_time:event.event_end_time,
    event_image_url:event.event_image_url,
    event_card_image_url:event.event_card_image_url,
    event_card_position_x:event.event_card_position_x,
    event_card_position_y:event.event_card_position_y,
    event_card_zoom:event.event_card_zoom,
    event_registration_url:event.event_registration_url,
    event_registration_mode:event.event_registration_mode,
    event_registration_open_at:event.event_registration_open_at,
    event_registration_close_at:event.event_registration_close_at,
    event_public_summary:event.event_public_summary || event.description || '',
    host_club_id:event.host_club_id,
    event_county:event.event_county,
    event_country:event.event_country,
    event_levels:event.event_levels || [],
    event_age_groups:event.event_age_groups || [],
    event_disciplines:event.event_disciplines || [],
    event_indoor_outdoor:event.event_indoor_outdoor || '',
    event_featured_public:event.event_featured_public === true,
    updated_date:event.updated_date || null,
  };
}

async function requireUser(base44:any) {
  const user = await base44.auth.me().catch(()=>null);
  if (!user) throw Object.assign(new Error('Sign in required'), { status:401 });
  return user;
}

async function loadPublicEvent(base44:any, eventId:string) {
  const rows = await base44.asServiceRole.entities.Tournament.filter({ id:eventId, event_public_visible:true, event_publish_status:'published' }, '-updated_date', 1);
  const event = rows?.[0];
  if (!event || event.status === 'Archived') throw Object.assign(new Error('Public event not found'), { status:404 });
  return event;
}

function activeClubFor(user:any, body:any) {
  if (user.role === 'admin' && body.clubId && body.tenantId) return { clubId:String(body.clubId), tenantId:String(body.tenantId) };
  if (user.approval_status === 'approved' && user.active_club_role === 'club_admin' && user.active_club_id && user.active_tenant_id) {
    return { clubId:String(user.active_club_id), tenantId:String(user.active_tenant_id) };
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireUser(base44);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');

    if (action === 'save' || action === 'set_status' || action === 'set_reminders') {
      const eventId = String(body.eventId || '').trim();
      if (!eventId) return Response.json({ error:'Event required' }, { status:400 });
      const event = await loadPublicEvent(base44, eventId);
      const existing = await base44.asServiceRole.entities.EventSavedItem.filter({ user_id:user.id, tournament_id:eventId }, '-updated_date', 2).catch(()=>[]);
      const current = existing?.[0];
      const allowedStatuses = new Set(['saved','planning','booked','past']);
      const nextStatus = allowedStatuses.has(String(body.status || '')) ? String(body.status) : (current?.status || 'saved');
      const patch:any = {
        tournament_id:eventId,
        user_id:user.id,
        status:nextStatus,
        last_seen_event_updated_at:event.updated_date || null,
      };
      if (action === 'set_reminders' || body.reminders) {
        const reminders = body.reminders || {};
        patch.remind_registration_open = !!reminders.registrationOpen;
        patch.remind_registration_closing = !!reminders.registrationClosing;
        patch.remind_one_week = !!reminders.oneWeek;
        patch.remind_one_day = !!reminders.oneDay;
      } else if (!current) {
        patch.remind_registration_open = false;
        patch.remind_registration_closing = false;
        patch.remind_one_week = false;
        patch.remind_one_day = false;
      }
      const saved = current
        ? await base44.asServiceRole.entities.EventSavedItem.update(current.id, patch)
        : await base44.asServiceRole.entities.EventSavedItem.create(patch);
      return Response.json({ success:true, saved, event:cleanEvent(event) });
    }

    if (action === 'unsave') {
      const eventId = String(body.eventId || '').trim();
      const rows = await base44.asServiceRole.entities.EventSavedItem.filter({ user_id:user.id, tournament_id:eventId }, '-updated_date', 20).catch(()=>[]);
      for (const row of rows || []) await base44.asServiceRole.entities.EventSavedItem.delete(row.id);
      return Response.json({ success:true });
    }

    if (action === 'my') {
      const saved = await base44.asServiceRole.entities.EventSavedItem.filter({ user_id:user.id }, '-updated_date', 300).catch(()=>[]);
      const eventIds = [...new Set((saved || []).map((row:any)=>String(row.tournament_id || '')).filter(Boolean))];
      const events:any[] = [];
      for (const id of eventIds) {
        const rows = await base44.asServiceRole.entities.Tournament.filter({ id }, '-updated_date', 1).catch(()=>[]);
        const event = rows?.[0];
        if (event && event.event_public_visible === true && event.event_publish_status === 'published' && event.status !== 'Archived') events.push(cleanEvent(event));
      }
      const byId = new Map(events.map((event:any)=>[String(event.id), event]));
      return Response.json({
        success:true,
        items:(saved || []).map((row:any)=>({ saved:row, event:byId.get(String(row.tournament_id || '')) || null })).filter((item:any)=>item.event),
      });
    }

    if (action === 'share_to_club') {
      const target = activeClubFor(user, body);
      if (!target) return Response.json({ error:'Club administrator permission required' }, { status:403 });
      const eventId = String(body.eventId || '').trim();
      const event = await loadPublicEvent(base44, eventId);
      const existing = await base44.asServiceRole.entities.ClubEventShare.filter({ tournament_id:eventId, tenant_id:target.tenantId, club_id:target.clubId }, '-updated_date', 2).catch(()=>[]);
      const patch = { status:'active', member_visible:true, shared_by_user_id:user.id, shared_at:new Date().toISOString() };
      const share = existing?.[0]
        ? await base44.asServiceRole.entities.ClubEventShare.update(existing[0].id, patch)
        : await base44.asServiceRole.entities.ClubEventShare.create({ tournament_id:eventId, tenant_id:target.tenantId, club_id:target.clubId, ...patch });
      return Response.json({ success:true, share, event:cleanEvent(event) });
    }

    if (action === 'unshare_from_club') {
      const target = activeClubFor(user, body);
      if (!target) return Response.json({ error:'Club administrator permission required' }, { status:403 });
      const eventId = String(body.eventId || '').trim();
      const rows = await base44.asServiceRole.entities.ClubEventShare.filter({ tournament_id:eventId, tenant_id:target.tenantId, club_id:target.clubId }, '-updated_date', 20).catch(()=>[]);
      for (const row of rows || []) await base44.asServiceRole.entities.ClubEventShare.update(row.id, { status:'removed', member_visible:false, shared_by_user_id:user.id, shared_at:new Date().toISOString() });
      return Response.json({ success:true });
    }

    if (action === 'club_shared') {
      const target = activeClubFor(user, body) || (user.active_club_id && user.active_tenant_id ? {clubId:String(user.active_club_id),tenantId:String(user.active_tenant_id)} : null);
      if (!target) return Response.json({ error:'Club access required' }, { status:403 });
      const shares = await base44.asServiceRole.entities.ClubEventShare.filter({ tenant_id:target.tenantId, club_id:target.clubId, status:'active', member_visible:true }, '-shared_at', 300).catch(()=>[]);
      const items:any[] = [];
      for (const share of shares || []) {
        const rows = await base44.asServiceRole.entities.Tournament.filter({ id:share.tournament_id }, '-updated_date', 1).catch(()=>[]);
        const event = rows?.[0];
        if (event && event.event_public_visible === true && event.event_publish_status === 'published' && event.status !== 'Archived') items.push({ share, event:cleanEvent(event) });
      }
      return Response.json({ success:true, items });
    }

    return Response.json({ error:'Unknown event engagement action' }, { status:400 });
  } catch (error) {
    return Response.json({ error:error?.message || 'Event action failed' }, { status:error?.status || 500 });
  }
});
