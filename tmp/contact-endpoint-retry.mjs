import fs from 'fs';
const previous=JSON.parse(fs.readFileSync('tmp/contact-endpoint-audit.json','utf8'));
const targets=previous.results.filter(r=>r.status!==200 && r.slug!=='eyva-s-invitational-series').map(r=>r.slug);
const url='https://rallyhub.ie/api/apps/6a01dc00702b7dd2a2978c28/functions/directoryContactAction';
const results=[];
for(let i=0;i<targets.length;i++){
 const slug=targets[i];
 const res=await fetch(url,{method:'POST',headers:{'content-type':'application/json','accept':'application/json','x-app-id':'6a01dc00702b7dd2a2978c28','base44-functions-version':'prod','x-base44-anonymous-id':'audit-retry-'+slug,'x-origin-url':'https://rallyhub.ie/directory/'+slug},body:JSON.stringify({action:'public_card',listingSlug:slug})});
 let data={};try{data=await res.json()}catch{}
 const card=data?.card||null;const serial=JSON.stringify(card||{}).toLowerCase();
 results.push({slug,status:res.status,featureDisabled:!!data?.featureDisabled,hasCard:!!card,call:!!card?.actions?.call,whatsapp:!!card?.actions?.whatsapp,email:!!card?.actions?.email,rawDestinationLeak:serial.includes('tel:')||serial.includes('wa.me/')||serial.includes('mailto:'),error:data?.error||''});
 await new Promise(r=>setTimeout(r,1000));
 if((i+1)%5===0 && i+1<targets.length) await new Promise(r=>setTimeout(r,15000));
}
fs.writeFileSync('tmp/contact-endpoint-retry.json',JSON.stringify(results,null,2));
const failures=results.filter(r=>r.status!==200||!r.hasCard||r.rawDestinationLeak);
console.log(JSON.stringify({checked:results.length,passed:results.length-failures.length,failures},null,2));
