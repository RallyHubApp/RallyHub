import assert from "node:assert/strict";
import fs from "node:fs";
import {
 assertScope, recipientDedupeKey, deliveryIdempotencyKey, classifyConsent,
 canBypassQuietHours, validateDualEmail, campaignSendReadiness, evaluateWorkflowStep, validatePoll
} from "../src/services/communications/core.js";

const schemas=["CommunicationCampaign","CommunicationMessage","CommunicationRecipient","CommunicationDeliveryAttempt","CommunicationBrandKit","CommunicationTemplate","CommunicationWorkflow","CommunicationPoll","CommunicationPollResponse"];
for (const s of schemas) assert.ok(fs.existsSync(`base44/entities/${s}.jsonc`), `missing schema ${s}`);

assert.equal(assertScope({owner_scope:"platform"}),true);
assert.equal(assertScope({owner_scope:"tenant",tenant_id:"t1"}),true);
assert.throws(()=>assertScope({owner_scope:"tenant"}),/COMM_TENANT_REQUIRED/);
assert.equal(recipientDedupeKey({email:" TEST@Example.com ",channel:"email"}),"email:test@example.com");
assert.equal(deliveryIdempotencyKey({campaign_id:"c",message_id:"m",recipient_key:"r",channel:"email"}),"c|m|r|email");
assert.deepEqual(classifyConsent({kind:"campaign",channel:"email",consent_status:"not_recorded"}),{eligible:false,reason:"marketing_permission_required"});
assert.deepEqual(classifyConsent({kind:"operational",channel:"email",consent_status:"not_recorded"}),{eligible:true,reason:"eligible"});
assert.deepEqual(classifyConsent({kind:"operational",channel:"email",consent_status:"accepted",suppressed:true}),{eligible:false,reason:"suppressed"});
assert.equal(canBypassQuietHours({kind:"emergency",priority:"routine"}),true);
assert.equal(canBypassQuietHours({kind:"campaign",priority:"routine"}),false);
assert.equal(validateDualEmail({html_body:"<p>Hello</p>",plain_text_body:"Hello"}).ok,true);
assert.equal(validateDualEmail({html_body:"<p>Hello</p>",plain_text_body:""}).ok,false);
assert.equal(campaignSendReadiness({
 campaign:{owner_scope:"tenant",tenant_id:"t1",purpose:"results",created_by_user_id:"u1"},
 message:{channel:"email",html_body:"<p>Hi</p>",plain_text_body:"Hi"},
 recipients:[{eligibility_status:"eligible"},{eligibility_status:"suppressed"}]
}).ready,true);
assert.deepEqual(evaluateWorkflowStep({goalAchieved:true}),{action:"exit",reason:"goal_achieved"});
assert.deepEqual(evaluateWorkflowStep({condition:false}),{action:"branch",reason:"condition_not_met"});
assert.equal(validatePoll({poll_type:"poll",title:"Court time?",questions:[{id:"q1",type:"single_choice"}]}).ok,true);
assert.equal(validatePoll({poll_type:"poll",title:"",questions:[]}).ok,false);

console.log("PASS communicationsCoreGate: schemas + tenant scope + consent + dedupe + idempotency + dual email + workflow exits + polls");
