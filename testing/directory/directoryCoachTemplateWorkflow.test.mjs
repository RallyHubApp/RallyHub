import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync('base44/functions/directoryClaim/entry.ts','utf8');
const mailing=readFileSync('src/components/admin/CoachInvitationBatch.jsx','utf8');
const comms=readFileSync('src/pages/CommunicationsCentre.jsx','utf8');
test('Directory coach master is centrally saved and approved in Communications Centre',()=>{
 for(const key of ['coach_invitation_template_get','coach_invitation_template_save','coach_invitation_template_approve'])assert.ok(backend.includes(key));
 assert.match(backend,/CommunicationTemplate\.create\(fields\)/);
 assert.match(backend,/status:'draft'/);
 assert.match(backend,/CommunicationTemplate\.update\(draft\.id,\{status:'approved'/);
 assert.match(backend,/CommunicationTemplate\.update\(approved\.id,\{status:'retired'\}\)/);
 assert.match(backend,/authorisedDirectorySuperAdmin\(user\)/);
 assert.match(comms,/coach_invitation_template_save/);
 assert.match(comms,/coach_invitation_template_approve/);
 assert.match(comms,/coach_invitation_template_get/);
});
test('Recipient personalisation is distinct, must be previewed, retains required tokens, never alters master',()=>{
 assert.match(mailing,/Personalise this coach/);
 assert.match(mailing,/customBySlug/);
 assert.match(mailing,/personalise=async/);
 assert.match(mailing,/customText:fields\.body/);
 assert.match(mailing,/coachOverrideText:customBySlug\[c\.slug\]\.body/);
 assert.match(backend,/coachOverrideText/);
 assert.match(backend,/Preserve \{\{CONTACT_NAME\}\}/);
 assert.match(backend,/Coach recipient must match a currently verified private Directory email/);
 assert.match(mailing,/selectedReady\.some\(c=>customBySlug\[c\.slug\]\?\.body&&!previews\[c\.slug\]\?\.html\)/);
});
test('Master changes require rendered preview, saving as draft and separate explicit approval',()=>{
 assert.match(mailing,/Preview edited master HTML/);
 assert.match(mailing,/master-coach-html-preview/);
 assert.match(mailing,/Save as Draft in Comms Centre/);
 assert.match(mailing,/Approve saved template/);
 assert.match(mailing,/window\.confirm\('Approve this saved draft/);
 assert.match(mailing,/masterRendered\.body!==masterBody/);
 assert.match(backend,/if\(action==='coach_invitation_template_save'\)/);
 assert.match(backend,/if\(action==='coach_invitation_template_get'\)/);
 assert.match(backend,/message:'Saved as draft in Communications Centre\. Nothing sent\.'/);
});
test('Preview only uses same sender rendering and neither creates invite nor sends',()=>{
 assert.match(backend,/if \(!previewOnly\) \{/);
 assert.match(backend,/if \(previewOnly\) return \{preview:true,to,subject,textBody,htmlBody\}/);
 assert.match(backend,/sendClaimInviteEmail\(base44,\{user,listing,contactName,contactEmail:endpoint\.email,claimUrl:dummyLink,customText,customSubject,previewOnly:true\}\)/);
});

test('standard batch preview fetches exactly one sample, never a request per coach',()=>{
 const start=mailing.indexOf('const loadPreviews=async()=>');
 const end=mailing.indexOf('const personalise=async()=>',start);
 const block=mailing.slice(start,end);
 assert.ok(start>0 && end>start);
 assert.doesNotMatch(block,/for\s*\(const c of selectedReady\)/);
 assert.match(block,/const sample=selectedReady\.find/);
 assert.equal((block.match(/preview_coach_invitation/g)||[]).length,1);
 assert.match(block,/setPreviews\(all\)/);
});
