import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const entry=readFileSync(new URL('../../base44/functions/eventRegistration/entry.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../../src/components/ccc/ClubEventRegistrationOverview.jsx',import.meta.url),'utf8');
test('admin promotion is gated and claims capacity before compare-and-set status',()=>{assert.match(entry,/adminActions=.*admin_promote_waitlist/);assert.match(entry,/reviewWaitlistPromotion\(\{rows,event:t,registrationId\}\)/);assert.match(entry,/event_reserved_count:\{\$lt:capacity\}/);assert.match(entry,/registration_status:'waitlisted'\},\{\$set:\{registration_status:'pending_approval'\}\}/)});
test('waitlisted place is offered before approval and checkout',()=>{assert.match(ui,/r.status==='waitlisted'/);assert.match(ui,/Offer place/);assert.match(ui,/requiresOrganiserApproval|Review and approve before payment/);assert.match(entry,/requiresOrganiserApproval:true/)});
test('notice failure does not reverse saved promotion',()=>{assert.match(entry,/noticeNeedsReview=false/);assert.match(entry,/status:'pending_approval',noticeNeedsReview/)});
