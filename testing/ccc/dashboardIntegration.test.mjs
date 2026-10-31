import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const dashboard=readFileSync(new URL('../../src/pages/Dashboard.jsx',import.meta.url),'utf8');
test('CCC operational data queries are restricted to entity admin role',()=>{
 for(const name of ['ccc-club-session-links','ccc-club-payment-records','ccc-guest-bookings','ccc-guest-attendance','ccc-followup-attempts']){
  const start=dashboard.indexOf(name);assert.ok(start>=0,name+' query missing');
  const block=dashboard.slice(start,dashboard.indexOf('});',start)+3);
  assert.match(block,/currentUser\?\.role === 'admin'/);
 }
});
test('operational dashboard panels are restricted to admin role',()=>{
 for(const name of ['ClubSchedulePanel','ClubPaymentPanel','ClubPostEventPanel']){
  assert.match(dashboard,new RegExp("currentUser\\?\\.role === 'admin' && <"+name+" tenantId="));
 }
});
test('dashboard remains read-only and uses existing entity filter API',()=>{
 assert.match(dashboard,/GuestSessionAttendance\.filter/);
 assert.match(dashboard,/CommunicationDeliveryAttempt\.filter/);
 assert.doesNotMatch(dashboard,/GuestSessionAttendance\.(create|update|delete)/);
});
