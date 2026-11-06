import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../src/pages/PublicKotcResults.jsx',import.meta.url),'utf8');
test('every completed KOTC exposes name-based individual results on Results tab',()=>{
 assert.match(source,/finished&&activeTab==='results'&&<section/);
 assert.match(source,/Choose your player name/);
 assert.match(source,/data\.participants\|\|\[\]/);
 assert.match(source,/data\.matches\|\|\[\]/);
 assert.doesNotMatch(source,/finished&&\['6ae381b98f9bf09088e77e26'/);
});
test('My KOTC verification panel remains available separately',()=>{
 assert.match(source,/activeTab==='my_access'&&<>\s*<KotcMyPlayerPanel/);
});
