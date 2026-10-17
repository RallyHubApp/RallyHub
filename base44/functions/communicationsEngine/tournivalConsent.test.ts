import {strict as assert} from 'node:assert';
import {assessTournivalConsent as check} from './tournivalConsent.ts';
const data={purpose:'tournival_payment_confirmed',personId:'person1',endpointHash:'digest',suppressions:[],preferences:[]};
Deno.test('essential transactional email can proceed without marketing opt-in',()=>{
 assert.equal(check({...data,channel:'email'}).allowed,true);
});
Deno.test('opt-out or active suppression blocks transactional email',()=>{
 assert.equal(check({...data,channel:'email',preferences:[{channel:'email',purpose:data.purpose,status:'withdrawn'}]}).reason,'consent_withdrawn');
 assert.equal(check({...data,channel:'email',suppressions:[{active:true,channel:'email',endpoint_hash:'digest'}]}).reason,'channel_suppression');
});
Deno.test('WhatsApp handoff needs affirmative channel opt-in',()=>{
 assert.equal(check({...data,channel:'whatsapp'}).reason,'whatsapp_opt_in_missing');
 assert.equal(check({...data,channel:'whatsapp',preferences:[{channel:'whatsapp',purpose:'tournival_transactional',status:'accepted'}]}).allowed,true);
 assert.equal(check({...data,channel:'whatsapp',preferences:[{channel:'whatsapp',purpose:data.purpose,status:'withdrawn'}]}).allowed,false);
});
