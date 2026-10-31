import test from 'node:test';
import assert from 'node:assert/strict';
import {postEventQueue,postEventSummary} from '../../src/lib/ccc/postEventQueue.js';
const row=(bookingId,attendanceStatus,bookingStatus='confirmed')=>({bookingId,name:bookingId,attendanceStatus,bookingStatus});
test('attendees enter follow-up queue, no-shows and cancelled do not',()=>{
 const q=postEventQueue({tenantId:'t',clubId:'c',sessionLinkId:'s',roster:[row('a','attended'),row('b','no_show'),row('c','attended','cancelled')]});
 assert.deepEqual(q.map(x=>x.needsFollowUp),[true,false,false]);
 assert.deepEqual(postEventSummary(q),{attended:2,noShow:1,followUpReady:1,alreadySent:0});
});
test('previous successful attempt blocks duplicate follow-up',()=>{
 const q=postEventQueue({tenantId:'t',clubId:'c',sessionLinkId:'s',roster:[row('a','attended')],attempts:[{tenant_id:'t',campaign_id:'guest_session_followup:s',recipient_id:'a',status:'delivered'}]});
 assert.equal(q[0].needsFollowUp,false);assert.equal(q[0].alreadySent,true);
});
test('wrong tenant attempt cannot suppress eligible follow-up',()=>{
 const q=postEventQueue({tenantId:'t',clubId:'c',sessionLinkId:'s',roster:[row('a','attended')],attempts:[{tenant_id:'other',campaign_id:'guest_session_followup:s',recipient_id:'a',status:'sent'}]});
 assert.equal(q[0].needsFollowUp,true);
});
