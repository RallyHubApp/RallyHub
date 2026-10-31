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

test('booking payment lookups use one club-scoped page with fallback on full page',()=>{
 assert.match(src,/PaymentRecord\.filter\(\{tenant_id:tenantId,club_id:clubId,purpose_type:'booking'\},'-created_date',500\)/);
 assert.match(src,/const paymentPageComplete=\(paymentPage\|\|\[\]\)\.length<500/);
 assert.match(src,/paymentPageComplete\|\|indexed\.length/);
 assert.match(src,/PaymentRecord\.filter\(\{tenant_id:tenantId,club_id:clubId,purpose_type:'booking',purpose_id:b\.id\}/);
});

test('admin list starts independent session, payment and offer reads concurrently',()=>{
 const start=src.indexOf("if(action==='admin_list')");
 const end=src.indexOf("if(action==='admin_archive_session'",start);
 const section=src.slice(start,end);
 assert.match(section,/const \[sessions,paymentPage,offers\]=await Promise\.all\(\[/);
 assert.match(section,/GuestSessionLink\.filter\(\{tenant_id:tenantId,club_id:clubId\}/);
 assert.match(section,/GuestBookingChangeOffer\.filter\(\{tenant_id:tenantId,club_id:clubId\}/);
 assert.equal((section.match(/GuestBookingChangeOffer\.filter/g)||[]).length,1);
});

test('admin list resolves hosts from one scoped directory snapshot, not per-session network reads',()=>{
 const start=src.indexOf("if(action==='admin_list')");
 const end=src.indexOf("if(action==='admin_archive_session'",start);
 const section=src.slice(start,end);
 assert.match(section,/const \[profiles,people\]=await Promise\.all\(\[/);
 assert.match(section,/Person\.filter\(\{tenant_id:tenantId\},'full_name',500\)/);
 assert.match(section,/sessionHostFromSnapshot\(s,hostProfile,hostPeople\)/);
 assert.doesNotMatch(section,/resolveSessionHostContact\(base44,s\)/);
});
test('host snapshot retains existing venue, weekday, start and host-name matching',()=>{
 assert.match(src,/function sessionHostFromSnapshot\(/);
 assert.match(src,/String\(s\.venueId\|\|''\)===String\(session\.venue_key\|\|''\)/);
 assert.match(src,/String\(s\.day\|\|''\)===String\(session\.weekday\|\|''\)/);
 assert.match(src,/nameKey\(p\.full_name\)===wanted/);
});
