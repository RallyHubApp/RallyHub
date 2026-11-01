import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../../base44/functions/eventRegistration/entry.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../../src/components/ccc/ClubEventRegistrationOverview.jsx',import.meta.url),'utf8');
test('all capacity-releasing event transitions surface waitlist follow-up',()=>{
 assert.equal((backend.match(/waitlistFollowup:postReleaseWaitlist\(/g)||[]).length,2);
 assert.match(backend,/waitlistFollowup:review\.releasesCapacity\?postReleaseWaitlist/);
});
test('post-release candidate requires confirmed capacity release',()=>{
 assert.match(backend,/capacityReleased:release\.released/);
 assert.match(backend,/registrationId,capacityReleased/);
});
test('organiser sees reconciliation warning before suggesting a new offer',()=>{
 assert.match(ui,/capacity requires reconciliation\. Do not offer another place/);
 assert.match(ui,/waitlistFollowup\?\.nextRegistrationId/);
});
