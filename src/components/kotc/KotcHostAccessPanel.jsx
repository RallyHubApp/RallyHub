import React,{useEffect,useMemo,useState} from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Check,ChevronDown,ChevronUp,Copy,ExternalLink,Link2,Loader2,Save,ShieldCheck,UserPlus,X } from 'lucide-react';
import KotcBroadcastPanel from './KotcBroadcastPanel';
import KotcPlayerVerificationPanel from './KotcPlayerVerificationPanel';

function errorMessage(error){return error?.response?.data?.error||error?.data?.error||error?.message||'KOTC access action failed.';}
const TAB_OPTIONS=[
  ['live','Live'],['players','Players'],['rounds','Rounds'],['scores','Scores'],['leaderboard','Leaderboard'],['event_info','Event Info']
];
const DEFAULT_TABS=['live','players','rounds','leaderboard','event_info'];

export default function KotcHostAccessPanel({session,isAdmin,onScorerLinkReady}){
  const [open,setOpen]=useState(false);const [email,setEmail]=useState('');const [loading,setLoading]=useState(false);const [grants,setGrants]=useState([]);const [copied,setCopied]=useState('');const [playerUrl,setPlayerUrl]=useState('');const [share,setShare]=useState(null);const [visibleTabs,setVisibleTabs]=useState(DEFAULT_TABS);const [scoringAccess,setScoringAccess]=useState('read_only');const [settingsDirty,setSettingsDirty]=useState(false);
  const hostUrl=useMemo(()=>`${window.location.origin}/kotc-host/${session?.id||''}`,[session?.id]);
  const applyShare=(data)=>{const token=data?.token||data?.playerLink?.token;if(token)setPlayerUrl(`${window.location.origin}/kotc-live/${token}`);const tabs=data?.tabs||data?.playerLink?.tabs;if(Array.isArray(tabs)&&tabs.length)setVisibleTabs(tabs);const access=data?.scoring_access||data?.playerLink?.scoring_access;if(access)setScoringAccess(access);setShare(data?.playerLink||data||null);setSettingsDirty(false);};
  const load=async()=>{if(!session?.id)return;try{setLoading(true);const [linkRes,grantRes]=await Promise.all([base44.functions.invoke('kotcResultsShare',{action:'get_or_create',sessionId:session.id}),isAdmin?base44.functions.invoke('manageKotcSessionAccess',{action:'list',sessionId:session.id}):Promise.resolve({data:{grants:[]}})]);applyShare(linkRes.data||{});setGrants((grantRes.data?.grants||[]).filter(g=>g.status==='active'&&['session_host','assistant_host'].includes(g.role)));}catch(e){toast.error(errorMessage(e));}finally{setLoading(false);}};
  useEffect(()=>{if(open)load();},[open,session?.id,isAdmin]);
  if(!session?.id)return null;
  const copyText=async(url,label,key)=>{try{await navigator.clipboard.writeText(url);setCopied(key);setTimeout(()=>setCopied(''),1800);toast.success(`${label} copied`);}catch{window.prompt(`Copy ${label}:`,url);}};
  const toggleTab=(key)=>{setVisibleTabs(prev=>{const next=prev.includes(key)?prev.filter(x=>x!==key):[...prev,key];return next.length?next:prev;});setSettingsDirty(true);};
  const changeScoring=(value)=>{setScoringAccess(value);if(value==='verified_players'&&!visibleTabs.includes('scores'))setVisibleTabs(prev=>[...prev,'scores']);setSettingsDirty(true);};
  const saveSettings=async()=>{try{setLoading(true);const r=await base44.functions.invoke('kotcResultsShare',{action:'update_player_link',sessionId:session.id,visibleTabs,scoringAccess,identificationMode:'host_code'});applyShare(r.data||{});if(scoringAccess==='verified_players')onScorerLinkReady?.();toast.success('KOTC Player Link settings saved');}catch(e){toast.error(errorMessage(e));}finally{setLoading(false);}};
  const grant=async()=>{if(!email.trim())return;setLoading(true);try{const res=await base44.functions.invoke('manageKotcSessionAccess',{action:'grant',sessionId:session.id,email:email.trim(),role:'session_host'});if(res.data?.success){toast.success(`Session Host access granted to ${res.data.user?.full_name||res.data.user?.email||email}`);setEmail('');await load();}else toast.error(res.data?.error||'Could not grant Session Host access.');}catch(e){toast.error(errorMessage(e));}finally{setLoading(false);}};
  const revoke=async userId=>{setLoading(true);try{await base44.functions.invoke('manageKotcSessionAccess',{action:'revoke',sessionId:session.id,userId});toast.success('Session Host access revoked');await load();}catch(e){toast.error(errorMessage(e));}finally{setLoading(false);}};

  return <div className="glass rounded-xl p-3 sm:p-4 space-y-3 border border-primary/20">
    <button type="button" onClick={()=>setOpen(v=>!v)} className="w-full flex items-center justify-between gap-3 text-left">
      <div className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-primary mt-0.5"/><div><p className="font-semibold text-sm">Player Link, Broadcasts & Access</p><p className="text-xs text-muted-foreground mt-1">One KOTC Player Link evolves from sign-up through live rounds, scoring and final results.</p></div></div>{open?<ChevronUp className="w-5 h-5 shrink-0"/>:<ChevronDown className="w-5 h-5 shrink-0"/>}
    </button>
    {open&&<div className="pt-2 border-t border-border space-y-4">
      <section className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-3" data-testid="kotc-player-link-settings">
        <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold flex items-center gap-2"><Link2 className="w-4 h-4"/>KOTC Player Link</p><p className="text-[11px] text-muted-foreground mt-1">Send this one link to everybody. The visible tabs change as the event progresses; final results replace live scoring when the session finishes.</p></div><Badge variant="outline">ONE LINK</Badge></div>
        {playerUrl&&<div className="rounded-lg border bg-background/70 p-2"><p className="text-[10px] break-all text-muted-foreground">{playerUrl}</p><div className="grid grid-cols-2 gap-2 mt-2"><Button size="sm" variant="outline" onClick={()=>copyText(playerUrl,'KOTC Player Link','player')}>{copied==='player'?<Check className="w-3.5 h-3.5 mr-1"/>:<Copy className="w-3.5 h-3.5 mr-1"/>}{copied==='player'?'Copied':'Copy Player Link'}</Button><Button size="sm" variant="outline" onClick={()=>window.open(playerUrl,'_blank','noopener,noreferrer')}><ExternalLink className="w-3.5 h-3.5 mr-1"/>Preview</Button></div></div>}
        <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Tabs players can use</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{TAB_OPTIONS.map(([key,label])=><button key={key} type="button" onClick={()=>toggleTab(key)} className={`rounded-lg border px-3 py-2 text-xs font-semibold text-left ${visibleTabs.includes(key)?'border-primary bg-primary/10 text-primary':'border-border bg-background'}`}><span className="inline-block w-5">{visibleTabs.includes(key)?'✓':''}</span>{label}</button>)}</div><p className="text-[10px] text-muted-foreground mt-2">Results appears automatically when the KOTC finishes. Live only shows meaningful live content once a round exists.</p></div>
        <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Player scoring</p><Select value={scoringAccess} onValueChange={changeScoring}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="off">Off — no Scores tab</SelectItem><SelectItem value="read_only">Read-only scores</SelectItem><SelectItem value="verified_players">Verified players can enter their own court score</SelectItem></SelectContent></Select><p className="text-[10px] text-muted-foreground mt-1">Verified scoring is free: the player chooses their name, shows the host a 4-digit code, and that device is trusted for this KOTC only.</p></div>
        <Button className="w-full" onClick={saveSettings} disabled={loading||!settingsDirty}><Save className="w-4 h-4 mr-2"/>{settingsDirty?'Save Player Link Settings':'Player Link Settings Saved ✓'}</Button>
      </section>

      {scoringAccess==='verified_players'&&<KotcPlayerVerificationPanel session={session}/>} 
      <KotcBroadcastPanel session={session}/>

      {isAdmin&&<section className="space-y-3 rounded-xl border p-3"><div><p className="text-xs font-bold">Restricted Host Access</p><p className="text-[10px] text-muted-foreground mt-1">Separate from the Player Link. Use only when another person needs host controls.</p></div><div className="rounded-lg bg-secondary/40 p-2"><p className="text-[10px] break-all text-muted-foreground">{hostUrl}</p><Button className="mt-2" size="sm" variant="outline" onClick={()=>copyText(hostUrl,'Session Host link','host')}>{copied==='host'?<Check className="w-3 h-3 mr-1"/>:<Copy className="w-3 h-3 mr-1"/>}{copied==='host'?'Copied':'Copy Host Link'}</Button></div><div className="grid sm:grid-cols-[1fr_auto] gap-2"><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="host@email.com" onKeyDown={e=>e.key==='Enter'&&grant()}/><Button onClick={grant} disabled={loading||!email.trim()}>{loading?<Loader2 className="w-4 h-4 mr-1 animate-spin"/>:<UserPlus className="w-4 h-4 mr-1"/>}Grant Host Access</Button></div><div className="space-y-1.5">{grants.length===0?<p className="text-xs text-muted-foreground">No additional session hosts assigned.</p>:grants.map(g=><div key={g.id} className="flex items-center gap-2 rounded-lg border p-2"><div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{g.user_name||g.user_email||g.user_id}</p><p className="text-[10px] text-muted-foreground truncate">{g.user_email||g.role}</p></div><Badge variant="outline" className="text-[10px]">Host</Badge><Button variant="ghost" size="icon" onClick={()=>revoke(g.user_id)} disabled={loading}><X className="w-4 h-4"/></Button></div>)}</div></section>}
    </div>}
  </div>;
}
