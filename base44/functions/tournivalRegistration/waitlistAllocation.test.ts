import {strict as assert} from 'node:assert';
import {allocateTournivalWaitlistTicket} from './waitlistAllocation.ts';

Deno.test('100 concurrent durable FIFO tickets are unique and contiguous',async()=>{
 let value:null|number=null;
 const tournaments={
  async filter(){await Promise.resolve();return [{tournival_waitlist_sequence:value}]},
  async updateMany(query:any,update:any){
   await Promise.resolve();
   if(query.tournival_waitlist_sequence!==value)return {updated:0};
   if(update.$set){value=update.$set.tournival_waitlist_sequence;return {updated:1}}
   if(update.$inc){value=(value as number)+1;return {updated:1}}
   throw Error('unsupported operator');
  }
 };
 const tickets=await Promise.all(Array.from({length:100},()=>allocateTournivalWaitlistTicket({
  tournaments,tournamentId:'test',tenantId:'synthetic',seed:0,attempts:400
 })));
 assert.deepEqual([...tickets].sort((a,b)=>a-b),Array.from({length:100},(_,i)=>i+1));
 assert.equal(value,100);
});
Deno.test('full or corrupt sequence fails closed',async()=>{
 const tournaments={filter:async()=>[{tournival_waitlist_sequence:NaN}],updateMany:async()=>({updated:0})};
 await assert.rejects(allocateTournivalWaitlistTicket({
  tournaments,tournamentId:'test',tenantId:'synthetic',seed:0
 }),/reconciliation/);
});
