import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const api=readFileSync('base44/functions/directoryClaim/entry.ts','utf8');
const ui=readFileSync('src/components/admin/CoachInvitationBatch.jsx','utf8');
const admin=readFileSync('src/pages/AdminPanel.jsx','utf8');
test('coach candidate API is private and excludes test listings',()=>{
  const a=api.slice(api.indexOf("if (action === 'list_coach_invitation_candidates')"),api.indexOf("if (action === 'list_admin')"));
  assert.match(a,/authorisedDirectorySuperAdmin\(user\)/);
  assert.match(a,/listing_type:'coach',status:'active'/);
  assert.match(a,/record\.visibility==='public'/);
  assert.match(a,/test\|preview/i);
  assert.match(a,/DirectoryContactEndpoint/);
  assert.match(a,/DirectoryClaimInvitation/);
  assert.match(a,/DirectoryListingAccess/);
});
test('batch selection defaults empty and cannot send without explicit review and confirmation',()=>{
 assert.match(ui,/useState\(\[\]\)/);
 assert.match(ui,/const selectedReady=/);
 assert.match(ui,/selectedReady\.some\(c=>!previews\[c\.slug\]\?\.html\)/);
 assert.match(ui,/window\.confirm/);
 assert.match(ui,/Select all available/);
 assert.match(ui,/Clear selection/);
 assert.match(ui,/Preview '\+selectedReady\.length/);
 assert.match(ui,/Send only '\+selectedReady\.length\+' selected/);
 assert.match(ui,/if\(response\.data\?\.sent!==true\)throw/);
 assert.match(ui,/break;/);
});
test('non-selectable previously invited or claimed entries and stop-on-failure',()=>{
 assert.match(ui,/c\.inviteStatus==='ready'/);
 assert.match(ui,/disabled=\{!available\|\|sending\}/);
 assert.match(api,/status:409/);
 assert.match(api,/inviteStatus=claimed\?'claimed'/);
});
test('coach mailing reuses approved Comms template for both HTML and text',()=>{
 assert.match(api,/purpose:'directory_claim_coaching',status:'approved'/);
 assert.match(api,/const coachingText=coachInvite/);
 assert.match(api,/content: coachInvite \? textToBrandedHtml\(textBody, claimUrl\)/);
 assert.match(api,/normaliseDirectorySignatureText\(coachInvite \? coachingText/);
 assert.match(api,/sendWithConfiguredEmailTransport/);
});
test('Admin directory coach workspace shows the batch component',()=>{
 assert.match(admin,/import CoachInvitationBatch from/);
 assert.match(admin,/<CoachInvitationBatch \/>/);
});

test('HTML preview is exactly derived from the approved send renderer, without any side effect',()=>{
 assert.match(api,/if \(action === 'preview_coach_invitation'\)/);
 assert.match(api,/previewOnly:true/);
 assert.match(api,/if \(!previewOnly\) \{/);
 assert.match(api,/if \(previewOnly\) return \{preview:true,to,subject,textBody,htmlBody\}/);
 assert.match(api,/PREVIEW-ONLY-NOT-A-REAL-LINK/);
 assert.match(ui,/srcDoc=\{previews\[previewSlug\]\.html\}/);
 assert.match(ui,/sandbox=""/);
 assert.match(ui,/preview_coach_invitation/);
 assert.match(ui,/loadPreviews/);
});
