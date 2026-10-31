import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=f=>readFileSync(new URL(`../../src/components/ccc/${f}`,import.meta.url),'utf8');
test('People inventory selects exact access record for independent identity verification',()=>{
 const board=src('ClubPeopleBoard.jsx');
 assert.match(board,/setSelectedAccess\(r\.accessId\)/);
 assert.match(board,/initialFirst=\{selectedAccess\}/);
 assert.doesNotMatch(board,/personId:\s*r\.userId/);
});
test('Management inventory selects existing config and active venue for explicit mapping',()=>{
 const board=src('ClubManagementBoard.jsx');
 assert.match(board,/setSelectedConfig\(h\.id\)/);
 assert.match(board,/setSelectedVenue\(v\.id\)/);
 assert.match(board,/initialFirst=\{selectedConfig\} initialSecond=\{selectedVenue\}/);
});
test('changing prefilled identifiers invalidates confirmation review',()=>{
 const review=src('ClubExplicitLinkReview.jsx');
 assert.match(review,/setFirst\(initialFirst\);setSecond\(initialSecond\)/);
 assert.match(review,/\[initialFirst,initialSecond,mode,tenantId,clubId\]/);
 assert.match(review,/review\.reviewedFirst!==first\.trim\(\)/);
});
