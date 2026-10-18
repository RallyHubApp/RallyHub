import React,{useCallback,useEffect,useRef,useState} from 'react';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
const TEST_SLOTS=[{id:'brian',label:'Brian'},{id:'marie',label:'Marie'},{id:'roisin',label:'Róisín'},{id:'rallyhub',label:'RallyHub App'}];
const ORIGIN='https://uat.dupr.gg';
export default function DuprUatAccounts(){
 const [accounts,setAccounts]=useState([]),[busy,setBusy]=useState(''),[error,setError]=useState(''),[result,setResult]=useState(null);
 const [iframe,setIframe]=useState(''),[slot,setSlot]=useState('');
 const waiting=useRef(false);
 const loginFrame=useRef(null);
 const call=useCallback(async(action,payload={})=>{
  const res=await base44.functions.invoke('duprIntegration',{action,...payload});
  if(!res?.data?.success)throw Error(res?.data?.error||'DUPR UAT request unsuccessful');
  return res.data;
 },[]);
 const reload=useCallback(async()=>{
  try{const r=await call('uat_accounts');setAccounts(r.accounts||[]);}catch(e){setError(e.message);}
 },[call]);
 useEffect(()=>{reload();},[reload]);
 const execute=async(action,payload={})=>{
  setError('');setBusy(action+String(payload.slot||''));setResult(null);
  try{const r=await call(action,payload);setResult(r);await reload();}
  catch(e){setError(e.response?.data?.error||e.message||'DUPR UAT failed');}
  finally{setBusy('');}
 };
 const begin=async(selected)=>{
  setError('');setResult(null);setBusy('start');
  try{
   const r=await call('uat_sso_start');
   const u=new URL(r.url);
   if(u.origin!==ORIGIN||!u.pathname.startsWith('/login-external-app/'))throw Error('Unexpected DUPR UAT login destination');
   setSlot(selected);setIframe(u.toString());waiting.current=false;
  }catch(e){setError(e.message);}finally{setBusy('');}
 };
 useEffect(()=>{
  if(!iframe||!slot)return;
  const listener=async event=>{
   if(event.origin!==ORIGIN||event.source!==loginFrame.current?.contentWindow||waiting.current)return;
   const source=event.data;
   if(!source||typeof source!=='object')return;
   const payload=source.data&&typeof source.data==='object'?source.data:source;
   const accessToken=payload.accessToken||payload.userToken,refreshToken=payload.refreshToken;
   if(typeof accessToken!=='string'||typeof refreshToken!=='string')return;
   waiting.current=true;setBusy('linking');setError('');
   try{
    const r=await call('uat_sso_connect',{slot,accessToken,refreshToken,duprId:payload.duprId||''});
    setResult(r);setIframe('');setSlot('');await reload();
   }catch(e){setError(e.response?.data?.error||e.message||'DUPR identity verification failed');waiting.current=false;}
   finally{setBusy('');}
  };
  window.addEventListener('message',listener);
  return()=>window.removeEventListener('message',listener);
 },[iframe,slot,call,reload]);
 return <div className="space-y-4">
  <div className="rounded-lg border border-border p-3 text-sm">
   <strong>Independent DUPR UAT · four-account acceptance</strong>
   <p className="text-xs text-muted-foreground mt-1">UAT only. Sign in to each test account in turn, complete DUPR consent and MFA where requested. Tokens are verified and encrypted server-side, not displayed.</p>
  </div>
  <div className="grid gap-3 md:grid-cols-2">
   {TEST_SLOTS.map(s=>{
    const row=accounts.find(a=>a.slot===s.id);
    return <div key={s.id} className="rounded-lg border border-border p-3 space-y-2">
     <p className="font-medium">{s.label} — {row?.linked?'SSO connected':'SSO not yet connected'}</p>
     {row?.duprId&&<p className="text-xs">Verified DUPR ID: {row.duprId}</p>}
     <div className="flex flex-wrap gap-2">
      <Button size="sm" disabled={!!busy} onClick={()=>begin(s.id)}>{row?.linked?'Reconnect':'Connect via DUPR SSO'}</Button>
      <Button size="sm" variant="outline" disabled={!row?.linked||!!busy} onClick={()=>execute('uat_verify',{slot:s.id})}>Verify & check ratings/club</Button>
      <Button size="sm" variant="outline" disabled={!row?.linked||!!busy} onClick={()=>execute('uat_refresh',{slot:s.id})}>Test refresh</Button>
      <Button size="sm" variant="outline" disabled={!row?.linked||!!busy} onClick={()=>execute('uat_subscribe_rating',{slot:s.id})}>Subscribe ratings</Button>
     </div>
    </div>;
   })}
  </div>
  {iframe&&<div className="space-y-2 rounded-lg border border-border p-3">
   <p className="font-semibold">DUPR UAT sign-in for {slot}. Complete the provider consent screen.</p>
   <iframe ref={loginFrame} title={'DUPR UAT SSO '+slot} src={iframe} allow="payment" className="h-[560px] w-full rounded-md bg-white" />
   <Button variant="outline" onClick={()=>{setIframe('');setSlot('');waiting.current=false;}}>Close sign-in</Button>
  </div>}
  <div className="flex flex-wrap gap-2">
   <Button disabled={!!busy} onClick={()=>execute('uat_match_preflight')}>Run 4-account club & rating preflight</Button>
   <Button variant="outline" disabled={!!busy} onClick={reload}>Refresh status</Button>
  </div>
  {busy&&<p className="text-sm">Checking {busy}…</p>}
  {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
  {result&&<pre className="overflow-auto rounded-md border p-3 text-xs">{JSON.stringify(result,null,2)}</pre>}
 </div>;
}
