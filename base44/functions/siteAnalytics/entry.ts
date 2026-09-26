import { createClientFromRequest } from 'npm:@base44/sdk@0.8.51';

const EVENT_NAMES = new Set([
  'page_view','page_engagement','directory_view','directory_search','directory_zero_result','county_filter','day_filter',
  'club_profile_view','venue_view','club_whatsapp_click','club_email_click','club_website_click','map_click',
  'share_club','share_player','player_updates_signup','add_missing_club','claim_club_start','claim_club_complete',
  'event_view','event_register_click'
]);
const clean=(value:any,max=500)=>String(value??'').trim().slice(0,max);
const safeJson=(value:any)=>{ try{return JSON.stringify(value??{}).slice(0,4000)}catch{return '{}'} };
const siteHost='rallyhub.ie';
let analyticsDiscoveryCache:any=null;
let analyticsDiscoveryAt=0;

async function googleConnection(base44:any,type:string){
  try { return await base44.asServiceRole.connectors.getConnection(type); } catch { return null; }
}

async function discoverGoogle(base44:any){
  if(analyticsDiscoveryCache && Date.now()-analyticsDiscoveryAt < 15*60*1000) return analyticsDiscoveryCache;
  const out:any={ga4Connected:false,searchConsoleConnected:false,propertyId:null,measurementId:null,propertyName:null,searchConsoleSite:null};

  const ga=await googleConnection(base44,'google_analytics');
  if(ga?.accessToken){
    out.ga4Connected=true;
    try{
      const summaryRes=await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200',{headers:{Authorization:`Bearer ${ga.accessToken}`}});
      if(summaryRes.ok){
        const summary=await summaryRes.json();
        const properties=(summary.accountSummaries||[]).flatMap((account:any)=>account.propertySummaries||[]);
        let fallback:any=null;
        for(const property of properties.slice(0,50)){
          fallback ||= property;
          const propertyId=String(property.property||'').replace('properties/','');
          if(!propertyId) continue;
          try{
            const streamsRes=await fetch(`https://analyticsadmin.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}/dataStreams?pageSize=50`,{headers:{Authorization:`Bearer ${ga.accessToken}`}});
            if(!streamsRes.ok) continue;
            const streams=await streamsRes.json();
            const web=(streams.dataStreams||[]).find((stream:any)=>String(stream.webStreamData?.defaultUri||'').toLowerCase().includes(siteHost));
            if(web){
              out.propertyId=propertyId;
              out.propertyName=property.displayName||null;
              out.measurementId=web.webStreamData?.measurementId||null;
              break;
            }
          }catch{}
        }
        if(!out.propertyId && properties.length===1 && fallback){
          out.propertyId=String(fallback.property||'').replace('properties/','')||null;
          out.propertyName=fallback.displayName||null;
          if(out.propertyId){
            try{
              const streamsRes=await fetch(`https://analyticsadmin.googleapis.com/v1beta/properties/${encodeURIComponent(out.propertyId)}/dataStreams?pageSize=50`,{headers:{Authorization:`Bearer ${ga.accessToken}`}});
              if(streamsRes.ok){
                const streams=await streamsRes.json();
                const web=(streams.dataStreams||[]).find((stream:any)=>stream.webStreamData?.measurementId);
                out.measurementId=web?.webStreamData?.measurementId||null;
              }
            }catch{}
          }
        }
      }
    }catch{}
  }

  const sc=await googleConnection(base44,'google_search_console');
  if(sc?.accessToken){
    out.searchConsoleConnected=true;
    try{
      const sitesRes=await fetch('https://www.googleapis.com/webmasters/v3/sites',{headers:{Authorization:`Bearer ${sc.accessToken}`}});
      if(sitesRes.ok){
        const sites=await sitesRes.json();
        const rows=sites.siteEntry||[];
        const exact=rows.find((row:any)=>['https://rallyhub.ie/','http://rallyhub.ie/','sc-domain:rallyhub.ie'].includes(String(row.siteUrl||'').toLowerCase()))
          || rows.find((row:any)=>String(row.siteUrl||'').toLowerCase().includes('rallyhub.ie'));
        out.searchConsoleSite=exact?.siteUrl||null;
      }
    }catch{}
  }
  analyticsDiscoveryCache=out;
  analyticsDiscoveryAt=Date.now();
  return out;
}

async function allRecentEvents(base44:any,sinceIso:string,maxRows=20000){
  const items:any[]=[];
  let cursor:any=null;
  do{
    const page=await base44.asServiceRole.entities.DirectoryAnalyticsEvent.filter(
      {occurred_at:{$gte:sinceIso}},
      {sort:'-occurred_at',limit:1000,cursor}
    );
    items.push(...(page.items||[]));
    cursor=page.next_cursor;
    if(items.length>=maxRows) break;
  }while(cursor);
  return items.slice(0,maxRows);
}

