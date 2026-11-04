import {test} from 'node:test';import assert from 'node:assert/strict';
import {selectCampaignAudience} from '../../src/lib/ccc/campaignAudience.js';
test('mixed sources, tennis OR badminton, dedupe, exclude active member',()=>{
 const rows=[{id:'1',source:'waiting_list',email:'a@test.ie',previous_sports:['Tennis']},{id:'2',source:'waiting_list',email:'b@test.ie',previous_sports:['Badminton']},{id:'3',source:'guests',email:'A@test.ie',previous_sports:['Tennis']},{id:'4',source:'waiting_list',email:'member@test.ie',previous_sports:['Tennis']},{id:'5',source:'waiting_list',email:'c@test.ie',previous_sports:['Squash']}];
 const result=selectCampaignAudience(rows,{sources:['waiting_list','guests'],sports:['tennis','badminton'],excludeActiveMembers:true,activeMemberEmails:['member@test.ie']});
 assert.equal(result.count,2);assert.deepEqual(result.excluded.map(x=>x.reason),['duplicate','active_member','sport']);
});
test('date and gender filters use recorded values only',()=>{const r=selectCampaignAudience([{id:'1',source:'guests',email:'a@x.ie',gender:'female',created_date:'2026-10-12'},{id:'2',source:'guests',email:'b@x.ie',created_date:'2026-10-12'}],{sources:['guests'],gender:'female',fromDate:'2026-10-01'});assert.equal(r.count,1)});
