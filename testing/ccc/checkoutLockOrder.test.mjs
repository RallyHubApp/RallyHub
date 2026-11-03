import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const s=readFileSync(new URL('../../base44/functions/eventRegistration/entry.ts',import.meta.url),'utf8');
test('checkout callback config is validated before acquiring approval lock',()=>{const i=s.indexOf("if(action==='admin_approve')");const j=s.indexOf('acquireEventApprovalLock',i);const k=s.indexOf('resolveEventCheckoutUrls',i);assert.ok(i>0&&k>i&&k<j)});
