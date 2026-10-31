/** Side-effect-free event booking capacity and idempotency policy.
 * Actual capacity reservation must occur atomically in the authorised backend.
 */
const ACTIVE = new Set(['confirmed','cash_confirmed','approved_payment_hold']);
const TERMINAL = new Set(['cancelled','declined','expired']);
export function bookingCapacitySnapshot(registrations=[],capacity){
 if(!Number.isSafeInteger(capacity)||capacity<1)throw new Error('Invalid capacity');
 const active=registrations.filter(r=>ACTIVE.has(r?.registration_status)).length;
 return {capacity,occupied:active,remaining:Math.max(0,capacity-active),full:active>=capacity};
}
export function registrationDecision({registrations=[],capacity,operationId,emailKey,personId}={}){
 if(!operationId||typeof operationId!=='string')return {decision:'reject',reason:'operation_id_required'};
 const existing=registrations.find(r=>r?.operation_id===operationId);
 if(existing)return {decision:'idempotent',registrationId:existing.id};
 if(!emailKey&&!personId)return {decision:'reject',reason:'identity_required'};
 const samePerson=registrations.find(r=>!TERMINAL.has(r?.registration_status)&&((personId&&r.person_id===personId)||(emailKey&&r.email_key===emailKey)));
 if(samePerson)return {decision:'duplicate',registrationId:samePerson.id};
 const snapshot=bookingCapacitySnapshot(registrations,capacity);
 return snapshot.full?{decision:'waitlist',remaining:0}:{decision:'request',remaining:snapshot.remaining};
}
export function isPaymentConfirmationEligible(registration){
 return !!registration && ['approved_payment_hold','confirmed'].includes(registration.registration_status) && !!registration.payment_checkout_id;
}
