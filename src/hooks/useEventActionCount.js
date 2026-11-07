import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';

/** Read-only, tenant-scoped event attention from the existing authorised admin endpoint. */
export default function useEventActionCount(user){
 const tenantId=user?.active_tenant_id,clubId=user?.active_club_id;
 const enabled=!!tenantId&&!!clubId&&(user?.role==='admin'||user?.active_club_role==='club_admin');
 return useQuery({
  queryKey:['ccc-event-action-count',tenantId,clubId],
  enabled,
  retry:1,
  refetchInterval:60000,
  refetchOnWindowFocus:true,
  queryFn:async()=>{
   const today=new Date().toISOString().slice(0,10);
   const events=await base44.entities.Tournament.filter({tenant_id:tenantId,host_club_id:clubId,event_registration_mode:'rallyhub',event_booking_enabled:true,event_publish_status:'published',start_date:{$gte:today}},'start_date',100);
   if(!Array.isArray(events)||events.length>=100)throw Error('Event action count incomplete');
   const active=events.filter(e=>String(e.start_date||'')>=today);
   if(active.length>25)throw Error('Too many active events for a verified action count');
   // Bound concurrent backend reads; an unbounded Promise.all across events can
   // overwhelm the shared Base44 function/request budget on dashboard load.
   const results=[];
   for(let i=0;i<active.length;i+=2){
    const batch=await Promise.all(active.slice(i,i+2).map(async e=>{
     const res=await base44.functions.invoke('eventRegistration',{action:'admin_roster',eventId:e.id});
     if(res.data?.success!==true||res.data?.summaryIsPartial)throw Error('Event action count unavailable');
     return (res.data.registrations||[]).filter(r=>r.status==='pending_approval'||r.status==='waitlisted'||(r.status==='approved_payment_hold'&&r.paymentStatus==='pending'&&r.paymentHoldExpiresAt&&Date.parse(r.paymentHoldExpiresAt)<Date.now())).length;
    }));
    results.push(...batch);
   }
   return results.reduce((a,b)=>a+b,0);
  }
 });
}
