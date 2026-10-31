import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=file=>readFileSync(new URL('../../src/components/ccc/'+file,import.meta.url),'utf8');
test('operations connects existing scoped registration, attendance and follow-up interface',()=>{
 const board=read('ClubOperationsBoard.jsx'),hub=read('ClubOperationsRegistrationHub.jsx');
 assert.match(board,/ClubOperationsRegistrationHub/);
 assert.match(board,/data\.upcoming/);
 assert.match(board,/data\.recent/);
 assert.match(hub,/ClubEventRegistrationOverview/);
 assert.match(hub,/activityId=\{chosen\.id\}/);
 assert.match(hub,/tenantId=\{tenantId\} clubId=\{clubId\}/);
});
test('only verified linked activities can open a roster; no duplicate booking or payment actions',()=>{
 const hub=read('ClubOperationsRegistrationHub.jsx');
 assert.match(hub,/a\.linkedEventId&&a\.bridgeStatus==='verified'/);
 assert.match(hub,/\['scheduled','registration_open','registration_closed','in_progress','completed'\]/);
 assert.doesNotMatch(hub,/EventRegistration\.create|PaymentRecord\.create|sendEmail|refundPayment\(/i);
});
test('attendance and approval refresh follow-up candidate review',()=>{
 const overview=read('ClubEventRegistrationOverview.jsx');
 const matches=overview.match(/invalidateQueries\(\{queryKey:\['ccc-followup-candidates'/g)||[];
 assert.equal(matches.length,2);
});
