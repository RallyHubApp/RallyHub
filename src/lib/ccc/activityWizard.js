import {activityTypes} from './activityContracts.js';
import {planActivityDraft,planActivityTransition} from './activityWorkflow.js';

export const ACTIVITY_STEPS=Object.freeze(['basics','schedule','registration','review']);
export const REGISTRATION_MODES=Object.freeze(['approval','automatic','closed']);
export const PAYMENT_METHODS=Object.freeze(['none','cash','online']);

export function newActivityDraft({tenantId,clubId,sport='pickleball'}={}){
 return {tenant_id:tenantId||'',club_id:clubId||'',sport,type:'session',title:'',venue_id:'',starts_at:'',ends_at:'',capacity:16,status:'draft',revision:0};
}
export function normaliseActivityForm(form={},scope={}){
 const capacity=Number(form.capacity);
 return {
  tenant_id:String(scope.tenant_id||''),club_id:String(scope.club_id||''),
  sport:String(form.sport||'').trim(),type:String(form.type||'').trim(),
  title:String(form.title||'').trim(),venue_id:String(form.venue_id||'').trim(),
  starts_at:String(form.starts_at||''),ends_at:String(form.ends_at||''),
  capacity:Number.isSafeInteger(capacity)?capacity:0,status:'draft',revision:0
 };
}
export function activityWizardReview({form,scope,venue,host,registrationMode,paymentMethod,approvedTemplate}={}){
 const activity=normaliseActivityForm(form,scope);
 const draft=planActivityDraft({activity,scope,venue});
 const fields=[];
 if(!activityTypes.includes(activity.type))fields.push('type_invalid');
 if(!REGISTRATION_MODES.includes(registrationMode))fields.push('registration_mode_required');
 if(!PAYMENT_METHODS.includes(paymentMethod))fields.push('payment_method_required');
 if(!host?.id)fields.push('host_required');
 // Draft review is informational: readiness for opening registration is a separate gate.
 const preview={...activity,id:'preview-only',status:'scheduled'};
 const opening=planActivityTransition({activity:preview,to:'registration_open',scope,venue,host,registrationMode,paymentMethod,approvedTemplate});
 return {valid:draft.valid&&fields.length===0,issues:[...new Set([...draft.issues,...fields])],registrationReady:opening.allowed,registrationIssues:opening.issues,activity};
}
