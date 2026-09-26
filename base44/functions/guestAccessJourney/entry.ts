import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { sendWithConfiguredEmailTransport } from './emailRouter.ts';

function clean(v:any,max=250){return String(v??'').trim().replace(/\s+/g,' ').slice(0,max)}
function emailKey(v:any){return clean(v,200).toLowerCase()}
function mobileKey(v:any){return clean(v,50).replace(/[^0-9]/g,'')}
function requestToken(){return `gr_${crypto.randomUUID().replaceAll('-','')}`}
function sessionToken(){return `gs_${crypto.randomUUID().replaceAll('-','')}`}
function inviteToken(){return `gi_${crypto.randomUUID().replaceAll('-','')}`}
function weekday(date:string){const d=new Date(`${date}T12:00:00Z`);return Number.isFinite(d.getTime())?['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getUTCDay()]:''}
function firstName(v:any){return clean(v,120).split(/\s+/).filter(Boolean)[0]||'there'}
function escapeHtml(v:any){return String(v??'').replace(/[&<>"']/g,(ch)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' } as any)[ch])}
function formatDate(v:string){try{return new Intl.DateTimeFormat('en-IE',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Dublin'}).format(new Date(`${v}T12:00:00Z`))}catch{return v}}
function money(v:any){try{return new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR'}).format(Number(v||0))}catch{return `€${Number(v||0).toFixed(2)}`}}

async function sendApprovedGuestInvite(base44:any,club:any,row:any,session:any,venue:any,date:string,inviteUrl:string){
  const scope={scopeType:'tenant' as const,purpose:'club_comms',tenantId:club.tenant_id,clubId:club.id};
  const hello=firstName(row.full_name);
  const fee=money(Number(session.price||0)||(/cash/i.test(String(session.paymentMethod||''))?5:5.5));
  const payment=/cash/i.test(String(session.paymentMethod||''))?`${fee} cash on arrival`:`${fee} online`;
  const subject=`${club.name} · Guest request approved · ${formatDate(date)} ${session.start||''}`;
  const textBody=`Hi ${hello},\n\nYour guest request has been approved.\n\nDate: ${formatDate(date)}\nTime: ${session.start||''}${session.end?`–${session.end}`:''}\nVenue: ${venue.name||''}\nFee: ${payment}\n\nComplete your waiver, Code of Conduct and booking/payment using your private link:\n${inviteUrl}\n\nThis private link is authorised for ${row.email}. If a different email is used, RallyHub will return the booking to the normal club approval route.\n\nBrian Moore\nChairperson, Clare Pickleball\n\nPowered by RallyHub`;
  const logo=escapeHtml(club.logo_url||'');
  const primary=escapeHtml(club.primary_colour||'#2667f2');
  const secondary=escapeHtml(club.secondary_colour||'#facc15');
  const htmlBody=`<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 12px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fff;border:1px solid #d9e1ec;border-radius:18px;overflow:hidden;"><tr><td style="height:6px;background:${primary};border-bottom:3px solid ${secondary};"></td></tr><tr><td style="padding:26px 28px 18px;text-align:center;">${logo?`<img src="${logo}" alt="${escapeHtml(club.name)} logo" width="72" height="72" style="display:block;margin:0 auto 12px;object-fit:contain;border-radius:12px;">`:''}<div style="font-size:25px;font-weight:800;">${escapeHtml(club.name)}</div><div style="margin-top:5px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;">Guest Session</div></td></tr><tr><td style="padding:0 28px 28px;"><h1 style="margin:0 0 18px;font-size:23px;line-height:1.25;">Guest request approved</h1><p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">Hi ${escapeHtml(hello)}, your guest request has been approved.</p><div style="margin:0 0 20px;padding:16px;border-radius:14px;background:#f7f9fc;border:1px solid #dfe5ee;font-size:14px;line-height:1.7;"><strong>${escapeHtml(formatDate(date))}</strong><br>${escapeHtml(`${session.start||''}${session.end?`–${session.end}`:''}`)}<br>${escapeHtml(venue.name||'')}<br>${escapeHtml(payment)}</div><div style="text-align:center;margin:6px 0 24px;"><a href="${escapeHtml(inviteUrl)}" style="display:inline-block;padding:14px 24px;border-radius:10px;background:${primary};color:#fff;text-decoration:none;font-size:16px;font-weight:800;">Complete guest booking</a></div><p style="margin:0 0 18px;font-size:12px;line-height:1.55;color:#6b7280;">This private link is authorised for ${escapeHtml(row.email)}. If a different email is entered, the booking will require club approval before payment.</p><p style="margin:0;font-size:15px;line-height:1.5;"><strong>Brian Moore</strong><br>Chairperson<br>Clare Pickleball</p></td></tr><tr><td style="padding:18px 28px;background:#f7f9fc;border-top:1px solid #e4e9f1;text-align:center;font-size:11px;color:#7b8494;">Powered by <strong>RallyHub</strong></td></tr></table></td></tr></table></body></html>`;
  await sendWithConfiguredEmailTransport(base44,scope,{to:row.email,subject,textBody,htmlBody});
}

async function loadClub(base44:any,slug:string){
  const club=(await base44.asServiceRole.entities.Club.filter({slug,status:'active'},'-updated_date',10))?.[0];
  if(!club)throw Object.assign(new Error('Club guest requests are unavailable.'),{status:404});
  return club;
}

async function loadDirectory(base44:any,slug:string){
  const profile=(await base44.asServiceRole.entities.DirectoryListingProfile.filter({listing_slug:slug,status:'active'},'-updated_at',5))?.[0];
  const data=profile?.public_json?JSON.parse(profile.public_json):{};
  return {profile,data,venues:Array.isArray(data?.venues)?data.venues:[],sessions:Array.isArray(data?.sessions)?data.sessions:[]};
}

async function loadConfig(base44:any,tenantId:string,clubId:string){
  return (await base44.asServiceRole.entities.ClubGuestJourneyConfig.filter({tenant_id:tenantId,club_id:clubId,active:true},'-updated_date',10))?.[0]||null;
}

function publicOptions(directory:any,config:any){
  const venues=(directory.venues||[]).map((v:any)=>({id:String(v.id),name:v.name||'',shortName:v.shortName||v.name||'',address:v.address||'',eircode:v.eircode||'',mapUrl:v.mapUrl||''}));
  const beginnerSet=new Set((config?.beginner_session_keys||[]).map(String));
  const experiencedVenueSet=new Set((config?.experienced_venue_keys||[]).map(String));
  const sessions=(directory.sessions||[]).filter((s:any)=>s?.guestEligible!==false).map((s:any)=>{
    const venue=venues.find((v:any)=>v.id===String(s.venueId));
    return {id:String(s.id),venueId:String(s.venueId),venueName:venue?.name||'',day:s.day||'',start:s.start||'',end:s.end||'',level:s.level||'',price:Number(s.price||0),paymentMethod:s.paymentMethod||'',capacity:Number(s.capacity||0)||null,beginnerEligible:beginnerSet.size?beginnerSet.has(String(s.id)):s.beginnerGuestEligible===true,experiencedEligible:experiencedVenueSet.size?experiencedVenueSet.has(String(s.venueId)):true};
  });
  return {venues,sessions};
}

function nextDateForDay(day:string){
  const names=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const target=names.indexOf(day);
  if(target<0)return '';
  const now=new Date();
  const today=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate(),12));
  let diff=(target-today.getUTCDay()+7)%7;
  if(diff===0)diff=7;
  today.setUTCDate(today.getUTCDate()+diff);
  return today.toISOString().slice(0,10);
}

async function sessionFromDirectory(base44:any,club:any,sessionId:string){
  const directory=await loadDirectory(base44,club.slug);
  const session=(directory.sessions||[]).find((s:any)=>String(s.id)===String(sessionId));
  if(!session)throw Object.assign(new Error('That club session is no longer available.'),{status:409});
  const venue=(directory.venues||[]).find((v:any)=>String(v.id)===String(session.venueId));
  if(!venue)throw Object.assign(new Error('The venue for that session is unavailable.'),{status:409});
  return {session,venue};
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action||'public_get',50);

    if(action==='public_get'){
      const clubSlug=clean(body.clubSlug,120);
      const club=await loadClub(base44,clubSlug);
      const [directory,config]=await Promise.all([loadDirectory(base44,clubSlug),loadConfig(base44,club.tenant_id,club.id)]);
      if(!config)return Response.json({error:'Guest requests are not currently enabled for this club.'},{status:404});
      const options=publicOptions(directory,config);
      return Response.json({success:true,club:{id:club.id,name:club.name,slug:club.slug,logo_url:club.logo_url||'',primary_colour:club.primary_colour||'',secondary_colour:club.secondary_colour||''},minimumAge:Number(config.minimum_age||18),adultsOnly:config.adults_only!==false,requireDuprForExperienced:config.require_dupr_for_experienced===true,requireHomeClubForExperienced:config.require_home_club_for_experienced===true,...options});
    }

    if(action==='public_submit'){
      const clubSlug=clean(body.clubSlug,120);
      const club=await loadClub(base44,clubSlug);
      const [directory,config]=await Promise.all([loadDirectory(base44,clubSlug),loadConfig(base44,club.tenant_id,club.id)]);
      if(!config)return Response.json({error:'Guest requests are not currently enabled for this club.'},{status:404});
      const options=publicOptions(directory,config);
      const fullName=clean(body.fullName,120);
      const email=emailKey(body.email);
      const mobile=clean(body.mobile,50);
      const experience=clean(body.experienceLevel,30).toLowerCase();
      const sessionId=clean(body.sessionId,120);
      const duprId=clean(body.duprId,120);
      const homeClub=clean(body.homeClub,160);
      if(!fullName||fullName.split(/\s+/).length<2)return Response.json({error:'Please enter your full name.'},{status:400});
      if(!email||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return Response.json({error:'Please enter a valid email address.'},{status:400});
      if(mobileKey(mobile).length<8)return Response.json({error:'Please enter a valid mobile number.'},{status:400});
      if(config.adults_only!==false&&body.ageConfirmed!==true)return Response.json({error:`Guest participation is currently for adults aged ${Number(config.minimum_age||18)} or over.`},{status:400});
      if(!['beginner','experienced'].includes(experience))return Response.json({error:'Please tell us whether you are a beginner or an experienced pickleball player.'},{status:400});
      const selected=options.sessions.find((s:any)=>s.id===sessionId);
      if(!selected)return Response.json({error:'Please choose a current Clare Pickleball session.'},{status:400});
      if(experience==='beginner'&&!selected.beginnerEligible)return Response.json({error:'That session is not available to beginner guests. Please choose one of the beginner options shown.'},{status:400});
      if(experience==='experienced'&&!selected.experiencedEligible)return Response.json({error:'That session is not available for guest requests.'},{status:400});
      if(experience==='experienced'&&config.require_home_club_for_experienced===true&&!homeClub)return Response.json({error:'Please enter the club you normally play with.'},{status:400});
      if(experience==='experienced'&&config.require_dupr_for_experienced===true&&!duprId)return Response.json({error:'Please enter your DUPR details, or enter “No DUPR” if you do not have one.'},{status:400});

      const existing=await base44.asServiceRole.entities.GuestBookingRequest.filter({tenant_id:club.tenant_id,club_id:club.id,email,status:'pending_approval',preferred_session_key:sessionId},'-submitted_at',10);
      if(existing?.[0])return Response.json({success:true,pending:true,requestToken:existing[0].request_token,message:'Your guest request is already awaiting club approval.'});

      const row=await base44.asServiceRole.entities.GuestBookingRequest.create({
        tenant_id:club.tenant_id,club_id:club.id,request_token:requestToken(),status:'pending_approval',source:'public_link',
        full_name:fullName,email,mobile,experience_level:experience,preferred_venue_key:selected.venueId,preferred_session_key:selected.id,
        dupr_id:duprId,home_club:homeClub,submitted_at:new Date().toISOString(),admin_notes:`Requested ${selected.day} ${selected.start}${selected.end?'–'+selected.end:''} · ${selected.venueName}`,
      });
      return Response.json({success:true,pending:true,requestToken:row.request_token,message:'Thanks. Your guest request has been sent to Clare Pickleball for approval. No payment has been taken. If approved, you will receive a private booking/payment link.'});
    }

    const user=await base44.auth.me();
    if(!user)return Response.json({error:'Unauthorized'},{status:401});
    if(user.role!=='admin')return Response.json({error:'Admin access required.'},{status:403});
    const tenantId=clean(user.active_tenant_id,100),clubId=clean(user.active_club_id,100);
    if(!tenantId||!clubId)return Response.json({error:'Choose an active RallyHub club first.'},{status:400});
    const club=(await base44.asServiceRole.entities.Club.filter({id:clubId,tenant_id:tenantId},'-updated_date',5))?.[0];
    if(!club)return Response.json({error:'Active club not found.'},{status:404});

    if(action==='admin_list'){
      const requests=await base44.asServiceRole.entities.GuestBookingRequest.filter({tenant_id:tenantId,club_id:clubId},'-submitted_at',200);
      const directory=await loadDirectory(base44,club.slug);
      const options=publicOptions(directory,await loadConfig(base44,tenantId,clubId));
      return Response.json({success:true,requests:(requests||[]).map((r:any)=>{const s=options.sessions.find((x:any)=>x.id===r.preferred_session_key);return {id:r.id,status:r.status,fullName:r.full_name,email:r.email,mobile:r.mobile,experienceLevel:r.experience_level,duprId:r.dupr_id||'',homeClub:r.home_club||'',sessionId:r.preferred_session_key,venueName:s?.venueName||r.preferred_venue_key,day:s?.day||'',start:s?.start||'',end:s?.end||'',nextDate:s?nextDateForDay(s.day):'',submittedAt:r.submitted_at};})});
    }

    if(action==='admin_reject'){
      const id=clean(body.requestId,100);
      const row=(await base44.asServiceRole.entities.GuestBookingRequest.filter({id,tenant_id:tenantId,club_id:clubId},'-submitted_at',5))?.[0];
      if(!row)return Response.json({error:'Guest request not found.'},{status:404});
      await base44.asServiceRole.entities.GuestBookingRequest.update(row.id,{status:'rejected',rejected_at:new Date().toISOString(),admin_notes:clean(body.reason||'Guest request declined by club.',500)});
      return Response.json({success:true});
    }

    if(action==='admin_approve'){
      const id=clean(body.requestId,100);
      const date=clean(body.sessionDate,20);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return Response.json({error:'Choose the approved session date.'},{status:400});
      const row=(await base44.asServiceRole.entities.GuestBookingRequest.filter({id,tenant_id:tenantId,club_id:clubId},'-submitted_at',5))?.[0];
      if(!row)return Response.json({error:'Guest request not found.'},{status:404});
      if(row.status!=='pending_approval')return Response.json({error:'This guest request has already been decided.'},{status:409});
      const {session,venue}=await sessionFromDirectory(base44,club,row.preferred_session_key);
      if(weekday(date)!==String(session.day||''))return Response.json({error:`That date is not a ${session.day}.`},{status:400});
      const payment=/cash/i.test(String(session.paymentMethod||''))?'cash':'sumup';
      const price=Number(session.price||0)||(payment==='cash'?5:5.5);
      let guestSession=(await base44.asServiceRole.entities.GuestSessionLink.filter({tenant_id:tenantId,club_id:clubId,session_date:date,start_time:String(session.start||''),venue_key:String(venue.id),active:true},'-created_at',10))?.[0];
      if(!guestSession){
        guestSession=await base44.asServiceRole.entities.GuestSessionLink.create({tenant_id:tenantId,club_id:clubId,token:sessionToken(),active:true,session_date:date,weekday:String(session.day||''),start_time:String(session.start||''),end_time:String(session.end||''),venue_key:String(venue.id),venue_name:String(venue.name||''),venue_address:String(venue.address||''),venue_eircode:String(venue.eircode||''),google_maps_url:String(venue.mapUrl||''),session_label:String(session.id),capacity:Number(session.capacity||0)||undefined,fee_amount:price,currency:'EUR',payment_method:payment,notification_email:emailKey(user.email||''),notification_name:clean(user.full_name||user.email||'',120),created_by_user_id:user.id,created_at:new Date().toISOString()});
      }
      const now=new Date();
      const invite=await base44.asServiceRole.entities.AccessInviteToken.create({tenant_id:tenantId,club_id:clubId,purpose:'guest_booking',token:inviteToken(),status:'active',session_link_id:guestSession.id,intended_email:row.email,intended_name:row.full_name,expires_at:new Date(now.getTime()+7*24*60*60*1000).toISOString(),created_by_user_id:user.id,created_at:now.toISOString(),notes:`Approved guest request ${row.id}`});
      await base44.asServiceRole.entities.GuestBookingRequest.update(row.id,{status:'approved',approved_at:now.toISOString(),approved_session_link_id:guestSession.id,admin_notes:`Approved for ${date} · ${session.day} ${session.start}`});
      return Response.json({success:true,magicInviteUrl:`https://rallyhub.ie/book/${encodeURIComponent(guestSession.token)}?invite=${encodeURIComponent(invite.token)}`,expiresAt:invite.expires_at,sessionDate:date});
    }

    return Response.json({error:'Invalid guest request action.'},{status:400});
  }catch(error){
    console.error('guestAccessJourney failed',error?.message||error);
    const status=Number(error?.status||500);
    return Response.json({error:status===500?'Unable to process the guest request right now.':error?.message||'Unable to process the guest request.'},{status});
  }
});
