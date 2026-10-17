export function assessTournivalConsent({channel,purpose,personId,endpointHash,suppressions=[],preferences=[]}:{
 channel:'email'|'whatsapp';purpose:string;personId:string;endpointHash:string;suppressions?:any[];preferences?:any[]
}){
 if(suppressions.some(r=>r.active===true&&r.channel===channel&&
   ((personId&&r.person_id===personId)||(endpointHash&&r.endpoint_hash===endpointHash))))
  return {allowed:false,reason:'channel_suppression'};
 const applicable=preferences.filter(r=>r.channel===channel&&
  (!r.purpose||r.purpose===purpose||r.purpose==='tournival_transactional'));
 if(applicable.some(r=>r.status==='withdrawn'))return {allowed:false,reason:'consent_withdrawn'};
 if(channel==='whatsapp'&&!applicable.some(r=>r.status==='accepted'))
  return {allowed:false,reason:'whatsapp_opt_in_missing'};
 return {allowed:true,reason:channel==='email'?'essential_transactional_email':'whatsapp_opted_in'};
}
