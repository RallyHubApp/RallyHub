import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {Link} from 'react-router-dom';
import {base44} from '@/api/base44Client';
export function useTournivalSummary(user,enabled=true){
 return useQuery({queryKey:['tournival-registration-summary',user?.id,user?.active_tenant_id,user?.active_club_id],enabled:enabled&&!!user?.active_tenant_id&&!!user?.active_club_id&&['admin','club_admin'].some(r=>r===user?.role||r===user?.active_club_role),queryFn:async()=>{const r=await base44.functions.invoke('legacyTournamentManager',{action:'tournival_registration_summary'});if(!r.data?.success)throw Error(r.data?.error||'Summary unavailable');return r.data.events;},staleTime:300000,refetchInterval:false,refetchOnWindowFocus:false,retry:false});
}
export default function TournivalRegistrationSummary({user}){
 const q=useTournivalSummary(user);
 return <section className="rounded-xl border bg-card p-4 space-y-2"><div className="flex justify-between"><h2 className="font-semibold">Tournival registrations</h2><button onClick={()=>q.refetch()} className="text-sm underline">Refresh</button></div>{q.isError?<p>Registration summary unavailable.</p>:q.isLoading?<p>Loading registrations…</p>:!q.data?.length?<p>No active Tournival events.</p>:q.data.map(e=><Link key={e.id} to={'/app/tournaments/'+e.id} className="block rounded-lg border p-3"><strong>{e.name}</strong><p>{e.registered}/{e.capacity} registered · {e.paid} paid/free · {e.pending} awaiting payment · {Math.max(0,e.capacity-e.registered)} places left</p></Link>)}</section>;
}
