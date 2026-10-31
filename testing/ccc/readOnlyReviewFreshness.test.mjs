import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const file of ['ClubGuestEligibilityReview.jsx','ClubPersonConsentReview.jsx']){
 test(`${file} discards stale asynchronous results after input changes`,()=>{
  const src=readFileSync(new URL(`../../src/components/ccc/${file}`,import.meta.url),'utf8');
  assert.match(src,/requestVersion=useRef\(0\)/);
  assert.match(src,/version!==requestVersion\.current/);
  assert.match(src,/invalidate\(\)/);
  assert.match(src,/setBusy\(false\)/);
 });
}
