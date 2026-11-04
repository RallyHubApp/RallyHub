const norm=v=>String(v??'').trim().toLowerCase();
const date=v=>String(v??'').slice(0,10);
export async function resolveCampaignAudience(sdk,tenant_id,club_id,filters={}){
 const sources=Array.isArray(filters.sources)?filters.sources:['waiting_list'];
 if(!sources.length||sources.some(x=>!['waiting_list','guests','members'].includes(x)))throw Error('Invalid audience sources');
 const fetch=async(name,query,limit=500)=>{const rows=await sdk.asServiceRole.entities[name].filter(query,'-created_date',limit);if(rows.length>=limit)throw Error(`${name} inventory may be incomplete; narrow the audience before saving`);return rows};
 const memberships=await fetch('ClubMembership',{tenant_id,club_id});
 const activePeople=new Set(memberships.filter(x=>x.membership_status==='paid_active').map(x=>x.person_id).filter(Boolean));
 const people=await fetch('Person',{tenant_id});const byPerson=new Map(people.map(x=>[x.id,x]));
 const activeEmails=new Set(memberships.filter(x=>x.membership_status==='paid_active').flatMap(x=>[byPerson.get(x.person_id)?.primary_email,...(byPerson.get(x.person_id)?.alternate_emails||[])]).map(norm).filter(Boolean));
 const rows=[];
 if(sources.includes('waiting_list'))for(const x of await fetch('WaitingListEntry',{tenant_id,club_id}))if(x.active!==false&&!['removed','declined','booked_course','completed_course'].includes(x.status))rows.push({source:'waiting_list',id:x.id,name:x.full_name,email:x.email,previous_sports:x.previous_sports||[],created_date:x.first_joined_at||x.created_date,person_id:x.person_id,gender:x.gender});
 if(sources.includes('guests'))for(const x of await fetch('GuestBookingRequest',{tenant_id,club_id}))if(x.status!=='rejected')rows.push({source:'guests',id:x.id,name:x.full_name,email:x.email,previous_sports:x.previous_sports||[],created_date:x.created_date,person_id:x.person_id,gender:x.gender});
 if(sources.includes('members'))for(const x of memberships)if(x.membership_status==='paid_active'){const p=byPerson.get(x.person_id);if(p)rows.push({source:'members',id:x.id,name:p.full_name,email:p.primary_email,previous_sports:p.previous_sports||[],created_date:x.join_date||x.created_date,person_id:x.person_id,gender:p.gender});}
 const sports=(filters.sports||[]).map(norm),seen=new Set(),selected=[],excluded={};
 for(const x of rows){const email=norm(x.email);let reason='';
 if(!email||!email.includes('@'))reason='missing_email';
 else if(x.source!=='members'&&(activeEmails.has(email)||activePeople.has(x.person_id)))reason='active_member';
 else if(filters.fromDate&&date(x.created_date)<filters.fromDate)reason='date';
 else if(filters.toDate&&date(x.created_date)>filters.toDate)reason='date';
 else if(filters.gender&&norm(x.gender)!==norm(filters.gender))reason='gender';
 else if(sports.length&&!x.previous_sports.some(s=>sports.includes(norm(s))))reason='sport';
 else if(seen.has(email))reason='duplicate';
 if(reason){excluded[reason]=(excluded[reason]||0)+1;continue}seen.add(email);selected.push(x);
 }
 return {count:selected.length,recipients:selected,excluded};
}
