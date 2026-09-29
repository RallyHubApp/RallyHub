const cases=[
 ['killarney-pickleball-club',true,false],
 ['carrickmacross-pickleball-club',true,false],
 ['multyfarnham-pickleball-club',true,true],
 ['stepaside-pickleball',true,true],
 ['kinvara-pickleball',false,true],
 ['galway-county-pickleball',false,true],
 ['southside-pickleball-club',false,true],
 ['west-cork-pickleball-club',false,true]
];
const url='https://rallyhub.ie/api/apps/6a01dc00702b7dd2a2978c28/functions/directoryContactAction';
const results=[];
for(let i=0;i<cases.length;i++){
 const [slug,phoneOptOut,nameOptOut]=cases[i];
 const res=await fetch(url,{method:'POST',headers:{'content-type':'application/json','accept':'application/json','x-app-id':'6a01dc00702b7dd2a2978c28','base44-functions-version':'prod','x-base44-anonymous-id':'optout-'+slug,'x-origin-url':'https://rallyhub.ie/directory/'+slug},body:JSON.stringify({action:'public_card',listingSlug:slug})});
 const data=await res.json(); const card=data?.card||{};
 results.push({slug,status:res.status,phoneOptOut,nameOptOut,call:!!card?.actions?.call,whatsapp:!!card?.actions?.whatsapp,email:!!card?.actions?.email,displayName:card?.contact?.displayName||'',phonePreserved:phoneOptOut?(!card?.actions?.call&&!card?.actions?.whatsapp):true,namePreserved:nameOptOut?!card?.contact?.displayName:true});
 await new Promise(r=>setTimeout(r,1800));
}
const failures=results.filter(r=>r.status!==200||!r.phonePreserved||!r.namePreserved);
console.log(JSON.stringify({count:results.length,failures,results},null,2));
