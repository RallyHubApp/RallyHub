import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TENANT='6a9b7790bc4a8d299938bda9';
const CLUB='6a9b779684daba85b3ffdeb5';
const SPORT='6aa1246d0401bf144776c3f1';
const SEASON='2026-27';
const CONFIRM='IMPORT_CLARE_152_BATCH_20260909';
const SOURCE='google_membership_master';
const nowIso=()=>new Date().toISOString();
const norm=(v:any)=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
const key=(n:any,e:any)=>`${norm(n)}|${norm(e)}`;
const compact=(o:any)=>Object.fromEntries(Object.entries(o).filter(([_,v])=>v!==undefined&&v!==null&&v!==''));
const CONSENT_DEFAULTS:any={
 gdpr_membership_communications:{response_text:'I have read and accept the Clare Pickleball Privacy Notice and consent to my information being used for administration of my club membership.',wording_hash:'deb7155855f564d8'},
 membership_conditions:{response_text:'Yes I confirm I understand and accept the above conditions.',wording_hash:'9818c6ff6325ba92'},
 health_declaration:{response_text:'I have read and agree to the Health Declaration above.',wording_hash:'c3b1c57b80246a08'},
 club_rules_code_of_conduct:{response_text:"I confirm that I have read and agree to abide by Clare Pickleball Club's Rules, Code of Conduct and Sportsmanship Guidelines.",wording_hash:'db22ef62e8b14a84'},
 photography_video:{response_text:'Yes, I consent',wording_hash:'622431950998091b'},
 declaration_liability_waiver:{response_text:"I confirm that I have read , understood and agree to the Clare Pickleball Club's Declaration & Liability Waiver",wording_hash:'27b7d862c321b583'}
};
const chunks=<T>(arr:T[],n=50)=>{const out:T[][]=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));return out;};
async function bulkCreate(base44:any, entity:string, rows:any[], size=50){for(const c of chunks(rows,size)){if(c.length)await base44.asServiceRole.entities[entity].bulkCreate(c);}}

