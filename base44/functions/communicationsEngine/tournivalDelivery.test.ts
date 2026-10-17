import {strict as assert} from 'node:assert';
import {makeTournivalDeliveryKey} from './tournivalDelivery.ts';
const data={tenantId:'tenant-A',eventId:'event-1',purpose:'tournival_results',recipientId:'reg-3',channel:'email',version:'1'};
Deno.test('event key is stable, isolated by tenant, recipient, channel and resend version',()=>{
 const original=makeTournivalDeliveryKey(data);
 assert.equal(original,makeTournivalDeliveryKey({...data}));
 for(const field of ['tenantId','eventId','purpose','recipientId','channel','version'])
  assert.notEqual(original,makeTournivalDeliveryKey({...data,[field]:field+'-other'}),field);
});
Deno.test('malformed or delimiter-injected keys cannot alias another event',()=>{
 for(const field of ['tenantId','eventId','purpose','recipientId','channel','version']){
  assert.throws(()=>makeTournivalDeliveryKey({...data,[field]:''}),/Invalid/);
  assert.throws(()=>makeTournivalDeliveryKey({...data,[field]:'a|b'}),/Invalid/);
 }
});
