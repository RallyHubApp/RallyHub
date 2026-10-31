import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const membership=readFileSync(new URL('../../base44/functions/membershipApplication/entry.ts',import.meta.url),'utf8');
const guest=readFileSync(new URL('../../base44/functions/guestAccessJourney/entry.ts',import.meta.url),'utf8');
test('membership invitation matching uses indexed application emails',()=>{
 assert.match(membership,/const applicationEmails=new Set\(rows\.map/);
 assert.match(membership,/!applicationEmails\.has\(emailKey\(r\.email\)\)/);
});
test('guest request admin listing indexes session, invite and booking references',()=>{
 const start=guest.indexOf("if(action==='admin_list')");
 const end=guest.indexOf("if(action==='admin_edit_request')",start);
 const code=guest.slice(start,end);
 for(const key of ['sessionLinkById','inviteByRequestId','bookingBySessionAndEmail','bookingBySessionAndMobile'])assert.match(code,new RegExp('const '+key+'=new Map'));
 assert.match(code,/bookingBySessionAndEmail\.get/);
 assert.match(code,/bookingBySessionAndMobile\.get/);
 assert.match(code,/inviteByRequestId\.get/);
});
test('guest request listing preserves active unexpired invitation check',()=>{
 assert.match(guest,/invite\.status==='active'&&\(!invite\.expires_at\|\|Date\.parse\(invite\.expires_at\)>nowMs\)/);
});
