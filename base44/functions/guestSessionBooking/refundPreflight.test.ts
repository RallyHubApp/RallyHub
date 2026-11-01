import {strict as assert} from 'node:assert';import {guestRefundPreflight as check} from './refundPreflight.ts';
const booking={id:'b',tenant_id:'t',club_id:'c'},payment={id:'p',tenant_id:'t',club_id:'c',purpose_type:'booking',purpose_id:'b',amount:20};
const run=(extra:any={})=>check({booking,payment,history:[],tenantId:'t',clubId:'c',amount:10,...extra});
Deno.test('valid partial refund permitted',()=>assert.equal(run().allowed,true));
Deno.test('pending refund blocks duplicate gateway call',()=>assert.ok(run({history:[{payment_record_id:'p',tenant_id:'t',club_id:'c',status:'processing',amount:10}]}).issues.includes('unresolved_refund')));
Deno.test('foreign payment blocks refund',()=>assert.ok(run({payment:{...payment,club_id:'other'}}).issues.includes('payment_scope')));
Deno.test('foreign refund history blocks refund',()=>assert.ok(run({history:[{payment_record_id:'p',tenant_id:'other',club_id:'c',status:'succeeded',amount:5}]}).issues.includes('history_scope')));
Deno.test('fully refunded transaction cannot refund again',()=>assert.ok(run({history:[{payment_record_id:'p',tenant_id:'t',club_id:'c',status:'succeeded',amount:20}]}).issues.includes('amount_exceeds_remaining')));
Deno.test('100-record truncation refuses provider refund',()=>assert.ok(run({history:Array.from({length:100},()=>({payment_record_id:'p',tenant_id:'t',club_id:'c',status:'succeeded',amount:0}))}).issues.includes('history_incomplete')));
