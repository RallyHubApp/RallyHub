import {createClientFromRequest} from 'npm:@base44/sdk@0.8.51';

const fields='name start_date end_date location description event_category event_start_time event_end_time event_image_url event_image_position_x event_image_position_y event_image_zoom event_card_image_url event_card_position_x event_card_position_y event_card_zoom event_image_original_url event_image_source_type event_public_summary event_internal_info event_contact event_contact_phone event_contact_phone_hidden_until event_contact_phone_keep_private event_status_override event_registration_url event_registration_mode event_registration_open_at event_registration_close_at event_fee_text event_capacity event_waitlist_enabled event_booking_policy event_county event_country event_indoor_outdoor event_levels event_age_groups event_disciplines event_collaborators event_schedule event_eligibility event_player_info event_fees_cancellation event_source_url event_map_url event_latitude event_longitude event_member_visible event_public_visible event_featured_member event_featured_public event_publish_status event_published_at'.split(' ');
const clean=(value:any,max=1000)=>String(value??'').trim().slice(0,max);
const normal=(value:any)=>clean(value,1000).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const urlKey=(value:any)=>{try{const u=new URL(clean(value));return u.hostname.toLowerCase().replace(/^www\./,'')+u.pathname.replace(/\/$/,'').toLowerCase()}catch{return ''}};

async function duplicateEvent(base44:any, source:any, excludeId=''){
  const candidates=await base44.asServiceRole.entities.Tournament.list('-created_date',1000);
  return (candidates||[]).find((row:any)=>{
    if(row.id===excludeId||row.status==='Archived')return false;
    const sourceKey=urlKey(source.event_source_url);
    const sameSource=sourceKey&&!sourceKey.endsWith('/events')&&sourceKey===urlKey(row.event_source_url);
    const sameEvent=!!source.start_date&&normal(row.name)===normal(source.name)
      &&String(row.start_date||'').slice(0,10)===String(source.start_date||'').slice(0,10)
      &&normal(row.location||row.event_county)===normal(source.location||source.event_county);
    return sameSource||sameEvent;
  });
}

Deno.serve(async req=>{try{
  const b=createClientFromRequest(req),u=await b.auth.me();
  if(!u)return Response.json({error:'Authentication required'},{status:401});
  const body=await req.json().catch(()=>({})),id=clean(body.eventId,180),source=body.event||{};

  let existing:any=null;
  if(id){
    const rows=await b.asServiceRole.entities.Tournament.filter({id},'-created_date',1);
    existing=rows?.[0];
    if(!existing)return Response.json({error:'Event not found'},{status:404});
    const permitted=u.role==='admin'||(u.active_club_role==='club_admin'&&u.active_club_id===existing.host_club_id&&u.active_tenant_id===existing.tenant_id);
    if(!permitted)return Response.json({error:'Not authorised to edit this event'},{status:403});
  }else{
    const tenantId=clean(source.tenant_id,180),hostClubId=clean(source.host_club_id,180);
    if(!tenantId||!hostClubId)return Response.json({error:'Event host is required'},{status:400});
    const permitted=u.role==='admin'||(u.active_club_role==='club_admin'&&u.active_club_id===hostClubId&&u.active_tenant_id===tenantId);
    if(!permitted)return Response.json({error:'Not authorised to create an event for this organisation'},{status:403});
  }

  const updates:any={};
  for(const key of fields)if(Object.prototype.hasOwnProperty.call(source,key))updates[key]=source[key];
  if(!String(updates.name??existing?.name??'').trim()||!String(updates.start_date??existing?.start_date??'').trim())return Response.json({error:'Name and start date required'},{status:400});
  if(updates.event_status_override&&!['save_the_date','full','cancelled','postponed'].includes(updates.event_status_override))return Response.json({error:'Invalid registration status'},{status:400});
  if(updates.event_status_override==='save_the_date'){updates.event_registration_mode='none';updates.event_registration_url='';updates.event_registration_open_at=null;updates.event_registration_close_at=null;}
  if(body.mode==='draft'){updates.event_publish_status='draft';updates.event_public_visible=false;updates.event_member_visible=false;}

  const duplicate=await duplicateEvent(b,{...existing,...source},id);
  if(duplicate)return Response.json({
    error:'This event is already listed in RallyHub. Keep one canonical event and add the other organisation as a collaborator rather than creating a second event or poster.',
    duplicate:true,existingEventId:duplicate.id,existingEventName:duplicate.name,
  },{status:409});

  if(existing){
    const saved=await b.asServiceRole.entities.Tournament.update(id,updates);
    return Response.json({success:true,event:saved});
  }

  updates.tenant_id=clean(source.tenant_id,180);
  updates.host_club_id=clean(source.host_club_id,180);
  updates.event_slug=clean(source.event_slug,180);
  updates.event_verified_organiser=u.role==='admin'&&source.event_verified_organiser===true;
  updates.format=clean(source.format,100)||'Event';
  updates.status=clean(source.status,80)||'Draft';
  const saved=await b.asServiceRole.entities.Tournament.create(updates);
  return Response.json({success:true,event:saved});
}catch(e){console.error('eventEditSave',e);return Response.json({error:'Could not save event'},{status:500})}});
