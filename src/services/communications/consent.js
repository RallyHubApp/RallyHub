export const PURPOSES=Object.freeze(["service","operational","safety","membership","competition","directory_service","provider_enquiry","marketing"]);
export function consentKey({person_id,scope,tenant_id,channel,purpose}){return [person_id,scope,tenant_id||"-",channel,purpose].join("|")}
export function resolvePermission({purpose,channel,records=[],suppressed=false}){
 if(suppressed)return{allowed:false,reason:"suppressed"};const matching=records.filter(r=>r.channel===channel&&r.purpose===purpose);
 const accepted=matching.find(r=>r.status==="accepted"&&!r.withdrawn_at);
 if(purpose==="marketing"&&!accepted)return{allowed:false,reason:"permission_required"};
 if(matching.some(r=>r.status==="withdrawn"||r.withdrawn_at))return{allowed:false,reason:"withdrawn"};
 return{allowed:true,reason:accepted?"consented":"service_basis"};
}
export function doubleOptInEvidence(x){return{...x,complete:!!(x.requested_at&&x.confirmed_at&&x.wording_version&&x.source&&x.channel)}}
