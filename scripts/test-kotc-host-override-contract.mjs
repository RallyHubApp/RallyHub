import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync('base44/functions/kotcCommand/entry.ts','utf8');
const segment=(a,b)=>s.slice(s.indexOf(`commandType === '${a}'`),s.indexOf(`commandType === '${b}'`));
const proposed=segment('adjust_proposed_round','adjust_started_round');
const started=segment('adjust_started_round','set_pair_lock');
const generated=segment('generate_next_round','replace_proposed_player');
const tests=[
 ['proposed override validates host-selected locks',/KotcFixedPair|locked partnership|lockRows/.test(proposed)],
 ['proposed override persists actual slots for ledger',proposed.includes('pairWarnings(')&&proposed.includes('assignment_type:'manual_override'')],
 ['started override persists actual slots for ledger',started.includes('pairWarnings(')&&started.includes('assignment_type:'manual_override'')],
 ['generation avoids crediting proposed bench before play',!generated.includes('fairness_credit:true')],
 ['proposed override validates unique assignments',proposed.includes('new Set(nextIds).size')],
 ['started override protects scored courts',started.includes('being scored')],
];let fail=0;for(const [name,ok] of tests){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}console.log(`${tests.length-fail}/${tests.length} host override contract checks passed`);if(fail)process.exitCode=1;
