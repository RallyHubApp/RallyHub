import {strict as assert} from 'node:assert';
import {describeTournivalLedger} from './tournivalRecovery.ts';
const campaign={id:'campaignA'},message={id:'messageA',campaign_id:'campaignA'};
const recipient={id:'recipientA',campaign_id:'campaignA'};
const good={id:'attemptA',campaign_id:'campaignA',message_id:'messageA',recipient_id:'recipientA',status:'queued'};
Deno.test('fully linked queued delivery has no recovery action',()=>{
 assert.deepEqual(describeTournivalLedger(good,campaign,message,recipient),{state:'complete',action:'none'});
});
Deno.test('missing or partial writes never trigger automatic resend',()=>{
 assert.deepEqual(describeTournivalLedger(null,null,null,null),{state:'missing_attempt',action:'investigate'});
 assert.deepEqual(describeTournivalLedger({...good,message_id:'pending'},campaign,null,recipient),{state:'incomplete',action:'quarantine'});
 assert.equal(describeTournivalLedger({...good,campaign_id:'other'},campaign,message,recipient).action,'quarantine');
});
Deno.test('unknown provider outcomes may not be quarantined or retried',()=>{
 assert.equal(describeTournivalLedger({...good,status:'sending'},null,null,null).action,'investigate_provider');
 assert.equal(describeTournivalLedger({...good,status:'sent'},null,null,null).action,'investigate_provider');
 assert.equal(describeTournivalLedger({...good,status:'cancelled'},null,null,null).action,'none');
});
