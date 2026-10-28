import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const api=readFileSync('base44/functions/directoryClaim/entry.ts','utf8');
const ui=readFileSync('src/components/admin/SupplierInvitationBatch.jsx','utf8');
const admin=readFileSync('src/pages/AdminPanel.jsx','utf8');
test('supplier campaign is limited to 3 explicit listings and private to super admin',()=>{
 assert.match(api,/const allowed=\['pickleballeire','celtic-pickleball','prism-pickleball'\]/);
 assert.match(api,/if\(!authorisedDirectorySuperAdmin\(user\)\)/);
 assert.match(api,/DirectoryContactEndpoint/);
 assert.match(api,/listing_type:'equipment',status:'active'/);
 assert.match(api,/status:claimed\?'claimed':invited\?'invited'/);
});
test('draft preview uses the same branded renderer and does not create an invitation',()=>{
 assert.match(api,/previewCategoryDraft:!approved/);
 assert.match(api,/previewOnly:true/);
 assert.match(api,/if \(previewOnly\) return \{preview:true,to,subject,textBody,htmlBody\}/);
 assert.match(api,/PREVIEW-ONLY-NOT-A-REAL-LINK/);
 assert.match(ui,/action:'preview_supplier_invitation'/);
 assert.match(ui,/srcDoc=\{preview.html\}/);
 assert.match(ui,/sandbox=""/);
 assert.match(ui,/const \{data\}=await base44.functions.invoke\('directoryClaim',\{action:'preview_supplier_invitation',listingSlug:picked\[0\]\.slug\}\)/);
});
test('approval happens separately in Comms Centre and never sends',()=>{
 assert.match(api,/action === 'approve_supplier_invitation_template'/);
 assert.match(api,/status:'approved',approved_at:/);
 assert.match(api,/message:'Supplier template approved in Communications Centre\. No email sent\.'/);
 assert.match(ui,/Approve supplier template \(no send\)/);
 assert.match(ui,/preview\?\.template\?\.status==='draft'/);
 assert.match(ui,/preview\?\.template\?\.status==='approved'/);
});
test('only deliberately selected suppliers send and stop after ambiguous failure',()=>{
 assert.match(ui,/useState\(\[\]\)/);
 assert.match(ui,/window\.confirm/);
 assert.match(ui,/action:'send_claim_invite'/);
 assert.match(ui,/data\?\.sent!==true/);
 assert.match(ui,/Check the invitation record before attempting a resend/);
 assert.match(ui,/break;/);
 assert.match(admin,/<SupplierInvitationBatch \/>/);
});
