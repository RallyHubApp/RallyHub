/**
 * Tournival public registration endpoint. Non-privileged access requires a
 * 192-bit opaque link; only SHA-256 digests persist. Sport state is untouched.
 *
 * Payment routes through existing RallyHub SumUp provider adapter. Never mark
 * a payment paid on browser return. Verified webhook/reconcile only.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.29';
import { createCheckout, providerConfigured, type ProviderAccount } from '../guestSessionBooking/payments.ts';
const clean=(value:any,max=240)=>String(value??'').trim().replace(/\s+/g,' ').slice(0,max);
const emailKey=(value:any)=>clean(value,180).toLowerCase();
const safeError=(error:string,status=400)=>Response.json({success:false,error},{status});
async function sha256(value:string) {
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
}
function activeAccess(row:any) {
  return row&&!row.revoked_at&&(!row.expires_at||Date.parse(row.expires_at)>Date.now());
}
function safeEvent(t:any,registered:number,waitlisted:number){
  const fee=Number(t.event_fee_amount||0);
  return {id:t.id,name:t.name,date:t.start_date||'',venue:t.location||'',
    capacity:Number(t.max_players||32),registered,waitlisted,fee,currency:t.event_currency||'EUR',
    status:t.status,format:'Tournival',minimumPlayers:4};
}
function publicReceipt(row:any,event:any,checkoutUrl='') {
  return {success:true,event,registration:{
    id:row.id,status:row.registration_status,paymentStatus:row.payment_status,
    checkoutUrl:checkoutUrl||'',amountDue:row.amount_due,waitlistPosition:row.waitlist_position||null
  }};
}
async function accountFor(base44:any,tournament:any):Promise<ProviderAccount|null>{
  const rows=await base44.asServiceRole.entities.PaymentGatewayAccount.filter({
    tenant_id:tournament.tenant_id,club_id:tournament.host_club_id,provider:'sumup',
    status:'connected',is_default:true
  },'-updated_date',5);
  const row=rows?.[0];
  if(!row)return null;
  return {provider:'sumup',merchantAccountId:row.merchant_account_id||'',
    credentialSecretName:row.credential_reference||'SUMUP_API_KEY',
    connectionMode:row.connection_mode||'api_key'};
}
Deno.serve(async(req)=>{
  if(req.method!=='POST')return safeError('POST required',405);
  const contentLength=Number(req.headers.get('content-length')||0);
  if(contentLength>20000)return safeError('Payload too large',413);
  try {
    const body=await req.json().catch(()=>({}));
    const token=clean(body.token,120);
    const action=clean(body.action||'get',40);
    if(!/^trn_[0-9a-f]{48}$/.test(token))return safeError('Invalid registration link',404);
    const base44=createClientFromRequest(req);
    const accessRows=await base44.asServiceRole.entities.TournivalAccessToken.filter({
      token_hash:await sha256(token),token_type:'registration'
    },'-created_at',3);
    const access=accessRows?.find(activeAccess);
    if(!access)return safeError('Registration link expired or revoked',404);
    const events=await base44.asServiceRole.entities.Tournament.filter({id:access.tournament_id});
    const tournament=events?.[0];
    if(!tournament||tournament.tenant_id!==access.tenant_id||
      String(tournament.format).toLowerCase()!=='tournival')
      return safeError('Tournival not available',404);
    const all=await base44.asServiceRole.entities.TournivalRegistration.filter({
      tournament_id:tournament.id,tenant_id:tournament.tenant_id
    },'-registered_at',500);
    const rows=all||[];
    const registered=rows.filter((r:any)=>['confirmed','pending_payment'].includes(r.registration_status)).length;
    const waitlisted=rows.filter((r:any)=>r.registration_status==='waitlisted').length;
    const event=safeEvent(tournament,registered,waitlisted);
    if(action==='get')return Response.json({success:true,event,consentVersion:'tournival-participation-v1'});
    if(action!=='register')return safeError('Unsupported registration action',400);
    if(!['Draft','Registration Open'].includes(tournament.status))return safeError('Registration closed',409);
    const name=clean(body.fullName,120),email=emailKey(body.email),mobile=clean(body.mobile,40);
    const operationId=clean(body.operationId,120);
    if(name.length<2||!/^\S+@\S+\.\S+$/.test(email)||!operationId||mobile.length>40)
      return safeError('Valid name, email and registration operation required');
    if(body.consent!==true||body.consentVersion!=='tournival-participation-v1')
      return safeError('Participation and privacy consent required');
    const duplicateOperation=rows.find((r:any)=>r.registration_operation_id===operationId);
    if(duplicateOperation){
      const payments=await base44.asServiceRole.entities.PaymentRecord.filter({purpose_type:'event',purpose_id:duplicateOperation.id},'-created_date',5);
      return Response.json(publicReceipt(duplicateOperation,event,payments?.[0]?.provider_checkout_url||''));
    }
    if(rows.some((r:any)=>emailKey(r.email)===email && r.registration_status!=='withdrawn')){
      // Public links must not reveal another person's registration/payment details.
      return Response.json({error:'This email may already be registered. Please contact the event organiser.'},{status:409});
    }
    // Reuse existing RallyHub Player identity when email already belongs to this tenant.
    const players=await base44.asServiceRole.entities.Player.filter({tenant_id:tournament.tenant_id,email},'-created_date',5);
    const player=players?.[0]||await base44.asServiceRole.entities.Player.create({
      tenant_id:tournament.tenant_id,full_name:name,email,
      phone:mobile||undefined,status:'Active',club_id:tournament.host_club_id||undefined
    });
    let person:any=(await base44.asServiceRole.entities.Person.filter({
      tenant_id:tournament.tenant_id,primary_email:email
    },'-updated_date',5))?.[0];
    if(!person)person=await base44.asServiceRole.entities.Person.create({
      tenant_id:tournament.tenant_id,full_name:name,primary_email:email,mobile,
      source_system:'tournival_registration',profile_visibility:'private'
    });
    const accepted=registered<event.capacity;
    const fee=Number(event.fee)||0;
    const status=!accepted?'waitlisted':fee>0?'pending_payment':'confirmed';
    let registration=await base44.asServiceRole.entities.TournivalRegistration.create({
      tenant_id:tournament.tenant_id,club_id:tournament.host_club_id||tournament.tenant_id,
      tournament_id:tournament.id,player_id:player.id,full_name:name,email,mobile,
      registration_operation_id:operationId,registration_status:status,
      amount_due:fee,currency:event.currency,
      payment_status:status==='waitlisted'?'not_required':fee>0?'pending':'not_required',
      consent_version:'tournival-participation-v1',consent_at:new Date().toISOString(),
      dupr_consent:body.duprConsent===true,dupr_consent_version:'tournival-dupr-opt-in-v1',
      registered_at:new Date().toISOString(),
      ...(status==='confirmed'?{confirmed_at:new Date().toISOString()}:{}),
      ...(status==='waitlisted'?{waitlist_position:waitlisted+1}:{})
    });
    // Confirmed free registration participates in the same player roster used
    // by the existing Tournival Setup screen. Pending/waitlisted never enter it.
    await base44.asServiceRole.entities.ConsentRecord.create({
      tenant_id:tournament.tenant_id,club_id:tournament.host_club_id||tournament.tenant_id,
      person_id:person.id,consent_type:'tournival_dupr_result_reporting',
      status:body.duprConsent===true?'accepted':'declined',
      consent_version:'tournival-dupr-opt-in-v1',recorded_at:new Date().toISOString(),
      source_system:'tournival_registration',source_row:registration.id
    });
    if(status==='confirmed'){
      const roster=Array.isArray(tournament.player_ids)?tournament.player_ids:[];
      if(!roster.includes(player.id)){
        await base44.asServiceRole.entities.Tournament.update(tournament.id,{
          player_ids:[...roster,player.id]
        });
      }
    }
    // Issue a distinct persistent personalised player link, independent from
    // the event registration link; store a hash, never the bearer value.
    const random=crypto.getRandomValues(new Uint8Array(24));
    const playerToken='trp_'+Array.from(random,b=>b.toString(16).padStart(2,'0')).join('');
    await base44.asServiceRole.entities.TournivalAccessToken.create({
      tenant_id:tournament.tenant_id,club_id:tournament.host_club_id||tournament.tenant_id,
      tournament_id:tournament.id,token_hash:await sha256(playerToken),token_type:'player',
      player_id:player.id,registration_id:registration.id,
      created_at:new Date().toISOString(),created_by_user_id:'self_registration'
    });
    const personalPath=`/tournival/player/${playerToken}`;
    if(status==='waitlisted'||fee===0)return Response.json({...publicReceipt(registration,event),personalPath},{status:201});

    // Hold the registration if payment infrastructure is temporarily unavailable.
    const account=await accountFor(base44,tournament);
    if(!providerConfigured('sumup',account)){
      return Response.json({...publicReceipt(registration,event),personalPath,paymentUnavailable:true,
        message:'Registration held; payment checkout currently unavailable. Contact organiser.'},{status:202});
    }
    const reference=`RH-TRN-${registration.id}`.slice(0,64);
    const payment=await base44.asServiceRole.entities.PaymentRecord.create({
      tenant_id:tournament.tenant_id,club_id:tournament.host_club_id||tournament.tenant_id,
      person_id:person.id,purpose_type:'event',purpose_id:registration.id,
      payment_type:'tournival_registration',amount:fee,currency:event.currency,
      provider:'sumup',payment_method:'online',payment_status:'pending',
      provider_payment_reference:reference
    });
    try{
      const checkout=await createCheckout({
        provider:'sumup',account,amount:fee,currency:event.currency,reference,
        description:`Tournival: ${clean(tournament.name,75)}`,
        redirectUrl:`https://rallyhub.ie/tournival/register/${encodeURIComponent(token)}`
      });
      await base44.asServiceRole.entities.PaymentRecord.update(payment.id,{
        provider_checkout_id:checkout.checkoutId,provider_checkout_url:checkout.checkoutUrl,
        provider_status:checkout.providerStatus,provider_account_id:checkout.merchantAccountId
      });
      registration=await base44.asServiceRole.entities.TournivalRegistration.update(registration.id,{payment_record_id:payment.id});
      return Response.json({...publicReceipt(registration,event,checkout.checkoutUrl),personalPath},{status:201});
    }catch(error){
      // Do not blindly create a second checkout after a network timeout.
      console.warn('Tournival payment checkout requires reconciliation',registration.id);
      return Response.json({...publicReceipt(registration,event),personalPath,paymentUnavailable:true,
        message:'Registration held. Payment checkout pending review; no payment confirmed.'},{status:202});
    }
  }catch(error){
    console.error('Tournival public registration failed:',(error as any)?.message||error);
    return safeError('Unable to process registration safely. Please contact organiser.',500);
  }
});
