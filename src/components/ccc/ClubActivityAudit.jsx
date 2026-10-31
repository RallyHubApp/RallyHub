import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
export default function ClubActivityAudit({activityId,tenantId,clubId}){
 const {data,isError,refetch}=useQuery({queryKey:['ccc-audit',tenantId,clubId,activityId],queryFn:async()=>{const result=await base44.functions.invoke('cccActivity',{action:'activity_audit',id:activityId});return result.data},enabled:!!activityId&&!!tenantId&&!!clubId,retry:false});
 if(!activityId)return null;
 return <section className="mt-3 rounded-lg border p-3"><div className="flex justify-between"><strong>Activity change history</strong><button type="button" onClick={()=>refetch()}>Refresh</button></div><p className="text-xs text-muted-foreground">Best-effort audit; not a complete compliance ledger.</p>{isError&&<p role="alert">History unavailable.</p>}{data?.entries?.map(e=><p key={e.id} className="text-xs">{e.action} · {e.createdAt} · {e.userId}</p>)}{data?.resultsMayBeTruncated&&<p role="alert">History is incomplete. Additional audit pages remain beyond the current review limit.</p>}</section>;
}
