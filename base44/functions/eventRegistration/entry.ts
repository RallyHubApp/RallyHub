/** Tenant Events registration. Explicitly gated until full payment, notice and admin workflows pass UAT. */
import {createClientFromRequest} from 'npm:@base44/sdk@0.8.48';
import {occupied,duplicate,nextStatus,consentEvidence} from './rules.js';
const clean=(v:any,n=200)=>String(v??'').trim().replace(/\s+/g,' ').slice(0,n);
const fail=(message:string,status=400)=>Response.json({success:false,error:message},{status});
Deno.serve(async(req)=>{
 if(req.method!=='POST')return fail('POST required',405);
 try{
  const b=await req.json();const action=clean(b.action||'get',30);const id=clean(b.eventId,80);
  if(!id)return fail('Event required');
  const base44=createClientFromRequest(req);
  const t=(await base44.asServiceRole.entities.Tournament.filter({id},'-created_date',1))?.[0];
  if(!t||!t.event_booking_enabled||t.event_registration_mode!=='rallyhub'||t.event_publish_status!=='published'||!t.event_public_visible)return fail('Bookings are not open for this event',404);
  const capacity=Number(t.event_capacity||0);if(!Number.isSafeInteger(capacity)||capacity<1)return fail('Event capacity is not configured',503);
  const rows=await base44.asServiceRole.entities.EventRegistration.filter({event_id:id,tenant_id:t.tenant_id},'-created_date',500);
  const publicEvent={id:t.id,name:t.name,date:t.start_date,venue:t.location,capacity,placesRemaining:Math.max(0,capacity-occupied(rows)),fee:Number(t.event_fee_amount||0),currency:t.event_currency||'EUR'};
  if(action==='get')return Response.json({success:true,event:publicEvent});
  if(action!=='apply')return fail('Unsupported action');
  const name=clean(b.fullName,120),email=clean(b.email,180).toLowerCase(),mobile=clean(b.mobile,40),emergencyName=clean(b.emergencyContactName,120),emergencyMobile=clean(b.emergencyContactMobile,40),operationId=clean(b.operationId,100);
  if(name.length<2||!/^\S+@\S+\.\S+$/.test(email)||!mobile||!emergencyName||!emergencyMobile||!operationId)return fail('Name, email, mobile, emergency contact and operation ID required');
  if(rows.some((r:any)=>r.operation_id===operationId))return Response.json({success:true,received:true,message:'Your application has already been received.'});
  if(duplicate(rows,email))return fail('This email may already have an application. Please contact the organiser.',409);
  const docs=await base44.asServiceRole.entities.ClubLegalDocument.filter({tenant_id:t.tenant_id,club_id:t.host_club_id,active:true},'-effective_from',100);
  const now=new Date().toISOString();const evidence=consentEvidence(b,docs,now);
  // An atomic counter is essential: two simultaneous applicants must never take the last place.
  await base44.asServiceRole.entities.Tournament.updateMany({id,tenant_id:t.tenant_id,event_reserved_count:null},{$set:{event_reserved_count:occupied(rows)}});
  const claimed=await base44.asServiceRole.entities.Tournament.updateMany({id,tenant_id:t.tenant_id,event_reserved_count:{$lt:capacity}},{$inc:{event_reserved_count:1}});
  const accepted=claimed.updated===1;
  const status=accepted?'pending_approval':'waitlisted';
  if(!accepted&&!t.event_waitlist_enabled)return fail('Event is full',409);
  try{
   await base44.asServiceRole.entities.EventRegistration.create({tenant_id:t.tenant_id,club_id:t.host_club_id,event_id:id,full_name:name,email,email_key:email,mobile,emergency_contact_name:emergencyName,emergency_contact_mobile:emergencyMobile,previous_experience:clean(b.previousExperience,250),medical_note:clean(b.medicalNote,1000),consent_evidence:evidence,photo_video_consent:!!b.consents?.photo_video,registration_status:status,payment_status:'not_required',operation_id:operationId,created_at:now});
  }catch(error){if(accepted)await base44.asServiceRole.entities.Tournament.updateMany({id,tenant_id:t.tenant_id,event_reserved_count:{$gt:0}},{$inc:{event_reserved_count:-1}});throw error;}
  return Response.json({success:true,received:true,status,message:accepted?'Application received. Await organiser approval.':'Event full. You have joined the waiting list.'});
 }catch(e){console.error('event registration error',e);return fail('Registration could not be completed. Please contact the organiser.',503)}
});
