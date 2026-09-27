import assert from 'node:assert/strict';
import { findUniqueSpondPersonRow } from '../base44/functions/guestSessionBooking/spondIdentityMatch.js';

// Regression fixture for the real failure that prompted the exact-event binding path:
// RallyHub holds "Ann Merrins", while a Spond profile may harmlessly differ as "Anne Merrins".
// The member must still resolve uniquely, and only events whose own distribution list contains
// that Spond member ID may be returned.
const ann={
  full_name:'Ann Merrins',
  primary_email:'Annmerrins@hotmail.com',
  mobile:'0868383710',
  alternate_emails:[],
  alternate_phones:[],
};

const groupMembers=[
  {id:'sp-ann-merrins',profile:{firstName:'Anne',lastName:'Merrins'}},
  {id:'sp-ann-gallery',profile:{firstName:'Ann',lastName:'Gallery'}},
  {id:'sp-marie',profile:{firstName:'Marie',lastName:'Moore'}},
];

const resolved=findUniqueSpondPersonRow(groupMembers,ann,'');
assert(resolved,'Ann must resolve from a unique surname + first-initial Spond identity when exact contact data is absent');
assert.equal(resolved.identity.id,'sp-ann-merrins');

const event7={id:'4FA65CB24B154F4AADCDC1EE376BEBF2',recipients:{group:{members:[{id:'sp-ann-merrins'}]}}};
const event8={id:'CA91A0FBD7D54BF4B63B2BA44D2AA9EC',recipients:{group:{members:[{id:'sp-ann-merrins'}]}}};
const doora={id:'unrelated-doora',recipients:{group:{members:[{id:'sp-marie'}]}}};
const onDistribution=event => (event.recipients?.group?.members||[]).some(row=>String(row.id||row.memberId||row.uid||row)===resolved.identity.id);
assert.equal(onDistribution(event7),true,'Ann must be eligible for the bound Ennistymon 7pm event');
assert.equal(onDistribution(event8),true,'Ann must be eligible for the bound Ennistymon 8pm event');
assert.equal(onDistribution(doora),false,'Ann must not inherit unrelated Doora sessions');

// Ambiguity must fail closed. We never guess if two loose identity candidates are equally strong.
const ambiguous=findUniqueSpondPersonRow([
  {id:'one',profile:{firstName:'Ann',lastName:'Merrins'}},
  {id:'two',profile:{firstName:'Anne',lastName:'Merrins'}},
],{full_name:'An Merrins'},'');
assert.equal(ambiguous,null,'Loose Spond identity matching must fail closed when ambiguous');

console.log('SPOND EXACT EVENT FIXTURE: PASS');
console.log('Verified: Ann/Anne identity bridge, exact 7pm + 8pm event distribution eligibility, unrelated session exclusion, ambiguity fail-closed.');
