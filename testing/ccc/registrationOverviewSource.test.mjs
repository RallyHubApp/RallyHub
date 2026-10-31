import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../../base44/functions/cccActivity/entry.ts',import.meta.url),'utf8');
const frontend=readFileSync(new URL('../../src/components/ccc/ClubEventRegistrationOverview.jsx',import.meta.url),'utf8');
const planner=readFileSync(new URL('../../src/components/ccc/ClubActivityPlanner.jsx',import.meta.url),'utf8');
test('overview is explicitly scoped to active tenant and club',()=>{
 assert.match(backend,/body\.action==='registration_overview'/);
 assert.match(backend,/EventRegistration\.filter\(\{event_id:event\.id,tenant_id,club_id\}/);
 assert.match(backend,/Tournament\.filter\(\{id:record\.linked_event_id,tenant_id,host_club_id:club_id\}/);
 assert.match(backend,/PaymentRecord\.filter\(\{tenant_id,club_id,purpose_type:'event'\}/);
});
test('overview exposes only selected participant fields and no medical notes',()=>{
 const action=backend.slice(backend.indexOf("if(body.action==='registration_overview')"),backend.indexOf("if(body.action==='registration_preflight')"));
 assert.doesNotMatch(action,/medical_note|consent_evidence|payment_checkout_url|provider_transaction_id/);
 assert.match(action,/overviewReadOnly:true/);
 assert.match(action,/resultsMayBeTruncated/);
});
test('frontend delegates approval and verification to existing service with confirmation, never direct refunds',()=>{
 assert.match(frontend,/action:'registration_overview'/);
 assert.match(frontend,/action:'admin_approve'/);
 assert.match(frontend,/action:'admin_verify'/);
 assert.match(frontend,/Confirm action/);
 assert.doesNotMatch(frontend,/action:'admin_refund_payment'|action:'send'/);
 assert.match(frontend,/not an authoritative SumUp reconciliation/);
});
test('planner supports new activity and linked registration overview',()=>{
 assert.match(planner,/const resetDraft=/);
 assert.match(planner,/setOperationId\(/);
 assert.match(planner,/<ClubEventRegistrationOverview/);
});
