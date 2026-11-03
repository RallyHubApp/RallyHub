import test from 'node:test';
import assert from 'node:assert/strict';
import {readScopedInventory,summarisePeopleInventory,summariseManagementInventory} from '../../base44/functions/cccActivity/managementReaders.mjs';
const entity=rows=>({filter:async(query,sort,limit)=>rows.filter(r=>Object.entries(query).every(([k,v])=>r[k]===v)).slice(0,limit)});
test('SDK positional filter returns scoped array',async()=>{
 const rows=[{id:'a',tenant_id:'t1',club_id:'c1'},{id:'b',tenant_id:'t1',club_id:'c2'}];
 const result=await readScopedInventory(entity(rows),{tenant_id:'t1',club_id:'c1'});
 assert.equal(result.rows.length,1);assert.equal(result.complete,true);
});
test('SDK array at limit is incomplete rather than falsely claiming total',async()=>{
 const rows=Array.from({length:451},(_,i)=>({id:'id'+i,tenant_id:'t1'}));
 const result=await readScopedInventory(entity(rows),{tenant_id:'t1'});
 assert.equal(result.rows.length,200);assert.equal(result.complete,false);
});
test('missing tenant and malformed paginated response fail closed',async()=>{
 await assert.rejects(()=>readScopedInventory(entity([]),{club_id:'c1'}),/Tenant scope required/);
 await assert.rejects(()=>readScopedInventory({filter:async()=>({items:[{id:'x',tenant_id:'t1'}],has_more:true,next_cursor:null})},{tenant_id:'t1'}),/cursor stalled/);
});
test('people overview counts independent records and never returns contact data',()=>{
 const result=summarisePeopleInventory({rows:[{id:'a',status:'active',person_id:'p1',email:'secret@example.ie'},{id:'b',status:'pending'}],complete:true},{rows:[{id:'m',status:'submitted',full_name:'Private Person'}],complete:true});
 assert.equal(result.access.total,2);assert.equal(result.access.unlinkedPeople,1);assert.equal(result.applications.total,1);
 assert.equal(JSON.stringify(result).includes('secret@example.ie'),false);assert.equal(JSON.stringify(result).includes('Private Person'),false);
});
test('management overview strips message bodies and host email addresses',()=>{
 const result=summariseManagementInventory({rows:[{id:'t',owner_scope:'tenant',name:'Welcome',status:'approved',html_template:'private HTML',brand_kit_id:'brand'}],complete:true},{rows:[{id:'h',venue_key:'ennis',active:true,host_emails:['secret@example.ie']}],complete:true});
 assert.equal(result.hosts[0].configuredHosts,1);assert.equal(result.hosts[0].usesLegacyVenueKey,true);
 assert.equal(result.templates[0].brandKitAssigned,true);assert.equal(result.sendingEnabled,false);
 assert.equal(JSON.stringify(result).includes('secret@example.ie'),false);assert.equal(JSON.stringify(result).includes('private HTML'),false);
});
