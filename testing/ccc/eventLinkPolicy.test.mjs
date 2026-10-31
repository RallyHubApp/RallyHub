import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEventLink} from '../../base44/functions/cccActivity/eventLinkPolicy.mjs';
const activity={tenant_id:'t1',club_id:'c1',venue_id:'v1',host_user_id:'host',communication_template_id:'template',capacity:16,starts_at:'2026-11-04T19:00:00',registration_mode:'approval',payment_method:'none'};
const event={tenant_id:'t1',host_club_id:'c1',venue_id:'v1',event_capacity:16,start_date:'2026-11-04',event_registration_mode:'rallyhub',event_fee_amount:0};
const context={venue:{id:'v1',tenant_id:'t1',club_id:'c1',status:'active'},hostVerified:true,templateVerified:true};
test('valid same-club linked event passes conservative checks',()=>assert.deepEqual(validateEventLink(activity,event,context),[]));
test('rejects event without explicit matching venue ID',()=>{
 assert.ok(validateEventLink(activity,{...event,venue_id:undefined},context).includes('event_venue_mismatch'));
 assert.ok(validateEventLink(activity,{...event,venue_id:'v2'},context).includes('event_venue_mismatch'));
});
test('rejects cross-club and cross-tenant event',()=>{
 assert.ok(validateEventLink(activity,{...event,host_club_id:'other'},context).includes('event_scope_mismatch'));
 assert.ok(validateEventLink(activity,{...event,tenant_id:'other'},context).includes('event_scope_mismatch'));
});
test('rejects unverified host and missing approved template',()=>{
 const issues=validateEventLink(activity,event,{...context,hostVerified:false,templateVerified:false});
 assert.ok(issues.includes('host_not_verified'));assert.ok(issues.includes('template_not_verified'));
});
test('rejects inactive venue, mismatched date, capacity and policy',()=>{
 const issues=validateEventLink({...activity,capacity:10,starts_at:'2026-11-05T19:00:00',registration_mode:'closed'},event,{...context,venue:{...context.venue,status:'inactive'}});
 for(const reason of ['venue_unavailable','event_date_mismatch','event_capacity_mismatch','registration_policy_unavailable'])assert.ok(issues.includes(reason));
});
test('paid events require online and free events cannot be linked to online policy',()=>{
 assert.ok(validateEventLink(activity,{...event,event_fee_amount:5},context).includes('paid_event_requires_online'));
 assert.ok(validateEventLink({...activity,payment_method:'online'},event,context).includes('free_event_payment_mismatch'));
 assert.deepEqual(validateEventLink({...activity,payment_method:'online'},{...event,event_fee_amount:5},context),[]);
});
