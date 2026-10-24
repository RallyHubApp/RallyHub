import test from 'node:test';
import assert from 'node:assert/strict';
import {directoryServiceOnlyRls,directoryAccessRls} from '../../base44/shared/directoryRlsPolicy.ts';
test('service-only Directory entities deny all direct SDK operations to all roles',()=>{
 const r=directoryServiceOnlyRls();
 assert.deepEqual(r,{create:false,read:false,update:false,delete:false});
});
test('listing owners may read only their own access row',()=>{
 const r=directoryAccessRls();
 assert.deepEqual(r.read,{'data.user_id':'{{user.id}}'});
 assert.equal(r.create,false);
 assert.equal(r.update,false);
 assert.equal(r.delete,false);
});
test('RLS rules do not embed static account IDs or broad generic admin privileges',()=>{
 const encoded=JSON.stringify([directoryServiceOnlyRls(),directoryAccessRls()]);
 assert.doesNotMatch(encoded,/user_condition|role|[a-f0-9]{24}/i);
 assert.match(encoded,/\{\{user\.id\}\}/);
});
