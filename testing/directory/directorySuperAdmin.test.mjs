import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isDirectorySuperAdmin,authorisedDirectorySuperAdmin,DIRECTORY_SUPERADMIN_USER_IDS} from '../../base44/shared/directorySuperAdmin.ts';
const brian='aaaaaaaaaaaaaaaaaaaaaaaa';
const conal='bbbbbbbbbbbbbbbbbbbbbbbb';
for(const id of [brian,conal]) test('authorised immutable ID '+id[0],()=>assert.equal(isDirectorySuperAdmin({id,role:'admin'},brian,conal),true));
for(const [title,user,a,b] of [
 ['anonymous',null,brian,conal],['generic platform admin',{id:'cccccccccccccccccccccccc',role:'admin'},brian,conal],
 ['club admin',{id:brian,role:'club_admin'},brian,conal],['listing owner',{id:brian,role:'user'},brian,conal],
 ['missing first secret',{id:brian,role:'admin'},undefined,conal],['missing second secret',{id:brian,role:'admin'},brian,undefined],
 ['duplicate secrets',{id:brian,role:'admin'},brian,brian],['malformed secret',{id:brian,role:'admin'},'Brian Moore',conal]
]) test('denies '+title,()=>assert.equal(isDirectorySuperAdmin(user,a,b),false));
for(const f of ['directoryCategory','directoryContactAction','siteAnalytics','directoryPlayerNetwork','directoryEvents','directoryListingProfile'])test(f+' uses directory-only gate',()=>{
 const source=readFileSync('base44/functions/'+f+'/entry.ts','utf8');
 assert.match(source,/authorisedDirectorySuperAdmin\(user\)/);
 assert.match(source,/shared\/directorySuperAdmin\.ts/);
});

test('Directory identity confirmation never renames tenant or club records',()=>{
 const source=readFileSync('base44/functions/directoryListingProfile/entry.ts','utf8');
 assert.doesNotMatch(source,/entities\.(?:Club|Tenant)\.update\(/);
 assert.match(source,/separate explicit, audited action/);
});
test('listing owners retain active listing-specific access checks',()=>{
 for(const file of ['directoryEvents','directoryListingProfile']){
  const source=readFileSync('base44/functions/'+file+'/entry.ts','utf8');
  assert.match(source,/DirectoryListingAccess\.filter\(/);
  assert.match(source,/listing_slug: ?listingSlug/);
  assert.match(source,/user_id: ?user\.id/);
  assert.match(source,/status: ?'active'/);
 }
});

test('Directory claim administrative endpoints use verified super-admin policy',()=>{
 const source=readFileSync('base44/functions/directoryClaim/entry.ts','utf8');
 assert.match(source,/shared\/directorySuperAdmin\.ts/);
 assert.ok((source.match(/!authorisedDirectorySuperAdmin\(user\)/g)||[]).length >= 10);
 assert.doesNotMatch(source,/if \(user\.role !== 'admin'\) return Response\.json\(\{ error: 'Admin access required'/);
});

test('Directory claim owner journeys never bypass via generic admin role',()=>{
 const source=readFileSync('base44/functions/directoryClaim/entry.ts','utf8');
 assert.doesNotMatch(source,/user\.role\s*(?:===|!==)\s*'admin'/);
 assert.match(source,/ownAccess\?\.role === 'owner'/);
 assert.match(source,/authorisedDirectorySuperAdmin\(user\)/);
});

test('backend allowlist is exactly two distinct immutable verified accounts',()=>{
 assert.equal(DIRECTORY_SUPERADMIN_USER_IDS.length,2);
 assert.equal(new Set(DIRECTORY_SUPERADMIN_USER_IDS).size,2);
 assert.ok(DIRECTORY_SUPERADMIN_USER_IDS.every(id=>/^[a-f0-9]{24}$/i.test(id)));
 for(const id of DIRECTORY_SUPERADMIN_USER_IDS) assert.equal(authorisedDirectorySuperAdmin({id,role:'admin'}),true);
 assert.equal(authorisedDirectorySuperAdmin({id:'6a0de66260b54416bd777a3f',role:'admin'}),false);
 assert.equal(authorisedDirectorySuperAdmin({id:DIRECTORY_SUPERADMIN_USER_IDS[0],role:'user'}),false);
});

test('Directory artwork staging never uses generic platform-admin bypass',()=>{
 const source=readFileSync('base44/functions/directoryLogoIngest/entry.ts','utf8');
 assert.match(source,/!serviceAuthenticated && !authorisedDirectorySuperAdmin\(user\)/);
 assert.doesNotMatch(source,/user\.role !== 'admin'/);
 assert.match(source,/DirectoryListingAccess\.filter/);
});
