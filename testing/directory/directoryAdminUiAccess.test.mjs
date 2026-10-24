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
 assert.match(code,/enabled: canAccessDirectoryAdmin && \['directory-command', 'directory-crm', 'directory-players'\]\.includes\(activeAdminTab\)/);
});
test('admin tabs are hidden unless capability is permitted',()=>{
 assert.match(code,/\{canAccessDirectoryAdmin && <Button[^>]+onClick=\{\(\)=>setSearchParams\(\{tab:'directory-command'\}\)\}/);
 assert.match(code,/const activeAdminTab = directoryTabNames\.includes\(rawAdminTab\) && !canAccessDirectoryAdmin \? 'linking' : rawAdminTab/);
});

test('directory navigation is workspace-specific and does not show club controls',()=>{
 const sidebar=readFileSync('src/components/layout/Sidebar.jsx','utf8');
 assert.match(sidebar,/const mainNavItems = inDirectoryWorkspace && isSuperAdmin \? directoryWorkspaceNavItems/);
 assert.match(sidebar,/Switch to RallyHub \/ Club Admin/);
 assert.match(code,/directoryContext \? \(<>[\s\S]*?value="directory-crm"/);
 assert.match(code,/<TabsTrigger value="players"[\s\S]*?Club Players/);
});
