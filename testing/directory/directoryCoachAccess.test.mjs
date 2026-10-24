import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('src/components/admin/CoachesReview.jsx','utf8');
test('coaches approval review uses server-verified Directory API, not unrestricted entity SDK',()=>{
 assert.doesNotMatch(source,/base44\.entities\.DirectoryListing(?:Record|Profile)/);
 assert.ok((source.match(/action:'list_admin'/g)||[]).length>=3);
 assert.match(source,/action:'set_visibility'/);
});
