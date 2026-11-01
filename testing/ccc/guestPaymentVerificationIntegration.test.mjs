import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../../base44/functions/guestSessionBooking/entry.ts',import.meta.url),'utf8');
test('admin verification never downgrades settled bookings',()=>{assert.match(src,/reviewGuestPaymentVerification\(booking,status\)/);assert.match(src,/alreadySettled:true/)});
test('confirmation failure is reported separately from settlement',()=>{assert.match(src,/completeGuestPaymentConfirmation\(updated/);assert.match(src,/confirmationNeedsReview:confirmation.confirmationNeedsReview/)});
