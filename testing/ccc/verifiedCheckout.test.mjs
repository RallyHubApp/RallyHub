import test from 'node:test';import assert from 'node:assert/strict';import {reviewVerifiedEventCheckout as review} from '../../base44/functions/eventRegistration/verifiedCheckout.mjs';
const result={normalizedStatus:'paid',transactionId:'tx',merchantAccountId:'merchant',raw:{id:'checkout',amount:5.5,currency:'EUR',merchant_code:'merchant'}};
const expected={amount:5.5,currency:'EUR',merchantCode:'merchant',checkoutId:'checkout'};
test('valid SumUp paid checkout passes',()=>assert.equal(review(result,expected).verified,true));
for(const [label,patch,issues] of [
 ['wrong amount',{raw:{...result.raw,amount:6}},'amount_mismatch'],
 ['missing amount',{raw:{...result.raw,amount:undefined}},'amount_mismatch'],
 ['wrong currency',{raw:{...result.raw,currency:'GBP'}},'currency_mismatch'],
 ['wrong merchant',{raw:{...result.raw,merchant_code:'different'}},'merchant_mismatch'],
 ['wrong checkout',{raw:{...result.raw,id:'other'}},'checkout_mismatch'],
 ['no transaction',{transactionId:''},'transaction_missing'],
 ['not paid',{normalizedStatus:'pending'},'provider_not_paid'],
 ])test(label+' cannot confirm booking',()=>assert.ok(review({...result,...patch},expected).issues.includes(issues)));
