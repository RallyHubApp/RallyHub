import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const ui=fs.readFileSync('src/components/communications/MembershipCampaignComposer.jsx','utf8');
const engine=fs.readFileSync('base44/functions/communicationsEngine/entry.ts','utf8');
const page=fs.readFileSync('src/pages/CommunicationsCentre.jsx','utf8');
test('membership composer is wired to approved Christmas template without changing event composer',()=>{
 assert.match(page,/Christmas Tournival Invitation 2026/);
 assert.match(page,/MembershipCampaignComposer/);
 assert.match(page,/WaitingListCampaignComposer/);
});
test('membership selection, saving, preview, test and approval are exposed',()=>{
 for(const label of ['Search members','Sort members','Select All','Deselect All','Save audience','Open saved audience','Save campaign','Full HTML preview','Send test','Approve campaign','Track delivery','Send selected campaign'])assert.ok(ui.includes(label),label);
 assert.match(ui,/audienceDirty/);
});
test('membership sending requires tenant scope, canonical person, suppressions, ledger and explicit approval',()=>{
 const section=engine.slice(engine.indexOf("if(['member_campaign_roster'"),engine.indexOf("if(action==='send_campaign_batch'"));
 for(const term of ['active_tenant_id','active_club_id','ClubMembership','Person.filter','CommunicationSuppression','CommunicationPreference','CommunicationDeliveryAttempt','approved_at','confirmSend','idempotency_key','needs_reconciliation','renderBasicBrandedEmail'])assert.ok(section.includes(term),term);
 assert.match(section,/membership_status==='paid_active'/);
});
