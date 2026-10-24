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
test('all Directory schemas are inventoried and parseable',()=>{assert.equal(configs.length,17);for(const {name,schema} of configs){assert.ok(schema.name,name);assert.ok(schema.rls,name);}});
test('record direct-entity generic-admin exposure as a blocking issue (not a passing security assertion)',()=>{
 const exposed=configs.filter(({schema})=>containsGenericAdmin(schema.rls)).map(({name})=>name);
 assert.equal(exposed.length,17,'Update audit when migration changes direct-entity RLS');
});
test('Directory audit records do not grant updates',()=>{
 const schema=configs.find(row=>row.schema.name==='DirectoryListingAudit')?.schema;
 assert.equal(schema?.rls?.update,false);
});
