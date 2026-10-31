import {prepareTournivalHostCommand} from './tournivalHostCommand.mjs';
/** Server adapter: auth/grant must be supplied by trusted server code, never client payload. */
export async function executeTournivalHostCommand({loadEvent,loadGrant,compareAndSwap,actorId,eventId,tenantId,clubId,command}) {
 if(!actorId||!eventId||!tenantId||!clubId)throw Error('Authenticated scope required');
 if(typeof loadEvent!=='function'||typeof loadGrant!=='function'||typeof compareAndSwap!=='function')throw Error('Atomic repository required');
 const event=await loadEvent({eventId,tenantId,clubId});
 if(!event||event.id!==eventId||event.tenantId!==tenantId||event.clubId!==clubId)throw Error('Event scope mismatch');
 const grant=await loadGrant({actorId,eventId,tenantId,clubId});
 const decision=prepareTournivalHostCommand(event,{...command,actorId,grant});
 if(!decision.allowed)return {ok:false,reason:decision.reason,issues:decision.issues||[]};
 if(decision.duplicate)return {ok:true,duplicate:true,revision:event.revision};
 if(!decision.proposedEvent)return {ok:true,readOnly:true,review:decision.review};
 const committed=await compareAndSwap({eventId,tenantId,clubId,expectedRevision:event.revision,nextEvent:decision.proposedEvent});
 if(committed!==true)return {ok:false,reason:'concurrent_revision_conflict'};
 return {ok:true,duplicate:false,revision:decision.proposedEvent.revision};
}
