import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseDirectoryAttribution} from '../../base44/shared/directoryAttribution.mjs';
const source=readFileSync('src/lib/site-analytics.js','utf8');
test('UTM attribution only records approved keys, persists across internal routes, and bounds length',()=>{
 const incoming=parseDirectoryAttribution('?utm_source=instagram&utm_medium=social&utm_campaign=Autumn+Open&utm_term=pickleball&email=private@example.test');
 assert.deepEqual(incoming,{utm_source:'instagram',utm_medium:'social',utm_campaign:'Autumn Open',utm_term:'pickleball'});
 assert.deepEqual(parseDirectoryAttribution('/?'.replace('/',''),incoming),incoming);
 assert.equal(parseDirectoryAttribution('?utm_content='+('X'.repeat(120))).utm_content.length,100);
 assert.ok(!JSON.stringify(incoming).includes('private@example.test'));
});
test('site analytics preserves consent gate and scopes metadata to Directory event transport',()=>{
 assert.match(source,/if\(typeof window==='undefined'\|\|analyticsConsent\(\)!=='granted'\)return/);
 assert.match(source,/metadata:\{\.\.\.\(details\.metadata/);
 assert.match(source,/attribution\},/);
 assert.match(source,/const ATTRIBUTION_KEY=/);
 assert.doesNotMatch(source,/localStorage\.setItem\(ATTRIBUTION_KEY/);
});
