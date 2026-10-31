import test from 'node:test';
import assert from 'node:assert/strict';
import {summariseClubOperations} from '../../base44/functions/cccActivity/operationsSummary.mjs';
const row=(id,status='scheduled',extra={})=>({id,title:'Session '+id,status,starts_at:'2026-11-04T19:00:00Z',ends_at:'2026-11-04T20:30:00Z',linked_event_id:'e',bridge_status:'verified',...extra});
test('operational summary returns stable status counts and upcoming sorted',()=>{
 const result=summariseClubOperations([row('b'),row('a'),row('c','completed'),row('a')],{now:'2026-11-01T00:00:00Z'});
 assert.equal(result.total,3);assert.equal(result.counts.scheduled,2);assert.equal(result.counts.completed,1);
 assert.deepEqual(result.upcoming.map(x=>x.id),['a','b']);assert.equal(result.financialTotalsIncluded,false);
});
test('unlinked and unverified events require review',()=>{
 const result=summariseClubOperations([row('a','scheduled',{linked_event_id:''}),row('b','registration_open',{bridge_status:'linked_unverified'})],{now:'2026-11-01T00:00:00Z'});
 assert.ok(result.alerts.some(x=>x.code==='missing_event_link'));
 assert.ok(result.alerts.some(x=>x.code==='event_link_not_verified'));
});
test('invalid schedule and past open activities are flagged',()=>{
 const result=summariseClubOperations([row('a','scheduled',{ends_at:'2026-11-04T18:00:00Z'}),row('b','registration_open',{starts_at:'2026-10-01T19:00:00Z',ends_at:'2026-10-01T20:00:00Z'})],{now:'2026-11-01T00:00:00Z'});
 assert.ok(result.alerts.some(x=>x.code==='invalid_schedule'));
 assert.ok(result.alerts.some(x=>x.code==='past_activity_not_closed'));
});
test('partial activity reads are prominently marked',()=>{
 const result=summariseClubOperations([row('a')],{complete:false});
 assert.equal(result.complete,false);assert.equal(result.resultsMayBeTruncated,true);
});
test('operational overview never returns participant personal information',()=>{
 const result=summariseClubOperations([row('a','scheduled',{email:'secret@example.ie',medical_note:'private'})]);
 assert.equal(JSON.stringify(result).includes('secret@example.ie'),false);
 assert.equal(JSON.stringify(result).includes('medical_note'),false);
});
