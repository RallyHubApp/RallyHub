import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {invokeReadWithDeadline,shouldRetryRead,readRetryDelay} from '../../src/lib/ccc/readResilience.js';
test('transient failures get one bounded retry; auth and validation never retry',()=>{assert.equal(shouldRetryRead(0,{response:{status:503}}),true);assert.equal(shouldRetryRead(1,{response:{status:503}}),true);assert.equal(shouldRetryRead(2,{response:{status:503}}),false);assert.equal(shouldRetryRead(0,{response:{status:403}}),false);assert.equal(shouldRetryRead(0,{response:{status:404}}),false);});
test('retry delay stays bounded',()=>{assert.ok(readRetryDelay(0)>0);assert.ok(readRetryDelay(100)<=1500);});
test('read wrapper returns successful result',async()=>assert.deepEqual(await invokeReadWithDeadline(async()=>({data:{ok:true}}),'test',{}),{data:{ok:true}}));
test('read wrapper rejects hung service without blocking indefinitely',async()=>{await assert.rejects(invokeReadWithDeadline(()=>new Promise(()=>{}),'test',{}, {timeoutMs:15}),/did not respond/);});
test('critical membership and guest queries use bounded retry and cache',()=>{
 for(const file of ['GuestBookings.jsx','MembershipConsole.jsx']){const src=readFileSync(new URL('../../src/pages/'+file,import.meta.url),'utf8');assert.match(src,/retry: ?shouldRetryRead/);assert.match(src,/staleTime: ?READ_STALE_MS/);assert.match(src,/invokeReadWithDeadline/);}
});

test('dashboard operational panels do not create five 60-second polling streams',()=>{
 const src=readFileSync(new URL('../../src/pages/Dashboard.jsx',import.meta.url),'utf8');
 const start=src.indexOf("queryKey: ['ccc-club-session-links'");
 const end=src.indexOf('  const scheduleFrom',start);
 const section=src.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.doesNotMatch(section,/refetchInterval:/);
 assert.equal((section.match(/staleTime: READ_STALE_MS/g)||[]).length,5);
 assert.equal((section.match(/retry: shouldRetryRead/g)||[]).length,5);
});
test('membership applications query has a single enabled and stale-time policy',()=>{
 const src=readFileSync(new URL('../../src/pages/MembershipConsole.jsx',import.meta.url),'utf8');
 const start=src.indexOf("queryKey: ['membership-applications'");
 const end=src.indexOf('  });',start);
 const section=src.slice(start,end);
 assert.equal((section.match(/staleTime: READ_STALE_MS/g)||[]).length,1);
 assert.equal((section.match(/enabled: canManage/g)||[]).length,1);
});
