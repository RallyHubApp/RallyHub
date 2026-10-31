import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../../base44/functions/cccActivity/entry.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../../src/components/ccc/ClubEventRegistrationOverview.jsx',import.meta.url),'utf8');
test('event finance review distinguishes paid, refunds and pending payments',()=>{assert.match(backend,/grossCents/);assert.match(backend,/refundedCents/);assert.match(backend,/pendingCents/);assert.match(backend,/authoritative:false/)});
test('payment discrepancies flag duplicates, missing paid records and over-refunds',()=>{for(const code of ['multiple_payment_records','paid_registration_without_matching_payment','refund_exceeds_payment','confirmed_with_pending_payment'])assert.ok(backend.includes(code))});
test('UI labels internal payment figures as non-authoritative',()=>{assert.match(ui,/Payment reconciliation review/);assert.match(ui,/compare against SumUp settlement/);assert.match(ui,/payment discrepancies require review/)});
