import {strict as assert} from 'node:assert';
import {validRatingEnvelope} from './ratingEnvelope.ts';
Deno.test('DUPR webhook RATING and RATING_SEED recognised',()=>{
 const e={clientId:'client-test',event:'RATING_SEED',message:{duprId:'ABC123',rating:null,metrics:null}};
 assert(validRatingEnvelope(e,'client-test'));
 assert(validRatingEnvelope({...e,event:'RATING'},'client-test'));
 assert(!validRatingEnvelope(e,'other-client'));
 assert(!validRatingEnvelope({...e,event:'OTHER'},'client-test'));
 assert(!validRatingEnvelope({...e,message:{}},'client-test'));
});
