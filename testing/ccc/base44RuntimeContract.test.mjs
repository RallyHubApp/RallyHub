import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=path=>readFileSync(new URL(path,import.meta.url),'utf8');
test('installed Base44 SDK exposes count and conditional updateMany endpoints',()=>{
 const source=file('../../node_modules/@base44/sdk/dist/modules/entities.js');
 assert.match(source,/async count\(query\)/);
 assert.match(source,/return result\.count/);
 assert.match(source,/async updateMany\(query, data\)/);
 assert.match(source,/axios\.patch\(\x60\$\{baseURL\}\/update-many\x60, \{ query, data \}\)/);
});
test('refund_pending exists in PaymentRecord schema and refunds have supported statuses',()=>{
 const payment=JSON.parse(file('../../base44/entities/PaymentRecord.jsonc'));
 const refund=JSON.parse(file('../../base44/entities/PaymentRefund.jsonc'));
 assert.ok(payment.properties.payment_status.enum.includes('refund_pending'));
 for(const status of ['requested','processing','succeeded','failed'])assert.ok(refund.properties.status.enum.includes(status));
});
test('identity and host mapping fields exist in the authoritative entity schemas',()=>{
 const access=JSON.parse(file('../../base44/entities/ClubUserAccess.jsonc'));
 const host=JSON.parse(file('../../base44/entities/MembershipVenueHostConfig.jsonc'));
 assert.ok(access.properties.person_id);assert.ok(access.properties.club_id);
 assert.ok(host.properties.venue_id);assert.ok(host.properties.active);
});
test('suppression policy uses the actual active field in entity schema',()=>{
 const schema=JSON.parse(file('../../base44/entities/CommunicationSuppression.jsonc'));
 const policy=file('../../src/lib/ccc/communicationPolicy.js');
 assert.ok(schema.properties.active);
 assert.match(policy,/s\?\.active!==false/);
});
