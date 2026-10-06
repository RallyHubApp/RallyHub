import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Save, Tags } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const slugify = value => String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,80);

export default function DirectoryCategoryManager(){
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState('');
  const [error,setError]=useState('');
  const [usingDefaults,setUsingDefaults]=useState(false);
  const [draft,setDraft]=useState({label:'',pluralLabel:'',locationMode:'none',showPublicFilter:true,showListingForm:true,allowPlayerNotifications:true,commercialListing:false,entitlementMode:'free'});

  const load=async()=>{
    setLoading(true);setError('');
    try{
      const res=await base44.functions.invoke('directoryCategory',{action:'admin_list'});
      if(res.data?.error)throw new Error(res.data.error);
      setRows(res.data?.categories||[]);setUsingDefaults(res.data?.usingDefaults===true);
    }catch(e){setError(e?.response?.data?.error||e?.message||'Could not load Directory categories.');}
    finally{setLoading(false)}
  };
  useEffect(()=>{load()},[]);

  const update=(key,field,value)=>setRows(prev=>prev.map(row=>row.key===key?{...row,[field]:value}:row));
  const save=async(row)=>{
    setBusy(row.key);setError('');
    try{
      const res=await base44.functions.invoke('directoryCategory',{action:'admin_save',...row});
      if(res.data?.error)throw new Error(res.data.error);
      setRows(res.data?.categories||[]);setUsingDefaults(false);
    }catch(e){setError(e?.response?.data?.error||e?.message||'Could not save category.');}
    finally{setBusy('')}
  };
  const seed=async()=>{
    setBusy('seed');setError('');
    try{
      const res=await base44.functions.invoke('directoryCategory',{action:'admin_seed_defaults'});
      if(res.data?.error)throw new Error(res.data.error);
      setRows(res.data?.categories||[]);setUsingDefaults(false);
    }catch(e){setError(e?.response?.data?.error||e?.message||'Could not create category settings.');}
    finally{setBusy('')}
  };
  const add=async()=>{
    const label=draft.label.trim();
    if(!label)return;
    await save({...draft,key:slugify(label),pluralLabel:draft.pluralLabel.trim()||label,active:true,sortOrder:Math.max(100,...rows.map(r=>Number(r.sortOrder)||0))+10,clubFirst:false});
    setDraft({label:'',pluralLabel:'',locationMode:'none',showPublicFilter:true,showListingForm:true,allowPlayerNotifications:true,commercialListing:false,entitlementMode:'free'});
  };

  return <section className="order-1 glass rounded-xl p-4 sm:p-5 space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Directory configuration</p><h3 className="mt-1 text-lg font-bold">Listing categories</h3><p className="mt-1 text-sm text-muted-foreground">Add or change a category once. RallyHub then uses these settings in the public Directory, listing form and player notification preferences.</p></div>
      <Button type="button" size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading?'animate-spin':''}`}/>Refresh</Button>
    </div>
    {usingDefaults&&<div className="rounded-lg border border-amber-400/30 bg-amber-500/5 p-3 text-sm"><strong>Using built-in defaults.</strong> Save them as managed categories so you can add, reorder or change them without code. <Button type="button" size="sm" className="ml-2" onClick={seed} disabled={busy==='seed'}>{busy==='seed'?'Saving…':'Manage these categories'}</Button></div>}
    {error&&<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
    <div className="space-y-3">
      {rows.map(row=><div key={row.key} className="rounded-xl border border-border bg-background/25 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-xs font-semibold">Public label<input className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={row.label||''} onChange={e=>update(row.key,'label',e.target.value)}/></label>
          <label className="text-xs font-semibold">Plural / filter label<input className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={row.pluralLabel||''} onChange={e=>update(row.key,'pluralLabel',e.target.value)}/></label>
          <label className="text-xs font-semibold">Location behaviour<select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={row.locationMode||'none'} onChange={e=>update(row.key,'locationMode',e.target.value)}><option value="county">County / map</option><option value="service_area">Service area / destination</option><option value="none">No location required</option></select></label>
          <label className="text-xs font-semibold">Order<input type="number" className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={row.sortOrder??100} onChange={e=>update(row.key,'sortOrder',Number(e.target.value))}/></label>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[['active','Category active'],['showPublicFilter','Show in Directory filter'],['showListingForm','Show in Add listing form'],['allowPlayerNotifications','Offer as player notification'],['commercialListing','Commercial-capable listing']].map(([field,label])=><label key={field} className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-xs"><input type="checkbox" checked={row[field]===true} onChange={e=>update(row.key,field,e.target.checked)}/>{label}</label>)}
          <label className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-xs"><span>Commercial mode</span><select className="ml-auto rounded border border-input bg-background px-2 py-1" value={row.entitlementMode||'free'} onChange={e=>update(row.key,'entitlementMode',e.target.value)}><option value="free">Free now</option><option value="future_paid">Future paid</option></select></label>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3"><span className="text-[11px] text-muted-foreground">Key: {row.key}{row.clubFirst?' · primary club category':''}</span><Button type="button" size="sm" onClick={()=>save(row)} disabled={busy===row.key}><Save className="mr-2 h-3.5 w-3.5"/>{busy===row.key?'Saving…':'Save category'}</Button></div>
      </div>)}
    </div>
    <div className="rounded-xl border border-dashed border-primary/40 p-4">
      <div className="flex items-center gap-2"><Tags className="h-4 w-4 text-primary"/><h4 className="font-bold">Add another category</h4></div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label className="text-xs font-semibold">Category name<input className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.label} onChange={e=>setDraft(v=>({...v,label:e.target.value}))} placeholder="e.g. Court installers"/></label>
        <label className="text-xs font-semibold">Plural / filter label<input className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.pluralLabel} onChange={e=>setDraft(v=>({...v,pluralLabel:e.target.value}))} placeholder="e.g. Court installers"/></label>
        <label className="text-xs font-semibold">Location behaviour<select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.locationMode} onChange={e=>setDraft(v=>({...v,locationMode:e.target.value}))}><option value="none">No location required</option><option value="service_area">Service area / destination</option><option value="county">County / map</option></select></label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {[['showPublicFilter','Directory filter'],['showListingForm','Add listing form'],['allowPlayerNotifications','Player notifications'],['commercialListing','Commercial-capable']].map(([field,label])=><label key={field} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"><input type="checkbox" checked={draft[field]} onChange={e=>setDraft(v=>({...v,[field]:e.target.checked}))}/>{label}</label>)}
      </div>
      <Button type="button" className="mt-3" onClick={add} disabled={!draft.label.trim()||!!busy}><Plus className="mr-2 h-4 w-4"/>Add category</Button>
    </div>
  </section>;
}