import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const s=fs.readFileSync('base44/functions/legacyTournamentManager/entry.ts','utf8');
const a=s.indexOf("    if (action === 'tournival_payment_reminder')"),b=s.indexOf("    if (action === 'tournival_registrations')",a);
const code=ts.transpileModule('async function handler(action,body,tournament,base44,clean,retrievePayment,createCheckout){'+s.slice(a,b)+'}',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const handler=new Function(code+';return handler')();
const fixture=()=>({row:{id:'r',tenant_id:'t',tournament_id:'e',club_id:'c',registration_status:'pending_payment',payment_status:'pending',payment_record_id:'p',amount_due:21,currency:'EUR',mobile:'0871234567',full_name:'Test Player'},payments:[{id:'p',tenant_id:'t',club_id:'c',purpose_id:'r',payment_type:'tournival_registration',payment_status:'pending',provider:'sumup',amount:21,currency:'EUR',provider_checkout_id:'old',provider_account_id:'merchant',provider_checkout_url:'https://checkout.sumup.com/test'}],status:'pending',creates:0,locked:false});
const call=async(f,id='r')=>{
 const match=(r,q)=>Object.entries(q).every(([k,v])=>r[k]===v);
 const e={Tournament:{updateMany:async(q,u)=>{if(u.$addToSet)return {updated:1};if(q.tournival_registration_lock===null&&f.locked)return {updated:0};f.locked=!!u.$set.tournival_registration_lock;return {updated:1};}},TournivalRegistration:{filter:async q=>[f.row].filter(r=>match(r,q)),update:async(id,u)=>Object.assign(f.row,u)},PaymentRecord:{filter:async q=>f.payments.filter(r=>match(r,q)),update:async(id,u)=>Object.assign(f.payments.find(p=>p.id===id),u),create:async u=>{const p={...u,id:'replacement'};f.payments.push(p);return p;}},PaymentGatewayAccount:{filter:async()=>[{merchant_account_id:'merchant'}]}};
 const retrievePayment=async(provider,id)=>({merchantAccountId:'merchant',raw:{amount:21,currency:'EUR',status:id==='old'?f.status:'pending'},normalizedStatus:id==='old'?f.status:'pending',providerStatus:f.status.toUpperCase(),transactionId:'tx'});
 const createCheckout=async()=>{f.creates++;return {checkoutId:'new',checkoutUrl:'https://checkout.sumup.com/new',providerStatus:'PENDING'};};
 return handler('tournival_payment_reminder',{registrationId:id},{id:'e',tenant_id:'t',format:'Tournival'},{asServiceRole:{entities:e}},(v,n)=>String(v??'').trim().slice(0,n),retrievePayment,createCheckout);
};
for(const status of ['pending','failed','expired']){
 const f=fixture();f.status=status;f.row.payment_status=status;
 const res=await call(f);assert.equal(res.status,200);assert.equal((await res.json()).mobile,'353871234567');
 assert.equal(f.creates,status==='pending'?0:1);
 assert.equal((await call(f)).status,200);assert.equal(f.creates,status==='pending'?0:1);
}
for(const mutate of [f=>f.row.payment_status='paid',f=>f.row.registration_status='withdrawn',f=>f.payments[0].payment_status='paid',f=>f.payments[0].amount=22,f=>f.payments[0].currency='USD',f=>f.payments[0].tenant_id='other',f=>f.payments[0].provider_checkout_url='https://sumup.com.evil.invalid/a',f=>f.payments[0].provider_checkout_id='',f=>f.status='unknown',f=>f.locked=true]){const f=fixture();mutate(f);assert.equal((await call(f)).status,409);assert.equal(f.creates,0);}
const paid=fixture();paid.status='paid';assert.equal((await (await call(paid)).json()).alreadyPaid,true);assert.equal(paid.row.payment_status,'paid');assert.equal(paid.creates,0);
console.log('PAYMENT REMINDER GATE PASS');
