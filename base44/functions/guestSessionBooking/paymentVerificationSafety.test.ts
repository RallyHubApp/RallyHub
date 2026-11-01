import {strict as assert} from 'node:assert';
import {reviewGuestPaymentVerification as review,completeGuestPaymentConfirmation as complete} from './paymentVerificationSafety.ts';
Deno.test('paid booking cannot regress on delayed failed checkout status',()=>assert.equal(review({payment_status:'paid'},'FAILED').action,'preserve_settlement'));
Deno.test('refunded booking cannot become paid again',()=>assert.equal(review({payment_status:'refunded'},'PAID').action,'already_settled'));
Deno.test('new paid checkout settles booking',()=>assert.equal(review({payment_status:'pending'},'PAID').action,'settle'));
Deno.test('failed pending checkout is recorded',()=>assert.equal(review({payment_status:'pending'},'EXPIRED').status,'expired'));
Deno.test('failed confirmation leaves paid booking intact',async()=>{const booking={payment_status:'paid'};const r=await complete(booking,async()=>{throw Error('SMTP offline')});assert.equal(r.booking,booking);assert.equal(r.confirmationNeedsReview,true)});
Deno.test('successful confirmation returns updated booking',async()=>assert.equal((await complete({},async()=>({sent:true}))).booking.sent,true));
