import { directoryClubs } from '../src/data/directorySeed.js';

const APP='6a01dc00702b7dd2a2978c28';
const fn=async(name,body)=>{
  const r=await fetch(`https://rallyhub.ie/api/apps/${APP}/functions/${name}`,{
    method:'POST',headers:{'content-type':'application/json','x-app-id':APP,'base44-functions-version':'prod','x-base44-anonymous-id':'final-audit-20260930','x-origin-url':'https://rallyhub.ie/directory'},
    body:JSON.stringify(body)
  });
  let j={}; try{j=await r.json()}catch{}
  return {status:r.status,data:j};
};
const publicList=await fn('directoryListingProfile',{action:'public_list'});
const dynamic=Object.keys(publicList.data?.listings||{});
const slugs=[...new Set([...directoryClubs.map(x=>x.slug),...dynamic])].filter(Boolean).sort();
const rows=[];
for(const slug of slugs){
  const r=await fn('directoryContactAction',{action:'public_card',listingSlug:slug});
  const s=JSON.stringify(r.data||{}).toLowerCase();
  const card=r.data?.card;
  rows.push({slug,status:r.status,featureDisabled:!!r.data?.featureDisabled,hasCard:!!card,call:!!card?.actions?.call,whatsapp:!!card?.actions?.whatsapp,email:!!card?.actions?.email,directLeak:/tel:|mailto:|wa\.me\//.test(s),error:r.data?.error||''});
  await new Promise(res=>setTimeout(res,180));
}
const expected={
 'clare-pickleball':[1,1,1],
 'oriel-pickleball-dundalk':[0,0,1],
 'southside-pickleball-club':[1,0,0],
 'carrickmacross-pickleball-club':[0,0,1],
 'bluestack-pickleball-club':[1,1,1],
 'killarney-pickleball-club':[0,0,1],
 'east-cavan-pickleball':[1,1,1],
 'cobh-pickleball':[1,0,1],
 'multyfarnham-pickleball-club':[0,0,1],
 'galway-pickleball':[1,1,1],
 'galway-county-pickleball':[1,1,1],
 'limerick-city-pickleball':[1,1,1],
 'ashbourne-pickleball':[0,0,1]
};
const mismatches=[];
for(const [slug,e] of Object.entries(expected)){
  const r=rows.find(x=>x.slug===slug);
  if(!r || Number(r.call)!==e[0]||Number(r.whatsapp)!==e[1]||Number(r.email)!==e[2]) mismatches.push({slug,expected:e,actual:r});
}
const hold=rows.find(x=>x.slug==='eyva-s-invitational-series');
const failures=rows.filter(x=>x.slug!=='eyva-s-invitational-series' && (x.status!==200||!x.hasCard||x.directLeak));
console.log(JSON.stringify({count:rows.length,serverListStatus:publicList.status,serverListCount:dynamic.length,failures:failures.length,mismatches,hold,channelCounts:{call:rows.filter(x=>x.call).length,whatsapp:rows.filter(x=>x.whatsapp).length,email:rows.filter(x=>x.email).length,noDirect:rows.filter(x=>x.hasCard&&!x.call&&!x.whatsapp&&!x.email).length},failureRows:failures.slice(0,30)},null,2));
