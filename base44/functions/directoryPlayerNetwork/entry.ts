import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const CONSENT_VERSION='rallyhub-directory-player-updates-v1-2026-09';
const TOPICS=['events','coaching','pickleball_updates'];

function clean(v:any,max=250){return String(v??'').trim().replace(/\s+/g,' ').slice(0,max)}
function emailKey(v:any){return clean(v,240).toLowerCase()}
function phoneDigits(v:any){return clean(v,80).replace(/\D/g,'')}
function samePhone(a:any,b:any){const aa=phoneDigits(a),bb=phoneDigits(b);return !!aa&&!!bb&&(aa===bb||(aa.length>=9&&bb.length>=9&&aa.slice(-9)===bb.slice(-9)))}
function validEmail(v:any){const e=emailKey(v);return !!e&&/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)}
function token(){return `dp_${crypto.randomUUID().replaceAll('-','')}`}
function safe(row:any){return {
  id:row.id,firstName:row.first_name||'',fullName:row.full_name||'',email:row.email||'',mobile:row.mobile||'',
  clubName:row.club_name||'',clubSlug:row.club_slug||'',county:row.county||'',duprRating:row.dupr_rating??null,
  emailOptIn:row.email_opt_in===true,whatsappOptIn:row.whatsapp_opt_in===true,topics:Array.isArray(row.topics)?row.topics:TOPICS,
  status:row.status||'active',consentAt:row.consent_at||'',createdAt:row.created_at||row.created_date||'',updatedAt:row.updated_at||row.updated_date||''
}}

