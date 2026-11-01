import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../src/components/ccc/ClubHostWorkspace.jsx',import.meta.url),'utf8');
test('host roster pagination discards responses from previously selected sessions',()=>{
 assert.match(source,/scopeRef.current=scopeKey/);
 assert.match(source,/const requested=scopeRef.current/);
 assert.match(source,/if\(scopeRef.current!==requested\)return/);
 assert.match(source,/if\(scopeRef.current===requested\)setPaging\(false\)/);
});
test('host roster remains scoped and does not expose contact or payment fields',()=>{
 assert.match(source,/action:'host_roster_page'/);
 assert.match(source,/id:selected,cursor:requestedCursor/);
 assert.doesNotMatch(source,/r\.email|r\.phone|r\.medical_note|r\.payment_method/);
});
