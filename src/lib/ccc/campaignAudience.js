// Pure CRM audience selection. Source records remain independent; no identity merges.
export const AUDIENCE_SOURCES=Object.freeze(['members','guests','waiting_list']);
const norm=v=>String(v??'').trim().toLocaleLowerCase();
const day=v=>String(v??'').slice(0,10);
export function selectCampaignAudience(records=[],filters={}){
 const sources=new Set(filters.sources||['waiting_list']);
 const sports=new Set((filters.sports||[]).map(norm));
 const excluded=new Set((filters.activeMemberEmails||[]).map(norm));
 const seen=new Set(),recipients=[],excludedRecords=[];
 for(const r of records){
  const email=norm(r.email||r.primary_email),source=r.source;
  let reason='';
  if(!sources.has(source))reason='source';
  else if(!email||!email.includes('@'))reason='missing_email';
  else if(filters.excludeActiveMembers&&source!=='members'&&excluded.has(email))reason='active_member';
  else if(filters.gender&&norm(r.gender)!==norm(filters.gender))reason='gender';
  else if(filters.fromDate&&day(r.created_date||r.created_at)<filters.fromDate)reason='date';
  else if(filters.toDate&&day(r.created_date||r.created_at)>filters.toDate)reason='date';
  else if(sports.size&&!(r.previous_sports||[]).some(s=>sports.has(norm(s))))reason='sport';
  else if(seen.has(email))reason='duplicate';
  if(reason){excludedRecords.push({id:r.id,reason});continue}
  seen.add(email);recipients.push(r);
 }
 return {recipients,excluded:excludedRecords,count:recipients.length};
}
