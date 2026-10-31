import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reconcileEventAttendance} from '../../src/lib/ccc/attendanceReconciliation.mjs';
const row=(id,status='confirmed',attendance='not_marked')=>({id,name:id,status,attendance,attendanceRevision:0});
test('confirmed roster reconciles attended, no-show, excused and outstanding separately',()=>{
 const result=reconcileEventAttendance([row('a','confirmed','attended'),row('b','cash_confirmed','no_show'),row('c','confirmed','excused'),row('d'),row('e','pending_approval')]);
 assert.deepEqual(result.counts,{confirmed:4,attended:1,noShow:1,excused:1,unmarked:1,notEligible:1,duplicateIds:0});
 assert.deepEqual(result.queue.map(x=>x.id),['d']);
 assert.equal(result.closed,false);
});
test('no-show is never inferred from an unmarked check-in',()=>{
 const result=reconcileEventAttendance([row('a')]);
 assert.equal(result.counts.noShow,0);assert.equal(result.counts.unmarked,1);
});
test('partial pages prevent closing even when all loaded registrations are marked',()=>{
 const result=reconcileEventAttendance([row('a','confirmed','attended')],{hasMore:true});
 assert.equal(result.closed,false);assert.equal(result.complete,false);
});
test('duplicate IDs are not double counted and block closure',()=>{
 const result=reconcileEventAttendance([row('a','confirmed','attended'),row('a','confirmed','attended')]);
 assert.equal(result.counts.attended,1);assert.equal(result.counts.duplicateIds,1);assert.equal(result.closed,false);
});
test('fully loaded roster closes only with explicit outcomes',()=>{
 const result=reconcileEventAttendance([row('a','confirmed','attended'),row('b','confirmed','no_show')]);
 assert.equal(result.closed,true);
});
test('reconciliation UI delegates single registration updates to existing attendance handler',()=>{
 const ui=readFileSync(new URL('../../src/components/ccc/ClubAttendanceReconciliation.jsx',import.meta.url),'utf8');
 const parent=readFileSync(new URL('../../src/components/ccc/ClubEventRegistrationOverview.jsx',import.meta.url),'utf8');
 assert.match(ui,/onMark\(choice\.row,choice\.value\)/);
 assert.match(parent,/onMark=\{markAttendance\}/);
 assert.match(parent,/action:'mark_attendance'/);
 assert.doesNotMatch(ui,/\.create\(|\.update\(|sendEmail/);
});
