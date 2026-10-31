import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../../base44/functions/guestSessionBooking/entry.ts',import.meta.url),'utf8');
test('guest session admin list does not call SumUp verification on every read',()=>{
 const start=src.indexOf("if(['admin_templates','admin_list'");
 const end=src.indexOf("if(action==='admin_list')",start);
 const section=src.slice(start,end);
 assert.match(section,/if\(sumupConfigured&&action==='admin_templates'\)/);
 assert.match(section,/verifyProviderConnection/);
});
test('gateway connection verification remains available in template settings',()=>{
 assert.match(src,/if\(action==='admin_templates'\)/);
 assert.match(src,/last_verified_at:new Date\(\)\.toISOString\(\)/);
});
