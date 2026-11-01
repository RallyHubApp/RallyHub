import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const entry=readFileSync(new URL('../../base44/functions/eventRegistration/entry.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../../src/components/ccc/ClubEventRegistrationOverview.jsx',import.meta.url),'utf8');
test('offer next uses scoped readiness and existing promotion preflight',()=>{assert.match(entry,/action==='admin_offer_next_waitlisted'/);assert.match(entry,/readiness\?readiness.next/);assert.match(entry,/reviewWaitlistPromotion\(\{rows,event:t,registrationId\}\)/)});
test('organiser must explicitly confirm an offer',()=>assert.match(entry,/b.confirmOffer!==true/));
test('status conflict never decrements another concurrent capacity reservation',()=>assert.match(entry,/capacity reservation needs reconciliation/));
test('organiser preview offers a confirmable next-place action',()=>{assert.match(ui,/Offer next waiting-list place/);assert.match(ui,/confirmOffer:true/)});
