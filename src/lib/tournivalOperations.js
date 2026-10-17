/**
 * Pure Tournival operational model, usable in the Base44 backend and sandbox.
 * No network, payments, customer messaging, DUPR submission or KOTC dependencies.
 */
export const TOURNIVAL_V1='tournival-v1';
export function createTournivalEvent({id,tenantId,clubId,capacity=32,fee=0,rehearsal=false,duprEnabled=false}) {
 if(!id||!tenantId||!clubId||!Number.isInteger(capacity)||capacity<4)throw Error('Invalid event');
 if(!Number.isFinite(fee)||fee<0)throw Error('Invalid fee');
 return {id,tenantId,clubId,engineVersion:TOURNIVAL_V1,rehearsal,duprEnabled,
   capacity,fee,phase:'registration',registrations:[],matches:[],revision:0,
   audit:[],outbox:[],notices:[],finalised:false};
}
function update(event,type,actor,change,details={}) {
 const at=new Date().toISOString();
 return {...change,revision:event.revision+1,audit:[...event.audit,{revision:event.revision+1,type,actor,at,...details}]};
}
export function registerTournivalPlayer(event,{playerId,name,email='',operationId,actor='self'}) {
 if(event.phase!=='registration')throw Error('Registration closed');
 if(!playerId||!name||!operationId)throw Error('Registration identity and operation required');
 const prior=event.registrations.find(r=>r.operationId===operationId);
 if(prior)return {event,registration:prior,duplicate:true};
 if(event.registrations.some(r=>r.playerId===playerId && r.status!=='withdrawn'))throw Error('Already registered');
 const accepted=event.registrations.filter(r=>r.status==='confirmed'||r.status==='pending_payment').length<event.capacity;
 const status=accepted?(event.fee>0&&!event.rehearsal?'pending_payment':'confirmed'):'waitlisted';
 const registration={id:`registration:${event.id}:${playerId}`,playerId,name,email,status,
    operationId,paymentStatus:event.rehearsal?'simulated':event.fee>0?'pending':'not_required',checkedIn:false};
 return {event:update(event,'registration',actor,{registrations:[...event.registrations,registration]},{playerId,status}),
  registration,duplicate:false};
}
export function confirmTournivalPayment(event,{registrationId,providerReference,verified=false,amount,actor='webhook'}) {
 if(event.rehearsal)throw Error('Rehearsal cannot process payments');
 if(!verified||!providerReference)throw Error('Provider-verified payment required');
 const target=event.registrations.find(r=>r.id===registrationId);
 if(!target)throw Error('Unknown registration');
 if(target.providerReference===providerReference && target.paymentStatus==='paid')return {event,duplicate:true};
 if(target.paymentStatus==='paid')throw Error('Payment conflict; reconcile');
 if(target.status!=='pending_payment'||amount!==event.fee)throw Error('Amount or payment state mismatch');
 const registrations=event.registrations.map(r=>r.id===registrationId?{...r,status:'confirmed',paymentStatus:'paid',providerReference}:r);
 return {event:update(event,'payment_verified',actor,{registrations},{registrationId}),duplicate:false};
}
export function checkInTournivalPlayer(event,{playerId,actor='host',present=true}) {
 const row=event.registrations.find(r=>r.playerId===playerId);
 if(!row||row.status!=='confirmed')throw Error('Player must be confirmed to check in');
 return update(event,present?'check_in':'check_out',actor,{registrations:event.registrations.map(r=>r.playerId===playerId?{...r,checkedIn:present}:r)},{playerId});
}
export function withdrawTournivalPlayer(event,{playerId,actor='host',reason}) {
 if(!reason)throw Error('Withdrawal reason required');
 const row=event.registrations.find(r=>r.playerId===playerId);
 if(!row||row.status==='withdrawn')throw Error('Invalid withdrawal');
 // Preserve prior matches and recorded results. A future fixture requires an explicit replacement/replan.
 let promoted=false;
 const registrations=event.registrations.map(r=>{
  if(r.playerId===playerId)return {...r,status:'withdrawn',checkedIn:false};
  if(!promoted&&r.status==='waitlisted'&&event.phase==='registration'){
   promoted=true;return {...r,status:event.fee>0&&!event.rehearsal?'pending_payment':'confirmed'};
  }
  return r;
 });
 return update(event,'withdrawal',actor,{registrations},{playerId,reason});
}
export function publishTournivalNotice(event,{text,actor='host'}) {
 if(!text||text.length>1000)throw Error('Invalid announcement');
 return update(event,'notice',actor,{notices:[...event.notices,{id:crypto.randomUUID(),text,at:new Date().toISOString()}]});
}
export function tournivalPublicSnapshot(event) {
 return {id:event.id,phase:event.phase,revision:event.revision,capacity:event.capacity,
    registered:event.registrations.filter(r=>r.status==='confirmed'||r.status==='pending_payment').length,
    waitlist:event.registrations.filter(r=>r.status==='waitlisted').length,
    players:event.registrations.filter(r=>r.status==='confirmed').map(r=>({id:r.playerId,name:r.name,checkedIn:r.checkedIn})),
    matches:event.matches.map(m=>({id:m.id,round:m.round,teamA:m.teamA,teamB:m.teamB,status:m.status,court:m.court,result:m.result})),
    notices:event.notices};
}
export function tournivalDuprEligibility(event,match,players={}) {
 if(event.rehearsal)return {eligible:false,reason:'rehearsal'};
 if(!event.duprEnabled)return {eligible:false,reason:'opted_out'};
 if(!match||match.status!=='completed'||!match.result)return {eligible:false,reason:'not_completed'};
 if(match.matchFormat?.startsWith('timed_'))return {eligible:false,reason:'timed_format_requires_provider_verification'};
 const ids=[...match.teamA,...match.teamB];
 if(ids.length!==4||ids.some(id=>!players[id]?.duprId||players[id]?.consent!==true))
   return {eligible:false,reason:'identity_or_consent_missing'};
 return {eligible:false,reason:'provider_rules_and_ssO_validation_pending'};
}
export function tournivalPrintData(event) {
 const snapshot=tournivalPublicSnapshot(event);
 return {...snapshot,generatedAt:new Date().toISOString(),printVersion:event.revision,
    instructions:'If offline, record stable match ID, player names, court, scores and scorer; reconcile before replaying.'};
}
export function assertRehearsalIsolation(event) {
 if(!event.rehearsal)throw Error('Not rehearsal mode');
 if(event.outbox.some(x=>['payment','external_message','dupr','live_statistics'].includes(x.channel)))
   throw Error('Rehearsal external side effect detected');
 return true;
}
