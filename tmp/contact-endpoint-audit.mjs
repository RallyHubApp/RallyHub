import { directoryClubs } from '../src/data/directorySeed.js';
import { importedContactEndpointFor } from '../base44/functions/directoryContactAction/importedContactEndpoints.ts';

const extras = [
  'north-kildare-pickleball-club','pickleball-ireland','eyva-s-invitational-series','newbridge-pickleball-club','oriel-pickleball-dundalk','newbridge-community-pickleball','shankill-tennis-club','ballinamore-pickleball-club','coillte-pickleball-club','dalkey-pickkeball-club','portmarnock-pickleball','vamos-pickleball'
];
const profileAuthoritative = new Set([
'north-kildare-pickleball-club','south-kildare-pickleball','pickleball-ireland','newbridge-pickleball-club','eyva-s-invitational-series','west-cork-pickleball-club','east-cavan-pickleball','galway-pickleball','oriel-pickleball-dundalk','killarney-pickleball-club','carrickmacross-pickleball-club','bluestack-pickleball-club','connemara-pickleball-club','multyfarnham-pickleball-club','cobh-pickleball','dalkey-pickkeball-club','deise-pickleball','southside-pickleball-club','dublin-15-pickleball','terenure-pickleball-club','limerick-city-pickleball','vamos-pickleball','ashbourne-pickleball','clare-pickleball'
]);
const phoneOptOut = new Set(['killarney-pickleball-club','carrickmacross-pickleball-club','multyfarnham-pickleball-club','stepaside-pickleball']);
const nameOptOut = new Set(['west-cork-pickleball-club','southside-pickleball-club','multyfarnham-pickleball-club','stepaside-pickleball','kinvara-pickleball','galway-county-pickleball']);
const slugs=[...new Set([...directoryClubs.map(c=>c.slug),...extras])].sort();
const url='https://rallyhub.ie/api/apps/6a01dc00702b7dd2a2978c28/functions/directoryContactAction';
const results=[];
for (const slug of slugs){
  const res=await fetch(url,{method:'POST',headers:{'content-type':'application/json','accept':'application/json','x-app-id':'6a01dc00702b7dd2a2978c28','base44-functions-version':'prod','x-base44-anonymous-id':'audit-'+slug,'x-origin-url':'https://rallyhub.ie/directory/'+slug},body:JSON.stringify({action:'public_card',listingSlug:slug})});
  let data={}; try{data=await res.json()}catch{}
  const card=data?.card||null;
  const serial=JSON.stringify(card||{}).toLowerCase();
  const row={slug,status:res.status,featureDisabled:!!data?.featureDisabled,hasCard:!!card,call:!!card?.actions?.call,whatsapp:!!card?.actions?.whatsapp,email:!!card?.actions?.email,rawDestinationLeak:serial.includes('tel:')||serial.includes('wa.me/')||serial.includes('mailto:'),nameHidden:nameOptOut.has(slug)?!card?.contact?.displayName:null,expectedMismatch:false,error:data?.error||''};
  if(slug==='eyva-s-invitational-series'){
    row.expectedHold = res.status===404 && !!data?.featureDisabled;
  } else if(!profileAuthoritative.has(slug)) {
    const e=importedContactEndpointFor(slug);
    if(e){
      const exp={call:phoneOptOut.has(slug)?false:!!e.allow_call,whatsapp:phoneOptOut.has(slug)?false:!!e.allow_whatsapp,email:!!e.allow_email};
      row.expected=exp;
      row.expectedMismatch=!!card && (row.call!==exp.call||row.whatsapp!==exp.whatsapp||row.email!==exp.email);
    }
  }
  results.push(row);
  await new Promise(r=>setTimeout(r,90));
}
const failures=results.filter(r=>r.slug==='eyva-s-invitational-series' ? !r.expectedHold : (r.status!==200||!r.hasCard||r.rawDestinationLeak||r.expectedMismatch||r.nameHidden===false));
const summary={count:results.length,failures:failures.length,channelCounts:{call:results.filter(r=>r.call).length,whatsapp:results.filter(r=>r.whatsapp).length,email:results.filter(r=>r.email).length,noDirect:results.filter(r=>r.hasCard&&!r.call&&!r.whatsapp&&!r.email).length},hold:results.find(r=>r.slug==='eyva-s-invitational-series'),failureRows:failures,results};
console.log(JSON.stringify(summary,null,2));
