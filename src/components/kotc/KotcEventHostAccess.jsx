import React,{useEffect,useState} from 'react';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {toast} from 'sonner';
export default function KotcEventHostAccess({tournamentId}){
 const [email,setEmail]=useState(''),[hosts,setHosts]=useState([]),[busy,setBusy]=useState(false);
 const url=`${window.location.origin}/kotc-event-host/${tournamentId}`;
 const refresh=async()=>{try{const r=await base44.functions.invoke('manageKotcEventHost',{action:'state',tournamentId});setHosts(r.data?.hosts||[]);}catch(e){toast.error(e?.message||'Host access unavailable');}};
 useEffect(()=>{refresh();},[tournamentId]);
 const grant=async()=>{if(!email.includes('@'))return;setBusy(true);try{const r=await base44.functions.invoke('manageKotcEventHost',{action:'grant',tournamentId,email});if(r.data?.error)throw Error(r.data.error);toast.success('Host appointed. Share the link below.');setEmail('');await refresh();}catch(e){toast.error(e.message);}finally{setBusy(false);}};
 return <section className="glass rounded-2xl p-4 space-y-3" data-testid="kotc-pre-session-host-access"><div><h3 className="font-bold">Appoint tonight’s host</h3><p className="text-xs text-muted-foreground">Give the host access before Round 1. They can refresh Spond, manage attendance and set up the session.</p></div><div className="flex gap-2"><Input type="email" placeholder="Host’s RallyHub account email" value={email} onChange={e=>setEmail(e.target.value)}/><Button disabled={busy||!email.includes('@')} onClick={grant}>Appoint Host</Button></div><div className="rounded-lg border p-2 text-xs break-all">{url}</div><Button variant="outline" onClick={()=>navigator.clipboard.writeText(url).then(()=>toast.success('Host link copied')).catch(()=>toast.error('Copy failed'))}>Copy Pre-session Host Link</Button><p className="text-xs text-muted-foreground">{hosts.length} appointed host{hosts.length===1?'':'s'}. Only signed-in, appointed accounts can open the link.</p></section>;
}
