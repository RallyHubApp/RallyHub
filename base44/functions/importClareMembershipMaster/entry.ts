import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { ungzip } from 'npm:pako@2.1.0';

const TENANT='6a9b7790bc4a8d299938bda9';
const CLUB='6a9b779684daba85b3ffdeb5';
const SPORT='6aa1246d0401bf144776c3f1';
const SEASON='2026-27';
const CONFIRM='IMPORT_CLARE_152_20260909';
const SOURCE='google_membership_master';

const nowIso=()=>new Date().toISOString();
const norm=(v:any)=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
const key=(n:any,e:any)=>`${norm(n)}|${norm(e)}`;
const chunks=<T>(arr:T[],n=50)=>{const out:T[][]=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));return out;};
async function bulkCreate(base44:any, entity:string, rows:any[], size=50){const out:any[]=[];for(const c of chunks(rows,size)){if(!c.length)continue;const r=await base44.asServiceRole.entities[entity].bulkCreate(c);if(Array.isArray(r))out.push(...r);}return out;}
function decodePayload(b64:string){let clean=String(b64||'').replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/');while(clean.length%4)clean+='=';const bytes=Uint8Array.from(atob(clean),c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(ungzip(bytes)));}
function compact(o:any){return Object.fromEntries(Object.entries(o).filter(([_,v])=>v!==undefined&&v!==null&&v!==''));}

Deno.serve(async(req)=>{
 try{
  const base44=createClientFromRequest(req);
  const body=await req.json().catch(()=>({}));
  if(body.confirmation!==CONFIRM)return Response.json({error:'confirmation required'},{status:403});
  const members=decodePayload(body.payload_base64);
  if(!Array.isArray(members)||members.length!==152)return Response.json({error:`Expected 152 members, received ${Array.isArray(members)?members.length:'invalid payload'}`},{status:400});
  const paid=members.filter((m:any)=>m.membership_status==='paid_active').length;
  const pending=members.filter((m:any)=>m.membership_status==='pending_payment').length;
  if(paid!==151||pending!==1)return Response.json({error:`Cohort validation failed paid=${paid} pending=${pending}`},{status:400});
  const keys=members.map((m:any)=>key(m.full_name,m.primary_email));
  if(new Set(keys).size!==152)return Response.json({error:'Composite name+email keys are not unique'},{status:400});
  if(members.some((m:any)=>norm(m.full_name).startsWith('kotc test')||String(m.primary_email||'').includes('@rallyhub.invalid')))return Response.json({error:'Test player detected in membership payload'},{status:400});
  if(members.some((m:any)=>norm(m.primary_email)==='conall.moore@icloud.com'))return Response.json({error:'Booking-only Conall must not be in membership payload'},{status:400});

  const ts=nowIso();
  let persons=await base44.asServiceRole.entities.Person.filter({tenant_id:TENANT,source_system:SOURCE});
  const byKey=new Map((persons||[]).map((p:any)=>[key(p.full_name,p.primary_email),p]));
  const missingPeople=members.filter((m:any)=>!byKey.has(key(m.full_name,m.primary_email))).map((m:any)=>compact({
    tenant_id:TENANT,linked_user_id:m.linked_user_id,full_name:m.full_name,primary_email:m.primary_email,
    alternate_emails:m.alternate_emails||[],mobile:m.mobile,date_of_birth:m.date_of_birth,
    full_postal_address:m.full_postal_address,postal_code:m.postal_code,country:m.country,
    emergency_contact_raw:m.emergency_contact_raw,emergency_mobile:m.emergency_mobile,
    profile_visibility:'club',photo_visibility:'club',source_system:SOURCE,source_rows:m.source_rows||[],last_synced_at:ts,
    data_quality_flags:m.data_quality_flags||[]
  }));
  if(missingPeople.length)await bulkCreate(base44,'Person',missingPeople,50);
  persons=await base44.asServiceRole.entities.Person.filter({tenant_id:TENANT,source_system:SOURCE});
  if(persons.length!==152)return Response.json({error:`Person verification failed: ${persons.length}`},{status:500});
  const personByKey=new Map(persons.map((p:any)=>[key(p.full_name,p.primary_email),p]));

  let rels=await base44.asServiceRole.entities.ClubRelationship.filter({tenant_id:TENANT,club_id:CLUB});
  const relPersonIds=new Set((rels||[]).map((r:any)=>String(r.person_id)));
  const newRels=members.filter((m:any)=>!relPersonIds.has(String(personByKey.get(key(m.full_name,m.primary_email))?.id))).map((m:any)=>{
    const p=personByKey.get(key(m.full_name,m.primary_email));
    return compact({tenant_id:TENANT,club_id:CLUB,person_id:p.id,relationship_type:'member',status:m.membership_status==='paid_active'?'active':'pending',entry_route:'direct_membership',source_system:SOURCE,notes:m.admin_notes});
  });
  if(newRels.length)await bulkCreate(base44,'ClubRelationship',newRels,50);

  let memberships=await base44.asServiceRole.entities.ClubMembership.filter({tenant_id:TENANT,club_id:CLUB,membership_season:SEASON});
  const memPersonIds=new Set((memberships||[]).map((r:any)=>String(r.person_id)));
  const newMemberships=members.filter((m:any)=>!memPersonIds.has(String(personByKey.get(key(m.full_name,m.primary_email))?.id))).map((m:any)=>{
    const p=personByKey.get(key(m.full_name,m.primary_email));
    return compact({tenant_id:TENANT,club_id:CLUB,person_id:p.id,member_id:m.member_id,membership_season:SEASON,membership_type:m.membership_type,
      membership_status:m.membership_status,relationship_type:'member',membership_fee:m.membership_fee,payment_status:m.payment_status,payment_date:m.payment_date,
      previous_member_ids:m.previous_member_ids||[],alternate_names:m.alternate_names||[],alternate_emails:m.alternate_emails||[],source_rows:m.source_rows||[],
      duplicate_flag:m.duplicate_flag,admin_notes:m.admin_notes,include_in_rallyhub:true,source_system:SOURCE,source_external_id:`form_rows:${(m.source_rows||[]).join(',')}`,
      last_synced_at:ts,data_quality_flags:m.data_quality_flags||[]});
  });
  if(newMemberships.length)await bulkCreate(base44,'ClubMembership',newMemberships,50);
  memberships=await base44.asServiceRole.entities.ClubMembership.filter({tenant_id:TENANT,club_id:CLUB,membership_season:SEASON});
  if(memberships.length!==152)return Response.json({error:`Membership verification failed: ${memberships.length}`},{status:500});
  const membershipByPerson=new Map(memberships.map((m:any)=>[String(m.person_id),m]));

  const existingPayments=await base44.asServiceRole.entities.PaymentRecord.filter({tenant_id:TENANT,club_id:CLUB,membership_season:SEASON,source_system:SOURCE});
  const payPeople=new Set((existingPayments||[]).map((r:any)=>String(r.person_id)));
  const newPayments=members.filter((m:any)=>!payPeople.has(String(personByKey.get(key(m.full_name,m.primary_email))?.id))).map((m:any)=>{
    const p=personByKey.get(key(m.full_name,m.primary_email)); const cm=membershipByPerson.get(String(p.id));
    return compact({tenant_id:TENANT,club_id:CLUB,person_id:p.id,club_membership_id:cm?.id,membership_season:SEASON,purpose_type:'membership',purpose_id:cm?.id,
      payment_type:'membership',amount:m.membership_fee,currency:'EUR',payment_method:m.payment_method,payment_status:m.payment_status,payment_date:m.payment_date,
      sumup_checkout_id:m.sumup_checkout_id,sumup_payment_link:m.sumup_payment_link,reconciliation_status:'imported_source_truth',source_system:SOURCE,source_row:(m.source_rows||[]).join(',')});
  });
  if(newPayments.length)await bulkCreate(base44,'PaymentRecord',newPayments,50);

  const existingExternal=await base44.asServiceRole.entities.ExternalIdentity.filter({tenant_id:TENANT,club_id:CLUB,provider:'google_membership'});
  const extPeople=new Set((existingExternal||[]).map((r:any)=>String(r.person_id)));
  const newExternal=members.filter((m:any)=>!extPeople.has(String(personByKey.get(key(m.full_name,m.primary_email))?.id))).map((m:any)=>{
    const p=personByKey.get(key(m.full_name,m.primary_email)); return compact({tenant_id:TENANT,club_id:CLUB,person_id:p.id,provider:'google_membership',
      external_person_id:`form_rows:${(m.source_rows||[]).join(',')}`,external_email:m.primary_email,external_mobile:m.mobile,external_name:m.full_name,
      match_status:'matched',match_method:'composite',is_authoritative_identity:false,last_verified_at:ts,last_seen_at:ts,notes:'2026-27 membership master import'});
  });
  if(newExternal.length)await bulkCreate(base44,'ExternalIdentity',newExternal,50);

  const existingSports=await base44.asServiceRole.entities.SportProfile.filter({tenant_id:TENANT,sport_id:SPORT});
  const sportPeople=new Set((existingSports||[]).map((r:any)=>String(r.person_id)));
  const newSports=members.filter((m:any)=>!sportPeople.has(String(personByKey.get(key(m.full_name,m.primary_email))?.id))).map((m:any)=>{
    const p=personByKey.get(key(m.full_name,m.primary_email)); return {tenant_id:TENANT,person_id:p.id,sport_id:SPORT,sport:'Pickleball',status:'active',experience_type:'current',primary_club_id:CLUB};
  });
  if(newSports.length)await bulkCreate(base44,'SportProfile',newSports,50);

  const existingConsents=await base44.asServiceRole.entities.ConsentRecord.filter({tenant_id:TENANT,club_id:CLUB,source_system:SOURCE});
  const consentKeys=new Set((existingConsents||[]).map((c:any)=>`${c.person_id}|${c.consent_type}|${c.source_row}|${c.consent_version}`));
  const newConsents:any[]=[];
  for(const m of members){const p=personByKey.get(key(m.full_name,m.primary_email));for(const c of (m.consents||[])){const ck=`${p.id}|${c.consent_type}|${c.source_row}|${c.consent_version}`;if(consentKeys.has(ck))continue;consentKeys.add(ck);newConsents.push(compact({tenant_id:TENANT,club_id:CLUB,person_id:p.id,consent_type:c.consent_type,status:c.status,response_text:c.response_text,consent_version:c.consent_version,wording_hash:c.wording_hash,recorded_at:c.recorded_at,source_system:SOURCE,source_row:c.source_row}));}}
  if(newConsents.length)await bulkCreate(base44,'ConsentRecord',newConsents,50);

  const existingAudits=await base44.asServiceRole.entities.SyncAudit.filter({tenant_id:TENANT,club_id:CLUB,source_system:SOURCE,sync_type:'membership_master_initial_import'});
  const auditPeople=new Set((existingAudits||[]).map((r:any)=>String(r.person_id)));
  const newAudits=members.filter((m:any)=>!auditPeople.has(String(personByKey.get(key(m.full_name,m.primary_email))?.id))).map((m:any)=>{
    const p=personByKey.get(key(m.full_name,m.primary_email));const cm=membershipByPerson.get(String(p.id));return {tenant_id:TENANT,club_id:CLUB,person_id:p.id,source_system:SOURCE,source_record:(m.source_rows||[]).join(','),sync_type:'membership_master_initial_import',matched_by:'composite_name_email',match_status:'created',target_entity_type:'ClubMembership',target_entity_id:cm?.id,synced_at:ts,data_quality_flags:m.data_quality_flags||[]};
  });
  if(newAudits.length)await bulkCreate(base44,'SyncAudit',newAudits,50);

  const clarePlayers=await base44.asServiceRole.entities.Player.filter({tenant_id:TENANT,club_id:CLUB});
  const newPlayers:any[]=[]; let reusedPlayers=0;
  for(const m of members){const p=personByKey.get(key(m.full_name,m.primary_email));const existing=(clarePlayers||[]).find((x:any)=>String(x.person_id||'')===String(p.id)||(norm(x.full_name)===norm(m.full_name)&&norm(x.email)===norm(m.primary_email)));
    if(existing){reusedPlayers++; if(!existing.person_id)await base44.asServiceRole.entities.Player.update(existing.id,{person_id:p.id,relationship_type:'member',relationship_status:m.membership_status==='paid_active'?'active':'pending',email:m.primary_email,phone:m.mobile});}
    else newPlayers.push(compact({person_id:p.id,full_name:m.full_name,email:m.primary_email,phone:m.mobile,user_id:m.linked_user_id,linked_user_email:m.linked_user_id?m.primary_email:undefined,status:'Active',tenant_id:TENANT,club_id:CLUB,relationship_type:'member',relationship_status:m.membership_status==='paid_active'?'active':'pending',wins:0,losses:0,matches_played:0}));
  }
  if(newPlayers.length)await bulkCreate(base44,'Player',newPlayers,50);

  const conall=(await base44.asServiceRole.entities.Player.filter({id:'6a01dda4702b7dd2a2978c80'}))?.[0];
  if(conall)await base44.asServiceRole.entities.Player.update(conall.id,{relationship_type:'booking_only',relationship_status:'active'});

  const john=persons.find((p:any)=>norm(p.full_name)==='john mclaughlin'); const viv=persons.find((p:any)=>norm(p.full_name)==='vivienne mclaughlin');
  if(john&&viv){const existing=await base44.asServiceRole.entities.PersonRelationship.filter({tenant_id:TENANT,person_id:john.id,related_person_id:viv.id,relationship_type:'household'});if(!existing.length)await base44.asServiceRole.entities.PersonRelationship.create({tenant_id:TENANT,person_id:john.id,related_person_id:viv.id,relationship_type:'household',status:'active',notes:'Separate members sharing household email; do not merge.'});}

  const final={
    success:true,persons:(await base44.asServiceRole.entities.Person.filter({tenant_id:TENANT,source_system:SOURCE})).length,
    memberships:(await base44.asServiceRole.entities.ClubMembership.filter({tenant_id:TENANT,club_id:CLUB,membership_season:SEASON})).length,
    relationships:(await base44.asServiceRole.entities.ClubRelationship.filter({tenant_id:TENANT,club_id:CLUB,relationship_type:'member'})).length,
    payments:(await base44.asServiceRole.entities.PaymentRecord.filter({tenant_id:TENANT,club_id:CLUB,membership_season:SEASON,source_system:SOURCE})).length,
    consents:(await base44.asServiceRole.entities.ConsentRecord.filter({tenant_id:TENANT,club_id:CLUB,source_system:SOURCE})).length,
    external_identities:(await base44.asServiceRole.entities.ExternalIdentity.filter({tenant_id:TENANT,club_id:CLUB,provider:'google_membership'})).length,
    sport_profiles:(await base44.asServiceRole.entities.SportProfile.filter({tenant_id:TENANT,sport_id:SPORT})).length,
    sync_audits:(await base44.asServiceRole.entities.SyncAudit.filter({tenant_id:TENANT,club_id:CLUB,source_system:SOURCE,sync_type:'membership_master_initial_import'})).length,
    new_players:newPlayers.length,reused_players:reusedPlayers,paid_active:paid,pending_payment:pending
  };
  await base44.asServiceRole.entities.AuditLog.create({tenant_id:TENANT,club_id:CLUB,user_id:'system-membership-import',action:'membership_master_import_completed',entity_type:'ClubMembership',entity_id:'2026-27',scope_type:'Club',scope_id:CLUB,after_state:JSON.stringify(final),reason:'Clare 2026-27 membership master initial import'});
  return Response.json(final);
 }catch(e){console.error('[importClareMembershipMaster]',e);return Response.json({success:false,error:String((e as any)?.message||e)},{status:500});}
});
