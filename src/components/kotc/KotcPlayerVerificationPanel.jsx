import React,{useEffect,useState} from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check,RefreshCw,ShieldCheck,X } from 'lucide-react';

function err(e){return e?.response?.data?.error||e?.data?.error||e?.message||'Verification action failed.';}

export default function KotcPlayerVerificationPanel({session}){
 const [rows,setRows]=useState([]);const [busy,setBusy]=useState('');const [loading,setLoading]=useState(false);
 const load=async({silent=false}={})=>{if(!session?.id)return;try{if(!silent)setLoading(true);const r=await base44.functions.invoke('kotcPlayerIdentity',{action:'host_list',sessionId:session.id});setRows(r.data?.requests||[]);}catch(e){if(!silent)toast.error(err(e));}finally{if(!silent)setLoading(false);}};
 useEffect(()=>{load();const t=setInterval(()=>load({silent:true}),7000);return()=>clearInterval(t);},[session?.id]);
 const act=async(row,action)=>{try{setBusy(row.id);await base44.functions.invoke('kotcPlayerIdentity',{action,sessionId:session.id,requestId:row.id});toast.success(action==='approve'?`${row.display_name} verified`:`${row.display_name} device access revoked`);await load({silent:true});}catch(e){toast.error(err(e));}finally{setBusy('');}};
 const pending=rows.filter(r=>r.status==='pending'),approved=rows.filter(r=>r.status==='approved');
 return <div className="rounded-xl border border-primary/20 p-3 space-y-3" data-testid="kotc-player-verification-panel">
   <div className="flex items-start justify-between gap-2"><div className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-primary mt-0.5"/><div><p className="text-sm font-semibold">Player Device Verification</p><p className="text-[11px] text-muted-foreground mt-0.5">Free verification for player scoring. The player chooses their name and shows you the 4-digit code on their phone.</p></div></div><Button size="sm" variant="ghost" onClick={()=>load()} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></Button></div>
   {pending.length===0&&approved.length===0&&<p className="text-xs text-muted-foreground">No verification requests yet.</p>}
   {pending.map(r=><div key={r.id} className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 flex items-center gap-3"><div className="min-w-0 flex-1"><p className="font-semibold text-sm truncate">{r.display_name}</p><p className="text-[10px] text-muted-foreground">Ask the player to show this code</p></div><div className="font-mono text-2xl font-black tracking-[.2em]">{r.verification_code}</div><Button size="sm" onClick={()=>act(r,'approve')} disabled={!!busy}><Check className="w-4 h-4 mr-1"/>Verify</Button></div>)}
   {approved.length>0&&<div className="space-y-1.5"><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Verified devices</p>{approved.map(r=><div key={r.id} className="rounded-lg border p-2 flex items-center gap-2"><div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate">{r.display_name}</p><p className="text-[10px] text-muted-foreground">This device can use My KOTC and score its current court</p></div><Badge variant="outline" className="text-green-600">Verified</Badge><Button size="icon" variant="ghost" onClick={()=>act(r,'revoke')} disabled={!!busy} title="Revoke this device"><X className="w-4 h-4"/></Button></div>)}</div>}
 </div>;
}
