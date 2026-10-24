import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const finance=readFileSync('src/pages/FinanceSummary.jsx','utf8');
test('finance screen gets Spond group from tenant-scoped bindings',()=>{
 assert.match(finance,/SpondSessionBinding\.filter\(\{ tenant_id:tenantId, club_id:clubId, active:true \}/);
 assert.match(finance,/spondBindings\.find\(binding => binding\.spond_group_id\)/);
 assert.doesNotMatch(finance,/base44\.entities\.DirectorySpondConnection/);
});
test('finance group binding is not misrepresented as verified Spond connection',()=>{
 assert.match(finance,/Spond group linked/);
 assert.doesNotMatch(finance,/Spond connected ·/);
});
