import test from 'node:test';
import assert from 'node:assert/strict';
import {communicationReadiness,reviewTemplate,requiredPurposes} from '../../base44/functions/cccActivity/communicationReadiness.mjs';
const template=(purpose,extra={})=>({id:purpose,owner_scope:'tenant',purpose,status:'approved',approved_at:'2026-10-01',approved_by_user_id:'admin',brand_kit_id:'kit',version:'1',subject_template:'Hello',html_template:'<p>Hello</p>',plain_text_template:'Hello',...extra});
test('all eight required communication purposes have a defined readiness gate',()=>{
 assert.equal(requiredPurposes.length,8);
 const result=communicationReadiness(requiredPurposes.map(p=>template(p)));
 assert.equal(result.readyPurposeCount,8);assert.equal(result.allTemplatesReady,true);
 assert.equal(result.authorisedToSend,false);assert.equal(result.deliveryEnabled,false);
 assert.equal(result.consentVerified,false);assert.equal(result.suppressionVerified,false);
});
test('missing template, brand kit, approval, subject and text fail closed',()=>{
 const result=communicationReadiness([template('membership_request',{brand_kit_id:'',approved_at:'',html_template:''})]);
 assert.equal(result.allTemplatesReady,false);
 assert.ok(result.purposes[0].issues.includes('brand_kit_missing'));
 assert.ok(result.purposes[0].issues.includes('approval_evidence_missing'));
 assert.ok(result.purposes[0].issues.includes('html_template_missing'));
 assert.ok(result.purposes[1].issues.includes('template_missing'));
});
test('draft or platform templates cannot satisfy tenant approval',()=>{
 assert.equal(reviewTemplate(template('host_access',{status:'draft'})).ready,false);
 assert.equal(reviewTemplate(template('host_access',{owner_scope:'platform'})).ready,false);
});
test('partial template scans cannot claim complete readiness',()=>{
 const result=communicationReadiness(requiredPurposes.map(p=>template(p)),{complete:false});
 assert.equal(result.readyPurposeCount,8);assert.equal(result.allTemplatesReady,false);assert.equal(result.complete,false);
});
test('readiness response never returns message bodies or recipient data',()=>{
 const result=communicationReadiness([template('payment_link',{html_template:'PRIVATE BODY',recipient:'private@example.ie'})]);
 assert.equal(JSON.stringify(result).includes('PRIVATE BODY'),false);
 assert.equal(JSON.stringify(result).includes('private@example.ie'),false);
});
