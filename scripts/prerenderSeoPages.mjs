import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
const dist=path.join(root,'dist');
const site='https://rallyhub.ie';
const template=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const { directoryClubs=[] }=await import(pathToFileURL(path.join(root,'src/data/directorySeed.js')).href);
const countySlug=county=>String(county||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const esc=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const venuePath=(club,venue)=>`/pickleball-venues/${encodeURIComponent(club.slug)}/${encodeURIComponent(venue.id)}`;

function inject(route,{title,description,body,schema=[]}){
  const canonical=`${site}${route==='/'?'':route}`;
  let html=template
    .replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/i,`<meta name="description" content="${esc(description)}" />`)
    .replace(/<meta property="og:title"[^>]*>/i,`<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/i,`<meta property="og:description" content="${esc(description)}" />`)
    .replace(/<meta property="og:url"[^>]*>/i,`<meta property="og:url" content="${esc(canonical)}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/i,`<meta name="twitter:title" content="${esc(title)}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/i,`<meta name="twitter:description" content="${esc(description)}" />`)
    .replace('</head>',`    <link rel="canonical" href="${esc(canonical)}" />\n    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />\n${schema.filter(Boolean).map(item=>`    <script type="application/ld+json">${json(item)}</script>`).join('\n')}\n  </head>`)
    .replace('<div id="root"></div>',`<div id="root"><main data-rallyhub-prerendered="true" style="max-width:1100px;margin:40px auto;padding:0 20px;font-family:Arial,sans-serif;color:#07184c;line-height:1.55">${body}</main></div>`);
  const target=route==='/'?path.join(dist,'index.html'):path.join(dist,...route.split('/').filter(Boolean),'index.html');
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,html);
}

const counties=[...new Set(directoryClubs.map(c=>c.county).filter(Boolean))].sort();
const directorySchema={
  '@context':'https://schema.org','@type':'CollectionPage',name:'RallyHub Irish Pickleball Club Directory',url:`${site}/directory`,
  description:`Find pickleball clubs, venues and weekly sessions across Ireland on RallyHub.`,
  mainEntity:{'@type':'ItemList',numberOfItems:directoryClubs.length,itemListElement:directoryClubs.map((club,index)=>({'@type':'ListItem',position:index+1,name:club.name,url:`${site}/directory/${club.slug}`}))}
};
const websiteSchema={
  '@context':'https://schema.org','@type':'WebSite',name:'RallyHub',url:site,inLanguage:'en-IE',
  description:'RallyHub helps people find pickleball clubs, venues, sessions and events across Ireland and provides club and competition management tools.'
};

inject('/directory',{
  title:'Pickleball Clubs in Ireland | RallyHub Club Directory',
  description:`Find ${directoryClubs.length} pickleball club listings, venues and weekly sessions across Ireland. Search by county, club, venue and playing day on RallyHub.`,
  schema:[websiteSchema,directorySchema],
  body:`<h1>Pickleball clubs and places to play in Ireland</h1><p>RallyHub is an all-Ireland pickleball directory covering clubs, venues and weekly playing sessions. Browse by county or open a club listing for current playing information.</p><h2>Browse pickleball by county</h2><ul>${counties.map(c=>`<li><a href="/pickleball-clubs/${countySlug(c)}">Pickleball clubs in ${esc(c)}</a></li>`).join('')}</ul><h2>Irish pickleball clubs</h2><ul>${directoryClubs.map(c=>`<li><a href="/directory/${encodeURIComponent(c.slug)}">${esc(c.name)}</a> — County ${esc(c.county)}</li>`).join('')}</ul>`
});

for(const county of counties){
  const clubs=directoryClubs.filter(c=>c.county===county);
  const venues=clubs.flatMap(c=>(c.venues||[]).map(v=>({club:c,venue:v})));
  const sessions=clubs.reduce((sum,c)=>sum+(c.sessions?.length||0),0);
  const description=`Find ${clubs.length} pickleball club${clubs.length===1?'':'s'} and ${venues.length} venue${venues.length===1?'':'s'} in County ${county}. View weekly sessions, maps and club contact details on RallyHub.`;
  const schema={
    '@context':'https://schema.org','@type':'CollectionPage',name:`Pickleball clubs in County ${county}`,url:`${site}/pickleball-clubs/${countySlug(county)}`,description,
    mainEntity:{'@type':'ItemList',numberOfItems:clubs.length,itemListElement:clubs.map((club,index)=>({'@type':'ListItem',position:index+1,name:club.name,url:`${site}/directory/${club.slug}`}))}
  };
  inject(`/pickleball-clubs/${countySlug(county)}`,{
    title:`Pickleball Clubs in ${county} | RallyHub Ireland`,description,schema:[schema],
    body:`<nav><a href="/directory">Irish Pickleball Directory</a></nav><h1>Pickleball clubs in ${esc(county)}</h1><p>${esc(description)}</p><p>${sessions?`${sessions} weekly sessions are currently listed across these clubs.`:'Session information is being added as clubs verify their listings.'}</p><h2>Clubs</h2>${clubs.map(club=>`<article><h3><a href="/directory/${encodeURIComponent(club.slug)}">${esc(club.name)}</a></h3><p>${esc(club.description||`Pickleball club in County ${county}.`)}</p>${club.venues?.length?`<p>Venues: ${club.venues.map(v=>`<a href="${venuePath(club,v)}">${esc(v.shortName||v.name)}</a>`).join(', ')}</p>`:''}</article>`).join('')}`
  });
}

