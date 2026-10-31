import test from 'node:test';import assert from 'node:assert/strict';import {identityLinkDecision} from '../../src/lib/ccc/memberIdentity.js';
const v={tenantId:'t',clubId:'c',person:{id:'p',tenant_id:'t',email:'same@example.com'},member:{id:'m',tenant_id:'t',club_id:'c',email:'same@example.com'}};
test('matching contact details do not silently link identities',()=>assert.equal(identityLinkDecision(v).reason,'explicit_confirmation_required'));
test('explicit confirmation permits scoped link',()=>assert.deepEqual(identityLinkDecision({...v,confirmedByAdmin:true}),{allowed:true,personId:'p',memberId:'m',alreadyLinked:false}));
test('conflicting existing identity cannot be overwritten',()=>assert.equal(identityLinkDecision({...v,confirmedByAdmin:true,member:{...v.member,person_id:'someone-else'}}).reason,'conflicting_person_link'));
test('cross-tenant link fails closed',()=>assert.equal(identityLinkDecision({...v,confirmedByAdmin:true,person:{id:'p',tenant_id:'other'}}).allowed,false));
