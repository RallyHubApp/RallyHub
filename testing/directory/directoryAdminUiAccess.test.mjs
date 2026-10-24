import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync('src/pages/AdminPanel.jsx','utf8');
const backend=readFileSync('base44/functions/directoryAdminAccess/entry.ts','utf8');
test('capability probe uses server side directory policy',()=>{
 assert.match(backend,/authorisedDirectorySuperAdmin\(user\)/);
 assert.match(backend,/'Cache-Control': 'no-store, max-age=0'/);
 assert.doesNotMatch(backend,/RALLYHUB_DIRECTORY_SUPERADMIN_BRIAN_ID/);
});
test('frontend never uses generic admin flag for directory queries',()=>{
 assert.match(code,/const canAccessDirectoryAdmin = canAccessAdmin && directoryCapability === true/);
 assert.match(code,/enabled: canAccessDirectoryAdmin,\s*staleTime: 0/);
 assert.match(code,/enabled: canAccessDirectoryAdmin && activeAdminTab === 'directory-players'/);
});
test('admin tabs are hidden unless capability is permitted',()=>{
 assert.match(code,/\{canAccessDirectoryAdmin && \(<>[\s\S]*?<TabsTrigger value="directory"/);
 assert.match(code,/const activeAdminTab = directoryTabNames\.includes\(rawAdminTab\) && !canAccessDirectoryAdmin \? 'linking' : rawAdminTab/);
});
