import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('base44/functions/guestSessionBooking/entry.ts','utf8');
const fn=source.slice(source.indexOf('async function loadInvitedMemberSpondSessions('));
test('guest/member Spond lookup prefers club-owned group binding',()=>{
 assert.match(fn,/SpondSessionBinding\.filter\(\{tenant_id:club\.tenant_id,club_id:club\.id,listing_slug:club\.slug,active:true\}/);
 assert.match(fn,/const boundGroup=/);
 assert.match(fn,/let spondGroupId=String\(boundGroup\)/);
});
test('legacy Directory connection is read only when tenant bindings unavailable',()=>{
 const bound=fn.indexOf('const boundGroup=');
 const fallback=fn.indexOf('DirectorySpondConnection.filter(');
 assert.ok(bound>=0&&fallback>bound);
 assert.match(fn,/if\(!spondGroupId\)\{/);
 assert.doesNotMatch(fn,/DirectorySpondConnection\.(?:update|create|delete)\(/);
});
