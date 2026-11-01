import {inspectWaitlistReadiness} from './waitlistReadiness.mjs';
/** Advisory after a successful capacity release; never sends an offer or changes a booking. */
export function postReleaseWaitlist({rows,event,registrationId,capacityReleased}={}){
 if(capacityReleased!==true)return {requiresReview:true,reason:'capacity_not_reconciled',nextRegistrationId:null};
 if(!Array.isArray(rows)||!registrationId)return {requiresReview:true,reason:'roster_unavailable',nextRegistrationId:null};
 const original=rows.find(r=>r.id===registrationId);
 if(!original)return {requiresReview:true,reason:'released_registration_missing',nextRegistrationId:null};
 const updated=rows.map(r=>r.id===registrationId?{...r,registration_status:'cancelled'}:r);
 const readiness=inspectWaitlistReadiness({rows:updated,event});
 return {requiresReview:readiness.issues.length>0,reason:readiness.issues.join(',')||null,nextRegistrationId:readiness.ready?readiness.next:null,waiting:readiness.waiting,available:readiness.available,requiresOrganiserApproval:true,advisoryOnly:true};
}
