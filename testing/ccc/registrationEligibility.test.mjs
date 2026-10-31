import test from 'node:test';import assert from 'node:assert/strict';import {guestSessionEligibility} from '../../src/lib/ccc/registrationEligibility.js';
const opts={experienceLevel:'beginner',venueKey:'ennis',restrictedBeginnerVenueKeys:['ennis'],sessionDate:'2026-11-10',nowDate:'2026-11-01'};
test('beginner cannot book restricted venue',()=>assert.deepEqual(guestSessionEligibility(opts),{eligible:false,issues:['beginner_venue_restricted']}));
test('experienced guest can request same venue',()=>assert.equal(guestSessionEligibility({...opts,experienceLevel:'experienced'}).eligible,true));
test('beginner can book permitted venue',()=>assert.equal(guestSessionEligibility({...opts,venueKey:'ennistymon'}).eligible,true));
test('closed or past sessions reject bookings',()=>{assert.ok(guestSessionEligibility({...opts,venueKey:'ennistymon',sessionActive:false}).issues.includes('session_closed'));assert.ok(guestSessionEligibility({...opts,venueKey:'ennistymon',sessionDate:'2026-10-31'}).issues.includes('session_in_past'));});