async function processBatch(base44:any,members:any[]){
 const ts=nowIso();
 if(!Array.isArray(members)||members.length<1||members.length>30)throw new Error('Batch must contain 1-30 members');
 if(members.some((m:any)=>norm(m.full_name).startsWith('kotc test')||String(m.primary_email||'').includes('@rallyhub.invalid')))throw new Error('Test player detected');
 if(members.some((m:any)=>norm(m.primary_email)==='conall.moore@icloud.com'))throw new Error('Conall is booking-only and cannot be imported as a member');
 if(new Set(members.map((m:any)=>key(m.full_name,m.primary_email))).size!==members.length)throw new Error('Duplicate composite key in batch');

 let persons=await base44.asServiceRole.entities.Person.filter({tenant_id:TENANT,source_system:SOURCE});
 let byKey=new Map((persons||[]).map((p:any)=>[key(p.full_name,p.primary_email),p]));
 const newPeople=members.filter((m:any)=>!byKey.has(key(m.full_name,m.primary_email))).map((m:any)=>compact({tenant_id:TENANT,linked_user_id:m.linked_user_id,full_name:m.full_name,primary_email:m.primary_email,alternate_emails:m.alternate_emails||[],mobile:m.mobile,date_of_birth:m.date_of_birth,full_postal_address:m.full_postal_address,postal_code:m.postal_code,country:m.country,emergency_contact_raw:m.emergency_contact_raw,emergency_mobile:m.emergency_mobile,profile_visibility:'club',photo_visibility:'club',source_system:SOURCE,source_rows:m.source_rows||[],last_synced_at:ts,data_quality_flags:m.data_quality_flags||[]}));
 if(newPeople.length)await bulkCreate(base44,'Person',newPeople);
 persons=await base44.asServiceRole.entities.Person.filter({tenant_id:TENANT,source_system:SOURCE});
 byKey=new Map(persons.map((p:any)=>[key(p.full_name,p.primary_email),p]));
 for(const m of members)if(!byKey.get(key(m.full_name,m.primary_email)))throw new Error(`Person missing after create: ${m.full_name}`);

 const batchPersonIds=members.map((m:any)=>String(byKey.get(key(m.full_name,m.primary_email)).id));
 const rels=await base44.asServiceRole.entities.ClubRelationship.filter({tenant_id:TENANT,club_id:CLUB});
 const relIds=new Set((rels||[]).map((x:any)=>String(x.person_id)));
 await bulkCreate(base44,'ClubRelationship',members.filter((m:any)=>!relIds.has(String(byKey.get(key(m.full_name,m.primary_email)).id))).map((m:any)=>{const p=byKey.get(key(m.full_name,m.primary_email));return compact({tenant_id:TENANT,club_id:CLUB,person_id:p.id,relationship_type:'member',status:m.membership_status==='paid_active'?'active':'pending',entry_route:'direct_membership',source_system:SOURCE,notes:m.admin_notes});}));

 let memberships=await base44.asServiceRole.entities.ClubMembership.filter({tenant_id:TENANT,club_id:CLUB,membership_season:SEASON});
 const memIds=new Set((memberships||[]).map((x:any)=>String(x.person_id)));
 await bulkCreate(base44,'ClubMembership',members.filter((m:any)=>!memIds.has(String(byKey.get(key(m.full_name,m.primary_email)).id))).map((m:any)=>{const p=byKey.get(key(m.full_name,m.primary_email));return compact({tenant_id:TENANT,club_id:CLUB,person_id:p.id,member_id:m.member_id,membership_season:SEASON,membership_type:m.membership_type,membership_status:m.membership_status,relationship_type:'member',membership_fee:m.membership_fee,payment_status:m.payment_status,payment_date:m.payment_date,previous_member_ids:m.previous_member_ids||[],alternate_names:m.alternate_names||[],alternate_emails:m.alternate_emails||[],source_rows:m.source_rows||[],duplicate_flag:m.duplicate_flag,admin_notes:m.admin_notes,include_in_rallyhub:true,source_system:SOURCE,source_external_id:`form_rows:${(m.source_rows||[]).join(',')}`,last_synced_at:ts,data_quality_flags:m.data_quality_flags||[]});}));
 memberships=await base44.asServiceRole.entities.ClubMembership.filter({tenant_id:TENANT,club_id:CLUB,membership_season:SEASON});
 const memByPerson=new Map(memberships.map((x:any)=>[String(x.person_id),x]));

 const pays=await base44.asServiceRole.entities.PaymentRecord.filter({tenant_id:TENANT,club_id:CLUB,membership_season:SEASON,source_system:SOURCE});
 const payIds=new Set((pays||[]).map((x:any)=>String(x.person_id)));
 await bulkCreate(base44,'PaymentRecord',members.filter((m:any)=>!payIds.has(String(byKey.get(key(m.full_name,m.primary_email)).id))).map((m:any)=>{const p=byKey.get(key(m.full_name,m.primary_email)),cm=memByPerson.get(String(p.id));return compact({tenant_id:TENANT,club_id:CLUB,person_id:p.id,club_membership_id:cm?.id,membership_season:SEASON,purpose_type:'membership',purpose_id:cm?.id,payment_type:'membership',amount:m.membership_fee,currency:'EUR',payment_method:m.payment_method,payment_status:m.payment_status,payment_date:m.payment_date,sumup_checkout_id:m.sumup_checkout_id,sumup_payment_link:m.sumup_payment_link,reconciliation_status:'imported_source_truth',source_system:SOURCE,source_row:(m.source_rows||[]).join(',')});}));

 const exts=await base44.asServiceRole.entities.ExternalIdentity.filter({tenant_id:TENANT,club_id:CLUB,provider:'google_membership'});
 const extIds=new Set((exts||[]).map((x:any)=>String(x.person_id)));
 await bulkCreate(base44,'ExternalIdentity',members.filter((m:any)=>!extIds.has(String(byKey.get(key(m.full_name,m.primary_email)).id))).map((m:any)=>{const p=byKey.get(key(m.full_name,m.primary_email));return compact({tenant_id:TENANT,club_id:CLUB,person_id:p.id,provider:'google_membership',external_person_id:`form_rows:${(m.source_rows||[]).join(',')}`,external_email:m.primary_email,external_mobile:m.mobile,external_name:m.full_name,match_status:'matched',match_method:'composite',is_authoritative_identity:false,last_verified_at:ts,last_seen_at:ts,notes:'2026-27 membership master import'});}));

 const sports=await base44.asServiceRole.entities.SportProfile.filter({tenant_id:TENANT,sport_id:SPORT});
 const sportIds=new Set((sports||[]).map((x:any)=>String(x.person_id)));
 await bulkCreate(base44,'SportProfile',members.filter((m:any)=>!sportIds.has(String(byKey.get(key(m.full_name,m.primary_email)).id))).map((m:any)=>{const p=byKey.get(key(m.full_name,m.primary_email));return {tenant_id:TENANT,person_id:p.id,sport_id:SPORT,sport:'Pickleball',status:'active',experience_type:'current',primary_club_id:CLUB};}));

 const existingConsents=await base44.asServiceRole.entities.ConsentRecord.filter({tenant_id:TENANT,club_id:CLUB,source_system:SOURCE});
 const ckeys=new Set((existingConsents||[]).map((c:any)=>`${c.person_id}|${c.consent_type}|${c.source_row}|${c.consent_version}`));
 const newConsents:any[]=[];for(const m of members){const p=byKey.get(key(m.full_name,m.primary_email));for(const c of (m.consents||[])){const ck=`${p.id}|${c.consent_type}|${c.source_row}|${c.consent_version}`;if(ckeys.has(ck))continue;ckeys.add(ck);const d=CONSENT_DEFAULTS[c.consent_type]||{};newConsents.push(compact({tenant_id:TENANT,club_id:CLUB,person_id:p.id,consent_type:c.consent_type,status:c.status,response_text:c.response_text||d.response_text,consent_version:c.consent_version,wording_hash:c.wording_hash||d.wording_hash,recorded_at:c.recorded_at,source_system:SOURCE,source_row:c.source_row}));}}await bulkCreate(base44,'ConsentRecord',newConsents);

 const audits=await base44.asServiceRole.entities.SyncAudit.filter({tenant_id:TENANT,club_id:CLUB,source_system:SOURCE,sync_type:'membership_master_initial_import'});
 const auditIds=new Set((audits||[]).map((x:any)=>String(x.person_id)));
 await bulkCreate(base44,'SyncAudit',members.filter((m:any)=>!auditIds.has(String(byKey.get(key(m.full_name,m.primary_email)).id))).map((m:any)=>{const p=byKey.get(key(m.full_name,m.primary_email)),cm=memByPerson.get(String(p.id));return {tenant_id:TENANT,club_id:CLUB,person_id:p.id,source_system:SOURCE,source_record:(m.source_rows||[]).join(','),sync_type:'membership_master_initial_import',matched_by:'composite_name_email',match_status:'created',target_entity_type:'ClubMembership',target_entity_id:cm?.id,synced_at:ts,data_quality_flags:m.data_quality_flags||[]};}));

 const players=await base44.asServiceRole.entities.Player.filter({tenant_id:TENANT,club_id:CLUB});
 const newPlayers:any[]=[];let reused=0;for(const m of members){const p=byKey.get(key(m.full_name,m.primary_email));const existing=(players||[]).find((x:any)=>String(x.person_id||'')===String(p.id)||(norm(x.full_name)===norm(m.full_name)&&norm(x.email)===norm(m.primary_email)));if(existing){reused++;if(!existing.person_id)await base44.asServiceRole.entities.Player.update(existing.id,{person_id:p.id,relationship_type:'member',relationship_status:m.membership_status==='paid_active'?'active':'pending',email:m.primary_email,phone:m.mobile});}else newPlayers.push(compact({person_id:p.id,full_name:m.full_name,email:m.primary_email,phone:m.mobile,user_id:m.linked_user_id,linked_user_email:m.linked_user_id?m.primary_email:undefined,status:'Active',tenant_id:TENANT,club_id:CLUB,relationship_type:'member',relationship_status:m.membership_status==='paid_active'?'active':'pending',wins:0,losses:0,matches_played:0}));}await bulkCreate(base44,'Player',newPlayers);
 return {batch_members:members.length,new_people:newPeople.length,new_consents:newConsents.length,new_players:newPlayers.length,reused_players:reused};
}

