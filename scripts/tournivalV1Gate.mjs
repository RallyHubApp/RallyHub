import assert from 'node:assert/strict';
import { generateGroupFixtures, validateTournivalScore, estimateDuration, computeLeaderboard, createKnockoutPairs, createKnockoutBracket } from '../src/lib/tournivalEngine.js';
let checked = 0;
for (const players of [8, 16, 24, 32]) {
  for (const courts of [1,2,4,8]) {
    for (const rounds of [2,3,4,5,6]) {
      for (const matchFormat of ['timed_10','first_11_by1','first_11_by2']) {
        const ids=Array.from({length:players},(_,i)=>'p'+i);
        const fixtures=generateGroupFixtures(ids,courts,rounds);
        assert.equal(fixtures.length,rounds);
        for(const round of fixtures){
          const assigned=round.courts.flatMap(c=>[...c.teamA,...c.teamB]);
          assert.equal(assigned.length,new Set(assigned).size,'duplicate player in a round');
          assert.ok(assigned.every(x=>ids.includes(x)));
          assert.equal(round.bench.length+assigned.length,players);
        }
        const d=estimateDuration({numPlayers:players,numCourts:courts,numRounds:rounds,matchFormat,venueMinutes:60});
        assert.ok(d.valid,JSON.stringify(d));
        assert.ok(d.stages.at(-1).final,'final is mandatory');
        assert.ok(d.totalMinutes>=d.groupMinutes+d.knockoutMinutes);
        checked++;
      }
    }
  }
}
for(const bad of [[null,11],[11,''],[11,11],[-1,11],[12,10]])assert.equal(validateTournivalScore(...bad,'first_11_by1').valid,false);
assert.equal(validateTournivalScore(11,10,'first_11_by1').valid,true);
assert.equal(validateTournivalScore(12,10,'first_11_by2').valid,true);
assert.equal(validateTournivalScore(11,10,'first_11_by2').valid,false);
assert.equal(validateTournivalScore(8,7,'timed_10').valid,true);
assert.equal(validateTournivalScore(7,7,'timed_10').valid,false);
const ids=Array.from({length:16},(_,i)=>'id'+i);
const rounds=generateGroupFixtures(ids,4,2);
const board=computeLeaderboard(ids,rounds,{},Object.fromEntries(ids.map(x=>[x,x])));
assert.equal(board.length,16);
const pairs=createKnockoutPairs(board);
assert.equal(pairs.length,8);
assert.equal(createKnockoutBracket(pairs).length,4);
assert.equal(createKnockoutBracket(pairs.slice(0,4))[0].match,'SF1');
assert.equal(createKnockoutBracket(pairs.slice(0,2))[0].match,'Final');
assert.equal(estimateDuration({numPlayers:16,numCourts:4,numRounds:1,matchFormat:'timed_10'}).valid,false);
assert.equal(estimateDuration({numPlayers:16,numCourts:4,numRounds:6,matchFormat:'timed_10',venueMinutes:75}).venueValid,false);
console.log('TOURNIVAL V1 GATE PASS:',checked,'sporting fixture/estimator scenarios; score validation, knockout, bounds.');
