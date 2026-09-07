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

export default function KotcHostAccessPanel({ session, isAdmin }){
  const [open,setOpen]=useState(false);
  const [email,setEmail]=useState('');
  const [loading,setLoading]=useState(false);
  const [grants,setGrants]=useState([]);
  const [copied,setCopied]=useState(false);
  const hostUrl=useMemo(()=>`${window.location.origin}/kotc-host/${session?.id||''}`,[session?.id]);

  const load=async()=>{
    if(!session?.id||!isAdmin)return;
    try{
      const res=await base44.functions.invoke('manageKotcSessionAccess',{action:'list',sessionId:session.id});
      setGrants((res.data?.grants||[]).filter(g=>g.status==='active'&&['session_host','assistant_host'].includes(g.role)));
    }catch(e){toast.error(errorMessage(e));}
  };
  useEffect(()=>{if(open)load();},[open,session?.id]);
  if(!isAdmin||!session?.id)return null;

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
  const copy=async()=>{
    try{await navigator.clipboard.writeText(hostUrl);setCopied(true);setTimeout(()=>setCopied(false),1800);toast.success('Session Host link copied');}
    catch{window.prompt('Copy Session Host link:',hostUrl);}
  };

  return <div className="glass rounded-xl p-3 sm:p-4 space-y-3 border border-primary/20">
    <button type="button" onClick={()=>setOpen(v=>!v)} className="w-full flex items-center justify-between gap-3 text-left">
      <div className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-primary mt-0.5"/><div><p className="font-semibold text-sm">Session Host Access</p><p className="text-xs text-muted-foreground mt-1">Give a host full control of this KOTC session only, without wider RallyHub access.</p></div></div>
      {open?<ChevronUp className="w-5 h-5 shrink-0"/>:<ChevronDown className="w-5 h-5 shrink-0"/>}
    </button>
    {open&&<div className="pt-2 border-t border-border space-y-3">
      <div className="rounded-lg bg-secondary/40 p-3 space-y-2"><p className="text-xs font-semibold flex items-center gap-2"><Link2 className="w-3.5 h-3.5"/>Restricted host link</p><p className="text-[11px] text-muted-foreground break-all">{hostUrl}</p><Button size="sm" variant="outline" onClick={copy}>{copied?<Check className="w-3 h-3 mr-1"/>:<Copy className="w-3 h-3 mr-1"/>}{copied?'Copied':'Copy Host Link'}</Button></div>
      <div className="grid sm:grid-cols-[1fr_auto] gap-2"><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="host@email.com" onKeyDown={e=>e.key==='Enter'&&grant()}/><Button onClick={grant} disabled={loading||!email.trim()}>{loading?<Loader2 className="w-4 h-4 mr-1 animate-spin"/>:<UserPlus className="w-4 h-4 mr-1"/>}Grant Host Access</Button></div>
      <p className="text-[10px] text-muted-foreground">The host must have a RallyHub account. Access is session-specific and expires automatically after 12 hours unless revoked sooner.</p>
      <div className="space-y-1.5">{grants.length===0?<p className="text-xs text-muted-foreground">No additional session hosts assigned.</p>:grants.map(g=><div key={g.id} className="flex items-center gap-2 rounded-lg border p-2"><div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{g.user_name||g.user_email||g.user_id}</p><p className="text-[10px] text-muted-foreground truncate">{g.user_email||g.role}</p></div><Badge variant="outline" className="text-[10px]">Host</Badge><Button variant="ghost" size="icon" onClick={()=>revoke(g.user_id)} disabled={loading} title="Revoke host access"><X className="w-4 h-4"/></Button></div>)}</div>
    </div>}
  </div>;
}
