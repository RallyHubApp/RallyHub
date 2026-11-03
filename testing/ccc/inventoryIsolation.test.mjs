import test from 'node:test';import assert from 'node:assert/strict';import {readScopedInventory} from '../../base44/functions/cccActivity/managementReaders.mjs';
const query={tenant_id:'tenant-A',club_id:'club-A'};
test('read-only inventory rejects cross-tenant rows even if backend filter returns them',async()=>{const entity={filter:async()=>({items:[{id:'x',tenant_id:'tenant-B',club_id:'club-A'}],has_more:false})};await assert.rejects(()=>readScopedInventory(entity,query),/scope violation/)});
test('read-only inventory rejects cross-club rows',async()=>{const entity={filter:async()=>({items:[{id:'x',tenant_id:'tenant-A',club_id:'club-B'}],has_more:false})};await assert.rejects(()=>readScopedInventory(entity,query),/scope violation/)});
test('read-only inventory accepts matching rows',async()=>{const entity={filter:async()=>({items:[{id:'x',...query}],has_more:false})};assert.equal((await readScopedInventory(entity,query)).rows.length,1)});
