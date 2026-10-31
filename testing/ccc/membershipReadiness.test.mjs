import test from 'node:test';
import assert from 'node:assert/strict';
import {membershipReadiness} from '../../base44/functions/cccActivity/membershipReadiness.mjs';
const scope={tenantId:'t1',clubId:'c1',complete:true};
const cfg={id:'cfg',tenant_id:'t1',club_id:'c1',status:'active',public_slug:'join',season_label:'2026',membership_fee:25,currency:'EUR',payment_required:true,payment_gateway_account_id:'gateway',privacy_document_id:'privacy',waiver_document_id:'waiver',code_document_id:'code',health_document_id:'health'};
const docs=['privacy','waiver','code','health'].map((id,i)=>({id,document_type:['privacy_data','liability_waiver','code_of_conduct','health_declaration'][i],tenant_id:'t1',club_id:'c1',active:true}));
const policy={tenant_id:'t1',club_id:'c1',policy_type:'adult_participation',status:'active',minimum_age:18};
const gateway={id:'gateway',tenant_id:'t1',club_id:'c1',provider:'sumup',status:'connected'};
test('configured journey passes structural review but never authorises charging',()=>{
 const r=membershipReadiness([cfg],[policy],docs,[gateway],scope);
 assert.equal(r.readyConfigCount,1);assert.equal(r.checkoutVerified,false);assert.equal(r.authorisedToCharge,false);
});
test('missing legal evidence, adult policy and gateway are flagged',()=>{
 const r=membershipReadiness([cfg],[],[],[],scope);
 assert.ok(r.configurations[0].issues.includes('adult_policy_not_verified'));
 assert.ok(r.configurations[0].issues.includes('gateway_not_connected'));
 assert.ok(r.configurations[0].issues.includes('privacy_data_not_verified'));
});
test('cross-club documents and gateways cannot satisfy checks',()=>{
 const r=membershipReadiness([cfg],[{...policy,club_id:'c2'}],docs.map(d=>({...d,club_id:'c2'})),[{...gateway,club_id:'c2'}],scope);
 assert.equal(r.readyConfigCount,0);
});
test('no active config and incomplete inventories require review',()=>{
 assert.equal(membershipReadiness([],[],[],[],scope).requiresReview,true);
 assert.equal(membershipReadiness([cfg],[policy],docs,[gateway],{...scope,complete:false}).requiresReview,true);
});
