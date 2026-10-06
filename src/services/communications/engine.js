import {resolveAudience,dedupeContacts} from "./audience.js";import {resolvePermission} from "./consent.js";import {preflight} from "./deliverability.js";import {renderEmail} from "./renderer.js";
export const ENGINE_MODES=Object.freeze(["simulation","test","live"]);
export function prepareCommunication({mode="simulation",campaign,people=[],consents=[],suppressions=[],template,brandKit,channel="email"}){
 if(!ENGINE_MODES.includes(mode))throw new Error("COMM_MODE_INVALID");const resolved=resolveAudience({people,definition:campaign.audience_definition||{}}),deduped=dedupeContacts(resolved),blocked=new Set(suppressions.map(s=>s.person_id||s.email));
 const recipients=deduped.people.map(p=>{const permission=resolvePermission({purpose:campaign.purpose,channel,records:consents.filter(c=>c.person_id===p.person_id),suppressed:blocked.has(p.person_id)||blocked.has(p.email)});return{...p,eligibility_status:permission.allowed?"eligible":"suppressed",eligibility_reason:permission.reason}});
 const rendered=channel==="email"?renderEmail({brandKit,...template,data:campaign.sample_data||{}}):null;const eligible=recipients.filter(r=>r.eligibility_status==="eligible");
 const flight=preflight({campaign,message:{channel,html_body:rendered?.html,plain_text_body:rendered?.plainText},audience:{eligible_count:eligible.length}});
 return{mode,campaign,recipients,eligible,duplicates:deduped.duplicates,rendered,preflight:flight,can_external_deliver:mode==="live"&&flight.allowed};
}
export function assertExternalDeliveryAllowed(prepared,{activationToken}={}){
 if(prepared.mode!=="live")throw new Error("COMM_EXTERNAL_DELIVERY_DISABLED");if(!prepared.preflight.allowed)throw new Error("COMM_PREFLIGHT_BLOCKED");if(!activationToken)throw new Error("COMM_ACTIVATION_TOKEN_REQUIRED");return true;
}
