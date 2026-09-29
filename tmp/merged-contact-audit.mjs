import fs from 'fs';
import { importedContactEndpointFor } from '../base44/functions/directoryContactAction/importedContactEndpoints.ts';
const first=JSON.parse(fs.readFileSync('tmp/contact-endpoint-audit.json','utf8')).results;
const retry=JSON.parse(fs.readFileSync('tmp/contact-endpoint-retry.json','utf8'));
const retryMap=new Map(retry.map(r=>[r.slug,r]));
const merged=first.map(r=>retryMap.get(r.slug)||r);
const profileAuthoritative=new Set(['north-kildare-pickleball-club','south-kildare-pickleball','pickleball-ireland','newbridge-pickleball-club','eyva-s-invitational-series','west-cork-pickleball-club','east-cavan-pickleball','galway-pickleball','oriel-pickleball-dundalk','killarney-pickleball-club','carrickmacross-pickleball-club','bluestack-pickleball-club','connemara-pickleball-club','multyfarnham-pickleball-club','cobh-pickleball','dalkey-pickkeball-club','deise-pickleball','southside-pickleball-club','dublin-15-pickleball','terenure-pickleball-club','limerick-city-pickleball','vamos-pickleball','ashbourne-pickleball','clare-pickleball']);
const phoneOptOut=new Set(['killarney-pickleball-club','carrickmacross-pickleball-club','multyfarnham-pickleball-club','stepaside-pickleball']);
const mismatches=[];
for(const r of merged){
 if(r.slug==='eyva-s-invitational-series'||profileAuthoritative.has(r.slug)) continue;
 const e=importedContactEndpointFor(r.slug); if(!e) continue;
 const exp={call:phoneOptOut.has(r.slug)?false:!!e.allow_call,whatsapp:phoneOptOut.has(r.slug)?false:!!e.allow_whatsapp,email:!!e.allow_email};
 if(r.call!==exp.call||r.whatsapp!==exp.whatsapp||r.email!==exp.email)mismatches.push({slug:r.slug,actual:{call:r.call,whatsapp:r.whatsapp,email:r.email},expected:exp});
}
const failures=merged.filter(r=>r.slug==='eyva-s-invitational-series'?!(r.status===404&&r.featureDisabled):(r.status!==200||!r.hasCard||r.rawDestinationLeak));
console.log(JSON.stringify({count:merged.length,failures:failures.length,mismatches,channelCounts:{call:merged.filter(r=>r.call).length,whatsapp:merged.filter(r=>r.whatsapp).length,email:merged.filter(r=>r.email).length,noDirect:merged.filter(r=>r.hasCard&&!r.call&&!r.whatsapp&&!r.email).length}},null,2));
