import assert from 'node:assert/strict';
import { findFinanceRuleForEvent, financeOccurrenceStartInWindow, financeRuleIsSelected, financeSpondPatternKey, financeVenueSimilarity } from '../base44/functions/spondIntegrationWorking/financeMatch.mjs';

const venues=[
  {id:'enn',name:'Ennistymon',address:'Ennistymon Community Centre, Parliament Street, Ennistymon, Co. Clare, V95 X8XC'},
  {id:'doora',name:'St Joseph’s, Doora Barefield',address:"St Joseph's Doora Barefield GAA Sports Hall, Gurteen, Quin Road, Co. Clare, V95 PD36"},
  {id:'corofin',name:'Corofin',address:'Corofin GAA Sports Hall, Corofin, Co. Clare, V95 XD56'},
];
const venuesById=new Map(venues.map(v=>[v.id,v]));
const rules=[
  {id:'enn-19',venue_id:'enn',venue_name:'Ennistymon',weekday:'Wednesday',start_time:'19:00',effective_from:'2026-09-01',income_source:'spond',spond_event_id:'4FA65CB24B154F4AADCDC1EE376BEBF2',default_fee_per_person:5.5},
  {id:'enn-20',venue_id:'enn',venue_name:'Ennistymon',weekday:'Wednesday',start_time:'20:00',effective_from:'2026-09-01',income_source:'spond',spond_event_id:'CA91A0FBD7D54BF4B63B2BA44D2AA9EC',default_fee_per_person:5.5},
  {id:'doora-thu-19',venue_id:'doora',venue_name:'St Joseph’s, Doora Barefield',weekday:'Thursday',start_time:'19:00',effective_from:'2026-09-01',income_source:'spond',default_fee_per_person:null},
];
const rulesByEvent=new Map(rules.filter(r=>r.spond_event_id).map(r=>[r.spond_event_id,r]));
const spondRules=rules.filter(r=>r.income_source==='spond');

function match(event,activityDate,day,time){
  return findFinanceRuleForEvent({event,activityDate,local:{day,time},rulesByEvent,spondRules,venuesById});
}

// Spond meetupTimestamp is the authoritative session time even when a secondary timestamp is earlier.
const minMs=new Date('2026-09-01T00:00:00Z').getTime(), maxMs=new Date('2026-09-30T23:59:59Z').getTime();
assert.equal(financeOccurrenceStartInWindow({meetupTimestamp:'2026-09-30T18:00:00Z',startTimestamp:'2026-09-29T18:00:00Z'},minMs,maxMs),'2026-09-30T18:00:00Z');

// Directory scanner and Finance detail sync must produce the same stable recurring-session key.
const enn19Pattern=financeSpondPatternKey({heading:'7pm Ennistymon Pickeball Session',day:'Wednesday',start:'19:00',end:'20:00',venueName:'Ennistymon Community Centre',venueAddress:'Parliament St, Ennistimon, Ennistymon'});
assert.equal(enn19Pattern,'7pm ennistymon pickeball session|Wednesday|19:00|20:00|ennistymon community centre|parliament st ennistimon ennistymon');
assert.equal(enn19Pattern,financeSpondPatternKey({heading:' 7PM Ennistymon Pickeball Session ',day:'Wednesday',start:'19:00:00',end:'20:00:00',venueName:'Ennistymon Community Centre',venueAddress:'Parliament St, Ennistimon, Ennistymon'}));

// Original Ennistymon binding still takes exact priority.
let result=match({id:'4FA65CB24B154F4AADCDC1EE376BEBF2',location:{feature:'Ennistymon Community Centre',address:'Parliament St, Ennistymon'}},'2026-09-30','Wednesday','19:00');
assert.equal(result.rule?.id,'enn-19');
assert.equal(result.matchMode,'exact_event_id');

// Later recurring occurrences have different Spond IDs and must still match by venue/day/time.
result=match({id:'87BCD997AA4E4DD7812E741E0303108D',location:{feature:'Ennistymon Community Centre',address:'Parliament St, Ennistymon'}},'2026-10-07','Wednesday','19:00');
assert.equal(result.rule?.id,'enn-19');
assert.equal(result.matchMode,'venue_day_time');

result=match({id:'816FF2331F434AA7BB54F51332CF3518',location:{feature:'Ennistymon Community Centre',address:'Parliament St, Ennistymon'}},'2026-10-07','Wednesday','20:00');
assert.equal(result.rule?.id,'enn-20');
assert.equal(result.matchMode,'venue_day_time');

// Doora recurrence should identify the correct finance rule even though its Spond occurrence ID changes.
result=match({id:'6616D45E5D2945BE8D50A10D8ED25CD6',location:{feature:'St. Josephs Doora Barefield GAA Club',address:'Gurteen Quin Road, Gorteen, Ennis'}},'2026-10-01','Thursday','19:00');
assert.equal(result.rule?.id,'doora-thu-19');
assert.equal(result.matchMode,'venue_day_time');
assert.ok(financeVenueSimilarity(result.rule,venuesById.get('doora'),{location:{feature:'St. Josephs Doora Barefield GAA Club'}})>=0.5);

// Venue selection must apply to the sync itself, not only the display. Ennistymon-only sync must ignore Doora rules with no player fee.
assert.equal(financeRuleIsSelected(rules.find(r=>r.id==='enn-19'),new Set(['enn'])),true);
assert.equal(financeRuleIsSelected(rules.find(r=>r.id==='doora-thu-19'),new Set(['enn'])),false);
assert.equal(Number(rules.find(r=>r.id==='enn-19')?.default_fee_per_person),5.5);

// Corofin must not be misclassified as Ennistymon or Doora when no Corofin finance rule exists.
result=match({id:'EB15B6E1B8B746209CBAFE7545D1DA8D',location:{feature:'Corofin GAA Club',address:'Newtown, Corofin'}},'2026-10-07','Wednesday','11:30');
assert.equal(result.rule,null);
assert.equal(result.matchMode,'');

// Wrong day/time at a valid venue must not match a recurring rule.
result=match({id:'other',location:{feature:'Ennistymon Community Centre'}},'2026-10-08','Thursday','19:00');
assert.equal(result.rule,null);

console.log('PASS finance Spond gate: Directory pattern keys, meetup-time precedence, exact IDs, recurrence fallback, venue selection and non-match protection.');
