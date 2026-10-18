import {strict as assert} from 'node:assert';
import {basicDuprIdentity,validSsoOrigin,entitled,canManageUatClub,validateMatch,sealTokens,unsealTokens,duprRequest} from './uatCore.ts';
const match={identifier:'uat-001',matchSource:'CLUB',clubId:6459394157,format:'DOUBLES',
 matchType:'RALLY',matchDate:'2026-10-18',
 teamA:{player1:'AAAAAA',player2:'BBBBBB',game1:11},
 teamB:{player1:'CCCCCC',player2:'DDDDDD',game1:7}};
Deno.test('SSO origin and identity are verified',()=>{
 assert(validSsoOrigin('https://uat.dupr.gg'));
 assert(!validSsoOrigin('https://attacker.uat.dupr.gg'));
 assert.equal(basicDuprIdentity({status:'SUCCESS',results:[{duprId:'GB0NV05E'}]}).duprId,'GB0NV05E');
 assert.throws(()=>basicDuprIdentity({status:'FAILURE',results:[{duprId:'GB0NV05E'}]}));
});
Deno.test('DUPR user entitlements and UAT club roles',()=>{
 assert(entitled({entitlements:{tournaments:['BASIC_L1']}}));
 assert(!entitled({entitlements:{tournaments:[]}}));
 assert(!entitled({entitlements:{tournaments:['BASIC_L1']}},'premium'));
 assert(entitled({entitlements:{tournaments:['BASIC_L1','PREMIUM_L1']}},'premium'));
 assert(canManageUatClub([{clubId:6459394157,role:'DIRECTOR'}]));
 assert(!canManageUatClub([{clubId:6459394157,role:'PLAYER'}]));
 assert(!canManageUatClub([{clubId:123,role:'DIRECTOR'}]));
 assert(canManageUatClub({membership:[{clubId:'6459394157',role:'DIRECTOR'}]}));
 assert(canManageUatClub({result:{membership:[{clubId:'6459394157',role:'ORGANIZER'}]}}));
 assert(!canManageUatClub({membership:[{clubId:'6459394157',role:'PLAYER'}]}));
});
Deno.test('DUPR documented subscriptions response and wrapped response',()=>{
 const subscriptions={subscriptions:[{status:'active',entitlements:{tournaments:['BASIC_L1','PREMIUM_L1']}}]};
 assert(entitled(subscriptions));
 assert(entitled(subscriptions,'premium'));
 assert(!entitled(subscriptions,'verified'));
 assert(entitled({result:subscriptions}));
 assert(entitled({subscriptions:[{entitlements:{tournaments:['BASIC_L1']}},{entitlements:{tournaments:['VERIFIED_L1']}}]},'verified'));
 assert(!entitled({subscriptions:[{entitlements:{tournaments:['PREMIUM_L1']}}]},'premium'));
 assert(!entitled({subscriptions:[]}));
 assert(!entitled({subscriptions:[{entitlements:{tournaments:'BASIC_L1'}}]}));
});
Deno.test('DUPR match errors and allowed sources',()=>{
 assert(validateMatch(match,true).ok);
 assert.equal(validateMatch({...match,teamA:{...match.teamA,player2:'AAAAAA'}},true).reason,'duplicate_player');
 assert.equal(validateMatch({...match,teamA:{...match.teamA,game1:7}},true).reason,'invalid_or_tied_game');
 assert.equal(validateMatch(match,false).reason,'club_permission');
 assert(validateMatch({...match,matchSource:'PARTNER',clubId:undefined},false).ok);
 assert.equal(validateMatch({...match,matchSource:'PARTNER'},true).reason,'partner_has_club_id');
 assert.equal(validateMatch({...match,identifier:''},true).reason,'identifier_missing');
 assert.equal(validateMatch({...match,matchDate:'2026-02-30'},true).reason,'date_invalid');
});
Deno.test('DUPR user tokens are encrypted, round-trip and tampering rejected',async()=>{
 const secret='secret-for-unit-test-not-production-12345';
 const pair={accessToken:'access-secret',refreshToken:'refresh-secret'};
 const a=await sealTokens(pair,secret),b=await sealTokens(pair,secret);
 assert.notEqual(a,b);assert(!a.includes(pair.accessToken));assert.deepEqual(await unsealTokens(a,secret),pair);
 await assert.rejects(unsealTokens(a,secret+'changed'));
});
Deno.test('HTTP 200 with DUPR FAILURE body is rejected',async()=>{
 const mock=(async()=>new Response(JSON.stringify({status:'FAILURE'}),{status:200})) as typeof fetch;
 await assert.rejects(duprRequest('https://uat.mydupr.com/api/user/v1.0/123',{fetcher:mock}));
 await assert.rejects(duprRequest('https://evil.example/api',{fetcher:mock}));
});
