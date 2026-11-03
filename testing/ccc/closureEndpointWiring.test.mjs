import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../../base44/functions/cccActivity/entry.ts',import.meta.url),'utf8');
test('both close-out endpoints construct recovery from scoped registrations and payments before response',()=>{
 for(const action of ['closure_readiness','closure_review']){
  const a=src.indexOf(`if(body.action==='${action}')`);assert.ok(a>=0);
  const b=src.indexOf("if(body.action==='",a+10);const section=src.slice(a,b);
  assert.match(section,/const recovery=reviewBookingRecovery\(/);
  assert.ok(section.indexOf('const recovery=')<section.indexOf('...review,recovery'));
 }
});
