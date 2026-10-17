import {strict as assert} from 'node:assert';
import {renderApprovedTournivalTemplate,resolveApprovedTournivalTemplate} from './tournivalTemplates.ts';
const brand={id:'kit-1',status:'active',tenant_id:'isolated-tenant',name:'Synthetic Pickleball',owner_scope:'tenant',colours:{primary:'#112244',secondary:'#ffee22'},logos:{primary:'https://example.invalid/logo.png'}};
const club={id:'club-1',tenant_id:'isolated-tenant',name:'Synthetic Pickleball'};
const template={id:'tpl-1',tenant_id:'isolated-tenant',brand_kit_id:'kit-1',owner_scope:'tenant',status:'approved',purpose:'tournival_payment_required',name:'Payment required',subject_template:'Payment for {{EVENT_NAME}}',plain_text_template:'Hi {{FIRST_NAME}}, pay here: {{PAYMENT_LINK}}',html_template:'<p>Hi {{FIRST_NAME}}</p><p><a href="{{PAYMENT_LINK}}">Pay now</a></p>',channel_templates:{email:{header_title:'Tournament payment'},whatsapp:{text_template:'Hi {{FIRST_NAME}}, complete payment: {{PAYMENT_LINK}}'}}};
Deno.test('approved email uses universal brand kit and escaped body links',()=>{
 const msg=renderApprovedTournivalTemplate({template,brand,club,channel:'email',fields:{FIRST_NAME:'A&B',EVENT_NAME:'Synthetic Open',PAYMENT_LINK:'https://example.invalid/pay'}});
 assert.equal(msg.subject,'Payment for Synthetic Open');
 assert.match(msg.html,/#112244/);
 assert.match(msg.html,/A&amp;B/);
 assert.match(msg.html,/https:\/\/example.invalid\/pay/);
 assert.match(msg.html,/Powered by/);
});
Deno.test('WhatsApp uses only approved channel template',()=>{
 const msg=renderApprovedTournivalTemplate({template,brand,club,channel:'whatsapp',fields:{FIRST_NAME:'Morgan',EVENT_NAME:'Synthetic Open',PAYMENT_LINK:'https://example.invalid/pay'}});
 assert.match(msg.text,/Morgan/);
 assert.equal(msg.html,undefined);
});
Deno.test('missing template, brand, fields, unsafe URL fail closed',async()=>{
 assert.throws(()=>renderApprovedTournivalTemplate({template:{...template,status:'draft'},brand,club,channel:'email',fields:{}}),/approved/);
 assert.throws(()=>renderApprovedTournivalTemplate({template,brand:{...brand,status:'retired'},club,channel:'email',fields:{}}),/active/);
 assert.throws(()=>renderApprovedTournivalTemplate({template,brand,club,channel:'email',fields:{EVENT_NAME:'X'}}),/Missing/);
 assert.throws(()=>renderApprovedTournivalTemplate({template,brand,club,channel:'email',fields:{EVENT_NAME:'X',FIRST_NAME:'Y',PAYMENT_LINK:'http://unsafe.invalid'}}),/HTTPS/);
 const db={asServiceRole:{entities:{CommunicationTemplate:{filter:async()=>[]}}}};
 await assert.rejects(resolveApprovedTournivalTemplate(db,{tenantId:'isolated-tenant',clubId:'club-1',purpose:'tournival_payment_required',channel:'email',fields:{}}),/template missing/);
});
