import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const backend=readFileSync('base44/functions/communicationsEngine/entry.ts','utf8');
const ui=readFileSync('src/pages/CommunicationsCentre.jsx','utf8');
const branch=backend.slice(backend.indexOf("if(action==='send_campaign_batch'||action==='test_campaign_bulk_path')"),backend.indexOf("if(action==='send_taster_batch')"));
test('test and bulk actions execute the same server-side rendering and transport branch',()=>{assert.match(branch,/const testMode=action==='test_campaign_bulk_path'/);assert.match(branch,/renderBasicBrandedEmail\(substitute\(template\.html_template\)/);assert.equal((branch.match(/sendWithConfiguredEmailTransport\(/g)||[]).length,1)});
test('test is restricted to Brian and does not consume campaign recipient idempotency or quota',()=>{assert.match(branch,/testAddress!=='brian\.moore007@gmail\.com'/);assert.match(branch,/campaign-bulk-test:/);assert.match(branch,/if\(!testMode\)remaining--/);assert.match(branch,/recipient_id:testMode\?testAddress:id/);assert.match(branch,/test:testMode/)});
test('campaign UI test button calls bulk path rather than preview HTML test action',()=>{const composer=ui.slice(ui.indexOf('function WaitingListCampaignComposer('),ui.indexOf('function CustomTenantComposer('));assert.match(composer,/action:'test_campaign_bulk_path'/);assert.doesNotMatch(composer,/action:'test_email'/)});
