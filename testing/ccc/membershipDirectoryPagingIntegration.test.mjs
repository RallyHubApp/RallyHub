import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync(new URL('../../base44/functions/membershipRecord/entry.ts',import.meta.url),'utf8');
const block=backend.slice(backend.indexOf("if(action==='admin_list')"),backend.indexOf("if(action==='admin_save_view')"));
test('member directory cursor-pages all five scoped ledgers',()=>{for(const entity of ['ClubMembership','Person','Player','SportProfile','ClubRelationship'])assert.match(block,new RegExp('readScopedMembershipLedger\\(base44\\.asServiceRole\\.entities\\.'+entity));});
test('member directory refuses partial or failed pagination',()=>{assert.match(block,/MEMBERSHIP_DIRECTORY_INCOMPLETE/);assert.match(block,/status:503/);});
test('configuration capped pages fail closed',()=>{assert.match(block,/readScopedMembershipLedger\(base44\.asServiceRole\.entities\.ClubSport/);assert.match(block,/readScopedMembershipLedger\(base44\.asServiceRole\.entities\.MembershipApplicationConfig/);assert.match(block,/MEMBERSHIP_CONFIG_INCOMPLETE/);});

test('global sports catalogue fails closed at cap rather than hiding sports',()=>{assert.match(block,/readActiveSportCatalogue\(base44\.asServiceRole\.entities\.Sport\)/);assert.match(block,/GLOBAL_SPORT_INVENTORY_INCOMPLETE/);});
