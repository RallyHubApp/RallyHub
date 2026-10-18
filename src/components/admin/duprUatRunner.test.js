import test from 'node:test';
import assert from 'node:assert/strict';
import {duprUatPreflight,duprUatSyntheticMatch,duprUatBulkAcceptance} from './duprUatRunner.js';
const accounts=['brian','marie','roisin','rallyhub'].map((slot,i)=>({slot,duprId:'ABC12'+i}));
test('one-click DUPR preflight completes four account gates',async()=>{
 const calls=[];
 const call=async(action)=>{calls.push(action);if(action==='uat_match_preflight')return {ready:true,accounts,clubId:'6459394157'};return {success:true};};
 const out=await duprUatPreflight(call);
 assert.equal(out.verified.accounts.length,4);
 assert.equal(calls.filter(x=>x==='uat_refresh').length,4);
 assert.equal(calls.filter(x=>x==='uat_subscribe_rating').length,4);
});