for(const club of directoryClubs){
  const clubDescription=`${club.name} pickleball club in County ${club.county}. Find ${club.venues?.length||0} venue${club.venues?.length===1?'':'s'}${club.sessions?.length?`, ${club.sessions.length} weekly session${club.sessions.length===1?'':'s'}`:''}, maps, playing times and contact information on RallyHub.`;
  const clubSchema={
    '@context':'https://schema.org','@type':'SportsOrganization',name:club.name,url:`${site}/directory/${club.slug}`,sport:'Pickleball',description:club.description||clubDescription,
    areaServed:{'@type':'AdministrativeArea',name:`County ${club.county}`},
    location:(club.venues||[]).map(v=>({'@type':'SportsActivityLocation',name:v.name,address:{'@type':'PostalAddress',streetAddress:v.address||'',addressRegion:club.county,postalCode:v.eircode||''},...(Number.isFinite(v.latitude)&&Number.isFinite(v.longitude)?{geo:{'@type':'GeoCoordinates',latitude:v.latitude,longitude:v.longitude}}:{})}))
  };
  inject(`/directory/${club.slug}`,{
    title:`${club.name} | Pickleball in ${club.county} | RallyHub`,description:clubDescription,schema:[clubSchema],
    body:`<nav><a href="/directory">Irish Pickleball Directory</a> / <a href="/pickleball-clubs/${countySlug(club.county)}">${esc(club.county)}</a></nav><h1>${esc(club.name)}</h1><p>${esc(club.description||clubDescription)}</p><h2>Pickleball venues</h2>${club.venues?.length?`<ul>${club.venues.map(v=>`<li><a href="${venuePath(club,v)}">${esc(v.name)}</a>${v.address?` — ${esc(v.address)}`:''}${v.eircode?` · ${esc(v.eircode)}`:''}</li>`).join('')}</ul>`:'<p>Venue details are being updated.</p>'}<h2>Weekly pickleball sessions</h2>${club.sessions?.length?`<ul>${club.sessions.map(s=>{const v=(club.venues||[]).find(x=>x.id===s.venueId);return `<li>${esc(s.day)} ${esc(s.start)}${s.end?`–${esc(s.end)}`:''} — ${esc(s.level||'Club session')}${v?` at <a href="${venuePath(club,v)}">${esc(v.shortName||v.name)}</a>`:''}</li>`}).join('')}</ul>`:'<p>No verified weekly session times are currently listed. Contact the club before travelling.</p>'}`
  });

  for(const venue of club.venues||[]){
    const sessions=(club.sessions||[]).filter(s=>String(s.venueId)===String(venue.id));
    const address=[venue.address,venue.eircode].filter(Boolean).join(', ');
    const description=`${venue.shortName||venue.name} is a pickleball venue used by ${club.name} in County ${club.county}.${sessions.length?` View ${sessions.length} listed weekly session${sessions.length===1?'':'s'}, times and club details.`:' View venue and club details.'}`;
    const schema={
      '@context':'https://schema.org','@type':'SportsActivityLocation',name:venue.name,url:`${site}${venuePath(club,venue)}`,description,sport:'Pickleball',
      address:{'@type':'PostalAddress',streetAddress:venue.address||'',addressRegion:club.county,postalCode:venue.eircode||''},
      ...(Number.isFinite(venue.latitude)&&Number.isFinite(venue.longitude)?{geo:{'@type':'GeoCoordinates',latitude:venue.latitude,longitude:venue.longitude}}:{})
    };
    inject(venuePath(club,venue),{
      title:`Pickleball at ${venue.shortName||venue.name}, ${club.county} | ${club.name} | RallyHub`,description,schema:[schema],
      body:`<nav><a href="/directory">Directory</a> / <a href="/pickleball-clubs/${countySlug(club.county)}">${esc(club.county)}</a> / <a href="/directory/${encodeURIComponent(club.slug)}">${esc(club.name)}</a></nav><h1>${esc(venue.name)}</h1><p>${esc(description)}</p><p><strong>Address:</strong> ${esc(address||`County ${club.county}`)}</p>${venue.courts?`<p><strong>Courts:</strong> ${esc(venue.courts)}</p>`:''}<h2>Weekly sessions</h2>${sessions.length?`<ul>${sessions.map(s=>`<li>${esc(s.day)} ${esc(s.start)}${s.end?`–${esc(s.end)}`:''} — ${esc(s.level||'Club session')}</li>`).join('')}</ul>`:`<p>No verified weekly session times are currently listed. Contact ${esc(club.name)} before travelling.</p>`}`
    });
  }
}

inject('/events',{
  title:'Pickleball Events, Tournaments & Coaching in Ireland | RallyHub',
  description:'Discover upcoming pickleball events, tournaments, competitions, social events and coaching opportunities in Ireland as RallyHub Events develops.',
  schema:[{'@context':'https://schema.org','@type':'CollectionPage',name:'RallyHub Pickleball Events Ireland',url:`${site}/events`,description:'Irish pickleball events, tournaments, competitions, social events and coaching opportunities.'}],
  body:'<h1>Pickleball events and tournaments in Ireland</h1><p>RallyHub Events is being developed as a national place to discover pickleball tournaments, social events, competitions, coaching and other playing opportunities around Ireland.</p><p><a href="/directory">Find pickleball clubs and venues in Ireland</a></p>'
});

console.log(`Pre-rendered SEO HTML for ${directoryClubs.length} clubs, ${counties.length} counties and ${directoryClubs.reduce((n,c)=>n+(c.venues?.length||0),0)} venues.`);
