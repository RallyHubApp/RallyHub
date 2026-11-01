import test from 'node:test';import assert from 'node:assert/strict';
import {mergeRegistrationPages,updateRegistrationAttendance,registrationPageDecision} from '../../src/lib/ccc/registrationPageJourney.mjs';
test('merge event registration pages preserving distinct records',()=>{const rows=mergeRegistrationPages([{id:'a',attendance:'not_marked'}],[{id:'a',attendance:'attended'},{id:'b'}]);assert.equal(rows.length,2);assert.equal(rows[0].attendance,'attended')});
test('mark attendance in later page without dropping earlier pages',()=>{const rows=updateRegistrationAttendance([{id:'a'},{id:'b',attendance:'not_marked'}],{id:'b',attendance:'attended',revision:3});assert.equal(rows.length,2);assert.equal(rows[1].attendanceRevision,3)});
test('reject repeated cursors and stale club',()=>{assert.equal(registrationPageDecision({scope:'a',requestScope:'b',cursor:'c'}).allowed,false);assert.equal(registrationPageDecision({scope:'a',requestScope:'a',cursor:'c',nextCursor:'c'}).allowed,false)});
