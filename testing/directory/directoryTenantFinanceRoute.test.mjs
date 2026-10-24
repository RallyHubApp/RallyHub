import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const server=readFileSync('base44/functions/tenantSpondFinance/entry.ts','utf8');
const client=readFileSync('src/pages/FinanceSummary.jsx','utf8');
const matcher=readFileSync('base44/functions/spondIntegrationWorking/financeMatch.mjs','utf8');
test('tenant Finance previews and syncs only through dedicated backend',()=>{
 assert.match(client,/functions\.invoke\('tenantSpondFinance',\{ action:'preview'/);
 assert.match(client,/functions\.invoke\('tenantSpondFinance',\{ action:'sync'/);
 assert.doesNotMatch(client,/directory_finance_(?:preview|sync)/);
});
test('tenant Finance backend authorises user and group before Spond login',()=>{
 const role=server.indexOf("user.role!=='admin'");
 const bind=server.indexOf('SpondSessionBinding.filter(');
 const validate=server.indexOf('validGroups.has(financeGroupId)');
 const login=server.indexOf('await spondLogin(email,password)');
 assert.ok(role>=0&&bind>role&&validate>bind&&login>validate);
 assert.match(server,/tenant_id:tenantId,club_id:clubId,active:true/);
});
test('tenant finance only reads/writes tenant-scoped finance records',()=>{
 assert.doesNotMatch(server,/entities\.Directory(?:SpondConnection|ListingAccess)/);
 for(const entity of ['ClubFinanceVenueRule','ClubFinanceSettings','ClubFinanceEntry','Venue']){
  assert.match(server,new RegExp(`entities\\.${entity}`));
 }
 assert.match(server,/tenant_id:tenantId,\s*club_id:clubId/);
});
test('tenant finance retains the matching and payment calculation contracts extracted from the previous adapter',()=>{
 for(const fragment of ['financeSpondPatternKey(', 'findFinanceRuleForEvent(', 'financeRuleIsSelected(', 'financeResponseMeta(event, fee)', 'paidPlaces = response.goingCount + response.declinedPaidCount', 'financialYearLabelFor(activityDate,fyMonth,fyDay)', 'source_type:\'spond_session\'']){
  assert.ok(server.includes(fragment),fragment);
  if(['financeSpondPatternKey(', 'findFinanceRuleForEvent(', 'financeRuleIsSelected('].includes(fragment)) assert.ok(matcher.includes('function '+fragment)||matcher.includes('export function '+fragment),fragment);
 }
});
test('tenant finance supports read-only preview and explicit sync only',()=>{
 assert.match(server,/if \(action === 'preview'\) continue/);
 assert.match(server,/if \(action === 'preview'\) \{/);
 assert.match(server,/\['preview','sync'\]\.includes\(action\)/);
});
