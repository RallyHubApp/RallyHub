import test from 'node:test';
import assert from 'node:assert/strict';
import { CLARE_JOINING_VENUES, validateClareJoiningVenue, hostNotificationVenue } from '../../src/lib/membershipVenuePolicy.mjs';
test('four non-Ennis venues accept acknowledged new joiners', () => {for (const venue of CLARE_JOINING_VENUES) assert.equal(validateClareJoiningVenue(venue,true),'');});
test('Ennis is excluded from new joining choices', () => assert.match(validateClareJoiningVenue('ennis',true),/Ennis/));
test('venue acknowledgement is mandatory', () => assert.match(validateClareJoiningVenue('shannon',false),/acknowledge/));
test('hosts are not notified until membership is active', () => {assert.equal(hostNotificationVenue('corofin',false),null);assert.equal(hostNotificationVenue('corofin',true),'corofin');assert.equal(hostNotificationVenue('ennis',true),null);});
