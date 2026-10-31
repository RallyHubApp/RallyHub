import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const backend=read('base44/functions/guestSessionBooking/entry.ts');
const section=backend.slice(backend.indexOf("if(action==='walkin_list')"),backend.indexOf("const bookingId=clean(body.bookingId"));
test('manual attendance is restricted to the active admin tenant, club and session',()=>{
 const before=backend.slice(backend.indexOf("if(['attendance_list'"),backend.indexOf("if(action==='walkin_list')"));
 assert.match(before,/user\.role!=='admin'/);assert.match(before,/active_tenant_id/);assert.match(before,/active_club_id/);
 assert.match(before,/GuestSessionLink\.filter\(\{id:sessionId,tenant_id:tenantId,club_id:clubId\}\)/);
 assert.match(section,/GuestSessionWalkIn\.filter\(\{tenant_id:tenantId,club_id:clubId,session_link_id:sessionId\}/);
});
test('walk-ins are separate attended-only entries with unverified payment and consent',()=>{
 assert.match(section,/GuestSessionWalkIn\.create/);assert.match(section,/attendance_status:'attended'/);
 assert.match(section,/payment_status:'unverified'/);assert.match(section,/consent_status:'not_verified'/);
 assert.doesNotMatch(section,/GuestSessionBooking\.create|followup_send|createCheckout/);
});
test('duplicate booking, restriction and contact checks precede manual entry',()=>{
 assert.match(section,/duplicate/);assert.match(section,/clubRestrictionCheck/);
 assert.match(section,/sameEmail/);assert.match(section,/sameMobile/);
 assert.match(section,/Name and email or mobile required/);
});
test('manual attendance is visible in guest session without adding to follow-up recipients',()=>{
 const parent=read('src/components/communications/GuestAttendanceFollowup.jsx');
 const child=read('src/components/communications/GuestSessionWalkIns.jsx');
 assert.match(parent,/GuestSessionWalkIns/);assert.match(child,/action:'walkin_add'/);assert.match(child,/action:'walkin_list'/);
 assert.doesNotMatch(child,/followup_send|sendEmail|\.create\(/);
});
