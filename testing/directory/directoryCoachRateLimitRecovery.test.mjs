import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const api=readFileSync('base44/functions/directoryClaim/entry.ts','utf8');
const mail=readFileSync('src/components/admin/CoachInvitationBatch.jsx','utf8');
const admin=readFileSync('src/pages/AdminPanel.jsx','utf8');
test('provider entity-list rate limit is returned as retryable 429 not generic 500',()=>{
 assert.match(api,/rate limit exceeded\|too many requests\|entity_list allows/i);
 assert.match(api,/code:'DIRECTORY_RATE_LIMIT'/);
 assert.match(api,/status:429,headers:\{'Retry-After':'5'\}/);
});
test('only coach list read retries, with progressive backoff and no refetch storm',()=>{
 assert.match(mail,/queryKey:\['directory-coach-invitation-candidates'\]/);
 assert.match(mail,/staleTime:60_000/);
 assert.match(mail,/refetchOnWindowFocus:false/);
 assert.match(mail,/retry:\(failures,error\)=>failures<3/);
 assert.match(mail,/retryDelay:attempt=>Math\.min\(10_000\*\(attempt\+1\),25_000\)/);
 assert.doesNotMatch(mail,/retry:\(failures,error\)=>true/);
 assert.match(admin,/refetchOnWindowFocus: false/);
 assert.match(admin,/refetchOnMount: false/);
});
test('list excludes previously invited coaches and requires deliberate sending',()=>{
 assert.match(api,/const sent=invites\.find/);
 assert.match(api,/inviteStatus=claimed\?'claimed'/);
 assert.match(mail,/c\.inviteStatus==='ready'/);
 assert.match(mail,/window\.confirm\('Send the approved RallyHub coach invitation/);
 assert.match(mail,/if\(response\.data\?\.sent!==true\)throw/);
});
