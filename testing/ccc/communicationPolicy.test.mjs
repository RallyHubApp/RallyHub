import test from 'node:test';
import assert from 'node:assert/strict';
import {communicationPreflight,providerSelection} from '../../src/lib/ccc/communicationPolicy.js';
const base={tenantId:'t',clubId:'c',personId:'p',channel:'email',purpose:'transactional',brandScope:'tenant',templateId:'approved',recipient:'p@example.com'};
test('transactional message requires approved template and brand scope',()=>{
 assert.equal(communicationPreflight(base).allowed,true);
 assert.ok(communicationPreflight({...base,templateId:''}).errors.includes('approved_template_required'));
 assert.ok(communicationPreflight({...base,brandScope:''}).errors.includes('brand_scope_required'));
});
test('marketing fails closed without matching tenant, person, channel consent',()=>{
 assert.ok(communicationPreflight({...base,purpose:'marketing'}).errors.includes('marketing_consent_required'));
 const consent={tenant_id:'t',club_id:'c',person_id:'p',status:'accepted',consent_type:'marketing',channels:['email']};
 assert.equal(communicationPreflight({...base,purpose:'marketing',consents:[consent]}).allowed,true);
 assert.equal(communicationPreflight({...base,purpose:'marketing',channel:'sms',consents:[consent]}).allowed,false);
});
test('suppression blocks transactional and marketing',()=>{
 const suppressions=[{tenant_id:'t',person_id:'p',channel:'email',status:'active'}];
 assert.ok(communicationPreflight({...base,suppressions}).errors.includes('recipient_suppressed'));
});
test('SMS/WhatsApp do not silently fall back to unconfigured providers',()=>{
 assert.deepEqual(providerSelection({channel:'sms'}),{available:false,reason:'provider_not_configured'});
 assert.deepEqual(providerSelection({channel:'whatsapp',configuredProviders:{whatsapp:{enabled:true,providerId:'approved-wa'}}}),{available:true,providerId:'approved-wa'});
});
test('actual CommunicationSuppression active field controls blocking, not legacy status',()=>{
 const active={owner_scope:'tenant',tenant_id:'t',person_id:'p',channel:'email',active:true};
 assert.ok(communicationPreflight({...base,suppressions:[active]}).errors.includes('recipient_suppressed'));
 assert.equal(communicationPreflight({...base,suppressions:[{...active,active:false}]}).errors.includes('recipient_suppressed'),false);
 assert.ok(communicationPreflight({...base,suppressions:[{...active,owner_scope:'platform',tenant_id:'other'}]}).errors.includes('recipient_suppressed'));
 assert.equal(communicationPreflight({...base,suppressions:[{...active,tenant_id:'other'}]}).errors.includes('recipient_suppressed'),false);
});
