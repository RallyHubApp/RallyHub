import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../../base44/functions/guestAccessJourney/entry.ts',import.meta.url),'utf8');
const approve=src.slice(src.indexOf("if(action==='admin_approve')"),src.indexOf("if(action==='admin_approve')")+13000);
test('approval checks current directory eligibility before creating booking or invite',()=>{const guard=approve.indexOf('assessGuestApprovalPolicy(');assert.ok(guard>0);assert.ok(approve.indexOf('if(!guestPolicy.allowed)')>guard);assert.ok(approve.indexOf('const allocationOpens=priorityOpening')>guard);});
test('approval uses current club configuration, not original guest request settings',()=>{assert.match(approve,/loadConfig\(base44,tenantId,clubId\)/);assert.match(approve,/beginnerSessionKeys:currentGuestConfig\?\.beginner_session_keys/);});
test('host review is preserved and policy conflicts reject with 409',()=>{assert.match(approve,/GUEST_SESSION_ELIGIBILITY_CHANGED/);assert.match(approve,/status:409/);});
