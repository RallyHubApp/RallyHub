import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const client=readFileSync('src/pages/DirectoryListingEdit.jsx','utf8');
const backend=readFileSync('base44/functions/directoryListingProfile/entry.ts','utf8');
const guided=readFileSync('src/lib/directory-guided-setup.js','utf8');
test('coach setup has its own photography stage while club navigation remains separate',()=>{
 assert.match(guided,/steps:\s*\['basics','photograph','contact'/);
 assert.match(client,/isClubListing && <nav className="mt-5/);
 assert.match(client,/id="photograph" style=\{\{ display: guidedSectionVisible\('photograph'\)/);
 assert.match(client,/data-testid="edit-saved-coach-photo"/);
 assert.match(client,/preserveFullImage: listingType === 'coach'/);
});
test('coach contacts come from private endpoint, not public profiles; both confirmations required',()=>{
 assert.match(backend,/if \(action === 'private_get'\)/);
 assert.match(backend,/let privateContact = null/);
 assert.match(backend,/action === 'save_coach_private_contact' \|\| action === 'save_supplier_private_contact'/);
 assert.match(backend,/body\.confirmEmail!==true \|\| body\.confirmMobile!==true/);
 assert.match(backend,/authorisedDirectorySuperAdmin\(user\)/);
 assert.match(backend,/DirectoryContactEndpoint\.update\(target\.id,values\)/);
 assert.match(backend,/allow_call:false,allow_whatsapp:false,allow_email:true/);
 assert.match(backend,/publicProfile\.contact = \{ name:null, phone:null, phoneHref:null, email:null, whatsapp:null \}/);
 assert.match(client,/setCoachEmailConfirmed\(false\)/);
 assert.match(client,/setCoachMobileConfirmed\(false\)/);
 assert.match(client,/action:'save_coach_private_contact'/);
 assert.match(client,/listingType !== 'coach' && <>/);
});
test('photo source and framing persist separately from the flattened public square',()=>{
 assert.match(backend,/photoSourceUrl: safeUrl\(input\?\.photoSourceUrl\)/);
 assert.match(backend,/photoCrop: input\?\.photoCrop/);
 assert.match(client,/photoSourceUrl:originalPhotoUrl,photoCrop:\{zoom:logoDraft\.zoom/);
 assert.match(client,/photoSourceUrl \|\| form\.photoUrl/);
 assert.match(client,/sourcePhotoUrl:originalUrl,zoom:crop\?\.zoom/);
});
