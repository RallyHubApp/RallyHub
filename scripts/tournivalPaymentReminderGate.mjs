import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const s=fs.readFileSync('base44/functions/legacyTournamentManager/entry.ts','utf8');
const a=s.indexOf("    if (action === 'tournival_payment_reminder')"),b=s.indexOf("    if (action === 'tournival_registrations')",a);
const code=ts.transpileModule('async function handler(action,body,tournament,base44,clean){'+s.slice(a,b)+'}',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const handler=new Function(code+';return handler')();
const fixture=()=>({row:{id:'r',tenant_id:'t',tournament_id:'e',club_id:'c',registration_status:'pending_payment',payment_status:'pending',payment_record_id:'p',amount_due:21,currency:'EUR',mobile:'0871234567',full_name:'Test Player'},payment:{id:'p',tenant_id:'t',club_id:'c',purpose_id:'r',payment_type:'tournival_registration',payment_status:'pending',provider:'sumup',amount:21,currency:'EUR',provider_checkout_url:'https://checkout.sumup.com/test'}});
const call=async(f,id='r')=>{const match=(r,q)=>Object.entries(q).every(([k,v])=>r[k]===v);const e={TournivalRegistration:{filter:async q=>[f.row].filter(r=>match(r,q))},PaymentRecord:{filter:async q=>[f.payment,...(f.extra||[])].filter(r=>match(r,q))}};return handler('tournival_payment_reminder',{registrationId:id},{id:'e',tenant_id:'t',format:'Tournival'},{asServiceRole:{entities:e}},(v,n)=>String(v??'').trim().slice(0,n));};
let f=fixture();let res=await call(f);assert.equal(res.status,200);let data=await res.json();assert.equal(data.mobile,'353871234567');assert.equal(data.checkoutUrl,f.payment.provider_checkout_url);assert.equal(data.amount,21);
for(const mobile of ['+353871234567','00353871234567']){f=fixture();f.row.mobile=mobile;assert.equal((await (await call(f)).json()).mobile,'353871234567');}
for(const mutate of [f=>f.row.payment_status='paid',f=>f.row.registration_status='withdrawn',f=>f.payment.payment_status='paid',f=>f.payment.amount=22,f=>f.payment.currency='USD',f=>f.payment.tenant_id='other',f=>f.payment.provider_checkout_url='https://sumup.com.evil.invalid/a',f=>f.payment.provider_checkout_url='',f=>f.row.mobile='',f=>f.extra=[{...f.payment,id:'p2',payment_status:'paid'}]]){f=fixture();mutate(f);assert.equal((await call(f)).status,409);}
assert.equal((await call(fixture(),'other')).status,409);
console.log('PAYMENT REMINDER GATE PASS: existing checkout, Irish/international numbers, paid/withdrawn, amount/currency, tenant scope, unsafe/missing URL, missing mobile, duplicate paid record');
