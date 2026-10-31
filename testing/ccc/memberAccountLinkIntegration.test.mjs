import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../../base44/functions/membershipRecord/entry.ts',import.meta.url),'utf8');
const block=src.slice(src.indexOf("if(action==='admin_connect_account')"),src.indexOf("if(action==='admin_dashboard_counts')"));
test('member account linking invokes integrity guard before any identity mutations',()=>{
 const guard=block.indexOf('assessMemberAccountLink(');
 assert.ok(guard>0);
 for(const mutation of ['Person.update(person.id','Player.update(player.id','ClubUserAccess.update(existingAccess.id','ClubUserAccess.create(accessData','User.update(userId'])assert.ok(block.indexOf(mutation)>guard,mutation);
});
test('guard conflict returns HTTP 409 and does not fall through to mutations',()=>{
 assert.match(block,/if\(!linkGuard\.allowed\)return Response\.json\([\s\S]*?MEMBER_IDENTITY_INTEGRITY[\s\S]*?status:409/);
});
test('account link retains explicit verification checks and cross-record conflicts',()=>{
 assert.match(block,/MULTIPLE_IDENTITY_MISMATCHES/);
 assert.match(block,/IDENTITY_CONFIRMATION_REQUIRED/);
 assert.match(block,/user account is already linked to a different person record/i);
});
