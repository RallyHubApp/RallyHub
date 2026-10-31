import {hostAccessDecision} from './hostAccessPolicy.js';
import {proposeTournivalHostRecovery,acknowledgeTournivalHostRecovery} from './tournivalHostRecovery.mjs';
import {reviewTournivalDuprReadiness} from './tournivalDuprReadiness.mjs';
/** Pure command boundary. Caller must authenticate the actor, load authoritative grant and persist with atomic CAS. */
export function prepareTournivalHostCommand(event,{actorId,grant,action,expectedRevision,operationId,now,courts=4,confirmedMatchIds=[],identities={}}={}) {
 const deny=(reason)=>({allowed:false,reason,proposedEvent:null,requiresAtomicPersistence:true});
 if(!event?.id||!event.tenantId||!event.clubId)return deny('event_scope_missing');
 if(!actorId||!operationId||typeof operationId!=='string')return deny('actor_or_operation_missing');
 if(!Number.isInteger(expectedRevision)||event.revision!==expectedRevision)return deny('stale_event_revision');
 if(!['recovery_acknowledge','dupr_review'].includes(action))return deny('unsupported_action');
 const permission=hostAccessDecision({tenantId:event.tenantId,clubId:event.clubId,sessionId:event.id,
  hostGrant:grant,action:action==='dupr_review'?'view_roster':'manage_session',now});
 if(!permission.allowed)return deny(permission.reason);
 if(grant.user_id!==actorId)return deny('actor_grant_mismatch');
 const previous=Array.isArray(event.audit)?event.audit.find(x=>x.operationId===operationId):null;
 if(previous)return {allowed:true,duplicate:true,reason:null,proposedEvent:event,requiresAtomicPersistence:true};
 if(action==='dupr_review')return {allowed:true,duplicate:false,reason:null,
  review:reviewTournivalDuprReadiness(event,identities),proposedEvent:null,requiresAtomicPersistence:false};
 const proposal=proposeTournivalHostRecovery(event,{expectedRevision,courts,hostId:actorId,confirmedMatchIds});
 if(!proposal.ready)return {...deny('recovery_review_failed'),issues:proposal.issues};
 const updated=acknowledgeTournivalHostRecovery(event,proposal,{expectedRevision,hostId:actorId});
 const audit=updated.audit.map((row,index)=>index===updated.audit.length-1?{...row,operationId}:row);
 return {allowed:true,duplicate:false,reason:null,proposedEvent:{...updated,audit},
  expectedRevision,requiresAtomicPersistence:true,externalCallsPerformed:false};
}
