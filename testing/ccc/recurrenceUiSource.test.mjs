import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../src/components/ccc/ClubRecurrencePreview.jsx',import.meta.url),'utf8');
test('recurrence preview ignores stale responses when activity or date changes',()=>{
 assert.match(source,/requestKey\.current=key\+'\|'\+weeks/);
 assert.match(source,/if\(requestKey\.current!==requested\)return/);
 assert.match(source,/setBusy\(false\)/);
});
test('recurrence preview is advisory, not a publishing or batch-create action',()=>{
 assert.match(source,/action:'recurrence_review'/);
 assert.doesNotMatch(source,/action:'(?:publish|create_recurrence|save_draft)'/);
 assert.match(source,/localTimeIssues/);
});
