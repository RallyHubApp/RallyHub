/** Advisory cross-source draft collision review; drafts do not reserve resources. */
export function reviewDraftResourceCollisions(activities,{complete=false}={}){
 const drafts=activities.filter(a=>a?.status==='draft'&&a.configuration?.recurrence_source_activity_id);
 const pairs=[],invalid=[];
 for(let i=0;i<drafts.length;i++){
  const a=drafts[i],start=Date.parse(a.starts_at),end=Date.parse(a.ends_at);
  if(!a.tenant_id||!a.club_id||!a.venue_id||!Number.isFinite(start)||!Number.isFinite(end)||end<=start){invalid.push(a.id);continue}
  for(let j=i+1;j<drafts.length;j++){
   const b=drafts[j];if(a.tenant_id!==b.tenant_id||a.club_id!==b.club_id||a.venue_id!==b.venue_id)continue;
   if(a.configuration.recurrence_source_activity_id===b.configuration.recurrence_source_activity_id)continue;
   if(a.court_id&&b.court_id&&a.court_id!==b.court_id)continue;
   const bs=Date.parse(b.starts_at),be=Date.parse(b.ends_at);
   if(Number.isFinite(bs)&&Number.isFinite(be)&&start<be&&bs<end)pairs.push({firstActivityId:a.id,secondActivityId:b.id,venueId:a.venue_id});
  }
 }
 return {complete,collisionCount:pairs.length,collisions:pairs.slice(0,100),invalidDraftIds:invalid.slice(0,100),resultsMayBeTruncated:!complete||pairs.length>100||invalid.length>100,readOnly:true,venueReservationConfirmed:false};
}
