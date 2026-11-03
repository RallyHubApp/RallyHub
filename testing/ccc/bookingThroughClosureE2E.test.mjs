import test from 'node:test';import assert from 'node:assert/strict';
import {createBookingJourney} from '../../src/lib/ccc/bookingJourneyHarness.mjs';
test('integrated simulated journey: booking → approval → checkout → payment → confirmation → delivery → attendance → close-out review',()=>{
 const j=createBookingJourney({capacity:2,amount:5.5});
 assert.equal(j.request({id:'r1',operationId:'op1',emailKey:'one@example.ie'}).decision,'request');
 assert.equal(j.act('r1','approve').allowed,true);assert.equal(j.checkout('r1','tx1').allowed,true);
 assert.equal(j.webhook('r1',{id:'wh1',provider:'sumup',transactionId:'tx1',status:'paid',verified:true,amount:5.5,currency:'EUR'}).allowed,true);
 assert.equal(j.state.registrations[0].registration_status,'confirmed');
 assert.equal(j.queueMessage('r1','confirmed1').allowed,true);
 const outbox=j.state.outbox[0].id;for(const stage of ['provider_accepted','sent','delivered'])assert.equal(j.advanceMessage(outbox,stage).allowed,true);
 assert.equal(j.completeActivity().allowed,false);
 assert.equal(j.markAttendance('r1','attended').allowed,true);assert.equal(j.completeActivity().allowed,true);
 const review=j.closureReview();assert.equal(review.operationallyReady,true);assert.equal(review.summary.attended,1);
 assert.equal(review.providerSettlementVerified,false);assert.equal(review.closeOutApproved,false);
});
test('integrated simulated journey: failed/forged payment blocks confirmation and close-out',()=>{
 const j=createBookingJourney({amount:5.5});j.request({id:'r1',operationId:'op1',emailKey:'one@example.ie'});j.act('r1','approve');j.checkout('r1','tx1');
 assert.equal(j.webhook('r1',{id:'fake',provider:'sumup',transactionId:'tx1',status:'paid',verified:false,amount:5.5,currency:'EUR'}).allowed,false);
 assert.equal(j.markAttendance('r1','attended').allowed,false);assert.equal(j.completeActivity().allowed,true);
 assert.equal(j.closureReview().operationallyReady,false);
});
