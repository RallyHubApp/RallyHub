import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {directoryDeliveryPlan} from '../../base44/shared/directoryDelivery.mjs';
import {directoryAudience} from '../../base44/shared/directoryAudience.mjs';
const governance=readFileSync('base44/functions/directoryGovernance/entry.ts','utf8');
const campaign={id:'campaign-draft-one',status:'approved',channel:'email',purpose:'tournaments_events',sender_email:'rallyhubapp@gmail.com',subject:'Events',body_text:'A deliberately approved sample email.'};
const person={id:'subscriber-1',email:'privacy@example.test',email_opt_in:true,status:'active',consent_at:'2026-10-24T10:00:00Z',consent_version:'directory-2026',topics:['tournaments_events']};
test('preflight only prepares an approved campaign for a currently consented audience',async()=>{
 const audience=await directoryAudience([person],[],{},new Date('2026-10-25T10:00:00Z'));
 const plan=await directoryDeliveryPlan(campaign,audience,new Date('2026-10-25T10:00:00Z'));
 assert.deepEqual(plan.issues,[]);assert.equal(plan.preparedCount,1);assert.equal(plan.entries[0].status,'prepared');assert.equal(plan.entries[0].attempt_count,0);
 assert.equal(plan.externalSendEnabled,false);assert.equal(plan.providerAcceptanceConfirmed,false);assert.equal(plan.deliveryConfirmed,false);
 assert.notEqual(plan.entries[0].recipient_hash,person.email);assert.match(plan.entries[0].idempotency_key,/^[a-f0-9]{64}$/);
});
test('unapproved, unsendable, empty-audience and unauthorised sender fail the preflight',async()=>{
 const a={eligible:[{subscriberId:'s1',email:'test@example.test',consentVersion:'v1'}],eligibleCount:1};
 for(const changed of [{status:'draft'},{sender_email:'other@example.test'},{channel:'whatsapp'},{body_text:''}]){
  const plan=await directoryDeliveryPlan({...campaign,...changed},a);
  assert.equal(plan.preparedCount,0);assert.ok(plan.issues.length);
 }
 const noAudience=await directoryDeliveryPlan(campaign,{eligible:[],eligibleCount:0});assert.equal(noAudience.preparedCount,0);
});
test('Directory server offers explicitly confirmed preparation only, with no external send action',()=>{
 assert.match(governance,/action==='admin_delivery_preflight'\|\|action==='admin_prepare_delivery'/);
 assert.match(governance,/body\.confirmPrepare!=='PREPARE ONLY'/);
 assert.match(governance,/DirectoryDeliveryAttempt\.filter\(\{idempotency_key:entry\.idempotency_key\}/);
 assert.match(governance,/Prepared records only\. No external delivery was triggered/);
 assert.doesNotMatch(governance,/sendEmail\(/);
});
