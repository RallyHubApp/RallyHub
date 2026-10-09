import { createClientFromRequest } from 'npm:@base44/sdk@0.8.51';
const approved=new Set(['pickleballireland.ie','www.pickleballireland.ie','pickledsports.ie','www.pickledsports.ie']);
const unescapeHtml=(s:string)=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'");
const clean=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function safeUrl(value:string,base:string){try{const u=new URL(unescapeHtml(value),base);return u.protocol==='https:'&&approved.has(u.hostname)&&!u.username&&!u.password?u.toString():null}catch{return null}}
function discover(html:string,pageUrl:string,eventName:string){
 const candidates:{imageUrl:string;eventUrl:string;eventName:string;origin:string;score:number}[]=[];
 const target=clean(eventName);const words=target.split(' ').filter(x=>x.length>2);
 const add=(image:string,name:string,event:string,origin:string,baseScore:number)=>{
  const imageUrl=safeUrl(image,pageUrl),eventUrl=safeUrl(event,pageUrl);if(!imageUrl||!eventUrl)return;
  const normalized=clean(name);const match=target&&normalized===target?60:words.length&&words.every(w=>normalized.includes(w))?45:0;
  if(target&&!match)return;
  candidates.push({imageUrl,eventUrl,eventName:name,origin,score:baseScore+match});
 };
 for(const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  try{const data=JSON.parse(m[1]);const visit=(item:any)=>{if(Array.isArray(item)){item.forEach(visit);return}if(!item||typeof item!=='object')return;if(item['@graph'])visit(item['@graph']);if(item['@type']){
   const types=Array.isArray(item['@type'])?item['@type']:[item['@type']];if(types.some((t:any)=>String(t).toLowerCase().endsWith('event'))){const image=typeof item.image==='string'?item.image:Array.isArray(item.image)?(typeof item.image[0]==='string'?item.image[0]:item.image[0]?.url):item.image?.url;if(image)add(image,String(item.name||''),String(item.url||pageUrl),'event-jsonld',90)}}};visit(data)}catch{}
 }
 // Only trust social metadata when this page itself is the named event, not an event index.
 const title=html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]||'';
 if(target&&clean(title).includes(target)){
  const og=html.match(/<meta\b(?=[^>]*(?:property|name)=["'](?:og:image|twitter:image)["'])(?=[^>]*content=["']([^"']+)["'])[^>]*>/i)?.[1];
  if(og)add(og,eventName,pageUrl,'event-social-image',70);
 }
 // Event images on listing pages must have an exact event-related alt or title.
 for(const m of html.matchAll(/<img\b[^>]*>/gi)){
  const tag=m[0],alt=tag.match(/\b(?:alt|title)=["']([^"']+)["']/i)?.[1]||'';
  if(!target||!clean(alt).includes(target))continue;
  const src=tag.match(/\b(?:src|data-src)=["']([^"']+)["']/i)?.[1];
  const set=tag.match(/\bsrcset=["']([^"']+)["']/i)?.[1];
  const largest=set?.split(',').map(x=>{const p=x.trim().split(/\s+/);return {url:p[0],width:parseInt(p[1])||0}}).sort((a,b)=>b.width-a.width)[0]?.url;
  if(largest||src)add(largest||src!,alt,pageUrl,'labelled-image',35);
 }
 const unique=new Map<string,typeof candidates[number]>();for(const candidate of candidates.sort((a,b)=>b.score-a.score)){if(!unique.has(candidate.imageUrl))unique.set(candidate.imageUrl,candidate)}const distinct=[...unique.values()];
 const best=distinct[0];return {success:!!best,reviewRequired:!best||best.score<120,sourcePage:pageUrl,selected:best||null,candidates:distinct.slice(0,40)};
}
Deno.serve(async req=>{
 try{
  const b=createClientFromRequest(req),user=await b.auth.me();
  const body=await req.json().catch(()=>({}));
  if(!user)return Response.json({error:'Authentication required'},{status:401});
  if(user.role!=='admin'){
   const slug=String(body.listingSlug||'').trim();
   if(!slug||slug.length>180)return Response.json({error:'Directory listing access required'},{status:403});
   const rows=await b.asServiceRole.entities.DirectoryListingAccess.filter({listing_slug:slug,user_id:user.id,status:'active'},'-granted_at',10);
   if(!rows?.length)return Response.json({error:'Directory listing access required'},{status:403});
  }
const url=safeUrl(String(body.eventUrl||''),'https://pickleballireland.ie/');
  if(!url)return Response.json({error:'Event page domain not approved'},{status:400});
  const name=String(body.eventName||'').trim();if(name.length>160)return Response.json({error:'Event name too long'},{status:400});
  const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!response.ok)return Response.json({error:'Event page unavailable'},{status:422});
  if(Number(response.headers.get('content-length')||0)>2_000_000)return Response.json({error:'Event page too large'},{status:413});
  const html=await response.text();if(html.length>2_000_000)return Response.json({error:'Event page too large'},{status:413});
  const result=discover(html,url,name);if(body.action==='list'){
    const discovered=result.candidates.filter(c=>c.origin==='event-jsonld').slice(0,30);
    const existing=await b.asServiceRole.entities.Tournament.list('-created_date',500);
    const normalizeUrl=(v:string)=>{try{const u=new URL(v);return u.hostname.toLowerCase().replace(/^www\./,'')+u.pathname.replace(/\/$/,'').toLowerCase()}catch{return ''}};
    const events=discovered.map(c=>{
      const match=existing.find((t:any)=>normalizeUrl(t.event_source_url)&&normalizeUrl(t.event_source_url)===normalizeUrl(c.eventUrl))
        ||existing.find((t:any)=>clean(t.name||'')===clean(c.eventName));
      return {name:c.eventName,eventUrl:c.eventUrl,imageUrl:c.imageUrl,exists:!!match,existingId:match?.id||null,existingName:match?.name||null};
    });
    return Response.json({success:true,events});
   }return Response.json(result);
 }catch(e){console.error('event poster discovery',e);return Response.json({error:'Event poster discovery failed'},{status:422})}
});
