import {test} from 'node:test';
import assert from 'node:assert/strict';
import {qualificationState,kitState,approvedGuidance} from '../../base44/functions/clubSafety/readiness.mjs';
const now=Date.parse('2026-11-28');
test('qualification expiry and verification',()=>{const r={status:'active',verified_by:'reviewer'};assert.equal(qualificationState({...r,expires_at:'2026-11-27'},now),'expired');assert.equal(qualificationState({...r,expires_at:'2026-12-01'},now),'expiring');assert.equal(qualificationState({...r,expires_at:'2027-03-01'},now),'current');assert.equal(qualificationState({...r,verified_by:''},now),'unverified')});
test('stock threshold and expiry',()=>{assert.equal(kitState({quantity:2,minimum_quantity:2},now),'replenish');assert.equal(kitState({quantity:4,minimum_quantity:2,expiry:'2020-01-01'},now),'expiry_review');assert.equal(kitState({quantity:-1,minimum_quantity:2},now),'invalid')});
test('clinical approval gate',()=>{const r={status:'approved',reviewed_by:'reviewer',reviewed_at:'2026-11-28',version:1,source_url:'https://example.org',content:'fictional'};assert.ok(approvedGuidance(r));assert.ok(!approvedGuidance({...r,status:'draft'}));assert.ok(!approvedGuidance({...r,reviewed_by:''}))});
