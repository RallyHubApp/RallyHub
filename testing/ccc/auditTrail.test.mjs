import test from 'node:test';import assert from 'node:assert/strict';import {auditTrail} from '../../src/lib/ccc/auditTrail.js';
const e=(id,action,extra={})=>({id,action,tenant_id:'t',club_id:'c',occurred_at:'2026-11-01T10:00:00Z',payload:{email:'private@example.com'},...extra});
test('audit projection strips private payload and scopes events',()=>{const rows=auditTrail({tenantId:'t',clubId:'c',events:[e('a','approved'),e('b','approved',{tenant_id:'other'}),e('c','invalid')]});assert.equal(rows.length,1);assert.equal(rows[0].id,'a');assert.equal('payload' in rows[0],false);});
test('newest audit events first with bounded limit',()=>{const rows=auditTrail({tenantId:'t',clubId:'c',limit:1,events:[e('a','created'),e('b','updated',{occurred_at:'2026-11-02T10:00:00Z'})]});assert.deepEqual(rows.map(r=>r.id),['b']);});
test('missing scope fails closed',()=>assert.deepEqual(auditTrail({events:[e('a','approved')]}),[]));
