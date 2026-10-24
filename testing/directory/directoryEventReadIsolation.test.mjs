import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const s=readFileSync('base44/functions/directoryEvents/entry.ts','utf8');
const afterDispatch=s.slice(s.indexOf("    if (action === 'list') {"));
const list=afterDispatch.split("    if (action === 'save') {")[0];
const deletePath=afterDispatch.split("    if (action === 'delete') {")[1] || '';
test('list resolves existing host rather than provisioning',()=>{
 assert.match(list,/findExistingHostIdentity\(base44, listing\)/);
 assert.doesNotMatch(list,/ensureHostIdentity/);
 assert.match(list,/Promise\.resolve\(\[\]\)/);
});
test('delete resolves existing host rather than provisioning',()=>{
 assert.match(deletePath,/findExistingHostIdentity\(base44, listing\)/);
 assert.doesNotMatch(deletePath,/ensureHostIdentity/);
});
test('new sporting event preserves existing host provisioning compatibility',()=>{
 const save=afterDispatch.split("    if (action === 'save') {")[1].split("    if (action === 'delete') {")[0];
 assert.match(save,/eventId\s*\?\s*await findExistingHostIdentity\(base44, listing\)\s*:\s*await ensureHostIdentity\(base44, listing\)/);
});
