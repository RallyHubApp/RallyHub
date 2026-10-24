import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync('base44/functions/directoryContactAction/entry.ts','utf8');
const coach=code.slice(code.indexOf("if (listingRecords?.[0]?.listing_type === 'coach')"),code.indexOf('    const state = await protectedState(base44, listingSlug);'));
const club=code.slice(code.indexOf("if (action === 'send_email')",code.indexOf('    const state = await protectedState(base44, listingSlug);'));
test('coach honeytrap silently acknowledges without sending',()=>assert.match(coach,/if \(clean\(body\.website,200\)\) return responseJson\(\{ success:true, acknowledged:true \}\)/));
test('coach enquiry saved before verified endpoint forwarding',()=>{
 const save=coach.indexOf('DirectoryContactEnquiry.create(');
 const lookup=coach.indexOf('DirectoryContactEndpoint.filter(');
 const send=coach.indexOf('sendWithConfiguredEmailTransport(');
 assert.ok(save>=0 && lookup>save && send>lookup);
 assert.match(coach,/endpoint\?\.allow_email === true/);
});
test('coach forwarding failure or missing endpoint never marks action sent',()=>{
 assert.match(coach,/let forwarded = false;/);
 assert.match(coach,/forwarded = true;/);
 assert.match(coach,/forwarded \? 'sent' : 'acknowledged'/);
 assert.match(coach,/delivery_status:'failed'/);
});
test('coach limits enquiries and durable duplicates',()=>{
 assert.match(coach,/consumeBucket\(emailBuckets,key,3,30\*60\*1000\)/);
 assert.match(coach,/durableActionFor\(base44,idemKey\)/);
});
test('club email rate limited, validated, de-duplicated and sends only to allowed endpoint',()=>{
 assert.match(club,/endpoint\.allow_email !== true/);
 assert.match(club,/!validEmail\(senderEmail\)/);
 assert.match(club,/message\.length < 5/);
 assert.match(club,/consumeBucket\(emailBuckets, key, 3, 30 \* 60 \* 1000\)/);
 assert.match(club,/durableActionFor\(base44, idemKey\)/);
 assert.match(club,/sendWithConfiguredEmailTransport/);
});
test('no CAPTCHA challenge introduced in contact backend',()=>assert.doesNotMatch(code,/captcha|turnstile/i));
