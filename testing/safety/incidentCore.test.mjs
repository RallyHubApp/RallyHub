import test from 'node:test';
import assert from 'node:assert/strict';
import {createDraft,validateIncidentDraft,transitionReport,stockMovementKey} from '../../src/lib/safety/incidentCore.mjs';
const draft=()=>createDraft({id:'i1',sessionId:'s1',venueId:'v1',reporterId:'h1',incidentAt:'2026-11-28T15:00:00Z'});
test('draft validation requires factual incident details',()=>{const d=draft();assert.ok(validateIncidentDraft(d).includes('Factual description is required'));assert.deepEqual(validateIncidentDraft({...d,description:'Player slipped on court'}),[])});
test('submission requires server confirmation',()=>{const pending=transitionReport(draft(),'awaiting_sync');assert.throws(()=>transitionReport(pending,'submitted'));assert.equal(transitionReport(pending,'submitted',{confirmed:true}).status,'submitted');assert.throws(()=>transitionReport({...pending,status:'submitted'},'awaiting_sync'))});
test('failed submissions can retry without pretending success',()=>{const failed=transitionReport(transitionReport(draft(),'awaiting_sync'),'submission_failed');assert.equal(transitionReport(failed,'awaiting_sync').status,'awaiting_sync')});
test('stock movement keys are deterministic and scoped',()=>{assert.equal(stockMovementKey('i1','kit1','pack'),stockMovementKey('i1','kit1','pack'));assert.notEqual(stockMovementKey('i1','kit1','pack'),stockMovementKey('i2','kit1','pack'))});
