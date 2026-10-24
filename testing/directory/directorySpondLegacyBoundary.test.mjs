import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const code=readFileSync('base44/functions/spondIntegrationWorking/entry.ts','utf8');
const directoryPart=code.slice(code.indexOf("if (String(action || '').startsWith('directory_'))"),code.indexOf("if (action === 'directory_save_connection')"));
test('legacy Directory finance routes are rejected before any finance access',()=>{
 assert.match(directoryPart,/if \(action === 'directory_finance_preview' \|\| action === 'directory_finance_sync'\) \{\s*return Response\.json\(\{ error:'Tenant finance actions must use the tenant finance service\.' \}, \{ status:403 \}\)/);
 assert.doesNotMatch(directoryPart,/entities\.ClubFinanceEntry\.(create|update|delete)/);
 assert.doesNotMatch(directoryPart,/entities\.ClubFinanceVenueRule\.filter/);
});
test('generic platform admin does not bypass Directory Spond permission',()=>{
 const gate=code.slice(code.indexOf('async function directoryAccessAllowed'),code.indexOf('async function interclubManagerAllowed'));
 assert.match(gate,/authorisedDirectorySuperAdmin\(user\)/);
 assert.doesNotMatch(gate,/user\.role === 'admin'/);
 assert.match(gate,/DirectoryListingAccess\.filter/);
});
