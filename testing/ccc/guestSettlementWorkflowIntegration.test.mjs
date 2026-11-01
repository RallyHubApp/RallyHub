import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../base44/functions/guestSessionBooking/entry.ts',import.meta.url),'utf8');
test('cash and SumUp settlement both require scoped unambiguous ledger',()=>{assert.match(source,/reviewCashSettlement\(booking\)/);assert.equal((source.match(/selectBookingPaymentRecords\(rawPayments,booking,session\)/g)||[]).length,3)});
test('cash and online confirmation failures are separate from settlement',()=>{assert.equal((source.match(/completeGuestPaymentConfirmation\(updated/g)||[]).length,2);assert.match(source,/ledgerNeedsReview,confirmationNeedsReview/);assert.match(source,/confirmationNeedsReview:confirmation.confirmationNeedsReview,ledgerNeedsReview/)});
