/** Versioned, idempotent communication outbox planning. Never sends externally. */
import {communicationPreflight,providerSelection} from './communicationPolicy.js';
export function planCommunicationOutbox({request,existing=[],configuredProviders={}}={}){
 const preflight=communicationPreflight(request||{});
 const issues=[...preflight.errors];
 if(!request?.operationId||!request?.sourceId||!request?.sourceType)issues.push('source_and_operation_required');
 if(!request?.templateVersion||!request?.templateApproved)issues.push('approved_version_required');
 const provider=providerSelection({channel:request?.channel,configuredProviders});
 if(!provider.available)issues.push(provider.reason);
 const key=[request?.tenantId,request?.clubId,request?.sourceType,request?.sourceId,request?.operationId,request?.channel].join(':');
 const previous=existing.find(x=>x.idempotency_key===key);
 if(previous)return {allowed:issues.length===0,idempotent:true,existingId:previous.id,issues};
 if(issues.length)return {allowed:false,issues:[...new Set(issues)]};
 return {allowed:true,idempotent:false,issues:[],record:{tenant_id:request.tenantId,club_id:request.clubId,person_id:request.personId,source_type:request.sourceType,source_id:request.sourceId,idempotency_key:key,channel:request.channel,purpose:request.purpose,template_id:request.templateId,template_version:request.templateVersion,provider_id:provider.providerId,status:'queued'},requiresAtomicUniqueKey:true};
}
export function planOutboxTransition({record,event,expectedRevision}={}){
 const allowed={queued:['provider_accepted','failed','suppressed'],provider_accepted:['sent','failed'],sent:['delivered','failed'],delivered:['read'],failed:['queued','dead_letter'],read:[],suppressed:[],dead_letter:[]};
 if(!record?.id||!Number.isSafeInteger(expectedRevision)||Number(record.revision||0)!==expectedRevision)return {allowed:false,reason:'stale_or_missing_record'};
 if(!allowed[record.status]?.includes(event))return {allowed:false,reason:'invalid_transition'};
 return {allowed:true,next:{status:event,revision:expectedRevision+1},atomicConditions:{id:record.id,revision:expectedRevision,tenant_id:record.tenant_id,club_id:record.club_id}};
}
