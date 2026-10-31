import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const event=read('../../base44/functions/eventRegistration/entry.ts');
const activity=read('../../base44/functions/cccActivity/entry.ts');
const ui=read('../../src/components/ccc/ClubEventRegistrationOverview.jsx');
const schema=read('../../base44/entities/EventRegistration.jsonc');
test('existing event admin actions fail closed outside active tenant and club',()=>{
 assert.match(event,/if\(isAdminAction\).*user\.role!=='admin'/);
 assert.match(event,/user\.active_tenant_id/);
 assert.match(event,/user\.active_club_id/);
 assert.match(event,/Event outside selected tenant or club/);
});
test('approval and payment verification use existing service and explicit UI confirmation',()=>{
 assert.match(ui,/functions\.invoke\('eventRegistration'/);
 assert.match(ui,/action:'admin_approve'/);
 assert.match(ui,/action:'admin_verify'/);
 assert.match(ui,/onClick=\{runAction\}/);
 assert.match(ui,/This action is not a preview/);
});
test('attendance uses tenant/club/event-scoped compare-and-set and confirmed bookings only',()=>{
 const section=activity.slice(activity.indexOf("if(body.action==='mark_attendance')"),activity.indexOf("if(body.action==='registration_overview')"));
 assert.match(section,/EventRegistration\.filter\(\{id:registrationId,event_id:event\.id,tenant_id,club_id\}/);
 assert.match(section,/\['confirmed','cash_confirmed'\]/);
 assert.match(section,/attendance_revision:prior/);
 assert.match(section,/updateMany/);
 assert.match(section,/Attendance changed; reload/);
 for(const field of ['attendance_status','attendance_revision','attendance_marked_at','attendance_marked_by_user_id'])assert.ok(JSON.parse(schema).properties[field]);
});
