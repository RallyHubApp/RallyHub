import {strict as assert} from 'node:assert';
import {assessMembershipLedgerCompleteness as check} from './ledgerCompleteness.ts';
Deno.test('under-cap pages are provisionally complete',()=>assert.equal(check({memberships:[1],people:[1],accesses:[]}).complete,true));
Deno.test('full membership page flags possible truncation',()=>assert.ok(check({memberships:Array(500).fill(1),people:[],accesses:[]}).issues.includes('memberships_may_be_truncated')));
Deno.test('full people page flags possible truncation',()=>assert.ok(check({memberships:[],people:Array(500).fill(1),accesses:[]}).issues.includes('people_may_be_truncated')));
Deno.test('full access page flags possible truncation',()=>assert.ok(check({memberships:[],people:[],accesses:Array(500).fill(1)}).issues.includes('accesses_may_be_truncated')));
Deno.test('malformed query response fails closed',()=>assert.equal(check({memberships:null,people:[],accesses:[]}).complete,false));
Deno.test('custom page size boundary supported',()=>assert.equal(check({memberships:[1,2],people:[],accesses:[],pageSize:2}).requiresPagination,true));
