import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, CheckCircle2, ExternalLink, RefreshCw, Search, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const num=value=>new Intl.NumberFormat('en-IE').format(Number(value||0));
const duration=seconds=>{
  const value=Math.max(0,Number(seconds||0));
  const mins=Math.floor(value/60),secs=Math.round(value%60);
  return mins?`${mins}m ${secs}s`:`${secs}s`;
};
const metric=(report,name)=>{
  const headers=report?.metricHeaders||[];
  const index=headers.findIndex(item=>item.name===name);
  if(index<0)return 0;
  return Number(report?.rows?.[0]?.metricValues?.[index]?.value||0);
};
const reportRows=(report,dimensionName,metricName)=>{
  const dimensionIndex=(report?.dimensionHeaders||[]).findIndex(item=>item.name===dimensionName);
  const metricIndex=(report?.metricHeaders||[]).findIndex(item=>item.name===metricName);
  if(dimensionIndex<0||metricIndex<0)return [];
  return (report?.rows||[]).map(row=>({label:row.dimensionValues?.[dimensionIndex]?.value||'Unknown',value:Number(row.metricValues?.[metricIndex]?.value||0)}));
};

function Stat({label,value,note}){
  return <div className="glass rounded-xl p-4 min-h-[112px]"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-2 text-2xl sm:text-3xl font-black text-foreground">{value}</p>{note&&<p className="mt-1 text-[11px] text-muted-foreground">{note}</p>}</div>;
}

function Table({title,rows,columns}){
  return <div className="glass rounded-xl p-4 sm:p-5 overflow-hidden">
    <h3 className="font-bold text-foreground">{title}</h3>
    <div className="mt-3 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs text-muted-foreground">{columns.map(c=><th key={c.key} className="py-2 pr-3 font-semibold">{c.label}</th>)}</tr></thead><tbody>{rows?.length?rows.map((row,index)=><tr key={row.key||row.slug||row.term||row.label||index} className="border-b border-border/50 last:border-0">{columns.map(c=><td key={c.key} className="py-2.5 pr-3">{c.render?c.render(row):row[c.key]??'—'}</td>)}</tr>):<tr><td colSpan={columns.length} className="py-6 text-center text-sm text-muted-foreground">No data yet.</td></tr>}</tbody></table></div>
  </div>;
}

