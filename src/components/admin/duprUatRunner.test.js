import test from 'node:test';
import assert from 'node:assert/strict';
import {duprUatPreflight,duprUatSyntheticMatch,duprUatBulkAcceptance} from './duprUatRunner.js';
const accounts=['brian','marie','roisin','rallyhub'].map((slot,i)=>({slot,duprId:'ABC12'+i,clubAdmin:i===0}));
test('one-click DUPR preflight completes four account gates',async()=>{
 const calls=[];
 const call=async(action)=>{calls.push(action);if(action==='uat_match_preflight')return {ready:true,accounts,clubId:'6459394157'};return {success:true};};
 const out=await duprUatPreflight(call);
 assert.equal(out.verified.accounts.length,4);
 assert.equal(calls.filter(x=>x==='uat_refresh').length,4);
 assert.equal(calls.filter(x=>x==='uat_subscribe_rating').length,4);
});
test('synthetic UAT match creates, rejects duplicate, updates and deletes',async()=>{
 let creates=0,updates=0,deletes=0;
 const call=async(action)=>{
  if(action==='uat_submit_match'){creates++;if(creates>1)throw Error('duplicate');return {acknowledged:true};}
  if(action==='uat_update_match'){updates++;return {updated:true};}
  if(action==='uat_delete_match'){deletes++;return {deleted:true};}
  throw Error(action);
 };
 const out=await duprUatSyntheticMatch(call,accounts,'6459394157');
 assert(out.duplicateBlocked);assert.equal(creates,2);assert.equal(updates,1);assert.equal(deletes,1);
});
test('bulk UAT submits two and deletes both',async()=>{
 let submitted=0,removed=0;
 const call=async(action,body)=>{
  if(action==='uat_submit_batch'){submitted=body.matches.length;return {acknowledged:true,submitted:[{},{}]};}
  if(action==='uat_delete_match'){removed++;return {deleted:true};}
  throw Error(action);
 };
 const out=await duprUatBulkAcceptance(call,accounts,'6459394157');
 assert.equal(submitted,2);assert.equal(removed,2);assert.equal(out.deleted.length,2);
});
