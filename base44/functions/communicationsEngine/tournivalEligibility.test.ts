import {strict as assert} from 'node:assert';
import {reasonForTournivalDelivery} from './tournivalEligibility.ts';
const confirmed={registration_status:'confirmed',payment_status:'not_required',checked_in_at:''};
Deno.test('Tournival delivery excludes withdrawn people and stale payment requests',()=>{
 assert.match(reasonForTournivalDelivery('tournival_results',{...confirmed,registration_status:'withdrawn'},null,false),/withdrawn/);
 assert.match(reasonForTournivalDelivery('tournival_payment_required',{...confirmed,payment_status:'paid'},null,false),/no longer outstanding/);
 assert.equal(reasonForTournivalDelivery('tournival_payment_required',{registration_status:'pending_payment',payment_status:'pending'},{payment_status:'pending',provider_checkout_url:'https://example.invalid/checkout'},false),'');
 assert.match(reasonForTournivalDelivery('tournival_payment_required',{registration_status:'pending_payment',payment_status:'pending'},{payment_status:'pending'},false),/checkout/);
 assert.equal(reasonForTournivalDelivery('tournival_payment_confirmed',{...confirmed,payment_status:'paid'},null,false),'');
 assert.match(reasonForTournivalDelivery('tournival_payment_confirmed',confirmed,null,false),/not been verified/);
});
Deno.test('Results delivery follows confirmed payment and actual check-in rules',()=>{
 assert.equal(reasonForTournivalDelivery('tournival_results',confirmed,null,false),'');
 assert.match(reasonForTournivalDelivery('tournival_results',confirmed,null,true),/did not check in/);
 assert.equal(reasonForTournivalDelivery('tournival_results',{...confirmed,checked_in_at:'2026-10-17T13:00:00Z'},null,true),'');
 assert.match(reasonForTournivalDelivery('tournival_results',{...confirmed,payment_status:'pending'},null,false),/payment complete/);
 assert.match(reasonForTournivalDelivery('tournival_results',null,null,false),/not found/);
});
Deno.test('Waitlist and promotion messages require current status',()=>{
 assert.equal(reasonForTournivalDelivery('tournival_waitlist_added',{registration_status:'waitlisted'},null,false),'');
 assert.match(reasonForTournivalDelivery('tournival_waitlist_added',confirmed,null,false),/no longer active/);
 assert.equal(reasonForTournivalDelivery('tournival_waitlist_promoted',confirmed,null,false),'');
 assert.match(reasonForTournivalDelivery('tournival_waitlist_promoted',{registration_status:'waitlisted'},null,false),/no longer confirmed/);
});
