import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync('base44/functions/kotcCommand/entry.ts','utf8');
const segment=(a,b)=>s.slice(s.indexOf(`commandType === '${a}'`),s.indexOf(`commandType === '${b}'`));
const proposed=segment('adjust_proposed_round','adjust_started_round');
const started=segment('adjust_started_round','set_pair_lock');
const generated=segment('generate_next_round','replace_proposed_player');
const tests=[
 ['proposed override validates host-selected locks',/KotcFixedPair|locked partnership|lockRows/.test(proposed)],
 ['proposed override persists actual slots for ledger',proposed.includes('pairWarnings(')&&proposed.includes("assignment_type:'manual_override'")],
 ['started override persists actual slots for ledger',started.includes('pairWarnings(')&&started.includes("assignment_type:'manual_override'")],
 ['generation avoids crediting proposed bench before play',!generated.includes('fairness_credit:true')],
 ['proposed override validates unique assignments',proposed.includes('new Set(nextIds).size')],
 ['started override protects scored courts',started.includes('being scored')],
];let fail=0;for(const [name,ok] of tests){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}console.log(`${tests.length-fail}/${tests.length} host override contract checks passed`);if(fail)process.exitCode=1;
const helper=s.slice(s.indexOf('function pairWarnings('),s.indexOf('function sportingDestinations('));
const pairWarnings=new Function(`${helper};return pairWarnings;`)();
const slots=[{ladder_court_rank:1,team_side:'A',participant_id:'a'},{ladder_court_rank:1,team_side:'A',participant_id:'b'},{ladder_court_rank:1,team_side:'B',participant_id:'c'},{ladder_court_rank:1,team_side:'B',participant_id:'d'}];
const lock=[{id:'lock1',participant1_id:'a',participant2_id:'b'}];
const cases=[['intact pair',slots,0],['split same court',[slots[0],{...slots[1],participant_id:'c'},{...slots[2],participant_id:'b'},slots[3]],1],['one partner benched',[slots[0],{...slots[1],participant_id:'e'},slots[2],slots[3]],1],['both benched',slots.map((x,i)=>({...x,participant_id:String(i)})),0]];
for(const [name,ss,expected] of cases){const actual=pairWarnings(ss,lock).length;assert.equal(actual,expected,`pair warning: ${name}`);console.log('PASS pair warning:',name)}
