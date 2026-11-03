import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../base44/functions/paymentGatewayWebhook/entry.ts',import.meta.url),'utf8');
test('SumUp event checkout amount/currency validation precedes paid ledger mutation',()=>{
 const anchor=source.indexOf("if(payment.purpose_type==='event'&&payment.payment_type==='event_registration'",source.indexOf("const update={"));
 const write=source.indexOf('PaymentRecord.update(payment.id,update)',anchor);
 assert.ok(anchor>0&&write>anchor);const validation=source.slice(anchor,write);
 assert.match(validation,/verified\.amount/);assert.match(validation,/verified\.currency/);assert.match(validation,/status:409/);
});
