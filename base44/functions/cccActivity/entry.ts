import {createClientFromRequest} from 'npm:@base44/sdk@0.8.48';
import {summariseEventFinance} from './reconciliation.mjs';
import {isConfiguredHost} from './hostPolicy.mjs';
import {readEventPayments} from './eventPaymentReader.mjs';
import {readEventRegistrations} from './registrationReader.mjs';
import {readScopedActivities} from './activityReader.mjs';
import {buildFollowupReview} from './followupReview.mjs';
import {validateEventLink} from './eventLinkPolicy.mjs';
import {readActivityAudit} from './activityAuditReader.mjs';
import {summariseClubOperations} from './operationsSummary.mjs';
import {readScopedInventory,summarisePeopleInventory,summariseManagementInventory} from './managementReaders.mjs';
import {validateHostVenueMapping,validatePersonAccessLink} from './managementActions.mjs';
import {communicationReadiness} from './communicationReadiness.mjs';
import {reviewHostRevocation} from './hostRevocation.mjs';
import {activityScheduleConflicts} from './activitySchedulePolicy.mjs';
import {reviewPersonCommunications} from './consentReview.mjs';
import {readPersonInventory} from './personInventory.mjs';
import {refundRecoveryQueue} from './refundRecovery.mjs';
import {identityIntegrity} from './identityIntegrity.mjs';
import {readCccAccess,cccAccessDecision} from './accessGate.mjs';
import {guestVenueReview} from './guestPolicy.mjs';
import {membershipReadiness} from './membershipReadiness.mjs';
import {reviewWeeklyRecurrence} from './recurrenceReview.mjs';
import {reviewLegacySessionOverlaps} from './legacySessionReview.mjs';
import {reviewDublinOccurrences} from './localTimeReview.mjs';
const s=(v:any,n=180)=>String(v??'').trim().slice(0,n);
const types=new Set(['session','guest_session','taster','open_day','clinic','training','quick_play','tournament','tournival','kotc','interclub']);
const fail=(error:string,status=400)=>Response.json({success:false,error},{status});
const isClubHost=async(sdk:any,tenant_id:string,club_id:string,venue_id:string,host_user_id:string)=>{
 const [users,venues]=await Promise.all([sdk.asServiceRole.entities.User.filter({id:host_user_id,active_tenant_id:tenant_id,active_club_id:club_id,approval_status:'approved'},'-created_date',1),sdk.asServiceRole.entities.Venue.filter({id:venue_id,tenant_id,club_id,status:'active'},'-created_date',1)]);
 const host=users?.[0],venue=venues?.[0];if(!host||!venue)return false;
 const grant=await readCccAccess(sdk,host,tenant_id,club_id);
 if(grant.admin)return true;
 if(!grant.member)return false;
 const configs=await sdk.asServiceRole.entities.MembershipVenueHostConfig.filter({tenant_id,club_id,active:true},'-updated_date',100);
 return isConfiguredHost(configs,venue,host.email);
};
const audit=async(sdk:any,tenant_id:string,club_id:string,user_id:string,action:string,entity_type:string,entity_id:string,before:any,after:any)=>{try{await sdk.asServiceRole.entities.AuditLog.create({tenant_id,club_id,user_id,action,entity_type,entity_id,scope_type:'club',scope_id:club_id,before_state:JSON.stringify(before),after_state:JSON.stringify(after)})}catch(_){/* A successful CAS must not be reported as failed after an audit transport error. */}};
Deno.serve(async req=>{
 if(req.method!=='POST')return fail('POST required',405);
 try{
  const sdk=createClientFromRequest(req),user=await sdk.auth.me().catch(()=>null);
  if(!user)return fail('Authentication required',403);
  const tenant_id=s(user.active_tenant_id),club_id=s(user.active_club_id);
  if(!tenant_id||!club_id)return fail('Select a club',409);
  const body=await req.json().catch(()=>({})),entity=sdk.asServiceRole.entities.ClubActivity;
  const hostAction=['host_activities','host_roster','host_roster_page','host_checkin'].includes(body.action);
  const access=await readCccAccess(sdk,user,tenant_id,club_id);
  if(!access.admin&&!hostAction)return fail('Active tenant or club administrator grant required',403);
  if(hostAction&&!access.member)return fail('Active club access required',403);
  if(body.action==='host_activities'){
   if(!access.admin&&user.approval_status&&user.approval_status!=='approved')return fail('Host access denied',403);
   const activityRead=await readScopedActivities(entity,{tenantId:tenant_id,clubId:club_id});const activities=activityRead.activities;
   const active=(activities||[]).filter((a:any)=>a.linked_event_id&&['scheduled','registration_open','registration_closed','in_progress'].includes(a.status));
   let allowed=active;
   if(!access.admin){
    const [users,venues,configs]=await Promise.all([
     sdk.asServiceRole.entities.User.filter({id:user.id,active_tenant_id:tenant_id,active_club_id:club_id,approval_status:'approved'},'-created_date',1),
     sdk.asServiceRole.entities.Venue.filter({tenant_id,club_id,status:'active'},'-created_date',200),
     sdk.asServiceRole.entities.MembershipVenueHostConfig.filter({tenant_id,club_id,active:true},'-updated_date',100)
    ]);
    const host=users?.[0],byVenue=new Map((venues||[]).map((v:any)=>[v.id,v]));
    allowed=host?active.filter((a:any)=>{const venue=byVenue.get(a.venue_id);return venue&&isConfiguredHost(configs,venue,host.email);}):[];
   }
   return Response.json({success:true,activities:allowed.map((a:any)=>({id:a.id,title:a.title,startsAt:a.starts_at,status:a.status,venueId:a.venue_id})),resultsMayBeTruncated:!activityRead.complete});
  }
  if(hostAction){
   const id=s(body.id),record=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!record||!record.linked_event_id)return fail('Linked activity not found',404);
   if(!access.admin&&((user.approval_status&&user.approval_status!=='approved')||!await isClubHost(sdk,tenant_id,club_id,record.venue_id,user.id)))return fail('Host access denied',403);
   const event=(await sdk.asServiceRole.entities.Tournament.filter({id:record.linked_event_id,tenant_id,host_club_id:club_id},'-created_date',1))?.[0];
   if(!event)return fail('Linked event unavailable',404);
   if(body.action==='host_roster'||body.action==='host_roster_page'){
    const continuation=body.action==='host_roster_page',cursor=s(body.cursor,1024);
    if(continuation&&!cursor)return fail('Roster continuation cursor required');
    const registrationRead=await readEventRegistrations(sdk.asServiceRole.entities.EventRegistration,{tenantId:tenant_id,clubId:club_id,eventId:event.id,startCursor:continuation?cursor:'',maxPages:1});const registrations=registrationRead.registrations;
    return Response.json({success:true,activityId:id,eventName:event.name||record.title,participants:(registrations||[]).filter((r:any)=>['confirmed','cash_confirmed'].includes(r.registration_status)).map((r:any)=>({id:r.id,name:r.full_name||'',bookingStatus:r.registration_status||'',attendance:r.attendance_status||'not_marked',attendanceRevision:Number(r.attendance_revision||0)})),nextCursor:registrationRead.nextCursor,resultsMayBeTruncated:!registrationRead.complete});
   }
   if(!['scheduled','registration_open','registration_closed','in_progress','completed'].includes(record.status))return fail('Check-in unavailable for this activity',409);
   const registrationId=s(body.registrationId),attendance=s(body.attendance),revision=Number(body.expectedRevision);
   if(!['attended','no_show','excused','not_marked'].includes(attendance)||!Number.isSafeInteger(revision)||revision<0)return fail('Invalid check-in request');
   const r=(await sdk.asServiceRole.entities.EventRegistration.filter({id:registrationId,event_id:event.id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!r)return fail('Registration not found',404);
   if(!['confirmed','cash_confirmed'].includes(r.registration_status))return fail('Only confirmed participants can be checked in',409);
   if(Number(r.attendance_revision||0)!==revision)return fail('Attendance changed; reload',409);
   const prior=r.attendance_revision===undefined?{$exists:false}:r.attendance_revision;
   const updated=await sdk.asServiceRole.entities.EventRegistration.updateMany({id:registrationId,event_id:event.id,tenant_id,club_id,attendance_revision:prior},{$set:{attendance_status:attendance,attendance_revision:revision+1,attendance_marked_at:new Date().toISOString(),attendance_marked_by_user_id:user.id}});
   if(updated.updated!==1)return fail('Attendance changed; reload',409);
   await audit(sdk,tenant_id,club_id,user.id,'ccc.host.checkin','EventRegistration',registrationId,{attendance:r.attendance_status||'not_marked',revision},{attendance,revision:revision+1});
   return Response.json({success:true,registrationId,attendance,revision:revision+1});
  }
  if(body.action==='person_link_review'||body.action==='person_link_confirm'){
   const accessId=s(body.accessId),personId=s(body.personId),reason=s(body.reason,500);
   if(!accessId||!personId)return fail('Access ID and Person ID required');
   const [accessRows,personRows]=await Promise.all([
    sdk.asServiceRole.entities.ClubUserAccess.filter({id:accessId,tenant_id,club_id},'-created_date',1),
    sdk.asServiceRole.entities.Person.filter({id:personId,tenant_id},'-created_date',1)
   ]);
   const access=accessRows?.[0],person=personRows?.[0];
   const issue=validatePersonAccessLink(access,person,{tenantId:tenant_id,clubId:club_id,expectedPersonId:personId});
   if(issue)return fail(issue,409);
   if(person.linked_user_id&&person.linked_user_id!==access.user_id)return fail('Person is linked to a different user',409);
   const [conflicting,reverseLinks]=await Promise.all([
    sdk.asServiceRole.entities.ClubUserAccess.filter({tenant_id,club_id,user_id:access.user_id,status:'active'},'-created_date',100),
    sdk.asServiceRole.entities.ClubUserAccess.filter({tenant_id,club_id,person_id:personId,status:'active'},'-created_date',100)
   ]);
   if(conflicting.length>=100||reverseLinks.length>=100)return fail('Identity link review exceeds safe limit',503);
   if(conflicting.some((a:any)=>a.id!==access.id&&a.person_id&&a.person_id!==personId))return fail('User has conflicting active Person links',409);
   if(reverseLinks.some((a:any)=>a.id!==access.id&&a.user_id!==access.user_id))return fail('Person is already linked to a different user in this club',409);
   if(body.action==='person_link_review')return Response.json({success:true,access:{id:access.id,userId:access.user_id,status:access.status,personId:access.person_id||null},person:{id:person.id,name:person.full_name||'',linkedUserId:person.linked_user_id||null},requiresIndependentIdentityVerification:true,mutationPerformed:false});
   if(body.confirmIdentityVerified!==true||reason.length<12)return fail('Confirm independent identity verification and provide a reason (at least 12 characters)');
   if(access.person_id===personId)return Response.json({success:true,alreadyLinked:true,mutationPerformed:false});
   const result=await sdk.asServiceRole.entities.ClubUserAccess.updateMany({id:accessId,tenant_id,club_id,status:'active',person_id:{$exists:false}},{$set:{person_id:personId}});
   if(result.updated!==1)return fail('Access link changed; reload review',409);
   await audit(sdk,tenant_id,club_id,user.id,'ccc.person.link','ClubUserAccess',accessId,{person_id:null},{person_id:personId,verification_confirmed:true});
   return Response.json({success:true,accessId,personId,mutationPerformed:true});
  }
  if(body.action==='host_revoke_review'||body.action==='host_revoke_confirm'){
   const configId=s(body.configId),reason=s(body.reason,500);
   if(!configId)return fail('Host configuration ID required');
   const configs=await sdk.asServiceRole.entities.MembershipVenueHostConfig.filter({id:configId,tenant_id,club_id},'-created_date',1);
   const review=reviewHostRevocation(configs?.[0],{tenantId:tenant_id,clubId:club_id});
   if(!review.allowed)return fail(review.error,409);
   if(body.action==='host_revoke_review')return Response.json({success:true,...review,mutationPerformed:false});
   if(body.confirmRevocation!==true||reason.length<12)return fail('Confirm host revocation and provide a reason (at least 12 characters)');
   const updated=await sdk.asServiceRole.entities.MembershipVenueHostConfig.updateMany({id:configId,tenant_id,club_id,active:true},{$set:{active:false,updated_by_user_id:user.id,updated_at:new Date().toISOString()}});
   if(updated.updated!==1)return fail('Host configuration changed; reload review',409);
   await audit(sdk,tenant_id,club_id,user.id,'ccc.host.revoke','MembershipVenueHostConfig',configId,{active:true},{active:false,affectedHostCount:review.affectedHostCount});
   return Response.json({success:true,configId,mutationPerformed:true,affectedHostCount:review.affectedHostCount});
  }
  if(body.action==='host_venue_review'||body.action==='host_venue_confirm'){
   const configId=s(body.configId),venueId=s(body.venueId),reason=s(body.reason,500);
   if(!configId||!venueId)return fail('Host configuration and venue required');
   const [configs,venues]=await Promise.all([
    sdk.asServiceRole.entities.MembershipVenueHostConfig.filter({id:configId,tenant_id,club_id},'-created_date',1),
    sdk.asServiceRole.entities.Venue.filter({id:venueId,tenant_id,club_id},'-created_date',1)
   ]);
   const config=configs?.[0],venue=venues?.[0];
   const issue=validateHostVenueMapping(config,venue,{tenantId:tenant_id,clubId:club_id,expectedVenueId:venueId});
   if(issue)return fail(issue,409);
   if(body.action==='host_venue_review')return Response.json({success:true,configId,venue:{id:venue.id,name:venue.name},configuredHostCount:config.host_emails.length,legacyVenueKey:config.venue_key||'',currentVenueId:config.venue_id||null,mutationPerformed:false});
   if(body.confirmVenueVerified!==true||reason.length<12)return fail('Confirm venue assignment and provide a reason (at least 12 characters)');
   if(config.venue_id===venueId)return Response.json({success:true,alreadyMapped:true,mutationPerformed:false});
   const result=await sdk.asServiceRole.entities.MembershipVenueHostConfig.updateMany({id:configId,tenant_id,club_id,active:true,venue_id:{$exists:false}},{$set:{venue_id:venueId,updated_by_user_id:user.id,updated_at:new Date().toISOString()}});
   if(result.updated!==1)return fail('Venue mapping changed; reload review',409);
   await audit(sdk,tenant_id,club_id,user.id,'ccc.host.venue_map','MembershipVenueHostConfig',configId,{venue_id:null,venue_key:config.venue_key},{venue_id:venueId,verification_confirmed:true});
   return Response.json({success:true,configId,venueId,mutationPerformed:true});
  }
  if(body.action==='membership_readiness'){
   const [configs,policies,documents,gateways]=await Promise.all([
    readScopedInventory(sdk.asServiceRole.entities.MembershipApplicationConfig,{tenant_id,club_id},{maxPages:10}),
    readScopedInventory(sdk.asServiceRole.entities.ClubPolicy,{tenant_id,club_id},{maxPages:10}),
    readScopedInventory(sdk.asServiceRole.entities.ClubLegalDocument,{tenant_id,club_id},{maxPages:10}),
    readScopedInventory(sdk.asServiceRole.entities.PaymentGatewayAccount,{tenant_id,club_id},{maxPages:10})
   ]);
   return Response.json({success:true,...membershipReadiness(configs.rows,policies.rows,documents.rows,gateways.rows,{tenantId:tenant_id,clubId:club_id,complete:configs.complete&&policies.complete&&documents.complete&&gateways.complete})});
  }
  if(body.action==='people_summary'){
   const [access,applications]=await Promise.all([readScopedInventory(sdk.asServiceRole.entities.ClubUserAccess,{tenant_id,club_id}),readScopedInventory(sdk.asServiceRole.entities.MembershipApplication,{tenant_id,club_id})]);
   return Response.json({success:true,...summarisePeopleInventory(access,applications),integrity:identityIntegrity(access.rows,{tenantId:tenant_id,clubId:club_id,complete:access.complete})});
  }
  if(body.action==='person_communication_review'){
   const personId=s(body.personId),channel=s(body.channel),purpose=s(body.purpose);
   if(!personId||!['email','sms','whatsapp'].includes(channel)||!['marketing','transactional'].includes(purpose))return fail('Person, channel and purpose required');
   const [people,access]=await Promise.all([
    sdk.asServiceRole.entities.Person.filter({id:personId,tenant_id},'-created_date',1),
    readScopedInventory(sdk.asServiceRole.entities.ClubUserAccess,{tenant_id,club_id,person_id:personId},{pageSize:100,maxPages:5})
   ]);
   if(!people?.length||!access.complete||!access.rows.some((a:any)=>a.status==='active'))return fail('Active club Person link not verified',409);
   const [consents,preferences,suppressions]=await Promise.all([
    readScopedInventory(sdk.asServiceRole.entities.ConsentRecord,{tenant_id,club_id,person_id:personId},{pageSize:100,maxPages:5}),
    readPersonInventory(sdk.asServiceRole.entities.CommunicationPreference,{personId,pageSize:100,maxPages:5}),
    readPersonInventory(sdk.asServiceRole.entities.CommunicationSuppression,{personId,channel,pageSize:100,maxPages:5})
   ]);
   return Response.json({success:true,...reviewPersonCommunications({tenantId:tenant_id,clubId:club_id,personId,channel,purpose,consents:consents.rows,preferences:preferences.rows,suppressions:suppressions.rows,complete:consents.complete&&preferences.complete&&suppressions.complete})});
  }
  if(body.action==='communications_readiness'){
   const templates=await readScopedInventory(sdk.asServiceRole.entities.CommunicationTemplate,{tenant_id,owner_scope:'tenant'});
   const scoped=templates.rows.filter((t:any)=>!t.club_id||t.club_id===club_id);
   return Response.json({success:true,...communicationReadiness(scoped,{complete:templates.complete})});
  }
  if(body.action==='refund_recovery_queue'){
   const [payments,refunds]=await Promise.all([
    readScopedInventory(sdk.asServiceRole.entities.PaymentRecord,{tenant_id,club_id},{pageSize:200,maxPages:30}),
    readScopedInventory(sdk.asServiceRole.entities.PaymentRefund,{tenant_id,club_id},{pageSize:200,maxPages:30})
   ]);
   return Response.json({success:true,...refundRecoveryQueue(payments.rows,refunds.rows,{tenantId:tenant_id,clubId:club_id,complete:payments.complete&&refunds.complete})});
  }
  if(body.action==='management_summary'){
   const [templateRead,hosts,venues]=await Promise.all([readScopedInventory(sdk.asServiceRole.entities.CommunicationTemplate,{tenant_id,owner_scope:'tenant'}),readScopedInventory(sdk.asServiceRole.entities.MembershipVenueHostConfig,{tenant_id,club_id}),readScopedInventory(sdk.asServiceRole.entities.Venue,{tenant_id,club_id,status:'active'})]);
   const templates={...templateRead,rows:templateRead.rows.filter((t:any)=>!t.club_id||t.club_id===club_id)};
   return Response.json({success:true,...summariseManagementInventory(templates,hosts,venues)});
  }
  if(body.action==='options'){
   const venueId=s(body.venueId);const venue=venueId?(await sdk.asServiceRole.entities.Venue.filter({id:venueId,tenant_id,club_id,status:'active'},'-created_date',1))?.[0]:null;
   if(venueId&&!venue)return fail('Venue outside active club',403);
   const [users,templates,events,hostConfigs,courts]=await Promise.all([
    sdk.asServiceRole.entities.User.filter({active_tenant_id:tenant_id,active_club_id:club_id},'full_name',200),
    sdk.asServiceRole.entities.CommunicationTemplate.filter({tenant_id,status:'approved',owner_scope:'tenant'},'-updated_date',200),
    sdk.asServiceRole.entities.Tournament.filter({tenant_id,host_club_id:club_id,event_registration_mode:'rallyhub'},'-created_date',100),
    sdk.asServiceRole.entities.MembershipVenueHostConfig.filter({tenant_id,club_id,active:true},'-updated_date',100),
    venueId?sdk.asServiceRole.entities.Court.filter({tenant_id,club_id,venue_id:venueId},'name',200):Promise.resolve([])
   ]);
   const [tenantGrants,clubGrants]=await Promise.all([
    readScopedInventory(sdk.asServiceRole.entities.TenantUserAccess,{tenant_id},{maxPages:20}),
    readScopedInventory(sdk.asServiceRole.entities.ClubUserAccess,{tenant_id,club_id},{maxPages:30})
   ]);
   if(!tenantGrants.complete||!clubGrants.complete)return fail('Host permissions inventory incomplete',503);
   const delegated=(u:any)=>!!venue&&isConfiguredHost(hostConfigs,venue,u.email);
   const grantsAdmin=(u:any)=>cccAccessDecision({user:u,tenantId:tenant_id,clubId:club_id,tenantGrants:tenantGrants.rows,clubGrants:clubGrants.rows}).admin;
   const grantsMember=(u:any)=>cccAccessDecision({user:u,tenantId:tenant_id,clubId:club_id,tenantGrants:tenantGrants.rows,clubGrants:clubGrants.rows}).member;
   const hosts=(users||[]).filter((u:any)=>(!u.approval_status||u.approval_status==='approved')&&(grantsAdmin(u)||(grantsMember(u)&&delegated(u)))).map((u:any)=>({id:u.id,name:u.full_name||u.name||u.email||u.id,delegated:delegated(u)}));
   return Response.json({success:true,hosts,courts:(courts||[]).filter((c:any)=>c.status!=='Maintenance').map((c:any)=>({id:c.id,name:c.name})),templates:(templates||[]).filter((t:any)=>!t.club_id||t.club_id===club_id).map((t:any)=>({id:t.id,name:t.name,purpose:t.purpose,version:t.version})),events:(events||[]).map((e:any)=>({id:e.id,name:e.name||e.title||e.id,start_date:e.start_date,capacity:e.event_capacity}))});
  }
  if(body.action==='guest_eligibility_review'){
   const venueId=s(body.venueId),experience=s(body.experience);
   if(!venueId)return fail('Venue required');
   const venue=(await sdk.asServiceRole.entities.Venue.filter({id:venueId,tenant_id,club_id},'-created_date',1))?.[0];
   return Response.json({success:true,...guestVenueReview({venue,experience,sessionActive:body.sessionActive!==false,tenantId:tenant_id,clubId:club_id})});
  }
  if(body.action==='recurrence_review'){
   const draft=body.draft||{};
   const candidate={id:s(body.id),tenant_id,club_id,venue_id:s(draft.venue_id),court_id:s(draft.court_id),starts_at:s(draft.starts_at),ends_at:s(draft.ends_at)};
   const venue=(await sdk.asServiceRole.entities.Venue.filter({id:candidate.venue_id,tenant_id,club_id,status:'active'},'-created_date',1))?.[0];
   if(!venue)return fail('Active venue required',409);
   if(candidate.court_id){const courts=await sdk.asServiceRole.entities.Court.filter({id:candidate.court_id,tenant_id,club_id,venue_id:candidate.venue_id},'-created_date',1);if(!courts?.length||courts[0].status==='Maintenance')return fail('Court not available in selected venue',409)}
   const [schedule,legacy]=await Promise.all([readScopedActivities(entity,{tenantId:tenant_id,clubId:club_id}),readScopedInventory(sdk.asServiceRole.entities.GuestSessionLink,{tenant_id,club_id},{pageSize:200,maxPages:20})]);
   const ccc=reviewWeeklyRecurrence(candidate,schedule.activities,{weeks:body.weeks,complete:schedule.complete});
   const legacyReview=reviewLegacySessionOverlaps(ccc.occurrences,legacy.rows,{tenantId:tenant_id,clubId:club_id,venueName:venue.name,complete:legacy.complete});
   const local=reviewDublinOccurrences(ccc.occurrences);
   const occurrences=local.occurrences.map((o:any,i:number)=>({...o,legacyOverlaps:legacyReview.occurrences[i]?.legacyOverlaps||[],legacyUnmapped:legacyReview.occurrences[i]?.legacyUnmapped||[]}));
   return Response.json({success:true,...ccc,occurrences,ready:ccc.ready&&legacyReview.ready&&local.ready,localTimeIssues:local.issues,timezone:local.timezone,daylightSavingChecked:true,legacySessionInventoryComplete:legacy.complete,legacyConflictedWeeks:legacyReview.conflictedWeeks,legacyUnmappedWeeks:legacyReview.unmappedWeeks,legacySessionCheckAdvisory:true});
  }
  if(body.action==='schedule_review'){
   const draft=body.draft||{};
   const candidate={id:s(body.id),tenant_id,club_id,venue_id:s(draft.venue_id),court_id:s(draft.court_id),starts_at:s(draft.starts_at),ends_at:s(draft.ends_at)};
   if(candidate.court_id){const courts=await sdk.asServiceRole.entities.Court.filter({id:candidate.court_id,tenant_id,club_id,venue_id:candidate.venue_id},'-created_date',1);if(!courts?.length||courts[0].status==='Maintenance')return fail('Court not available in selected venue',409)}
   const [schedule,legacy,venueRows]=await Promise.all([readScopedActivities(entity,{tenantId:tenant_id,clubId:club_id}),readScopedInventory(sdk.asServiceRole.entities.GuestSessionLink,{tenant_id,club_id},{pageSize:200,maxPages:20}),sdk.asServiceRole.entities.Venue.filter({id:candidate.venue_id,tenant_id,club_id,status:'active'},'-created_date',1)]);
   const checked=activityScheduleConflicts(candidate,schedule.activities);
   const valid=checked.valid&&!!venueRows?.[0];
   const legacyReview=reviewLegacySessionOverlaps([{week:1,startsAt:candidate.starts_at,endsAt:candidate.ends_at}],legacy.rows,{tenantId:tenant_id,clubId:club_id,venueName:venueRows?.[0]?.name,complete:legacy.complete});
   return Response.json({success:true,valid,conflicts:checked.conflicts,legacyOverlaps:legacyReview.occurrences[0]?.legacyOverlaps||[],legacyUnmapped:legacyReview.occurrences[0]?.legacyUnmapped||[],complete:schedule.complete&&legacy.complete,ready:valid&&schedule.complete&&checked.conflicts.length===0&&legacyReview.ready,mutationPerformed:false,legacySessionCheckAdvisory:true});
  }
  if(body.action==='operations_summary'){
   const result=await readScopedActivities(entity,{tenantId:tenant_id,clubId:club_id});
   return Response.json({success:true,...summariseClubOperations(result.activities,{complete:result.complete})});
  }
  if(body.action==='list'){
   const result=await readScopedActivities(entity,{tenantId:tenant_id,clubId:club_id});
   return Response.json({success:true,activities:result.activities,resultsMayBeTruncated:!result.complete});
  }
  if(body.action==='activity_audit'){
   const id=s(body.id);
   const record=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!record)return fail('Activity not found',404);
   const history=await readActivityAudit(sdk.asServiceRole.entities.AuditLog,{tenantId:tenant_id,clubId:club_id,activityId:id});
   return Response.json({success:true,activityId:id,...history});
  }
  if(body.action==='link_event'){
   const id=s(body.id),event_id=s(body.eventId),revision=Number(body.expectedRevision);
   const record=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!record)return fail('Activity not found',404);
   if(record.revision!==revision||!Number.isSafeInteger(revision))return fail('Activity changed; reload',409);
   if(!['draft','ready','scheduled'].includes(record.status))return fail('Cannot link activity in current state',409);
   const event=(await sdk.asServiceRole.entities.Tournament.filter({id:event_id,tenant_id,host_club_id:club_id},'-created_date',1))?.[0];
   if(!event)return fail('Event not found in selected club',404);
   const [venueRows,templateRows,hostVerified]=await Promise.all([
    sdk.asServiceRole.entities.Venue.filter({id:record.venue_id,tenant_id,club_id,status:'active'},'-created_date',1),
    record.communication_template_id?sdk.asServiceRole.entities.CommunicationTemplate.filter({id:record.communication_template_id,tenant_id,owner_scope:'tenant',status:'approved'},'-created_date',1):Promise.resolve([]),
    record.host_user_id?isClubHost(sdk,tenant_id,club_id,record.venue_id,record.host_user_id):Promise.resolve(false)
   ]);
   const template=templateRows?.[0],templateVerified=!!template&&(!template.club_id||template.club_id===club_id);
   const issues=validateEventLink(record,event,{venue:venueRows?.[0],hostVerified,templateVerified});
   if(issues.length)return fail('Event link requires review: '+issues.join(', '),409);
   const existingLinks=await entity.filter({tenant_id,club_id,linked_event_id:event_id},{sort:'-created_date',limit:2});
   if(!existingLinks||!Array.isArray(existingLinks.items))return fail('Unable to verify existing event links',503);
   if(existingLinks.items.some((a:any)=>a.id!==id))return fail('Event is already linked to another activity',409);
   if(existingLinks.has_more===true)return fail('Event link review incomplete',503);
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
   const registrationRead=await readEventRegistrations(sdk.asServiceRole.entities.EventRegistration,{tenantId:tenant_id,clubId:club_id,eventId:event.id,maxPages:4});const registrations=registrationRead.registrations;
   const registrationIds=(registrations||[]).map((r:any)=>r.id).filter(Boolean);
   const paymentRead=await readEventPayments(sdk.asServiceRole.entities.PaymentRecord,{tenantId:tenant_id,clubId:club_id,registrationIds});const payments=paymentRead.payments;
   const financeResult=summariseEventFinance(registrations||[],payments||[]);const byRegistration=financeResult.byRegistration;const {byRegistration:_,...finance}=financeResult;finance.complete=registrationRead.complete&&!paymentRead.possiblyTruncated;finance.requiresReview=!finance.complete||finance.anomalies.length>0;
   const rows=(registrations||[]).map((r:any)=>{const p:any=byRegistration.get(r.id);return {id:r.id,name:r.full_name||'',email:r.email||'',mobile:r.mobile||'',status:r.registration_status||'',paymentStatus:p?.payment_status||r.payment_status||'unknown',amount:Number(p?.amount||0),refundedAmount:Number(p?.amount_refunded||0),createdAt:r.created_at||'',attendance:r.attendance_status||'not_marked',attendanceRevision:Number(r.attendance_revision||0)}});
   const count=(status:string)=>rows.filter((r:any)=>r.status===status).length;

   return Response.json({success:true,activityId:id,event:{id:event.id,name:event.name||record.title,capacity:Number(event.event_capacity||0),fee:Number(event.event_fee_amount||0),bookingEnabled:!!event.event_booking_enabled},summary:{total:rows.length,pending:count('pending_approval'),confirmed:count('confirmed')+count('cash_confirmed'),waitlisted:count('waitlisted'),cancelled:count('cancelled'),paymentHolds:count('approved_payment_hold'),attended:rows.filter((r:any)=>r.attendance==='attended').length,noShows:rows.filter((r:any)=>r.attendance==='no_show').length,unmarked:rows.filter((r:any)=>['confirmed','cash_confirmed'].includes(r.status)&&r.attendance==='not_marked').length,netCollected:finance.net},finance,registrations:rows,overviewReadOnly:true,summaryIsPartial:!registrationRead.complete,initialPaymentReadComplete:!paymentRead.possiblyTruncated,registrationNextCursor:registrationRead.nextCursor,resultsMayBeTruncated:!registrationRead.complete||paymentRead.possiblyTruncated});
  }
  if(body.action==='registration_page'){
   const id=s(body.id),cursor=s(body.cursor,2048);
   if(!cursor||cursor.length>1024)return fail('Valid continuation cursor required',400);
   const record=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!record||!record.linked_event_id)return fail('Linked activity not found',404);
   const event=(await sdk.asServiceRole.entities.Tournament.filter({id:record.linked_event_id,tenant_id,host_club_id:club_id},'-created_date',1))?.[0];
   if(!event)return fail('Linked event unavailable',404);
   const read=await readEventRegistrations(sdk.asServiceRole.entities.EventRegistration,{tenantId:tenant_id,clubId:club_id,eventId:event.id,startCursor:cursor,pageSize:250,maxPages:1});
   const paymentRead=await readEventPayments(sdk.asServiceRole.entities.PaymentRecord,{tenantId:tenant_id,clubId:club_id,registrationIds:read.registrations.map((r:any)=>r.id)});
   const financeResult=summariseEventFinance(read.registrations,paymentRead.payments);const byRegistration=financeResult.byRegistration;
   const rows=read.registrations.map((r:any)=>{const p:any=byRegistration.get(r.id);return {id:r.id,name:r.full_name||'',email:r.email||'',mobile:r.mobile||'',status:r.registration_status||'',paymentStatus:p?.payment_status||r.payment_status||'unknown',amount:Number(p?.amount||0),refundedAmount:Number(p?.amount_refunded||0),createdAt:r.created_at||'',attendance:r.attendance_status||'not_marked',attendanceRevision:Number(r.attendance_revision||0)}});
   const {byRegistration:_,...pageFinance}=financeResult;pageFinance.complete=!paymentRead.possiblyTruncated;pageFinance.requiresReview=!pageFinance.complete||pageFinance.anomalies.length>0;
   return Response.json({success:true,activityId:id,registrations:rows,nextCursor:read.nextCursor,hasMore:read.hasMore,finance:pageFinance,financeNotIncluded:paymentRead.possiblyTruncated,paymentReviewRequired:pageFinance.requiresReview});
  }
  if(body.action==='followup_candidates'){
   const id=s(body.id),record=(await entity.filter({id,tenant_id,club_id},'-created_date',1))?.[0];
   if(!record||!record.linked_event_id)return fail('Linked activity not found',404);
   const event=(await sdk.asServiceRole.entities.Tournament.filter({id:record.linked_event_id,tenant_id,host_club_id:club_id},'-created_date',1))?.[0];
   if(!event)return fail('Linked event unavailable',404);
   const registrationRead=await readEventRegistrations(sdk.asServiceRole.entities.EventRegistration,{tenantId:tenant_id,clubId:club_id,eventId:event.id,extraFilters:{attendance_status:'attended'}});const registrations=registrationRead.registrations;
   const review=buildFollowupReview(registrations);
   return Response.json({success:true,activityId:id,...review,resultsMayBeTruncated:!registrationRead.complete});
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
    if(!await isClubHost(sdk,tenant_id,club_id,record.venue_id,record.host_user_id))issues.push('host_not_verified_for_club');
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
   if(['ready','scheduled'].includes(to)){
    if(record.court_id){const courts=await sdk.asServiceRole.entities.Court.filter({id:record.court_id,tenant_id,club_id,venue_id:record.venue_id},'-created_date',1);if(!courts?.length||courts[0].status==='Maintenance')return fail('Court unavailable',409)}
    const schedule=await readScopedActivities(entity,{tenantId:tenant_id,clubId:club_id});
    if(!schedule.complete)return fail('Schedule review incomplete; cannot advance activity',503);
    const checked=activityScheduleConflicts(record,schedule.activities);
    if(!checked.valid)return fail('Invalid schedule',409);
    if(checked.conflicts.length)return fail('Venue has an overlapping active activity',409);
   }
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
  const court_id=s(f.court_id);
  if(court_id){const courts=await sdk.asServiceRole.entities.Court.filter({id:court_id,tenant_id,club_id,venue_id},'-created_date',1);if(!courts?.length||courts[0].status==='Maintenance')return fail('Court not available in selected venue',409)}
  const registration_mode=s(f.registration_mode||'approval'),payment_method=s(f.payment_method||'none');
  if(!['approval','automatic','closed'].includes(registration_mode)||!['none','cash','online'].includes(payment_method))return fail('Invalid policy');
  const host_user_id=s(f.host_user_id),communication_template_id=s(f.communication_template_id);
  if(host_user_id){
   if(!await isClubHost(sdk,tenant_id,club_id,venue_id,host_user_id))return fail('Select an authorised club host',403);
  }
  if(communication_template_id){
   const templates=await sdk.asServiceRole.entities.CommunicationTemplate.filter({id:communication_template_id,tenant_id,owner_scope:'tenant',status:'approved'},'-created_date',1);
   if(!templates?.length||(templates[0].club_id&&templates[0].club_id!==club_id))return fail('Select an approved club template',403);
  }
  const payload={tenant_id,club_id,sport,type,title,venue_id,court_id,starts_at,ends_at,capacity,registration_mode,payment_method,host_user_id,communication_template_id,updated_by_user_id:user.id};
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
