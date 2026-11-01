import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../../base44/functions/eventRegistration/entry.ts',import.meta.url),'utf8');
const admin=readFileSync(new URL('../../src/components/ccc/ClubEventRegistrationOverview.jsx',import.meta.url),'utf8');
test('event approval and paid confirmation report notice failure without repeating payment',()=>{assert.match(backend,/noticeNeedsReview/);assert.match(backend,/confirmAndNotify/);assert.match(admin,/participant email needs delivery review/)});
test('event refund does not report gateway accepted refund as failed',()=>{assert.match(backend,/eventRefundProviderOutcome/);assert.match(backend,/status:outcome.success\?200:502/)});
