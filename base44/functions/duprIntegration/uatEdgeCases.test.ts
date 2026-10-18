import {strict as assert} from 'node:assert';
import {validateMatch} from './uatCore.ts';
Deno.test('impossible calendar dates rejected',()=>{
 const m={identifier:'RH-UAT-1',matchSource:'PARTNER',format:'SINGLES',matchType:'RALLY',matchDate:'2026-99-99',teamA:{player1:'ABC123',game1:11},teamB:{player1:'DEF456',game1:8}};
 assert.equal(validateMatch(m,true).reason,'date_invalid');
});
