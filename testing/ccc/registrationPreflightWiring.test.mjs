import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../../base44/functions/cccActivity/entry.ts',import.meta.url),'utf8');
test('preflight derives readiness from actual configuration rather than unconditional pending marker',()=>{const a=src.indexOf("if(body.action==='registration_preflight')");const b=src.indexOf("if(body.action==='cancellation_review')",a);const section=src.slice(a,b);assert.ok(a>0&&b>a);assert.doesNotMatch(section,/booking_capacity_payment_and_notification_integration_pending/);assert.match(section,/ready:issues\.length===0/);assert.match(section,/providerSettlementVerified:false/)});
const webhook=readFileSync(new URL('../../base44/functions/paymentGatewayWebhook/entry.ts',import.meta.url),'utf8');
test('webhook confirmation helper is locally bundled',()=>{assert.match(webhook,/from '\.\/confirmationLock\.mjs'/)});
