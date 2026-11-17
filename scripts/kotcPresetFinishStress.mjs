import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makePresetFinish,validatePresetFinish} from '../src/lib/kotcPresetFinish.js';
let checks=0;let warnings=0;
for(let n=16;n<=24;n++)for(let i=0;i<1500;i++){
 const people=Array.from({length:n},(_,j)=>`p${j}`);const count=Math.min(4,Math.floor(n/4));const presets=makePresetFinish(people,2,i%2?10:15,count);
 const errs=validatePresetFinish(presets,people,count);assert(!errs.some(e=>!e.includes('host warning')),errs.join(';'));checks++;
 if(n>count*4&&i%2===0){assert(errs.some(e=>e.includes('host warning')));warnings++;checks++;}
 const dup=structuredClone(presets);dup[1].courts[0].A[0]=dup[1].courts[0].B[0];assert(validatePresetFinish(dup,people,count).some(e=>e.includes('duplicate')));checks++;
 const invalid=structuredClone(presets);invalid[0].courts[0].A[0]='absent';assert(validatePresetFinish(invalid,people,count).some(e=>e.includes('unavailable')));checks++;
 const badMinutes=structuredClone(presets);badMinutes[0].minutes=0;assert(validatePresetFinish(badMinutes,people,count).some(e=>e.includes('duration')));checks++;
}
const prepare=fs.readFileSync('base44/functions/prepareKotcNextRound/entry.ts','utf8');const save=fs.readFileSync('base44/functions/saveKotcPresetFinish/entry.ts','utf8');const host=fs.readFileSync('src/components/kotc/KotcV2SessionView.jsx','utf8');
for(const pattern of ['presetIndex','preset_finish_index:index','bulkCreate(slots)','bulkCreate(matchRows)','play_minutes:minutes','current_round_id:round.id','new Set(ids).size!==ids.length']){assert(prepare.includes(pattern),`Missing activation contract: ${pattern}`);checks++;}
for(const pattern of ['expectedSessionRevision','session_host','new Set(assigned).size!==assigned.length','preset_finish_json']){assert(save.includes(pattern),`Missing save contract: ${pattern}`);checks++;}
for(const pattern of ['kotc-preset-finish-editor','kotc-save-preset-finish','kotc-activate-preset-finish','prepareNextRound(next)','PresetFinishEditor']){assert(host.includes(pattern),`Missing host contract: ${pattern}`);checks++;}
for(const path of ['base44/functions/kotcCommand/entry.ts','base44/functions/endKotcSession/entry.ts','base44/functions/kotcResultsShare/entry.ts']){assert(fs.readFileSync(path,'utf8').includes('!m.preset_finish_index')||fs.readFileSync(path,'utf8').includes('!x.preset_finish_index'));checks++;}
console.log(JSON.stringify({result:'PASS',checks,warnings,scenarios:13500,kind:'planner permutations and source integration contracts'}));
