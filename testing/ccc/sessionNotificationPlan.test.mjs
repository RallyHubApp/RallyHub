import test from 'node:test';
import assert from 'node:assert/strict';
import {sessionNotificationPlan} from '../../src/lib/ccc/sessionNotificationPlan.js';
test('session invitation plan deduplicates recipients and does not send',()=>{
 const p=sessionNotificationPlan({event:'invitation',sessionId:'s 1',title:'8:30 session',memberUserIds:['a','b','a','']});
 assert.deepEqual(p.recipients,['a','b']);
 assert.equal(p.deliveryState,'not_sent');
 assert.equal(p.payload.url,'/app?section=sessions&sessionId=s%201');
 assert.equal(p.channels.push,true);
});
test('rejects unsupported events and missing session identity',()=>{
 assert.throws(()=>sessionNotificationPlan({event:'unknown',sessionId:'x'}));
 assert.throws(()=>sessionNotificationPlan({event:'confirmed'}));
});