async function byToken(base44:any,rawToken:any){
  const t=clean(rawToken,100);
  if(!/^dp_[0-9a-f]{32}$/i.test(t))return null;
  const rows=await base44.asServiceRole.entities.DirectoryPlayerSubscriber.filter({unsubscribe_token:t},'-created_at',5);
  return rows?.[0]||null;
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action||'public_subscribe',60);

    if(action.startsWith('admin_')){
      const user=await base44.auth.me();
      if(user?.role!=='admin')return Response.json({error:'Admin access required'},{status:403});
      if(action==='admin_list'){
        const rows=await base44.asServiceRole.entities.DirectoryPlayerSubscriber.list('-updated_at',500);
        const active=(rows||[]).filter((r:any)=>r.status==='active'&&(r.email_opt_in===true||r.whatsapp_opt_in===true));
        const counties=new Set(active.map((r:any)=>clean(r.county,100)).filter(Boolean));
        const clubs=new Set(active.map((r:any)=>clean(r.club_name,160)).filter(Boolean));
        return Response.json({
          success:true,
          counts:{
            total:(rows||[]).length,
            active:active.length,
            email:active.filter((r:any)=>r.email_opt_in===true&&validEmail(r.email)).length,
            whatsapp:active.filter((r:any)=>r.whatsapp_opt_in===true&&phoneDigits(r.mobile).length>=8).length,
            counties:counties.size,
            clubs:clubs.size,
          },
          subscribers:(rows||[]).map(safe)
        });
      }
      return Response.json({error:'Invalid player network admin action.'},{status:400});
    }

    if(action==='public_get_preferences'){
      const row=await byToken(base44,body.token);
      if(!row)return Response.json({error:'This preference link is invalid or unavailable.'},{status:404});
      return Response.json({success:true,subscriber:safe(row),consentVersion:CONSENT_VERSION});
    }

    if(action==='public_update_preferences'){
      const row=await byToken(base44,body.token);
      if(!row)return Response.json({error:'This preference link is invalid or unavailable.'},{status:404});
      const emailOptIn=body.emailOptIn===true;
      const whatsappOptIn=body.whatsappOptIn===true;
      if(emailOptIn&&!validEmail(row.email))return Response.json({error:'A valid email address is required for email updates.'},{status:400});
      if(whatsappOptIn&&phoneDigits(row.mobile).length<8)return Response.json({error:'A valid mobile number is required for WhatsApp/SMS updates.'},{status:400});
      const now=new Date().toISOString();
      const status=emailOptIn||whatsappOptIn?'active':'unsubscribed';
      const updated=await base44.asServiceRole.entities.DirectoryPlayerSubscriber.update(row.id,{
        email_opt_in:emailOptIn,whatsapp_opt_in:whatsappOptIn,status,
        unsubscribed_at:status==='unsubscribed'?now:'',updated_at:now,
        consent_version:CONSENT_VERSION,consent_at:now,
      });
      return Response.json({success:true,subscriber:safe(updated),message:status==='unsubscribed'?'You have been unsubscribed from RallyHub player updates.':'Your RallyHub update preferences have been saved.'});
    }

    if(action!=='public_subscribe')return Response.json({error:'Invalid player network action.'},{status:400});

    // Honeypot: bots filling this hidden field get a harmless success response.
    if(clean(body.website,200))return Response.json({success:true,message:'Thanks. Your preferences have been saved.'});

    const firstName=clean(body.firstName,80);
    const fullName=clean(body.fullName||firstName,160);
    const email=emailKey(body.email);
    const mobile=clean(body.mobile,80);
    const clubName=clean(body.clubName,160);
    const clubSlug=clean(body.clubSlug,160);
    const county=clean(body.county,100);
    const emailOptIn=body.emailOptIn===true;
    const whatsappOptIn=body.whatsappOptIn===true;
    const duprRaw=body.duprRating===undefined||body.duprRating===null||body.duprRating===''?null:Number(body.duprRating);

    if(!firstName)return Response.json({error:'Please enter your first name.'},{status:400});
    if(!county)return Response.json({error:'Please choose your county.'},{status:400});
    if(!emailOptIn&&!whatsappOptIn)return Response.json({error:'Choose email and/or WhatsApp/SMS updates.'},{status:400});
    if(emailOptIn&&!validEmail(email))return Response.json({error:'Please enter a valid email address for email updates.'},{status:400});
    if(whatsappOptIn&&phoneDigits(mobile).length<8)return Response.json({error:'Please enter a valid mobile number for WhatsApp/SMS updates.'},{status:400});
    if(email&&!validEmail(email))return Response.json({error:'Please enter a valid email address or leave it blank.'},{status:400});
    if(mobile&&phoneDigits(mobile).length<8)return Response.json({error:'Please enter a valid mobile number or leave it blank.'},{status:400});
    if(duprRaw!==null&&(!Number.isFinite(duprRaw)||duprRaw<1||duprRaw>8))return Response.json({error:'DUPR rating should be between 1.0 and 8.0, or left blank.'},{status:400});

    const rows=await base44.asServiceRole.entities.DirectoryPlayerSubscriber.list('-updated_at',500);
    const existing=(rows||[]).find((r:any)=>
      (email&&emailKey(r.email)===email) || (mobile&&samePhone(r.mobile,mobile))
    )||null;
    const now=new Date().toISOString();
    const data:any={
      first_name:firstName,full_name:fullName,email,mobile,club_name:clubName,club_slug:clubSlug,county,
      dupr_rating:duprRaw,email_opt_in:emailOptIn,whatsapp_opt_in:whatsappOptIn,topics:TOPICS,status:'active',
      consent_version:CONSENT_VERSION,consent_at:now,source:'rallyhub_directory',updated_at:now,unsubscribed_at:''
    };
    let saved;
    if(existing){
      saved=await base44.asServiceRole.entities.DirectoryPlayerSubscriber.update(existing.id,{...data,unsubscribe_token:existing.unsubscribe_token||token()});
    }else{
      saved=await base44.asServiceRole.entities.DirectoryPlayerSubscriber.create({...data,unsubscribe_token:token(),created_at:now});
    }
    return Response.json({
      success:true,
      subscriber:safe(saved),
      preferencesUrl:`https://rallyhub.ie/directory/player-updates?token=${encodeURIComponent(saved.unsubscribe_token)}`,
      message:`Thanks ${firstName}. You're signed up for RallyHub pickleball updates.`
    });
  }catch(e){
    console.error('directoryPlayerNetwork failed',e?.message||e);
    return Response.json({error:e?.message||'Unable to save your RallyHub update preferences.'},{status:500});
  }
});
