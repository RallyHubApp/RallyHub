import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveEventTemplate,eventTemplateValues} from '../../base44/functions/eventRegistration/templateResolver.js';
test('only approved event templates are sent and tokens are merged',()=>{
 const values=eventTemplateValues({name:'Corofin Taster',start_date:'2026-11-12',location:'Corofin'},{full_name:'Brian Moore',payment_hold_expires_at:'2026-10-30T17:00:00Z'},'Payment link: https://pay.example.test/123');
 const rows=[{purpose:'event_payment_required',status:'draft',subject_template:'DRAFT'},{purpose:'event_payment_required',status:'approved',subject_template:'Pay {{EVENT_NAME}}',plain_text_template:'Hi {{FIRST_NAME}} {{PAYMENT_LINK}} {{PAYMENT_DEADLINE}}',html_template:'<p>{{PAYMENT_LINK}}</p>'}];
 const result=resolveEventTemplate(rows,'payment_required',values);
 assert.equal(result.subject,'Pay Corofin Taster');assert.match(result.body,/https:\/\/pay.example.test\/123/);assert.match(result.html,/pay.example.test/);assert.ok(!result.body.includes('{{'));
 assert.equal(resolveEventTemplate(rows,'booking_confirmed',values),null);
});
