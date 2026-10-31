import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../../base44/functions/membershipRecord/entry.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../../src/pages/MembershipConsole.jsx',import.meta.url),'utf8');
const block=backend.slice(backend.indexOf("if(action==='admin_dashboard_counts')"),backend.indexOf("if(action==='admin_list')"));
test('membership totals read all three sources with scoped cursor pagination',()=>{assert.match(block,/readScopedMembershipLedger\(base44\.asServiceRole\.entities\.ClubMembership/);assert.match(block,/readScopedMembershipLedger\(base44\.asServiceRole\.entities\.Person/);assert.match(block,/readScopedMembershipLedger\(base44\.asServiceRole\.entities\.ClubUserAccess/);assert.doesNotMatch(block,/\.filter\(\{tenant_id:tenantId,club_id:clubId\},'-created_date',500\)/);});
test('pagination errors fail closed instead of returning misleading counts',()=>{assert.match(block,/MEMBERSHIP_LEDGER_INCOMPLETE/);assert.match(block,/status:503/);});
test('dashboard exposes retry when verified counts are unavailable',()=>{assert.match(ui,/isError: dashboardError/);assert.match(ui,/Verified membership totals unavailable/);assert.match(ui,/refetchDashboard\(\)/);});
