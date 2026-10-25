import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {directoryAudience,directoryEmailHash} from '../../base44/shared/directoryAudience.mjs';
const source=readFileSync('base44/functions/directoryPlayerNetwork/entry.ts','utf8');
test('public consent withdrawal creates a hashed Directory-only suppression',()=>{
 assert.match(source,/if\(!emailOptIn\)await syncDirectoryEmailSuppression\(base44,row,false\)/);
 assert.match(source,/DirectorySuppression\.create\(/);
 assert.match(source,/directoryEmailHash\(row\.email\)/);
 assert.doesNotMatch(source,/asServiceRole\.entities\.(Tenant|ClubMembership|Member|GuestBooking)/);
});
test('fresh consent cannot lift an administrator suppression',()=>{
 assert.match(source,/entry\.reason!=='public_unsubscribe'\|\|entry\.source!=='preferences_link'/);
 assert.match(source,/if\(emailOptIn\)await syncDirectoryEmailSuppression\(base44,updated,true\)/);
 assert.match(source,/if\(emailOptIn\)await syncDirectoryEmailSuppression\(base44,saved,true\)/);
});
test('email consent withdrawn but WhatsApp still on never qualifies for email campaign',async()=>{
 const now=new Date('2026-10-25T11:00:00Z');
 const people=[{id:'subscriber-one',email:'one@example.test',email_opt_in:false,whatsapp_opt_in:true,status:'active',topics:['tournaments_events'],consent_at:now.toISOString(),consent_version:'directory'}];
 const r=await directoryAudience(people,[],{},now);
 assert.equal(r.eligibleCount,0);assert.equal(r.excluded.noEmailOptIn,1);
 const h=await directoryEmailHash('one@example.test');assert.equal(h.length,64);
});
