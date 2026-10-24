import test from 'node:test';
import assert from 'node:assert/strict';
import {directorySuperAdminRls,directoryAccessReadRls} from '../../base44/shared/directoryRlsPolicy.ts';
const a='aaaaaaaaaaaaaaaaaaaaaaaa',b='bbbbbbbbbbbbbbbbbbbbbbbb';
function evaluate(rule, user, data={}){
 if(rule.$or)return rule.$or.some(part=>evaluate(part,user,data));
 if(rule.$and)return rule.$and.every(part=>evaluate(part,user,data));
 if(rule.user_condition)return Object.entries(rule.user_condition).every(([key,val])=>user?.[key]===val);
 if(rule['data.user_id'])return data.user_id===user?.id && !!user?.id;
 return false;
}
test('only the two verified platform admins get Directory administrative access',()=>{
 const r=directorySuperAdminRls(a,b);
 for(const id of [a,b])assert.equal(evaluate(r,{id,role:'admin'}),true);
 assert.equal(evaluate(r,{id:'cccccccccccccccccccccccc',role:'admin'}),false);
 assert.equal(evaluate(r,{id:a,role:'user'}),false);
 assert.equal(evaluate(r,null),false);
});
test('Directory listing access rows remain visible only to own identity or approved admins',()=>{
 const r=directoryAccessReadRls(a,b);
 assert.equal(evaluate(r,{id:'owner_1234',role:'user'},{user_id:'owner_1234'}),true);
 assert.equal(evaluate(r,{id:'stranger',role:'admin'},{user_id:'owner_1234'}),false);
 assert.equal(evaluate(r,{id:a,role:'admin'},{user_id:'owner_1234'}),true);
});
test('misconfigured super-admin identities always reject at construction',()=>{
 for(const pair of [[a,a],[a,''],['Brian Moore',b],['',b]]) assert.throws(()=>directorySuperAdminRls(...pair));
});
test('produces Base44 supported equality-only, $or/$and policies',()=>{
 const r=directorySuperAdminRls(a,b);
 assert.ok(r.$and);
 assert.deepEqual(r.$and[1].$or.map(x=>Object.keys(x.user_condition)),[['id'],['id']]);
});