export default function DirectoryAnalyticsDashboard(){
  const [days,setDays]=useState(30);
  const {data={},isLoading,error,refetch,isFetching}=useQuery({
    queryKey:['directory-site-analytics',days],
    queryFn:async()=>{
      const response=await base44.functions.invoke('siteAnalytics',{action:'admin_dashboard',days});
      if(response.data?.error)throw new Error(response.data.error);
      return response.data||{};
    },
    staleTime:5*60*1000,
    refetchOnWindowFocus:false
  });
  const first=data.firstParty||{};
  const google=data.google||{};
  const ga=data.ga4||null;
  const sc=data.searchConsole||null;
  const gaOverview=ga?.overview;
  const googleUsers=metric(gaOverview,'activeUsers');
  const googleSessions=metric(gaOverview,'sessions');
  const googleViews=metric(gaOverview,'screenPageViews');
  const googleEngaged=metric(gaOverview,'engagedSessions');
  const googleAvgSession=metric(gaOverview,'averageSessionDuration');
  const topGaPages=reportRows(ga?.pages,'pagePath','screenPageViews').filter(row=>row.label.startsWith('/directory')||row.label.startsWith('/pickleball-')).slice(0,12);
  const channels=reportRows(ga?.channels,'sessionDefaultChannelGroup','sessions').slice(0,10);
  const searchRows=useMemo(()=>((sc?.queries?.rows||[]).map(row=>({query:row.keys?.[0]||'',clicks:row.clicks||0,impressions:row.impressions||0,ctr:row.ctr||0,position:row.position||0})).slice(0,15)),[sc]);
  const searchPages=useMemo(()=>((sc?.pages?.rows||[]).map(row=>({page:row.keys?.[0]||'',clicks:row.clicks||0,impressions:row.impressions||0,ctr:row.ctr||0,position:row.position||0})).filter(row=>row.page.includes('/directory')||row.page.includes('/pickleball-')).slice(0,15)),[sc]);

  if(isLoading)return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading Directory analytics…</div>;
  if(error)return <div className="glass rounded-xl p-6"><p className="text-sm text-destructive">{error.message||'Could not load analytics.'}</p><Button className="mt-3" variant="outline" onClick={()=>refetch()}>Try again</Button></div>;

  return <div className="space-y-5">
    <div className="glass rounded-xl p-4 sm:p-5 flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Directory intelligence</p>
        <h2 className="mt-1 text-xl font-black text-foreground">Audience, discovery and commercial proof</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">RallyHub first-party analytics measures Directory behaviour after optional analytics consent. GA4 provides independently recognised audience measurement; Search Console shows how people discover RallyHub through Google.</p>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        {[7,30,90].map(value=><Button key={value} size="sm" variant={days===value?'default':'outline'} onClick={()=>setDays(value)}>{value} days</Button>)}
        <Button size="sm" variant="outline" onClick={()=>refetch()} disabled={isFetching} className="gap-1.5"><RefreshCw className={`w-3.5 h-3.5 ${isFetching?'animate-spin':''}`}/>Refresh</Button>
      </div>
    </div>

    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <Stat label="Measured Directory users" value={num(first.measuredUsers)} note="RallyHub first-party, consented visitors" />
      <Stat label="Returning visitor rate" value={`${Number(first.returningRate||0).toFixed(1)}%`} note={`${num(first.returningUsers)} measured returning users`} />
      <Stat label="Directory page views" value={num(first.pageViews)} note={`${num(first.sessions)} measured sessions`} />
      <Stat label="Average engaged time" value={duration(first.averageEngagementSeconds)} note="First-party time on public pages" />
    </div>

    <div className="grid lg:grid-cols-3 gap-3">
      <div className="glass rounded-xl p-4 sm:p-5 lg:col-span-2">
        <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold">Traffic trend</h3><p className="text-xs text-muted-foreground">Measured users and page views by day</p></div><BarChart3 className="w-5 h-5 text-primary"/></div>
        <div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={first.daily||[]}><CartesianGrid strokeDasharray="3 3" opacity={0.2}/><XAxis dataKey="date" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip/><Line type="monotone" dataKey="users" name="Users" stroke="currentColor" dot={false}/><Line type="monotone" dataKey="views" name="Views" stroke="currentColor" strokeDasharray="5 4" dot={false}/></LineChart></ResponsiveContainer></div>
      </div>
      <div className="glass rounded-xl p-4 sm:p-5">
        <h3 className="font-bold">Useful actions</h3><p className="text-xs text-muted-foreground">Signals that a visit led somewhere</p>
        <div className="mt-4 space-y-3 text-sm">
          {[['Player Network signups',first.actions?.playerSignups],['Club contact actions',first.actions?.contactActions],['Directory searches',first.actions?.searches],['Zero-result searches',first.actions?.zeroResults],['Club shares',first.actions?.clubShares],['Player shares',first.actions?.playerShares]].map(([label,value])=><div key={label} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0"><span className="text-muted-foreground">{label}</span><strong>{num(value)}</strong></div>)}
        </div>
      </div>
    </div>

    <div className="grid xl:grid-cols-2 gap-4">
      <Table title="Most viewed clubs" rows={first.clubs||[]} columns={[{key:'name',label:'Club'},{key:'county',label:'County'},{key:'views',label:'Views',render:r=>num(r.views)},{key:'visitors',label:'Users',render:r=>num(r.visitors)},{key:'actions',label:'Actions',render:r=>num(r.actions)}]} />
      <Table title="Most viewed venues" rows={first.venues||[]} columns={[{key:'name',label:'Venue'},{key:'clubName',label:'Club'},{key:'county',label:'County'},{key:'views',label:'Views',render:r=>num(r.views)},{key:'visitors',label:'Users',render:r=>num(r.visitors)}]} />
      <Table title="Top Directory searches" rows={first.searches||[]} columns={[{key:'term',label:'Search'},{key:'count',label:'Searches',render:r=>num(r.count)}]} />
      <Table title="Searches with no result" rows={first.zeroResults||[]} columns={[{key:'term',label:'Missing demand'},{key:'count',label:'Searches',render:r=>num(r.count)}]} />
    </div>

    <div className="glass rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Google Analytics 4</p><h3 className="text-lg font-bold">Independent audience measurement</h3></div>
        <Badge variant="outline" className={google.ga4Connected?'border-green-400/40 text-green-500':'border-amber-400/40 text-amber-500'}>{google.ga4Connected?'Google account connected':'Connection required'}</Badge>
      </div>
      {google.ga4Connected&&google.propertyId ? <>
        <p className="mt-2 text-xs text-muted-foreground">Property: {google.propertyName||google.propertyId}{google.measurementId?` · ${google.measurementId}`:''}</p>
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-3"><Stat label="GA4 active users" value={num(googleUsers)}/><Stat label="GA4 sessions" value={num(googleSessions)}/><Stat label="GA4 page views" value={num(googleViews)}/><Stat label="Engaged sessions" value={num(googleEngaged)}/><Stat label="Avg session" value={duration(googleAvgSession)}/></div>
        <div className="mt-4 grid xl:grid-cols-2 gap-4">
          <Table title="Top Directory pages in GA4" rows={topGaPages} columns={[{key:'label',label:'Page'},{key:'value',label:'Views',render:r=>num(r.value)}]} />
          <div className="glass rounded-xl p-4"><h3 className="font-bold">Traffic channels</h3><div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={channels} layout="vertical"><CartesianGrid strokeDasharray="3 3" opacity={0.2}/><XAxis type="number" tick={{fontSize:10}}/><YAxis type="category" dataKey="label" width={110} tick={{fontSize:10}}/><Tooltip/><Bar dataKey="value" name="Sessions" fill="currentColor"/></BarChart></ResponsiveContainer></div></div>
        </div>
      </> : <p className="mt-3 text-sm text-muted-foreground">The dashboard is ready for GA4. Connect the RallyHub Google Analytics account and create/select the rallyhub.ie GA4 property; the property and Measurement ID are discovered automatically.</p>}
      {google.ga4Error&&<p className="mt-2 text-xs text-destructive">GA4 connection note: {google.ga4Error}</p>}
    </div>

    <div className="glass rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Google Search Console</p><h3 className="text-lg font-bold">Search visibility and SEO demand</h3></div><Badge variant="outline" className={google.searchConsoleConnected?'border-green-400/40 text-green-500':'border-amber-400/40 text-amber-500'}>{google.searchConsoleConnected?'Google account connected':'Connection required'}</Badge></div>
      {google.searchConsoleConnected&&google.searchConsoleSite ? <div className="mt-4 grid xl:grid-cols-2 gap-4">
        <Table title="Google searches finding RallyHub" rows={searchRows} columns={[{key:'query',label:'Query'},{key:'clicks',label:'Clicks',render:r=>num(r.clicks)},{key:'impressions',label:'Impressions',render:r=>num(r.impressions)},{key:'position',label:'Avg position',render:r=>Number(r.position||0).toFixed(1)}]} />
        <Table title="Directory pages in Google Search" rows={searchPages} columns={[{key:'page',label:'Page'},{key:'clicks',label:'Clicks',render:r=>num(r.clicks)},{key:'impressions',label:'Impressions',render:r=>num(r.impressions)},{key:'position',label:'Avg position',render:r=>Number(r.position||0).toFixed(1)}]} />
      </div> : <p className="mt-3 text-sm text-muted-foreground">The Search Console report is ready. Connect the RallyHub Google Search Console account and verify rallyhub.ie; RallyHub will then show search queries, impressions, clicks and average rankings here.</p>}
      {google.searchConsoleError&&<p className="mt-2 text-xs text-destructive">Search Console connection note: {google.searchConsoleError}</p>}
    </div>

    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs leading-5 text-muted-foreground">
      <strong className="text-foreground">Commercial interpretation:</strong> use GA4 for externally recognisable audience size, Search Console for organic discovery, and RallyHub first-party events for sport-specific proof such as which clubs/venues people viewed, what they searched for, and whether they contacted or shared a club. {data.sampleLimited?'The first-party report reached its current 20,000-event dashboard cap; longer-term rollups should be enabled as traffic grows.':''}
    </div>
  </div>;
}
