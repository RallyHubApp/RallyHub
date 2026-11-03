import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const s=readFileSync(new URL('../../base44/functions/cccActivity/entry.ts',import.meta.url),'utf8');const block=s.slice(s.indexOf("if(body.action==='finance_consolidation')"),s.indexOf("if(body.action==='person_timeline')"));
test('finance remains protected by existing club administrator access gate',()=>assert.match(s,/if\(!access.admin&&!hostAction&&!delegatedFinance\)return fail\('Active administrator or approved centre finance grant required',403\)/));
test('finance audit reuses scoped immutable audit records',()=>{assert.match(block,/entities.AuditLog,\{tenant_id,club_id\}/);assert.match(block,/financeAudit:\{entries:/)});
test('centre filter never claims delegated centre permissions or centre-specific audit coverage',()=>{assert.match(block,/centreDelegationVerified:false/);assert.match(block,/centreFilterSupported:false/)});
