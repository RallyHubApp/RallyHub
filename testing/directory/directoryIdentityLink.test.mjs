import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareDirectoryIdentityLink} from '../../base44/shared/directoryIdentityLink.ts';
const source={directoryId:'directory_1234',tenantId:'tenant_5678',purpose:'person_identity_reference',provenance:'Approved by account holder during identity review',explicitlyApproved:true};
const actor='admin_0123',at='2026-10-24T19:00:00Z';
test('approved reference preserves separate identifiers and provenance',()=>{
 const result=prepareDirectoryIdentityLink(source,actor,at);
 assert.equal(result.directory_id,source.directoryId);
 assert.equal(result.tenant_id,source.tenantId);
 assert.equal(result.approved_by_user_id,actor);
 assert.equal(result.approved_at,at);
 assert.equal(result.status,'active');
 assert.equal(Object.isFrozen(result),true);
 assert.equal('consent' in result,false);
 assert.equal('profile' in result,false);
});
for(const [name,patch] of [['implicit',{explicitlyApproved:false}],['missing provenance',{provenance:''}],['unsupported purpose',{purpose:'sync_profiles'}],['missing tenant id',{tenantId:''}],['invalid directory id',{directoryId:' '}],['wrong actor',{}]]){
 test('reject '+name,()=>assert.throws(()=>prepareDirectoryIdentityLink({...source,...patch},name==='wrong actor'?'':actor,at)));
}
