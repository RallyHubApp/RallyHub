import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectSportingFixtures} from '../../src/lib/ccc/sportingFixturePreflight.mjs';

const fixture = (id, players, status='waiting', court=null, result=null) => ({
  id,teamA:players.slice(0,2),teamB:players.slice(2,4),status,court,result,
});
const codes = review => review.issues.map(issue => issue.code);

test('valid checked-in doubles fixtures are accepted without side effects', () => {
  const matches=[fixture('m1',['a','b','c','d']),fixture('m2',['e','f','g','h'])];
  const copy=structuredClone(matches);
  const review=inspectSportingFixtures(matches,{checkedInIds:['a','b','c','d','e','f','g','h']});
  assert.equal(review.valid,true);
  assert.equal(review.playerCount,8);
  assert.deepEqual(matches,copy);
});
test('check-in evidence is mandatory by default', () => {
  assert.ok(codes(inspectSportingFixtures([fixture('m1',['a','b','c','d'])])).includes('check_in_evidence_missing'));
});
test('unchecked players cannot be silently included', () => {
  const review=inspectSportingFixtures([fixture('m1',['a','b','c','d'])],{checkedInIds:['a','b','c']});
  assert.ok(codes(review).includes('unchecked_player'));
});
test('overlapping active players and courts are blocked', () => {
  const review=inspectSportingFixtures([
    fixture('m1',['a','b','c','d'],'playing',1),
    fixture('m2',['a','e','f','g'],'playing',1)
  ],{checkedInIds:['a','b','c','d','e','f','g']});
  assert.ok(codes(review).includes('overlapping_active_player'));
  assert.ok(codes(review).includes('active_court_collision'));
});
test('duplicate IDs and players are rejected', () => {
  const review=inspectSportingFixtures([
    fixture('m1',['a','a','c','d']),
    fixture('m1',['e','f','g','h'])
  ],{requireCheckIn:false});
  assert.ok(codes(review).includes('duplicate_match_id'));
  assert.ok(codes(review).includes('duplicate_player_in_match'));
});
test('completed fixtures require an actual result', () => {
  assert.ok(codes(inspectSportingFixtures([fixture('m1',['a','b','c','d'],'completed')],{requireCheckIn:false})).includes('completed_result_missing'));
});
test('invalid court count, malformed doubles teams and statuses fail closed', () => {
  const review=inspectSportingFixtures([{id:'x',teamA:['a'],teamB:['b'],status:'unknown'}],{courts:0,requireCheckIn:false});
  assert.ok(codes(review).includes('invalid_court_count'));
  assert.ok(codes(review).includes('invalid_doubles_teams'));
  assert.ok(codes(review).includes('invalid_match_status'));
});
test('missing fixtures fail closed', () => {
  const review=inspectSportingFixtures([],{requireCheckIn:false});
  assert.equal(review.valid,false);
  assert.ok(codes(review).includes('fixtures_missing'));
});

test('malformed team data fails closed instead of crashing the preflight', () => {
  const review=inspectSportingFixtures([{id:'broken',teamA:'not-an-array',teamB:null,status:'waiting'}],{requireCheckIn:false});
  assert.equal(review.valid,false);
  assert.ok(codes(review).includes('invalid_team_structure'));
});
