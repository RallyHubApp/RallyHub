import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const funcs=['tournivalRegistration','tournivalHostAccess','tournivalPlayerPortal','tournivalPublicRead','legacyTournamentManager'];
for(const name of funcs){
 const source=readFileSync('base44/functions/'+name+'/entry.ts','utf8');
 assert.doesNotMatch(source,/(?:\.SendEmail\s*\(|sendWithConfiguredEmailTransport\s*\(|gmail\.googleapis\.com|messages\/send|wa\.me\/|sendWhatsApp\s*\()/,
   name+' bypasses Communications Centre');
}
const engine=readFileSync('base44/functions/communicationsEngine/entry.ts','utf8');
assert.match(engine,/action==='preview_tournival'/);
assert.match(engine,/resolveApprovedTournivalTemplate/);
const templates=readFileSync('base44/functions/communicationsEngine/tournivalTemplates.ts','utf8');
assert.match(templates,/status!=='approved'/);
assert.match(templates,/status!=='active'/);
assert.match(templates,/renderBasicBrandedEmail/);
assert.match(templates,/deliveryPerformed:false|templateId:template.id/);
console.log('TOURNIVAL COMMUNICATIONS GATE PASS: no direct channel send; approved Centre template, tenant brand, fail-closed preview.');