function summarizeFirstParty(events:any[]){
  const pageViews=events.filter(e=>e.event_name==='page_view');
  const visitors=new Set(pageViews.map(e=>e.visitor_id).filter(Boolean));
  const sessions=new Set(pageViews.map(e=>e.session_id).filter(Boolean));
  const returningVisitors=new Set(pageViews.filter(e=>e.is_returning).map(e=>e.visitor_id).filter(Boolean));
  const engagement=events.filter(e=>e.event_name==='page_engagement').reduce((sum,e)=>sum+Number(e.engagement_seconds||0),0);
  const byDay=new Map<string,{date:string,views:number,visitors:Set<string>}>();
  for(const row of pageViews){
    const date=String(row.occurred_at||'').slice(0,10); if(!date)continue;
    if(!byDay.has(date))byDay.set(date,{date,views:0,visitors:new Set()});
    const item=byDay.get(date)!; item.views++; if(row.visitor_id)item.visitors.add(row.visitor_id);
  }
  const clubMap=new Map<string,any>();
  for(const row of events.filter(e=>e.club_slug)){
    const key=row.club_slug;
    if(!clubMap.has(key))clubMap.set(key,{slug:key,name:row.club_name||key,county:row.county||'',views:0,actions:0,visitors:new Set()});
    const item=clubMap.get(key); if(row.event_name==='club_profile_view'||(row.event_name==='page_view'&&String(row.path||'').startsWith('/directory/')))item.views++;
    if(['club_whatsapp_click','club_email_click','club_website_click','map_click','share_club'].includes(row.event_name))item.actions++;
    if(row.visitor_id)item.visitors.add(row.visitor_id);
  }
  const venueMap=new Map<string,any>();
  for(const row of events.filter(e=>e.venue_id)){
    const key=`${row.club_slug||''}:${row.venue_id}`;
    if(!venueMap.has(key))venueMap.set(key,{key,name:row.venue_name||row.venue_id,clubName:row.club_name||'',county:row.county||'',views:0,visitors:new Set()});
    const item=venueMap.get(key); if(row.event_name==='venue_view'||row.event_name==='page_view')item.views++; if(row.visitor_id)item.visitors.add(row.visitor_id);
  }
  const searchMap=new Map<string,any>();
  for(const row of events.filter(e=>e.event_name==='directory_search'&&e.search_term)){
    const key=String(row.search_term).toLowerCase(); if(!searchMap.has(key))searchMap.set(key,{term:row.search_term,count:0}); searchMap.get(key).count++;
  }
  const zeroMap=new Map<string,any>();
  for(const row of events.filter(e=>e.event_name==='directory_zero_result'&&e.search_term)){
    const key=String(row.search_term).toLowerCase(); if(!zeroMap.has(key))zeroMap.set(key,{term:row.search_term,count:0}); zeroMap.get(key).count++;
  }
  const sources=new Map<string,number>();
  for(const row of pageViews){const source=row.traffic_source||'Direct / unknown';sources.set(source,(sources.get(source)||0)+1)}
  const top=(map:Map<string,any>,mapper:(v:any)=>any,limit=20)=>[...map.values()].map(mapper).sort((a:any,b:any)=>(b.views??b.count??0)-(a.views??a.count??0)).slice(0,limit);
  return {
    measuredUsers:visitors.size,sessions:sessions.size,pageViews:pageViews.length,returningUsers:returningVisitors.size,
    returningRate:visitors.size?Math.round(returningVisitors.size/visitors.size*1000)/10:0,
    averageEngagementSeconds:pageViews.length?Math.round(engagement/pageViews.length):0,
    daily:[...byDay.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(v=>({date:v.date,views:v.views,users:v.visitors.size})),
    clubs:top(clubMap,v=>({...v,visitors:v.visitors.size})),venues:top(venueMap,v=>({...v,visitors:v.visitors.size})),
    searches:top(searchMap,v=>v),zeroResults:top(zeroMap,v=>v),
    sources:[...sources.entries()].map(([source,count])=>({source,count})).sort((a,b)=>b.count-a.count).slice(0,15),
    actions:{
      playerSignups:events.filter(e=>e.event_name==='player_updates_signup').length,
      clubShares:events.filter(e=>e.event_name==='share_club').length,
      playerShares:events.filter(e=>e.event_name==='share_player').length,
      contactActions:events.filter(e=>['club_whatsapp_click','club_email_click','club_website_click'].includes(e.event_name)).length,
      searches:events.filter(e=>e.event_name==='directory_search').length,
      zeroResults:events.filter(e=>e.event_name==='directory_zero_result').length,
    }
  };
}

async function gaReport(token:string,propertyId:string,body:any){
  const res=await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`,{
    method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body)
  });
  if(!res.ok) throw new Error(`GA4 report ${res.status}`);
  return await res.json();
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action,80);

    if(action==='public_config'){
      const google=await discoverGoogle(base44);
      return Response.json({measurementId:google.measurementId||null,ga4Configured:!!google.measurementId,consentVersion:'analytics-v1'});
    }

    if(action==='public_track'){
      if(body.website) return Response.json({success:true});
      const eventName=clean(body.eventName,80);
      if(!EVENT_NAMES.has(eventName)) return Response.json({error:'Unsupported analytics event'},{status:400});
      const visitorId=clean(body.visitorId,120),sessionId=clean(body.sessionId,120),path=clean(body.path,500);
      if(!visitorId||!sessionId||!path) return Response.json({error:'Analytics identifiers required'},{status:400});
      await base44.asServiceRole.entities.DirectoryAnalyticsEvent.create({
        event_name:eventName,visitor_id:visitorId,session_id:sessionId,is_returning:body.isReturning===true,
        path,page_title:clean(body.pageTitle,240)||undefined,referrer_domain:clean(body.referrerDomain,240)||undefined,
        traffic_source:clean(body.trafficSource,240)||undefined,club_slug:clean(body.clubSlug,180)||undefined,
        club_name:clean(body.clubName,240)||undefined,county:clean(body.county,80)||undefined,
        venue_id:clean(body.venueId,180)||undefined,venue_name:clean(body.venueName,240)||undefined,
        search_term:clean(body.searchTerm,240)||undefined,engagement_seconds:Number.isFinite(Number(body.engagementSeconds))?Math.max(0,Math.min(3600,Number(body.engagementSeconds))):undefined,
        metadata_json:safeJson(body.metadata),consent_version:clean(body.consentVersion,80)||'analytics-v1',occurred_at:new Date().toISOString()
      });
      return Response.json({success:true});
    }

    const user=await base44.auth.me();
    if(!user||user.role!=='admin') return Response.json({error:'Admin access required'},{status:403});

    if(action==='admin_dashboard'){
      const days=Math.max(7,Math.min(90,Number(body.days||30)));
      const since=new Date(Date.now()-days*86400000).toISOString();
      const events=await allRecentEvents(base44,since,20000);
      const firstParty=summarizeFirstParty(events);
      const google=await discoverGoogle(base44);
      const response:any={success:true,days,firstParty,google:{...google},ga4:null,searchConsole:null,sampleLimited:events.length>=20000};

      if(google.ga4Connected&&google.propertyId){
        try{
          const conn=await googleConnection(base44,'google_analytics');
          if(conn?.accessToken){
            const overview=await gaReport(conn.accessToken,google.propertyId,{
              dateRanges:[{startDate:`${days}daysAgo`,endDate:'today'}],
              metrics:[{name:'activeUsers'},{name:'newUsers'},{name:'sessions'},{name:'engagedSessions'},{name:'averageSessionDuration'},{name:'screenPageViews'}]
            });
            const pages=await gaReport(conn.accessToken,google.propertyId,{
              dateRanges:[{startDate:`${days}daysAgo`,endDate:'today'}],dimensions:[{name:'pagePath'}],metrics:[{name:'activeUsers'},{name:'screenPageViews'}],limit:30,orderBys:[{metric:{metricName:'screenPageViews'},desc:true}]
            });
            const channels=await gaReport(conn.accessToken,google.propertyId,{
              dateRanges:[{startDate:`${days}daysAgo`,endDate:'today'}],dimensions:[{name:'sessionDefaultChannelGroup'}],metrics:[{name:'sessions'},{name:'activeUsers'}],limit:20,orderBys:[{metric:{metricName:'sessions'},desc:true}]
            });
            response.ga4={overview,pages,channels};
          }
        }catch(error){response.google.ga4Error=String(error?.message||error)}
      }

      if(google.searchConsoleConnected&&google.searchConsoleSite){
        try{
          const conn=await googleConnection(base44,'google_search_console');
          if(conn?.accessToken){
            const end=new Date(Date.now()-86400000).toISOString().slice(0,10);
            const start=new Date(Date.now()-(days+1)*86400000).toISOString().slice(0,10);
            const query=async(dimensions:string[])=>{
              const res=await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(google.searchConsoleSite)}/searchAnalytics/query`,{
                method:'POST',headers:{Authorization:`Bearer ${conn.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({startDate:start,endDate:end,dimensions,rowLimit:50})
              });
              if(!res.ok) throw new Error(`Search Console report ${res.status}`); return await res.json();
            };
            response.searchConsole={queries:await query(['query']),pages:await query(['page'])};
          }
        }catch(error){response.google.searchConsoleError=String(error?.message||error)}
      }
      return Response.json(response);
    }

    if(action==='admin_refresh_google'){
      analyticsDiscoveryCache=null; analyticsDiscoveryAt=0;
      return Response.json({success:true,google:await discoverGoogle(base44)});
    }

    return Response.json({error:'Unknown action'},{status:400});
  }catch(error){
    return Response.json({error:String(error?.message||error)},{status:500});
  }
});
