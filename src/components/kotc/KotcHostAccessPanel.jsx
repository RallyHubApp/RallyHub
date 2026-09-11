import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, ChevronDown, ChevronUp, Copy, Link2, Loader2, ShieldCheck, UserPlus, X } from 'lucide-react';

function errorMessage(error){
  return error?.response?.data?.error || error?.data?.error || error?.message || 'Host access action failed.';
}

export default function KotcHostAccessPanel({ session, isAdmin, onScorerLinkReady }){
  const [open,setOpen]=useState(false);
  const [email,setEmail]=useState('');
  const [loading,setLoading]=useState(false);
  const [grants,setGrants]=useState([]);
  const [copied,setCopied]=useState('');
  const [liveUrl,setLiveUrl]=useState('');
  const [scorerUrl,setScorerUrl]=useState('');
  const hostUrl=useMemo(()=>`${window.location.origin}/kotc-host/${session?.id||''}`,[session?.id]);

  const load=async()=>{
    if(!session?.id||!isAdmin)return;
    try{
      const res=await base44.functions.invoke('manageKotcSessionAccess',{action:'list',sessionId:session.id});
      setGrants((res.data?.grants||[]).filter(g=>g.status==='active'&&['session_host','assistant_host'].includes(g.role)));
    }catch(e){toast.error(errorMessage(e));}
  };
  useEffect(()=>{if(open&&isAdmin)load();},[open,session?.id,isAdmin]);
  if(!session?.id)return null;

  const grant=async()=>{
    if(!email.trim())return;
    setLoading(true);
    try{
      const res=await base44.functions.invoke('manageKotcSessionAccess',{action:'grant',sessionId:session.id,email:email.trim(),role:'session_host'});
      if(res.data?.success){toast.success(`Session Host access granted to ${res.data.user?.full_name||res.data.user?.email||email}`);setEmail('');await load();}
      else toast.error(res.data?.error||'Could not grant Session Host access.');
    }catch(e){toast.error(errorMessage(e));}finally{setLoading(false);}
  };
  const revoke=async userId=>{
    setLoading(true);
    try{await base44.functions.invoke('manageKotcSessionAccess',{action:'revoke',sessionId:session.id,userId});toast.success('Session Host access revoked');await load();}catch(e){toast.error(errorMessage(e));}finally{setLoading(false);}
  };
  const copyText=async(url,label,key)=>{try{await navigator.clipboard.writeText(url);setCopied(key);setTimeout(()=>setCopied(''),1800);toast.success(`${label} copied`);}catch{window.prompt(`Copy ${label}:`,url);}};
  const prepareLive=async()=>{setLoading(true);try{const res=await base44.functions.invoke('kotcResultsShare',{action:'get_or_create',sessionId:session.id});const url=`${window.location.origin}/kotc-live/${res.data.token}`;setLiveUrl(url);await copyText(url,'Live Player View link','live');}catch(e){toast.error(errorMessage(e));}finally{setLoading(false);}};
  const prepareScorer=async()=>{setLoading(true);try{const res=await base44.functions.invoke('manageKotcScorerLinks',{action:'get_or_create',sessionId:session.id});const url=`${window.location.origin}/kotc-score/${res.data.token}`;setScorerUrl(url);onScorerLinkReady?.();await copyText(url,'Scorer link','scorer');}catch(e){toast.error(errorMessage(e));}finally{setLoading(false);}};
  const copyHost=()=>copyText(hostUrl,'Session Host link','host');

  return <div className="glass rounded-xl p-3 sm:p-4 space-y-3 border border-primary/20">
    <button type="button" onClick={()=>setOpen(v=>!v)} className="w-full flex items-center justify-between gap-3 text-left">
      <div className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-primary mt-0.5"/><div><p className="font-semibold text-sm">Session Links & Access</p><p className="text-xs text-muted-foreground mt-1">Live player view, scorer access and restricted host control for this session.</p></div></div>
      {open?<ChevronUp className="w-5 h-5 shrink-0"/>:<ChevronDown className="w-5 h-5 shrink-0"/>}
    </button>
    {open&&<div className="pt-2 border-t border-border space-y-3">
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="rounded-lg bg-secondary/40 p-3 space-y-2"><p className="text-xs font-semibold flex items-center gap-2"><Link2 className="w-3.5 h-3.5"/>Live Player View</p><p className="text-[10px] text-muted-foreground">Public, read-only and updates automatically through assignments, live scores, standings and podium.</p><Button size="sm" variant="outline" onClick={prepareLive} disabled={loading}>{copied==='live'?<Check className="w-3 h-3 mr-1"/>:<Copy className="w-3 h-3 mr-1"/>}{copied==='live'?'Copied':'Copy Live Link'}</Button>{liveUrl&&<p className="text-[9px] break-all text-muted-foreground">{liveUrl}</p>}</div>
        <div className="rounded-lg bg-secondary/40 p-3 space-y-2"><p className="text-xs font-semibold flex items-center gap-2"><Link2 className="w-3.5 h-3.5"/>Player Scoring Link</p><p className="text-[10px] text-muted-foreground">Share with all players. Each court nominates one player to enter/correct that court’s score. Per-court edit locking prevents two devices overwriting each other.</p><Button size="sm" variant="outline" onClick={prepareScorer} disabled={loading}>{copied==='scorer'?<Check className="w-3 h-3 mr-1"/>:<Copy className="w-3 h-3 mr-1"/>}{copied==='scorer'?'Copied':'Copy Player Scoring Link'}</Button>{scorerUrl&&<p className="text-[9px] break-all text-muted-foreground">{scorerUrl}</p>}</div>
      </div>
      {isAdmin&&<><div className="rounded-lg bg-secondary/40 p-3 space-y-2"><p className="text-xs font-semibold flex items-center gap-2"><Link2 className="w-3.5 h-3.5"/>Restricted Host Link</p><p className="text-[11px] text-muted-foreground break-all">{hostUrl}</p><Button size="sm" variant="outline" onClick={copyHost}>{copied==='host'?<Check className="w-3 h-3 mr-1"/>:<Copy className="w-3 h-3 mr-1"/>}{copied==='host'?'Copied':'Copy Host Link'}</Button></div>
      <div className="grid sm:grid-cols-[1fr_auto] gap-2"><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="host@email.com" onKeyDown={e=>e.key==='Enter'&&grant()}/><Button onClick={grant} disabled={loading||!email.trim()}>{loading?<Loader2 className="w-4 h-4 mr-1 animate-spin"/>:<UserPlus className="w-4 h-4 mr-1"/>}Grant Host Access</Button></div>
      <p className="text-[10px] text-muted-foreground">The host must have a RallyHub account. Host access is session-specific and expires automatically after 12 hours unless revoked sooner.</p>
      <div className="space-y-1.5">{grants.length===0?<p className="text-xs text-muted-foreground">No additional session hosts assigned.</p>:grants.map(g=><div key={g.id} className="flex items-center gap-2 rounded-lg border p-2"><div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{g.user_name||g.user_email||g.user_id}</p><p className="text-[10px] text-muted-foreground truncate">{g.user_email||g.role}</p></div><Badge variant="outline" className="text-[10px]">Host</Badge><Button variant="ghost" size="icon" onClick={()=>revoke(g.user_id)} disabled={loading} title="Revoke host access"><X className="w-4 h-4"/></Button></div>)}</div></>}
    </div>}
  </div>;
}
