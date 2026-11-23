import React,{useState} from 'react';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
const err=e=>e?.response?.data?.error||e?.message||'Preferences unavailable';
export function suggestPresetCourts(people,rows,courtCount){
 const ids=people.map(p=>String(p.id));const allowed=new Set(ids);const preferences=new Map(rows.map(r=>[String(r.participant_id),r]));
 const used=new Set(),pairs=[];
 // Prefer mutual partner requests; then single partner requests; fill the remaining players deterministically.
 const candidates=[];
 for(const id of ids){const p=preferences.get(id);const other=String(p?.partner_id||'');if(other&&other!==id&&allowed.has(other)){const mutual=String(preferences.get(other)?.partner_id||'')===id;candidates.push({a:id,b:other,score:mutual?2:1});}}
 candidates.sort((a,b)=>b.score-a.score||ids.indexOf(a.a)-ids.indexOf(b.a));
 for(const c of candidates){if(!used.has(c.a)&&!used.has(c.b)){pairs.push([c.a,c.b]);used.add(c.a);used.add(c.b);}}
 const rest=ids.filter(id=>!used.has(id));while(rest.length>=2)pairs.push([rest.shift(),rest.shift()]);
 const courts=[];for(let i=0;i<Math.min(courtCount,Math.floor(pairs.length/2));i++)courts.push({A:pairs[2*i],B:pairs[2*i+1]});
 return courts;
}
export default function KotcPresetHostPreferences({session,participants,courtCount,onApply,disabled}){
 const [rows,setRows]=useState([]),[open,setOpen]=useState(false),[loading,setLoading]=useState(false),[selected,setSelected]=useState(''),[partner,setPartner]=useState(''),[opponent,setOpponent]=useState('');
 const eligible=participants.filter(p=>!['withdrawn','replaced','no_show','left'].includes(p.status));const names=Object.fromEntries(eligible.map(p=>[String(p.id),p.display_name]));
 const refresh=async()=>{try{setLoading(true);const r=await base44.functions.invoke('kotcPresetPreferences',{action:'host_list',sessionId:session.id});if(!r.data?.success)throw new Error(r.data?.error||'Could not load');setRows(r.data.preferences||[]);}catch(e){toast.error(err(e));}finally{setLoading(false);}};
 const choose=id=>{setSelected(id);const row=rows.find(r=>r.participant_id===id);setPartner(row?.partner_id||'');setOpponent(row?.opponent_id||'');};
 const save=async()=>{try{setLoading(true);const r=await base44.functions.invoke('kotcPresetPreferences',{action:'save',sessionId:session.id,participantId:selected,partnerId:partner,opponentId:opponent});if(!r.data?.success)throw new Error(r.data?.error||'Save failed');await refresh();toast.success('Host preference saved');}catch(e){toast.error(err(e));}finally{setLoading(false);}};
 const choices=eligible.filter(p=>p.id!==selected);
 return <div className="rounded-lg border p-3 space-y-3" data-testid="kotc-host-preferences"><div className="flex justify-between items-center gap-2"><div><p className="font-semibold text-sm">Player preferences · Optional</p><p className="text-xs text-muted-foreground">Never blocks play. Suggestions are editable and are not automatically activated.</p></div><Button size="sm" variant="outline" onClick={()=>{setOpen(!open);if(!open)refresh();}}>{open?'Close':'Review'}</Button></div>{open&&<div className="space-y-3"><Button variant="outline" size="sm" onClick={refresh} disabled={loading}>Refresh responses ({rows.length})</Button>{eligible.map(p=>{const r=rows.find(x=>x.participant_id===p.id);return <div key={p.id} className="text-xs border-b pb-1"><b>{p.display_name}</b>: {r?`Partner ${names[r.partner_id]||'any'} · Face ${names[r.opponent_id]||'any'}${r.second_choice_id?` · Other ${names[r.second_choice_id]||'any'}`:''}`:'No response'}</div>;})}<div className="border-t pt-2 space-y-2"><p className="text-xs font-semibold">Host can enter or override a preference</p><select className="w-full border rounded p-2 bg-background" value={selected} onChange={e=>choose(e.target.value)}><option value="">Choose player</option>{eligible.map(p=><option key={p.id} value={p.id}>{p.display_name}</option>)}</select>{selected&&<><select className="w-full border rounded p-2 bg-background" value={partner} onChange={e=>setPartner(e.target.value)}><option value="">No partner preference</option>{choices.map(p=><option key={p.id} value={p.id}>{p.display_name}</option>)}</select><select className="w-full border rounded p-2 bg-background" value={opponent} onChange={e=>setOpponent(e.target.value)}><option value="">No opponent preference</option>{choices.map(p=><option key={p.id} value={p.id}>{p.display_name}</option>)}</select><Button variant="outline" size="sm" disabled={loading} onClick={save}>Save host entry</Button></>}</div><Button disabled={disabled||courtCount<1} onClick={()=>onApply(suggestPresetCourts(eligible,rows,courtCount))}>Suggest court layout · Review before saving</Button><p className="text-xs text-muted-foreground">Mutual partner requests first, then single requests. Remaining players assigned in roster order. No AI. Host can swap anyone before saving.</p></div>}</div>;
}
