import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, Medal, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';

const podiumColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
const formats=['Overall','KOTC','Interclub','Tournival','Tournament'];

function projectFormat(row,format){
  if(format==='Overall')return row;
  const f=row.formats?.[format];
  if(!f)return null;
  return {...row,...f,events_played:f.events_played||0,score_difference:f.score_difference||0,win_rate:f.win_rate||0};
}

export default function Leaderboard() {
  const [search,setSearch]=useState('');
  const [scope,setScope]=useState('season');
  const [format,setFormat]=useState('Overall');
  const {data,isLoading,error}=useQuery({
    queryKey:['performance-analytics-club'],
    queryFn:async()=>{const res=await base44.functions.invoke('performanceAnalytics',{action:'club'});if(res.data?.error)throw new Error(res.data.error);return res.data;},
    refetchOnWindowFocus:true,
    staleTime:30_000,
  });
  const rows=useMemo(()=>{
    const base=scope==='all'?(data?.all_time_rows||[]):(data?.rows||[]);
    return base.map(row=>projectFormat(row,format)).filter(Boolean).filter(row=>!search||String(row.full_name||'').toLowerCase().includes(search.toLowerCase())).sort((a,b)=>Number(b.leaderboard_points||0)-Number(a.leaderboard_points||0)||Number(b.wins||0)-Number(a.wins||0)||Number(b.score_difference||0)-Number(a.score_difference||0)||Number(b.points_for||0)-Number(a.points_for||0)||String(a.full_name).localeCompare(String(b.full_name))).map((r,i)=>({...r,display_rank:i+1}));
  },[data,scope,format,search]);
  const top3=rows.slice(0,3),top3Ids=new Set(top3.map(r=>r.player_id)),rest=rows.filter(r=>!top3Ids.has(r.player_id));
  return <div className="space-y-6">
    <PageHeader title="Club Leaderboard" description="One RallyHub performance record across eligible club competitions" />
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground"><div className="flex items-center gap-2"><Crown className="w-4 h-4 text-primary"/><span>2 points for a win, 1 for a genuine draw, 0 for a loss. Ranking ties are separated by wins, score difference, then points scored.</span></div></div>

    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1">{formats.map(item=><Button key={item} size="sm" variant={format===item?'default':'outline'} onClick={()=>setFormat(item)} className="shrink-0">{item}</Button>)}</div>
      <div className="flex gap-2 lg:ml-auto"><Button size="sm" variant={scope==='season'?'default':'outline'} onClick={()=>setScope('season')}>Season {data?.season?.label||''}</Button><Button size="sm" variant={scope==='all'?'default':'outline'} onClick={()=>setScope('all')}>All time</Button></div>
    </div>

    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><Input placeholder="Search club leaderboard..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 bg-secondary border-border"/></div>
    {isLoading&&<div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading club leaderboard…</div>}
    {error&&<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Could not load the leaderboard: {error.message}</div>}
    {!isLoading&&!error&&rows.length===0&&<div className="glass rounded-xl p-8 text-center"><Crown className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2"/><p className="font-semibold">No eligible results in this view yet</p><p className="text-xs text-muted-foreground mt-1">Completed competitions marked to count toward the club leaderboard will appear here.</p></div>}

    {top3.length>0&&<div className="flex items-end justify-center gap-4 py-4">{[1,0,2].map(idx=>{const row=top3[idx];if(!row)return <div key={idx} className="w-24"/>;const height=idx===0?'h-28':idx===1?'h-20':'h-16';return <motion.div key={row.player_id} initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:.15+idx*.08}} className="flex flex-col items-center"><Link to={`/app/players/${row.player_id}`} className="flex flex-col items-center group"><Medal className={cn('w-6 h-6 mb-2',podiumColors[idx])}/><div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-2"><span className="text-lg font-bold text-primary">{(row.full_name||'P')[0]}</span></div><p className="text-xs font-semibold text-foreground text-center group-hover:text-primary transition-colors max-w-28">{row.full_name}</p><p className="text-sm font-black font-mono text-primary">{row.leaderboard_points} pts</p></Link><div className={cn('w-20 rounded-t-lg bg-primary/10 mt-2',height)}/></motion.div>})}</div>}

    {rows.length>0&&<div className="glass rounded-xl overflow-hidden">
      <div className="grid grid-cols-[2.5rem_1fr_3.5rem_4.5rem] sm:grid-cols-[3rem_1fr_4rem_4rem_4rem_5rem_5rem_5rem_5rem] items-center px-3 sm:px-4 py-2.5 bg-secondary text-[10px] sm:text-xs font-medium text-muted-foreground"><span>#</span><span>Player</span><span className="text-right hidden sm:block">MP</span><span className="text-right hidden sm:block">W</span><span className="text-right hidden sm:block">L</span><span className="text-right">Pts</span><span className="text-right hidden sm:block">PF</span><span className="text-right hidden sm:block">PA</span><span className="text-right">Diff</span></div>
      {rest.map((row,i)=><motion.div key={row.player_id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*.015}}><Link to={`/app/players/${row.player_id}`} className="grid grid-cols-[2.5rem_1fr_3.5rem_4.5rem] sm:grid-cols-[3rem_1fr_4rem_4rem_4rem_5rem_5rem_5rem_5rem] items-center px-3 sm:px-4 py-3 border-t border-border hover:bg-secondary/50 transition-colors"><span className="text-sm font-bold text-muted-foreground">{row.display_rank}</span><div className="min-w-0"><p className="text-sm font-medium text-foreground truncate">{row.full_name}</p><p className="text-[10px] text-muted-foreground truncate">{row.matches_played} matches · {Math.round(Number(row.win_rate||0)*100)}% wins</p></div><span className="text-sm text-right hidden sm:block">{row.matches_played}</span><span className="text-sm text-right hidden sm:block">{row.wins}</span><span className="text-sm text-right hidden sm:block">{row.losses}</span><span className="text-sm font-bold text-primary text-right">{row.leaderboard_points}</span><span className="text-sm text-right hidden sm:block">{row.points_for}</span><span className="text-sm text-right hidden sm:block">{row.points_against}</span><span className="text-sm text-right">{Number(row.score_difference)>0?'+':''}{row.score_difference}</span></Link></motion.div>)}
    </div>}
  </div>;
}
