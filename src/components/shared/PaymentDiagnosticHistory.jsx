import React,{useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
export default function PaymentDiagnosticHistory({tenantId,clubId}){
 const [open,setOpen]=useState(false);
 const [search,setSearch]=useState('');
 const {data,error,isFetching,refetch}=useQuery({queryKey:['payment-diagnostics',tenantId,clubId],enabled:open&&!!tenantId&&!!clubId,queryFn:async()=>{const r=await base44.functions.invoke('paymentDiagnosticHistory',{});return r.data.events||[];}});
 const rows=(data||[]).filter(r=>[r.checkout_id,r.transaction_id,r.reference,r.workflow,r.fault_category,r.provider_status].some(v=>String(v||'').toLowerCase().includes(search.toLowerCase())));
 return <section className="rounded-lg border p-4 space-y-3"><button type="button" className="font-semibold" onClick={()=>setOpen(!open)}>Payment diagnostic history {open?'−':'+'}</button>{open&&<><div className="flex gap-2"><input aria-label="Search payment history" className="border rounded p-2 w-full" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Checkout, transaction, reference or fault"/><button type="button" onClick={()=>refetch()}>Refresh</button></div>{isFetching?<p>Loading…</p>:error?<p>Diagnostic history unavailable.</p>:<><p className="text-xs">Showing {rows.length} of the latest {data?.length||0} events.</p><div className="overflow-auto"><table className="w-full text-sm"><thead><tr>{['Time','Workflow','Operation','Checkout','Transaction','Status','Fault','HTTP'].map(h=><th key={h} className="text-left p-2">{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id}>{[r.occurred_at,r.workflow,r.operation,r.checkout_id,r.transaction_id,r.provider_status,r.fault_category,r.http_status].map((v,i)=><td key={i} className="p-2">{v||'—'}</td>)}</tr>)}</tbody></table></div></>}</>}</section>;
}
