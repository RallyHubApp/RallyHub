import {activityTypes,canTransition,assertScope,validateDraft} from './activityContracts.js';
import {activityReadiness} from './activityReadiness.js';

/** Read-only, deterministic activity transition plan.
 * Caller must enforce authenticated backend permissions and atomic persistence.
 * No database mutation, notification or registration is performed here.
 */
export function planActivityTransition({activity,to,scope,venue,host,registrationMode,paymentMethod,approvedTemplate,expectedRevision}={}){
 const issues=[];
 try{assertScope(activity,scope)}catch{return {allowed:false,issues:['scope_denied'],next:null};}
 if(!activityTypes.includes(activity?.type))issues.push('unsupported_activity_type');
 if(!canTransition(activity?.status,to))issues.push('invalid_transition');
 if(expectedRevision!==undefined&&String(expectedRevision)!==String(activity?.revision??''))issues.push('stale_revision');
 if(['ready','scheduled','registration_open','registration_closed','in_progress'].includes(to)){
   for(const issue of validateDraft(activity))issues.push('draft_'+issue);
 }
 if(to==='registration_open'){
   const readiness=activityReadiness({
     activity,venue,host,capacity:activity?.capacity,registrationMode,paymentMethod,approvedTemplate
   });
   issues.push(...readiness.issues);
 }
 if(to==='in_progress'&&activity?.starts_at&&!Number.isFinite(Date.parse(activity.starts_at)))issues.push('invalid_start_time');
 if(to==='completed'&&!activity?.id)issues.push('activity_id_required');
 return {allowed:issues.length===0,issues:[...new Set(issues)],next:issues.length?null:{id:activity.id,from:activity.status,to,revision:activity.revision??null}};
}

/** Validate that a proposed activity's own scope agrees with its selected venue. */
export function planActivityDraft({activity,scope,venue}={}){
 const issues=validateDraft(activity);
 try{assertScope(activity,scope)}catch{issues.push('scope_denied')}
 if(venue?.tenant_id&&venue.tenant_id!==activity?.tenant_id)issues.push('venue_tenant_mismatch');
 if(venue?.club_id&&venue.club_id!==activity?.club_id)issues.push('venue_club_mismatch');
 if(venue?.id&&venue.id!==activity?.venue_id)issues.push('venue_id_mismatch');
 return {valid:issues.length===0,issues:[...new Set(issues)]};
}
