/** Isolated in-memory acceptance harness. Does not perform production/backend writes.
 * Exercises actual CCC decision contracts through booking, approval, webhook and outbox.
 */
import {registrationDecision} from './bookingPolicy.js';
import {reviewRegistrationAction} from './approvalLifecycle.mjs';
import {reviewPaymentWebhook} from './paymentWebhookLifecycle.mjs';
import {planCommunicationOutbox,planOutboxTransition} from './communicationOutbox.mjs';
import {reviewScopedEventClosure} from '../../../base44/functions/cccActivity/closureGate.mjs';
export function createBookingJourney({tenantId='t1',clubId='c1',eventId='event1',capacity=2,amount=5.5,now=Date.now()}={}){
 const state={registrations:[],payments:[],outbox:[],processedWebhooks:new Set(),audit:[],activityStatus:'in_progress'};
 const actor={id:'admin',tenant_id:tenantId,club_id:clubId,role:'club_admin'};
 const record=(action,entityId)=>state.audit.push({action,entityId});
 return {state,
  request({operationId,emailKey,personId,id}){
   const decision=registrationDecision({registrations:state.registrations,capacity,operationId,emailKey,personId});
   if(!['request','waitlist'].includes(decision.decision))return decision;
   const row={id,operation_id:operationId,email_key:emailKey,person_id:personId,tenant_id:tenantId,club_id:clubId,event_id:eventId,registration_status:decision.decision==='waitlist'?'waitlisted':'pending_approval',revision:0,payment_required:amount>0,requested_at:new Date(now+state.registrations.length).toISOString()};
   state.registrations.push(row);record('request',id);return {decision:decision.decision,id};
  },
  act(id,action,at=now){
   const row=state.registrations.find(x=>x.id===id);if(!row)return {allowed:false,issues:['registration_not_found']};
   const decision=reviewRegistrationAction({registration:row,action,expectedRevision:row.revision,actor,capacity,registrations:state.registrations,now:at});
   if(!decision.allowed)return decision;
   Object.assign(row,decision.next);record(action,id);return decision;
  },
  checkout(id,transactionId){
   const row=state.registrations.find(x=>x.id===id);
   if(row?.registration_status!=='approved_payment_hold')return {allowed:false,reason:'booking_not_held'};
   const payment={id:`pay-${id}`,tenant_id:tenantId,club_id:clubId,purpose_id:id,provider:'sumup',provider_transaction_id:transactionId,amount,currency:'EUR',payment_status:'pending',revision:0};
   state.payments.push(payment);record('checkout',id);return {allowed:true,payment};
  },
  webhook(id,event){
   const registration=state.registrations.find(x=>x.id===id),payment=state.payments.find(x=>x.purpose_id===id);
   const decision=reviewPaymentWebhook({payment,event,registration,seenEventIds:[...state.processedWebhooks],expectedRevision:payment?.revision});
   if(!decision.allowed||decision.idempotent)return decision;
   payment.payment_status=decision.paymentStatus;payment.revision++;
   if(payment.payment_status==='paid')registration.payment_status='paid';
   if(decision.registrationStatus){registration.registration_status=decision.registrationStatus;registration.revision++;}
   state.processedWebhooks.add(event.id);record('webhook',id);return decision;
  },
  queueMessage(id,operationId,templateId='approved1'){
   const registration=state.registrations.find(x=>x.id===id);
   if(!registration||!['confirmed','approved_payment_hold'].includes(registration.registration_status))return {allowed:false,issues:['booking_not_eligible']};
   const request={tenantId,clubId,personId:registration.person_id||id,channel:'email',purpose:'transactional',brandScope:'tenant',templateId,templateVersion:1,templateApproved:true,recipient:registration.email_key,sourceType:'booking',sourceId:id,operationId};
   const result=planCommunicationOutbox({request,existing:state.outbox,configuredProviders:{email:{enabled:true,providerId:'simulated-email'}}});
   if(result.allowed&&!result.idempotent){state.outbox.push({id:`outbox-${state.outbox.length+1}`,...result.record,revision:0});record('queue_message',id)}
   return result;
  },
  markAttendance(id,status){const r=state.registrations.find(x=>x.id===id);if(!r||!['confirmed','cash_confirmed'].includes(r.registration_status)||!['attended','no_show','excused'].includes(status))return {allowed:false};r.attendance_status=status;r.attendance_revision=(r.attendance_revision||0)+1;record('attendance',id);return {allowed:true};},
  completeActivity(){if(state.registrations.some(r=>['confirmed','cash_confirmed'].includes(r.registration_status)&&!['attended','no_show','excused'].includes(r.attendance_status)))return {allowed:false};state.activityStatus='completed';record('complete_activity',eventId);return {allowed:true};},
  closureReview(){const activity={id:'activity',tenant_id:tenantId,club_id:clubId,linked_event_id:eventId,status:state.activityStatus};const event={id:eventId,tenant_id:tenantId,host_club_id:clubId};const payments=state.payments.map(p=>({...p,id:p.id,provider_transaction_id:p.provider_transaction_id}));return reviewScopedEventClosure({activity,event,registrations:state.registrations,payments,registrationComplete:true,paymentComplete:true});},
  advanceMessage(outboxId,event){const row=state.outbox.find(x=>x.id===outboxId);const decision=planOutboxTransition({record:row,event,expectedRevision:row?.revision});if(decision.allowed){Object.assign(row,decision.next);record('message_'+event,outboxId)}return decision;}
 };
}
