import test from 'node:test';
import assert from 'node:assert/strict';
import {sessionCalendar,scheduleConflicts} from '../../src/lib/ccc/sessionCalendar.js';
const s=(id,date,start,end,extra={})=>({id,tenant_id:'t',club_id:'c',session_date:date,start_time:start,end_time:end,venue_key:'hall',venue_name:'Main hall',active:true,...extra});
test('calendar filters by tenant, club and date and sorts sessions',()=>{
 const result=sessionCalendar({tenantId:'t',clubId:'c',fromDate:'2026-11-01',toDate:'2026-11-30',sessions:[s('b','2026-11-04','20:00','21:00'),s('a','2026-11-04','19:00','20:00'),s('other','2026-11-04','19:00','20:00',{tenant_id:'different'}),s('old','2026-10-31','19:00','20:00')]});
 assert.deepEqual(result.map(x=>x.id),['a','b']);
});
test('same venue overlapping sessions conflict; adjacent sessions do not',()=>{
 const rows=sessionCalendar({tenantId:'t',clubId:'c',fromDate:'2026-11-01',toDate:'2026-11-30',sessions:[s('a','2026-11-04','19:00','20:30'),s('b','2026-11-04','20:00','21:00'),s('c','2026-11-04','21:00','22:00'),s('d','2026-11-04','20:00','21:00',{venue_key:'other'})]});
 assert.deepEqual(scheduleConflicts(rows),[{firstId:'a',secondId:'b',date:'2026-11-04',venueKey:'hall'}]);
});
test('closed sessions remain visible, archived sessions do not generate conflicts',()=>{
 const rows=sessionCalendar({tenantId:'t',clubId:'c',fromDate:'2026-11-01',toDate:'2026-11-30',sessions:[s('a','2026-11-04','19:00','21:00',{active:false}),s('b','2026-11-04','19:30','20:30',{archived_at:'2026-11-01T00:00:00Z'})]});
 assert.equal(rows[0].status,'closed');assert.equal(rows[1].status,'archived');assert.equal(scheduleConflicts(rows).length,0);
});
test('invalid date range fails closed',()=>assert.deepEqual(sessionCalendar({tenantId:'t',clubId:'c',fromDate:'2026-11-30',toDate:'2026-11-01',sessions:[s('a','2026-11-04','19:00','20:00')]}),[]));
