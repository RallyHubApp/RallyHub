import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const catalogue=readFileSync('src/services/communications/legacyApprovedTemplates.js','utf8');
const invite=readFileSync('base44/functions/directoryClaim/entry.ts','utf8');
const profile=readFileSync('base44/functions/directoryListingProfile/entry.ts','utf8');
const guided=readFileSync('src/pages/DirectoryListingEdit.jsx','utf8');
const composer=readFileSync('src/pages/CommunicationsCentre.jsx','utf8');
for(const category of ['coaching','suppliers','clubs','holidays','events']) {
 for(const stage of ['invitation','access_approved','profile_completed']) {
  test(`Directory ${category} ${stage} template is reviewed before activation`,()=>{
   if(category==='coaching'&&stage==='invitation')assert.match(catalogue,/"id": "directory_claim_coaching"/);
   else assert.match(catalogue,new RegExp(`"id": "directory_${category}_${stage}"[^\\n]*"status": "draft"`));
  });
 }
}
test('completion email requires explicit finish, no autosave trigger',()=>{
 assert.match(guided,/action:'complete_guided_setup'/);
 assert.equal((guided.match(/action:'complete_guided_setup'/g)||[]).length,1);
 assert.match(profile,/if \(action === 'complete_guided_setup'\)/);
 assert.match(profile,/directory_guided_completion_email_reserved/);
 assert.match(profile,/DirectoryListingAccess.filter/);
 assert.match(profile,/status:'approved'/);
 assert.match(profile,/emailStatus:'already_processed'/);
});
test('invitation and access-approved email choose category-specific approved templates',()=>{
 assert.match(invite,/categoryInvitationPurpose/);
 assert.match(invite,/directory_\$\{directoryCategory\}_access_approved/);
 assert.match(invite,/pendingTemplate:true/);
});
test('communications composer exposes draft status and supports explicit approval',()=>{
 assert.match(composer,/Draft — review required/);
 assert.match(composer,/Approve reviewed template/);
 assert.match(composer,/MANAGE_LINK/);
});
