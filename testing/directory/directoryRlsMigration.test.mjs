import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {planDirectorySchemaRls} from '../../base44/shared/directoryRlsMigration.ts';
const schemas=readdirSync('base44/entities').filter(f=>/^Directory.*\.jsonc$/.test(f)).map(f=>JSON.parse(readFileSync('base44/entities/'+f,'utf8')));
test('migration covers all 23 Directory schemas without changing properties or required fields',()=>{
 assert.equal(schemas.length,23);
 for(const original of schemas){
  const migrated=planDirectorySchemaRls(original);
  assert.deepEqual(migrated.properties,original.properties);
  assert.deepEqual(migrated.required,original.required);
  for(const action of ['create','update','delete'])assert.equal(migrated.rls[action],false,`${original.name}:${action}`);
  if(original.name==='DirectoryListingAccess')assert.deepEqual(migrated.rls.read,{'data.user_id':'{{user.id}}'});
  else assert.equal(migrated.rls.read,false,`${original.name}:read`);
 }
});
test('migration is pure',()=>{
 const originals=structuredClone(schemas);
 schemas.forEach(planDirectorySchemaRls);
 assert.deepEqual(schemas,originals);
});
test('refuses unrelated schemas',()=>assert.throws(()=>planDirectorySchemaRls({name:'Tenant',rls:{}})));
