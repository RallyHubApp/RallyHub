import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const names = readdirSync('base44/entities').filter(name => /^Directory.*\.jsonc$/.test(name));
const configs = names.map(name => ({name,schema:JSON.parse(readFileSync(join('base44/entities',name),'utf8'))}));
function containsGenericAdmin(value){
 if (value===null || typeof value!=='object') return false;
 if (value.user_condition?.role === 'admin') return true;
 return Object.values(value).some(containsGenericAdmin);
}
test('all Directory schemas are inventoried and parseable',()=>{assert.equal(configs.length,22);for(const {name,schema} of configs){assert.ok(schema.name,name);assert.ok(schema.rls,name);}});
test('none of the Directory entities expose direct generic-admin access',()=>{
 const exposed=configs.filter(({schema})=>containsGenericAdmin(schema.rls)).map(({name})=>name);
 assert.deepEqual(exposed,[]);
});
test('all Directory writes are service-only; non-owner reads fail closed',()=>{
 for(const {schema,name} of configs){
  for(const op of ['create','update','delete'])assert.equal(schema.rls[op],false,`${name}:${op}`);
  if(schema.name==='DirectoryListingAccess')assert.deepEqual(schema.rls.read,{'data.user_id':'{{user.id}}'});
  else assert.equal(schema.rls.read,false,`${name}:read`);
 }
});
test('Directory audit records do not grant updates',()=>{
 const schema=configs.find(row=>row.schema.name==='DirectoryListingAudit')?.schema;
 assert.equal(schema?.rls?.update,false);
});
