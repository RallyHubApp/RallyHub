import test from 'node:test';
import assert from 'node:assert/strict';
import {attendanceRoster,attendanceSummary} from '../../src/lib/ccc/attendanceProjection.js';
const booking=(id,name,extra={})=>({id,full_name:name,tenant_id:'t',club_id:'c',session_link_id:'s',payment_status:'paid',...extra});
const mark=(id,status,time='2026-10-31T09:00:00Z',extra={})=>({booking_id:id,status,marked_at:time,tenant_id:'t',club_id:'c',session_link_id:'s',...extra});
test('attendance distinguishes paid no-shows from attendees',()=>{
 const roster=attendanceRoster({tenantId:'t',clubId:'c',sessionLinkId:'s',bookings:[booking('1','Guest A'),booking('2','Guest B')],attendance:[mark('1','no_show'),mark('2','attended')]});
 assert.deepEqual(attendanceSummary(roster),{total:2,attended:1,noShow:1,cancelled:0,unconfirmed:0});
 assert.equal(roster[0].paymentStatus,'paid');
});
test('latest valid mark wins without cross-tenant or cross-session leakage',()=>{
 const roster=attendanceRoster({tenantId:'t',clubId:'c',sessionLinkId:'s',bookings:[booking('1','Guest A'),booking('2','Guest B',{club_id:'other'})],attendance:[mark('1','attended'),mark('1','no_show','2026-10-31T10:00:00Z'),mark('1','cancelled','2026-10-31T11:00:00Z',{tenant_id:'other'})]});
 assert.equal(roster.length,1);assert.equal(roster[0].attendanceStatus,'no_show');
});
test('no tenant, club or session context fails closed',()=>assert.deepEqual(attendanceRoster({bookings:[booking('1','Guest A')]}),[]));
