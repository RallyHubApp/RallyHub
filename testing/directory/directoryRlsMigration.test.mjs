import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { planDirectorySchemaRls } from '../../base44/shared/directoryRlsMigration.ts';
const first='aaaaaaaaaaaaaaaaaaaaaaaa',second='bbbbbbbbbbbbbbbbbbbbbbbb';
const schemas=readdirSync('base44/entities').filter(x=>/^Directory.*\.jsonc$/.test(x)).map(x=>JSON.parse(readFileSync(`base44/entities/${x}`,'utf8')));
function allows(rule,user,row={}){
 if(rule===true)return true;
 if(!rule||typeof rule!=='object')return false;
 if(rule.$or)return rule.$or.some(part=>allows(part,user,row));
 if(rule.$and)return rule.$and.every(part=>allows(part,user,row));
 if(rule.user_condition)return Object.entries(rule.user_condition).every(([key,value])=>user?.[key]===value);
 if(rule['data.user_id'])return row.user_id===user?.id && !!user?.id;
 return false;
}
test('dry-run covers all 17 Directory entities and removes broad admin grants',()=>{
 assert.equal(schemas.length,17);
 for(const schema of schemas){const planned=planDirectorySchemaRls(schema,first,second);for(const [action,rule] of Object.entries(planned.rls)) assert.equal(allows(rule,{id:'cccccccccccccccccccccccc',role:'admin'},{user_id:'someone_else'}),false,`${schema.name}:${action}`);assert.deepEqual(planned.properties,schema.properties);}
});
test('migration is pure and never changes original schema data',()=>{
 const originals=structuredClone(schemas);
 schemas.forEach(schema=>planDirectorySchemaRls(schema,first,second));
 assert.deepEqual(schemas,originals);
});
test('listing owner access read remains scoped to the owner row',()=>{
 const original=schemas.find(x=>x.name==='DirectoryListingAccess');
 const next=planDirectorySchemaRls(original,first,second);
 assert.ok(JSON.stringify(next.rls.read).includes('data.user_id'));
 assert.ok(JSON.stringify(next.rls.read).includes('{{user.id}}'));
});
test('audit update denial remains immutable',()=>{
 const original=schemas.find(x=>x.name==='DirectoryListingAudit');
 assert.equal(planDirectorySchemaRls(original,first,second).rls.update,false);
});
test('migration refuses invalid identities and non-Directory entities',()=>{
 assert.throws(()=>planDirectorySchemaRls(schemas[0],first,first));
 assert.throws(()=>planDirectorySchemaRls({name:'Tenant',rls:{}},first,second));
});
