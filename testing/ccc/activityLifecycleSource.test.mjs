import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const backend=read('../../base44/functions/cccActivity/entry.ts');
const planner=read('../../src/components/ccc/ClubActivityPlanner.jsx');
const followup=read('../../src/components/ccc/ClubEventFollowupCandidates.jsx');
test('lifecycle supports registration, session and completion states with event guards',()=>{
 for(const state of ['registration_open','registration_closed','in_progress','completed'])assert.ok(backend.includes(state)&&planner.includes(state));
 assert.match(backend,/Close registration in the existing event service first/);
 assert.match(backend,/Existing event is not open for registration/);
 assert.match(backend,/Cannot complete activity before scheduled end/);
 assert.match(backend,/revision:revision\+1/);
});
test('attendance checks first write and logs status transitions',()=>{
 assert.match(backend,/attendance_revision===undefined\?\{\$exists:false\}/);
 assert.match(backend,/ccc\.attendance\.mark/);
 assert.match(backend,/ccc\.activity\.transition/);
 assert.match(backend,/ccc\.activity\.link_event/);
 assert.match(backend,/AuditLog\.create/);
});
test('follow-up candidates are scoped, confirmed attendees only, and never sent',()=>{
 const section=backend.slice(backend.indexOf("if(body.action==='followup_candidates')"),backend.indexOf("if(body.action==='registration_preflight')"));
 assert.match(section,/EventRegistration\.filter\(\{event_id:event\.id,tenant_id,club_id,attendance_status:'attended'\}/);
 assert.match(section,/\['confirmed','cash_confirmed'\]/);
 assert.match(section,/deliveryEnabled:false/);
 assert.match(section,/consentAndSuppressionNotChecked:true/);
 assert.match(followup,/No messages can be sent from this panel/);
 assert.doesNotMatch(followup,/admin_approve|sendEmail|deliverEventNotice/);
});
