import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const backend = readFileSync('base44/functions/directoryEnquiryAdmin/entry.ts', 'utf8');
const admin = readFileSync('src/pages/AdminPanel.jsx', 'utf8');
const editor = readFileSync('src/components/admin/DirectoryEnquiryFollowupEditor.jsx', 'utf8');
const schema = JSON.parse(readFileSync('base44/entities/DirectoryEnquiryFollowup.jsonc', 'utf8'));
const inbox = backend.slice(backend.indexOf("if (action === 'admin_inbox')"),backend.indexOf("if (action === 'admin_set_followup')"));
const save = backend.slice(backend.indexOf("if (action === 'admin_set_followup')"),backend.indexOf("if (action === 'admin_preview'"));

test('both inbox read and follow-up write fail closed before touching private records',()=>{
  assert.match(backend,/base44\.auth\.me\(\)\.catch\(\(\) => null\)/);
  assert.match(backend,/Directory super-admin access required\./);
  const authGate=backend.indexOf('if (!directorySuperAdmin(user))');
  const firstRead=backend.indexOf('base44.asServiceRole.entities.');
  assert.ok(authGate>=0 && firstRead>authGate,'service-role data access must follow superadmin verification');
  assert.doesNotMatch(inbox,/GuestBooking|ClubMembership|SpondSessionBinding|asServiceRole\.entities\.User/);
  assert.doesNotMatch(save,/GuestBooking|ClubMembership|SpondSessionBinding|asServiceRole\.entities\.User/);
});
test('inbox is read-only and retains both enquiry and contact activity provenance',()=>{
  assert.match(inbox,/DirectoryContactEnquiry\.list/);
  assert.match(inbox,/DirectoryContactAction\.list/);
  assert.match(inbox,/DirectoryEnquiryFollowup\.list/);
  assert.match(inbox,/senderEmail/);
  assert.match(inbox,/deliveryProvider/);
  assert.match(inbox,/actionType/);
  assert.doesNotMatch(inbox,/\.create\(|\.update\(|sendWithConfiguredEmailTransport/);
});
test('follow-up endpoint validates enquiry, status and writes only Directory follow-up',()=>{
  assert.match(save,/\['open','in_progress','resolved'\]\.includes\(status\)/);
  assert.match(save,/DirectoryContactEnquiry\.filter\(\{id:enquiryId\}/);
  assert.match(save,/DirectoryEnquiryFollowup\.create\(payload\)/);
  assert.match(save,/DirectoryEnquiryFollowup\.update\(existing\[0\]\.id,payload\)/);
  assert.doesNotMatch(save,/DirectoryContactEnquiry\.(create|update|delete)|sendWithConfiguredEmailTransport/);
  for(const action of ['create','read','update','delete'])assert.equal(schema.rls[action],false);
});
test('Directory CRM displays enquiry messages and status, with explicit save only',()=>{
  assert.match(admin,/enabled: canAccessDirectoryAdmin && \['directory-crm','directory-command'\]\.includes\(activeAdminTab\)/);
  assert.match(admin,/DirectoryEnquiryFollowupEditor enquiry=\{row\}/);
  assert.match(admin,/Enquiries · Directory inbox/);
  assert.match(admin,/Contact activity/);
  assert.match(editor,/action: 'admin_set_followup'/);
  assert.match(editor,/functions\.invoke\('directoryEnquiryAdmin'/);
  assert.match(admin,/functions\.invoke\('directoryEnquiryAdmin', \{ action:'admin_inbox'/);
  assert.match(editor,/onClick=\{save\}/);
  assert.doesNotMatch(editor,/useEffect\(|sendEmail\(|mailto:/);
});
