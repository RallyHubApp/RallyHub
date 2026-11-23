import test from 'node:test';import assert from 'node:assert/strict';import {suggestPresetCourts} from '../src/lib/kotcPresetPreferences.mjs';
const people=Array.from({length:18},(_,i)=>({id:String(i+1)}));
test('no responses never blocks a four-court layout and leaves two benched',()=>{const c=suggestPresetCourts(people,[],4);assert.equal(c.length,4);const ids=c.flatMap(x=>[...x.A,...x.B]);assert.equal(ids.length,16);assert.equal(new Set(ids).size,16);});
test('mutual partner preference honoured without duplicate players',()=>{const c=suggestPresetCourts(people,[{participant_id:'1',partner_id:'8'},{participant_id:'8',partner_id:'1'}],4);assert.deepEqual(c[0].A,['1','8']);});
test('one-sided preference accepted',()=>{const c=suggestPresetCourts(people,[{participant_id:'3',partner_id:'9'}],4);assert.deepEqual(c[0].A,['3','9']);});
test('court count limited to available players',()=>{assert.equal(suggestPresetCourts(people.slice(0,6),[],4).length,1);});
