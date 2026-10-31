import test from 'node:test';import assert from 'node:assert/strict';import {operationalHealth} from '../../src/lib/ccc/operationalHealth.js';
const c=(id,status,extra={})=>({id,status,tenant_id:'t',club_id:'c',...extra});
test('unknown checks do not report healthy',()=>assert.equal(operationalHealth({tenantId:'t',clubId:'c'}).status,'unknown'));
test('failures are prioritised over unknown checks',()=>{const result=operationalHealth({tenantId:'t',clubId:'c',checks:[c('email','failed'),c('payments','unknown'),c('other','passed',{club_id:'other'})]});assert.equal(result.status,'attention');assert.deepEqual(result.issues,['email']);assert.deepEqual(result.unknown,['payments']);});
test('only passed scoped checks yield healthy',()=>assert.equal(operationalHealth({tenantId:'t',clubId:'c',checks:[c('email','passed')]}).status,'healthy'));
