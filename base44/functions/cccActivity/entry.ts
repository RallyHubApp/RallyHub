import {createClientFromRequest} from 'npm:@base44/sdk@0.8.48';
const s=(v:any,n=180)=>String(v??'').trim().slice(0,n);
const types=new Set(['session','guest_session','taster','open_day','clinic','training','quick_play','tournament','tournival','kotc','interclub']);
const fail=(error:string,status=400)=>Response.json({success:false,error},{status});
const audit=async(sdk:any,tenant_id:string,club_id:string,user_id:string,action:string,entity_type:string,entity_id:string,before:any,after:any)=>{try{await sdk.asServiceRole.entities.AuditLog.create({tenant_id,club_id,user_id,action,entity_type,entity_id,scope_type:'club',scope_id:club_id,before_state:JSON.stringify(before),after_state:JSON.stringify(after)})}catch(_){/* A successful CAS must not be reported as failed after an audit transport error. */}};
Deno.serve(async req=>{
 if(req.method!=='POST')return fail('POST required',405);
 try{
  const sdk=createClientFromRequest(req),user=await sdk.auth.me().catch(()=>null);
  if(!user||user.role!=='admin')return fail('Admin access required',403);
  const tenant_id=s(user.active_tenant_id),club_id=s(user.active_club_id);
  if(!tenant_id||!club_id)return fail('Select a club',409);
  const body=await req.json().catch(()=>({})),entity=sdk.asServiceRole.entities.ClubActivity;
  if(body.action==='options'){
   const [users,templates,events]=await Promise.all([
    sdk.asServiceRole.entities.User.filter({active_tenant_id:tenant_id,active_club_id:club_id,approval_status:'approved'},'full_name',200),
    sdk.asServiceRole.entities.CommunicationTemplate.filter({tenant_id,status:'approved',owner_scope:'tenant'},'-updated_date',200),
    sdk.asServiceRole.entities.Tournament.filter({tenant_id,host_club_id:club_id,event_registration_mode:'rallyhub'},'-created_date',100)
   ]);
   return Response.json({success:true,hosts:(users||[]).filter((u:any)=>u.role==='admin'||u.active_club_role==='club_admin').map((u:any)=>({id:u.id,name:u.full_name||u.name||u.email||u.id})),templates:(templates||[]).filter((t:any)=>!t.club_id||t.club_id===club_id).map((t:any)=>({id:t.id,name:t.name,purpose:t.purpose,version:t.version})),events:(events||[]).map((e:any)=>({id:e.id,name:e.name||e.title||e.id,start_date:e.start_date,capacity:e.event_capacity}))});
  }
  if(body.action==='list')return Response.json({success:true,activities:await entity.filter({tenant_id,club_id},'-created_date',100)});
  if(body.action==='link_event'){
   const id=s(body.id),event_id=s(body.eventId),revision=Number(body.expectedRevision);
   const record=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!record)return fail('Activity not found',404);
   if(record.revision!==revision||!Number.isSafeInteger(revision))return fail('Activity changed; reload',409);
   if(!['draft','ready','scheduled'].includes(record.status))return fail('Cannot link activity in current state',409);
   const event=(await sdk.asServiceRole.entities.Tournament.filter({id:event_id,tenant_id,host_club_id:club_id},'-created_date',1))?.[0];
   if(!event)return fail('Event not found in selected club',404);
   if(event.event_registration_mode!=='rallyhub')return fail('Event does not use RallyHub registration',409);
   if(Number(event.event_capacity)!==Number(record.capacity))return fail('Event capacity differs from activity',409);
   if(event.venue_id&&event.venue_id!==record.venue_id)return fail('Event venue differs from activity',409);
   if(event.start_date&&String(event.start_date).slice(0,10)!==String(record.starts_at).slice(0,10))return fail('Event date differs from activity',409);
   if(Number(event.event_fee_amount||0)>0&&record.payment_method!=='online')return fail('Paid event requires online payment policy',409);
   const update=await entity.updateMany({id,tenant_id,club_id,revision},{$set:{linked_event_id:event_id,bridge_status:'linked_unverified',revision:revision+1,updated_by_user_id:user.id}});
   if(update.updated!==1)return fail('Activity changed; reload',409);
   await audit(sdk,tenant_id,club_id,user.id,'ccc.activity.link_event','ClubActivity',id,{linked_event_id:record.linked_event_id||'',revision},{linked_event_id:event_id,revision:revision+1});
   return Response.json({success:true,id,eventId:event_id,bridgeStatus:'linked_unverified',revision:revision+1});
  }
  if(body.action==='mark_attendance'){
   const id=s(body.id),registrationId=s(body.registrationId),attendance=s(body.attendance),expectedRevision=Number(body.expectedRevision);
   if(!['attended','no_show','excused','not_marked'].includes(attendance))return fail('Invalid attendance status');
   if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0)return fail('Attendance revision required');
   const record=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!record||!record.linked_event_id)return fail('Linked activity not found',404);
   if(!['scheduled','registration_closed','in_progress','completed'].includes(record.status))return fail('Attendance unavailable in current activity state',409);
   const event=(await sdk.asServiceRole.entities.Tournament.filter({id:record.linked_event_id,tenant_id,host_club_id:club_id},'-created_date',1))?.[0];
   if(!event)return fail('Linked event unavailable',404);
   const registration=(await sdk.asServiceRole.entities.EventRegistration.filter({id:registrationId,event_id:event.id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!registration)return fail('Registration not found',404);
   if(!['confirmed','cash_confirmed'].includes(registration.registration_status))return fail('Only confirmed participants can be checked in',409);
   const current=Number(registration.attendance_revision||0);
   if(current!==expectedRevision)return fail('Attendance changed; reload',409);
   const prior=registration.attendance_revision===undefined?{$exists:false}:registration.attendance_revision;
   const result=await sdk.asServiceRole.entities.EventRegistration.updateMany({id:registrationId,event_id:event.id,tenant_id,club_id,attendance_revision:prior},{$set:{attendance_status:attendance,attendance_revision:current+1,attendance_marked_at:new Date().toISOString(),attendance_marked_by_user_id:user.id}});
   if(result.updated!==1)return fail('Attendance changed; reload',409);
   await audit(sdk,tenant_id,club_id,user.id,'ccc.attendance.mark','EventRegistration',registrationId,{status:registration.attendance_status||'not_marked',revision:current},{status:attendance,revision:current+1});
   return Response.json({success:true,registrationId,attendance,revision:current+1});
  }
  if(body.action==='registration_overview'){
   const id=s(body.id),record=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!record)return fail('Activity not found',404);
   if(!record.linked_event_id)return fail('Link an existing event first',409);
   const event=(await sdk.asServiceRole.entities.Tournament.filter({id:record.linked_event_id,tenant_id,host_club_id:club_id},'-created_date',1))?.[0];
   if(!event)return fail('Linked event unavailable for this club',404);
   const [registrations,payments]=await Promise.all([
    sdk.asServiceRole.entities.EventRegistration.filter({event_id:event.id,tenant_id,club_id},'-created_date',500),
    sdk.asServiceRole.entities.PaymentRecord.filter({tenant_id,club_id,purpose_type:'event'},'-created_date',500)
   ]);
   const byRegistration=new Map();for(const p of payments||[]){if(p.purpose_id&&!byRegistration.has(p.purpose_id))byRegistration.set(p.purpose_id,p)}
   const rows=(registrations||[]).map((r:any)=>{const p:any=byRegistration.get(r.id);return {id:r.id,name:r.full_name||'',email:r.email||'',mobile:r.mobile||'',status:r.registration_status||'',paymentStatus:p?.payment_status||r.payment_status||'unknown',amount:Number(p?.amount||0),refundedAmount:Number(p?.amount_refunded||0),createdAt:r.created_at||'',attendance:r.attendance_status||'not_marked',attendanceRevision:Number(r.attendance_revision||0)}});
   const count=(status:string)=>rows.filter((r:any)=>r.status===status).length;
   const paid=rows.reduce((sum:number,r:any)=>sum+(r.paymentStatus==='paid'||r.paymentStatus==='partially_refunded'||r.paymentStatus==='refunded'?Math.max(0,r.amount-r.refundedAmount):0),0);
   return Response.json({success:true,activityId:id,event:{id:event.id,name:event.name||record.title,capacity:Number(event.event_capacity||0),fee:Number(event.event_fee_amount||0),bookingEnabled:!!event.event_booking_enabled},summary:{total:rows.length,pending:count('pending_approval'),confirmed:count('confirmed')+count('cash_confirmed'),waitlisted:count('waitlisted'),cancelled:count('cancelled'),paymentHolds:count('approved_payment_hold'),attended:rows.filter((r:any)=>r.attendance==='attended').length,noShows:rows.filter((r:any)=>r.attendance==='no_show').length,unmarked:rows.filter((r:any)=>['confirmed','cash_confirmed'].includes(r.status)&&r.attendance==='not_marked').length,netCollected:Math.round(paid*100)/100},registrations:rows,overviewReadOnly:true,resultsMayBeTruncated:(registrations||[]).length===500||(payments||[]).length===500});
  }
  if(body.action==='followup_candidates'){
   const id=s(body.id),record=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!record||!record.linked_event_id)return fail('Linked activity not found',404);
   const event=(await sdk.asServiceRole.entities.Tournament.filter({id:record.linked_event_id,tenant_id,host_club_id:club_id},'-created_date',1))?.[0];
   if(!event)return fail('Linked event unavailable',404);
   const registrations=await sdk.asServiceRole.entities.EventRegistration.filter({event_id:event.id,tenant_id,club_id,attendance_status:'attended'},'-created_date',500);
   const candidates=(registrations||[]).filter((r:any)=>['confirmed','cash_confirmed'].includes(r.registration_status)).map((r:any)=>({registrationId:r.id,name:r.full_name||'',email:r.email||'',hasEmail:!!r.email,attendance:r.attendance_status}));
   return Response.json({success:true,activityId:id,candidates,reviewRequired:true,deliveryEnabled:false,consentAndSuppressionNotChecked:true,resultsMayBeTruncated:(registrations||[]).length===500});
  }
  if(body.action==='registration_preflight'){
   const id=s(body.id),record=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!record)return fail('Activity not found',404);
   const issues:string[]=[];
   if(record.status!=='scheduled'&&record.status!=='registration_closed')issues.push('activity_not_scheduled');
   if(!Number.isSafeInteger(record.capacity)||record.capacity<1)issues.push('invalid_capacity');
   if(!Number.isFinite(Date.parse(record.starts_at))||Date.parse(record.starts_at)<=Date.now())issues.push('activity_start_not_future');
   const venue=(await sdk.asServiceRole.entities.Venue.filter({id:record.venue_id,tenant_id,club_id,status:'active'},'-created_date',1))?.[0];
   if(!venue)issues.push('venue_not_active');
   if(!record.host_user_id)issues.push('host_required');
   else {
    const hosts=await sdk.asServiceRole.entities.User.filter({id:record.host_user_id},'-created_date',1);
    if(!hosts?.length||hosts[0].approval_status!=='approved'||hosts[0].active_tenant_id!==tenant_id||hosts[0].active_club_id!==club_id||!(hosts[0].role==='admin'||hosts[0].active_club_role==='club_admin'))issues.push('host_not_verified_for_club');
   }
   if(!['approval','automatic','closed'].includes(record.registration_mode)||record.registration_mode==='closed')issues.push('registration_policy_closed');
   if(!['none','cash','online'].includes(record.payment_method))issues.push('payment_policy_invalid');
   if(!record.communication_template_id)issues.push('approved_template_required');
   else {
    const templates=await sdk.asServiceRole.entities.CommunicationTemplate.filter({id:record.communication_template_id,tenant_id,owner_scope:'tenant',status:'approved'},'-created_date',1);
    if(!templates?.length||(templates[0].club_id&&templates[0].club_id!==club_id))issues.push('approved_template_not_found');
   }
   if(!record.linked_event_id)issues.push('event_link_missing');
   else {
    const linked=(await sdk.asServiceRole.entities.Tournament.filter({id:record.linked_event_id,tenant_id,host_club_id:club_id},'-created_date',1))?.[0];
    if(!linked)issues.push('linked_event_not_found');
    else {
     if(linked.event_registration_mode!=='rallyhub')issues.push('event_registration_mode_invalid');
     if(!linked.event_booking_enabled||linked.event_publish_status!=='published'||!linked.event_public_visible)issues.push('event_not_bookable');
     if(Number(linked.event_capacity)!==Number(record.capacity))issues.push('event_capacity_mismatch');
     if(linked.venue_id&&linked.venue_id!==record.venue_id)issues.push('event_venue_mismatch');
     if(linked.start_date&&String(linked.start_date).slice(0,10)!==String(record.starts_at).slice(0,10))issues.push('event_date_mismatch');
     if(Number(linked.event_fee_amount||0)>0&&record.payment_method!=='online')issues.push('paid_event_requires_online_payment');
    }
   }
   issues.push('booking_capacity_payment_and_notification_integration_pending');
   return Response.json({success:true,ready:false,issues,activityId:id,revision:record.revision});
  }
  if(body.action==='transition'){
   const id=s(body.id),to=s(body.to),revision=Number(body.expectedRevision);
   const record=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!record)return fail('Activity not found',404);
   if(!Number.isSafeInteger(revision)||record.revision!==revision)return fail('Activity changed; reload',409);
   const allowed:any={draft:['ready','cancelled'],ready:['draft','scheduled','cancelled'],scheduled:['registration_open','registration_closed','in_progress','cancelled'],registration_open:['registration_closed','in_progress','cancelled'],registration_closed:['registration_open','in_progress','cancelled'],in_progress:['completed','cancelled'],completed:['archived'],cancelled:['archived']};
   if(!allowed[record.status]?.includes(to))return fail('Transition unavailable until downstream workflows are connected',409);
   if(['ready','scheduled','registration_open','in_progress'].includes(to)){
    const venue=(await sdk.asServiceRole.entities.Venue.filter({id:record.venue_id,tenant_id,club_id,status:'active'},'-created_date',1))?.[0];
    if(!venue)return fail('Club venue is no longer active',409);
    if(!Number.isFinite(Date.parse(record.starts_at))||Date.parse(record.ends_at)<=Date.parse(record.starts_at))return fail('Invalid schedule',409);
   }
   if(['registration_open','registration_closed','in_progress','completed'].includes(to)){
    if(!record.linked_event_id)return fail('Link an existing event before advancing',409);
    const event=(await sdk.asServiceRole.entities.Tournament.filter({id:record.linked_event_id,tenant_id,host_club_id:club_id},'-created_date',1))?.[0];
    if(!event||event.event_registration_mode!=='rallyhub'||Number(event.event_capacity)!==Number(record.capacity)||event.venue_id&&event.venue_id!==record.venue_id||event.start_date&&String(event.start_date).slice(0,10)!==String(record.starts_at).slice(0,10))return fail('Linked event does not match activity',409);
    if(to==='registration_open'&&(!event.event_booking_enabled||!event.event_public_visible||event.event_publish_status!=='published'))return fail('Existing event is not open for registration',409);
    if(to==='registration_closed'&&event.event_booking_enabled)return fail('Close registration in the existing event service first',409);
    if(to==='completed'&&Date.parse(record.ends_at)>Date.now())return fail('Cannot complete activity before scheduled end',409);
   }
   const updated=await entity.updateMany({id,tenant_id,club_id,status:record.status,revision},{$set:{status:to,revision:revision+1,updated_by_user_id:user.id}});
   if(updated.updated!==1)return fail('Activity changed; reload',409);
   await audit(sdk,tenant_id,club_id,user.id,'ccc.activity.transition','ClubActivity',id,{status:record.status,revision},{status:to,revision:revision+1});
   return Response.json({success:true,id,status:to,revision:revision+1});
  }
  if(body.action!=='save_draft')return fail('Unsupported action');
  const f=body.draft||{},type=s(f.type),title=s(f.title,200),sport=s(f.sport),venue_id=s(f.venue_id);
  const starts_at=s(f.starts_at),ends_at=s(f.ends_at),capacity=Number(f.capacity);
  if(!types.has(type)||!title||!sport||!venue_id||!Number.isSafeInteger(capacity)||capacity<1)return fail('Invalid activity details');
  if(!Number.isFinite(Date.parse(starts_at))||!Number.isFinite(Date.parse(ends_at))||Date.parse(ends_at)<=Date.parse(starts_at))return fail('Invalid activity dates');
  const venues=await sdk.asServiceRole.entities.Venue.filter({id:venue_id,tenant_id,club_id,status:'active'},'-created_date',1);
  if(!venues?.length)return fail('Venue not in active club',403);
  const registration_mode=s(f.registration_mode||'approval'),payment_method=s(f.payment_method||'none');
  if(!['approval','automatic','closed'].includes(registration_mode)||!['none','cash','online'].includes(payment_method))return fail('Invalid policy');
  const host_user_id=s(f.host_user_id),communication_template_id=s(f.communication_template_id);
  if(host_user_id){
   const hosts=await sdk.asServiceRole.entities.User.filter({id:host_user_id,active_tenant_id:tenant_id,active_club_id:club_id,approval_status:'approved'},'-created_date',1);
   if(!hosts?.length||!(hosts[0].role==='admin'||hosts[0].active_club_role==='club_admin'))return fail('Select an authorised club host',403);
  }
  if(communication_template_id){
   const templates=await sdk.asServiceRole.entities.CommunicationTemplate.filter({id:communication_template_id,tenant_id,owner_scope:'tenant',status:'approved'},'-created_date',1);
   if(!templates?.length||(templates[0].club_id&&templates[0].club_id!==club_id))return fail('Select an approved club template',403);
  }
  const payload={tenant_id,club_id,sport,type,title,venue_id,starts_at,ends_at,capacity,registration_mode,payment_method,host_user_id,communication_template_id,updated_by_user_id:user.id};
  const id=s(body.id),revision=Number(body.expectedRevision);
  if(id){
   const existing=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!existing)return fail('Draft not found',404);
   if(existing.status!=='draft'||!Number.isSafeInteger(revision)||revision!==existing.revision)return fail('Draft changed; reload',409);
   const result=await entity.updateMany({id,tenant_id,club_id,status:'draft',revision},{$set:{...payload,revision:revision+1}});
   if(result.updated!==1)return fail('Draft changed; reload',409);
   return Response.json({success:true,id,revision:revision+1,status:'draft'});
  }
  const key=s(body.operationId,120);if(!key)return fail('Operation ID required');
  const prior=await entity.filter({tenant_id,club_id,idempotency_key:key},'-created_date',1);
  if(prior?.length)return Response.json({success:true,id:prior[0].id,revision:prior[0].revision,status:prior[0].status,reused:true});
  const created=await entity.create({...payload,status:'draft',revision:1,idempotency_key:key,created_by_user_id:user.id});
  return Response.json({success:true,id:created.id,revision:1,status:'draft'});
 }catch(e:any){return fail('Activity service unavailable',500)}
});