async function finalise(base44:any){
 const persons=await base44.asServiceRole.entities.Person.filter({tenant_id:TENANT,source_system:SOURCE});
 const memberships=await base44.asServiceRole.entities.ClubMembership.filter({tenant_id:TENANT,club_id:CLUB,membership_season:SEASON});
 const paid=memberships.filter((m:any)=>m.membership_status==='paid_active').length,pending=memberships.filter((m:any)=>m.membership_status==='pending_payment').length;
 if(persons.length!==152||memberships.length!==152||paid!==151||pending!==1)throw new Error(`Final validation failed persons=${persons.length} memberships=${memberships.length} paid=${paid} pending=${pending}`);
 const conall=(await base44.asServiceRole.entities.Player.filter({id:'6a01dda4702b7dd2a2978c80'}))?.[0];if(conall)await base44.asServiceRole.entities.Player.update(conall.id,{relationship_type:'booking_only',relationship_status:'active'});
 const john=persons.find((p:any)=>norm(p.full_name)==='john mclaughlin'),viv=persons.find((p:any)=>norm(p.full_name)==='vivienne mclaughlin');if(john&&viv){const pr=await base44.asServiceRole.entities.PersonRelationship.filter({tenant_id:TENANT,person_id:john.id,related_person_id:viv.id,relationship_type:'household'});if(!pr.length)await base44.asServiceRole.entities.PersonRelationship.create({tenant_id:TENANT,person_id:john.id,related_person_id:viv.id,relationship_type:'household',status:'active',notes:'Separate members sharing household email; do not merge.'});}
 const result={success:true,persons:persons.length,memberships:memberships.length,paid_active:paid,pending_payment:pending,relationships:(await base44.asServiceRole.entities.ClubRelationship.filter({tenant_id:TENANT,club_id:CLUB,relationship_type:'member'})).length,payments:(await base44.asServiceRole.entities.PaymentRecord.filter({tenant_id:TENANT,club_id:CLUB,membership_season:SEASON,source_system:SOURCE})).length,consents:(await base44.asServiceRole.entities.ConsentRecord.filter({tenant_id:TENANT,club_id:CLUB,source_system:SOURCE})).length,external_identities:(await base44.asServiceRole.entities.ExternalIdentity.filter({tenant_id:TENANT,club_id:CLUB,provider:'google_membership'})).length,sport_profiles:(await base44.asServiceRole.entities.SportProfile.filter({tenant_id:TENANT,sport_id:SPORT})).length,sync_audits:(await base44.asServiceRole.entities.SyncAudit.filter({tenant_id:TENANT,club_id:CLUB,source_system:SOURCE,sync_type:'membership_master_initial_import'})).length,clare_players:(await base44.asServiceRole.entities.Player.filter({tenant_id:TENANT,club_id:CLUB})).length};
 await base44.asServiceRole.entities.AuditLog.create({tenant_id:TENANT,club_id:CLUB,user_id:'system-membership-import',action:'membership_master_import_completed',entity_type:'ClubMembership',entity_id:'2026-27',scope_type:'Club',scope_id:CLUB,after_state:JSON.stringify(result),reason:'Clare 2026-27 membership master initial import'});return result;
}

Deno.serve(async(req)=>{try{const base44=createClientFromRequest(req);const body=await req.json().catch(()=>({}));if(body.confirmation!==CONFIRM)return Response.json({error:'confirmation required'},{status:403});if(body.action==='finalise')return Response.json(await finalise(base44));return Response.json({success:true,...await processBatch(base44,body.members)});}catch(e){console.error('[importClareMembershipBatch]',e);return Response.json({success:false,error:String((e as any)?.message||e)},{status:500});}});
