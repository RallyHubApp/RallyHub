import test from 'node:test';
import assert from 'node:assert/strict';
import {registrationBridgePreflight} from '../../src/lib/ccc/registrationBridge.js';
import {reconcileEventAttendance} from '../../src/lib/ccc/attendanceReconciliation.mjs';
import {reviewEventClosure} from '../../src/lib/ccc/eventClosureReadiness.mjs';
import {guestSessionEligibility} from '../../src/lib/ccc/registrationEligibility.js';
import {paymentLedger,paymentReconciliationSummary} from '../../src/lib/ccc/paymentReconciliation.js';
import {reviewFinanceSettlement} from '../../src/lib/ccc/financeSettlementIntegrity.mjs';
import {reviewCommunicationDelivery} from '../../src/lib/ccc/communicationsDeliveryIntegrity.mjs';
import {reviewTournamentResults} from '../../src/lib/ccc/tournamentResultIntegrity.mjs';
import {assessReleaseEvidence} from '../../src/lib/ccc/acceptanceGates.mjs';
const tenantId='tenant',clubId='club';
const activity={id:'activity',tenant_id:tenantId,club_id:clubId,capacity:8,status:'scheduled'};
const event={id:'event',tenant_id:tenantId,host_club_id:clubId,event_registration_mode:'rallyhub',event_publish_status:'published',event_public_visible:true,event_booking_enabled:true,event_capacity:8,event_fee_amount:5.5};
test('event registration -> attendance -> finance -> closure cannot bypass provider and consent evidence',()=>{
 assert.equal(registrationBridgePreflight({activity,event,tenantId,clubId,providerReady:true,communicationsReady:true}).ready,true);
 const rows=[{id:'r1',name:'Guest',status:'confirmed',attendance:'attended',attendanceRevision:1}];
 assert.equal(reconcileEventAttendance(rows,{hasMore:false}).closed,true);
 const close=reviewEventClosure(rows,{hasMore:false,paymentReadComplete:true,finance:{complete:true,requiresReview:false,anomalies:[]},activityStatus:'completed'});
 assert.equal(close.operationallyReconciled,true);assert.equal(close.releaseApproved,false);
 assert.ok(close.open.includes('provider_settlement_verified'));assert.ok(close.open.includes('delivery_audit_verified'));
});
test('event cannot enter booking journey with mismatched tenant or unavailable payment provider',()=>{
 const result=registrationBridgePreflight({activity,event:{...event,tenant_id:'other'},tenantId,clubId,providerReady:false,communicationsReady:true});
 assert.equal(result.ready,false);assert.ok(result.issues.includes('event_scope_denied'));assert.ok(result.issues.includes('payment_provider_unavailable'));
});
test('beginner guest denied restricted venue; experienced guest remains eligible',()=>{
 const base={venueKey:'ennis',restrictedBeginnerVenueKeys:['ennis'],sessionActive:true};
 assert.equal(guestSessionEligibility({...base,experienceLevel:'beginner'}).eligible,false);
 assert.equal(guestSessionEligibility({...base,experienceLevel:'experienced'}).eligible,true);
});
test('membership -> scoped ledger -> settlement detects duplicate provider transactions and scope drift',()=>{
 const payments=[{id:'p1',tenant_id:tenantId,club_id:clubId,membership_id:'m',purpose_type:'membership',payment_status:'paid',provider:'sumup',provider_transaction_id:'tx',amount:25},{id:'p2',tenant_id:tenantId,club_id:clubId,membership_id:'m',purpose_type:'membership',payment_status:'paid',provider:'sumup',provider_transaction_id:'tx',amount:25}];
 const ledger=paymentLedger({tenantId,clubId,payments});assert.equal(paymentReconciliationSummary(ledger).duplicates,1);
 const integrity=reviewFinanceSettlement({membership:{id:'m',tenant_id:tenantId,club_id:clubId,payment_status:'paid'},payments});assert.ok(integrity.issues.includes('duplicate_provider_settlement'));
});
test('communication delivery requires approved template, valid consent and provider receipt',()=>{
 const message={tenant_id:tenantId,club_id:clubId,person_id:'person',purpose:'marketing',brand_scope:'tenant',approved_template_id:'template',delivery_status:'delivered'};
 const invalid=reviewCommunicationDelivery({message,consent:{status:'accepted',tenant_id:tenantId,person_id:'person'}});
 assert.ok(invalid.issues.includes('delivery_without_provider_receipt'));
 assert.equal(reviewCommunicationDelivery({message:{...message,provider_message_id:'provider-id'},consent:{status:'accepted',tenant_id:tenantId,person_id:'person'}}).healthy,true);
});
test('tournament scoring -> mirror -> release cannot proceed on revision drift',()=>{
 const sessionState={revision:4,matches:[{id:'match'}],results:[{match_id:'match'}]};
 const mirror={...sessionState,revision:3};
 const review=reviewTournamentResults({tournament:{id:'t',tenant_id:tenantId,host_club_id:clubId,tournival_state:JSON.stringify(mirror)},session:{id:'s',tournament_id:'t',tenant_id:tenantId,club_id:clubId,state_revision:4,state_json:JSON.stringify(sessionState)}});
 assert.ok(review.issues.includes('mirror_revision_mismatch'));
 assert.equal(assessReleaseEvidence({tournival_results:{sourceTestsPassed:true}}).ready,false);
});
