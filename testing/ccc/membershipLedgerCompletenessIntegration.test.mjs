import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../../base44/functions/membershipRecord/entry.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../../src/pages/MembershipConsole.jsx',import.meta.url),'utf8');
test('dashboard returns source completeness beside membership totals',()=>{const block=backend.slice(backend.indexOf("if(action==='admin_dashboard_counts')"),backend.indexOf("if(action==='admin_list')"));assert.match(block,/assessMembershipLedgerCompleteness\(\{memberships,people,accesses\}\)/);assert.match(block,/currentSeason,ledgerCompleteness/);});
test('membership dashboard visibly warns if records may be truncated',()=>{assert.match(ui,/dashboardData\.ledgerCompleteness\?\.complete === false/);assert.match(ui,/Membership totals may be incomplete/);});
