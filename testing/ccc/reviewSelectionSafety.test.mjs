import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL(`../../src/components/ccc/${name}`,import.meta.url),'utf8');
test('host revocation rejects stale reviewed configuration and invalidates pending response',()=>{
 const ui=read('ClubHostRevocation.jsx');
 assert.match(ui,/review\.reviewedConfigId!==id\|\|review\.configId!==id/);
 assert.match(ui,/onChange=\{e=>\{invalidate\(\);setId\(e\.target\.value\)\}\}/);
 assert.match(ui,/version!==requestVersion\.current/);
 assert.match(ui,/disabled=\{busy\}/);
});
test('person and venue linking require same exact reviewed identifiers at confirmation',()=>{
 const ui=read('ClubExplicitLinkReview.jsx');
 assert.match(ui,/review\.reviewedFirst!==first\.trim\(\)/);
 assert.match(ui,/review\.reviewedSecond!==second\.trim\(\)/);
 assert.match(ui,/onChange=\{e=>\{invalidate\(\);setFirst\(e\.target\.value\)\}\}/);
 assert.match(ui,/onChange=\{e=>\{invalidate\(\);setSecond\(e\.target\.value\)\}\}/);
 assert.match(ui,/version!==requestVersion\.current/);
});
