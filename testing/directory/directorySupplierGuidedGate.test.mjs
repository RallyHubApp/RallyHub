import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {buildDirectorySetupProgress} from '../../src/lib/directory-guided-setup.js';
const backend=readFileSync('base44/functions/directoryListingProfile/entry.ts','utf8');
const client=readFileSync('src/pages/DirectoryListingEdit.jsx','utf8');
const publicPage=readFileSync('src/pages/PublicClubProfile.jsx','utf8');
const templates=readFileSync('src/services/communications/legacyApprovedTemplates.js','utf8');
test('supplier mirrors coach steps without forcing an event or empty coverage',()=>{
 const p=buildDirectorySetupProgress({listingType:'equipment',visibility:'public',profile:{name:'Celtic Pickleball',description:'Pickleball paddles, accessories and bundles are available.',logoUrl:'https://example.com/logo.jpg',website:'https://example.com',productCategories:['Paddles']}});
 assert.deepEqual(p.steps.map(x=>x.id),['basics','photograph','contact','location','review']);
 assert.equal(p.steps.find(x=>x.id==='location').optional,true);
 assert.equal(p.steps.find(x=>x.id==='photograph').complete,true);
});
test('supplier profile supports products and shop, privately prefilled contacts and a guarded save',()=>{
 assert.match(backend,/productCategories: \(Array\.isArray\(input\?\.productCategories\)/);
 assert.match(backend,/shopUrl: safeUrl\(input\?\.shopUrl\)/);
 assert.match(backend,/save_supplier_private_contact/);
 assert.match(backend,/protectedListing/);
 assert.match(backend,/\['coach','equipment'\]/);
 assert.match(client,/Supplier contact name/);
 assert.match(client,/save_supplier_private_contact/);
 assert.match(client,/I confirm that this \{listingType === 'equipment'/);
 assert.match(client,/Your business logo/);
 assert.match(publicPage,/Shop products/);
 assert.match(publicPage,/Products supplied/);
});
test('supplier Comms catalogue contains three drafts and protected delivery links',()=>{
 for(const p of ['directory_suppliers_invitation','directory_suppliers_access_approved','directory_suppliers_profile_completed'])assert.match(templates,new RegExp('"id": "'+p+'"'));
 assert.match(templates,/{{CLAIM_LINK}}/);
 assert.match(templates,/{{MANAGE_LINK}}/);
 assert.match(templates,/Contact Supplier enquiry form/);
});
