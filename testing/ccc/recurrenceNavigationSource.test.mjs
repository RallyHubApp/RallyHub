import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const planner=readFileSync(new URL('../../src/components/ccc/ClubActivityPlanner.jsx',import.meta.url),'utf8');
const queue=readFileSync(new URL('../../src/components/ccc/ClubRecurrenceQueue.jsx',import.meta.url),'utf8');
test('recurrence queue links to a specific source activity in the planner',()=>{
 assert.match(queue,/section=activities&activityId=/);
 assert.match(queue,/encodeURIComponent\(b.id\)/);
 assert.match(planner,/routeParams.get\('activityId'\)/);
 assert.match(planner,/savedDrafts.find\(d=>d.id===requested\)/);
});
test('planner reports incomplete inventory and supports searching by exact ID',()=>{
 assert.match(planner,/activityList.partial/);
 assert.match(planner,/String\(d.id\|\|''\)/);
 assert.match(planner,/Search title or activity ID/);
});
