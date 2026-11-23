import React,{useState} from 'react';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
const error=e=>e?.response?.data?.error||e?.message||'Could not save preferences';
export default function KotcPresetPreferences({shareToken,session,participants,participantId,deviceToken}){
 const [partner,setPartner]=useState(''),[opponent,setOpponent]=useState(''),[second,setSecond]=useState(''),[busy,setBusy]=useState(false);
 if(!session||['completed','finalised','cancelled'].includes(session.status))return null;
 const choices=(participants||[]).filter(p=>p.id!==participantId&&!['withdrawn','replaced','no_show','left'].includes(p.status));
 const selector=(title,value,setValue)=> <label className="block text-xs font-medium space-y-1"><span>{title}</span><select className="w-full min-h-11 rounded-md border bg-background p-2 text-sm" value={value} onChange={e=>setValue(e.target.value)}><option value="">No preference</option>{choices.map(p=><option key={p.id} value={p.id}>{p.display_name}</option>)}</select></label>;
 const save=async()=>{try{setBusy(true);const r=await base44.functions.invoke('kotcPresetPreferences',{action:'save',shareToken,participantId,deviceToken,partnerId:partner,opponentId:opponent,secondChoiceId:second});if(!r.data?.success)throw new Error(r.data?.error||'Save failed');toast.success('Preferences sent to the host');}catch(e){toast.error(error(e));}finally{setBusy(false);}};
 return <div className="rounded-xl border bg-background p-3 space-y-3" data-testid="kotc-preset-preferences"><div><p className="font-bold text-sm">Optional preset preferences</p><p className="text-xs text-muted-foreground">One set of preferences for tonight. The host makes the final court decisions. You can skip this entirely.</p></div>{selector('Preferred partner',partner,setPartner)}{selector('Player you would like to face',opponent,setOpponent)}{selector('Another player you would like to play with or against',second,setSecond)}<Button className="w-full" disabled={busy} onClick={save}>{busy?'Saving…':'Send preferences to host'}</Button></div>;
}
