import {strict as assert} from 'node:assert';
import {assessMemberAccountLink as assess} from './accountLinkGuard.ts';
const fixture=()=>({tenantId:'t',clubId:'c',userId:'u',person:{id:'p',tenant_id:'t'},membership:{id:'m',tenant_id:'t',club_id:'c',person_id:'p'},player:{id:'r',tenant_id:'t',club_id:'c',person_id:'p'},target:{id:'u'},accessRows:[]});
Deno.test('consistent scoped identity may proceed to explicit verification',()=>assert.equal(assess(fixture()).allowed,true));
Deno.test('membership for another person is blocked',()=>assert.equal(assess({...fixture(),membership:{...fixture().membership,person_id:'other'}}).issues.includes('person_relationship_mismatch'),true));
Deno.test('cross-tenant player is blocked',()=>assert.equal(assess({...fixture(),player:{...fixture().player,tenant_id:'other'}}).allowed,false));
Deno.test('existing person link to another account blocked',()=>assert.equal(assess({...fixture(),person:{...fixture().person,linked_user_id:'other'}}).allowed,false));
Deno.test('existing user linked to another person blocked',()=>assert.equal(assess({...fixture(),otherPerson:{id:'other'}}).allowed,false));
Deno.test('existing user linked to another player blocked',()=>assert.equal(assess({...fixture(),otherPlayer:{id:'other'}}).allowed,false));
Deno.test('existing access to another person is never silently overwritten',()=>assert.equal(assess({...fixture(),accessRows:[{tenant_id:'t',club_id:'c',user_id:'u',person_id:'other'}]}).issues.includes('access_person_conflict'),true));
Deno.test('revoked access requires administrator review rather than reactivation',()=>assert.equal(assess({...fixture(),accessRows:[{tenant_id:'t',club_id:'c',user_id:'u',status:'revoked'}]}).allowed,false));
Deno.test('already linked consistent records are identified',()=>assert.equal(assess({...fixture(),person:{...fixture().person,linked_user_id:'u'},player:{...fixture().player,user_id:'u'}}).alreadyLinked,true));
Deno.test('target user ID mismatch fails closed',()=>assert.equal(assess({...fixture(),target:{id:'other'}}).allowed,false));

Deno.test('duplicate access grants require manual review',()=>assert.equal(assess({...fixture(),accessRows:[{tenant_id:'t',club_id:'c',user_id:'u'},{tenant_id:'t',club_id:'c',user_id:'u'}]}).issues.includes('duplicate_access_records'),true));

Deno.test('partially linked person cannot be silently completed',()=>assert.equal(assess({...fixture(),person:{...fixture().person,linked_user_id:'u'}}).issues.includes('partial_account_link_requires_review'),true));
Deno.test('partially linked player cannot be silently completed',()=>assert.equal(assess({...fixture(),player:{...fixture().player,user_id:'u'}}).allowed,false));
