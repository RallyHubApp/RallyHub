import {executeTournivalHostCommand} from './tournivalHostPersistence.mjs';
/** Authorised backend entrypoint adapter. Authentication and server clock are injected by trusted runtime. */
export function createTournivalHostService({authenticate,repository,clock}) {
 if(typeof authenticate!=='function'||typeof clock!=='function')throw Error('Trusted runtime authentication and clock required');
 if(!repository||typeof repository.loadEvent!=='function'||typeof repository.loadGrant!=='function'||typeof repository.compareAndSwap!=='function')throw Error('Atomic repository contract required');
 return async function handleHostCommand(request){
  const principal=await authenticate();
  if(!principal?.id||principal.disabled===true)throw Error('Authentication required');
  const {eventId,tenantId,clubId,command}=request||{};
  if(!eventId||!tenantId||!clubId||!command||typeof command!=='object')throw Error('Scoped command required');
  if(!command.operationId||typeof command.operationId!=='string'||command.operationId.length>128)throw Error('Operation key required');
  const serverNow=clock();
  if(typeof serverNow!=='string'||!Number.isFinite(Date.parse(serverNow)))throw Error('Trusted server clock invalid');
  return executeTournivalHostCommand({
   loadEvent:repository.loadEvent,loadGrant:repository.loadGrant,compareAndSwap:repository.compareAndSwap,
   actorId:principal.id,eventId,tenantId,clubId,command,serverNow,
  });
 };
}
