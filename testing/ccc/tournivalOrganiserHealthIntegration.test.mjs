import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../../base44/functions/tournivalOrganiserHealth/entry.ts',import.meta.url),'utf8');
test('organiser health requires authenticated admin grant and scoped event',()=>{assert.match(src,/base44\.auth\.me\(\)/);assert.match(src,/ClubUserAccess\.filter/);assert.match(src,/tenant_id:tenantId,host_club_id:clubId/);});
test('organiser endpoint exposes review only with no write operations',()=>{assert.match(src,/body\.action!=='review'/);assert.doesNotMatch(src,/\.update\(|\.create\(|\.delete\(/);});
test('session inventory cap fails closed',()=>{assert.match(src,/TOURNIVAL_SESSION_INVENTORY_INCOMPLETE/);assert.match(src,/status:503/);});
