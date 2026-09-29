import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const clean=(v:any,max=500)=>String(v??'').trim().slice(0,max);
const nowIso=()=>new Date().toISOString();
const ALLOWED_PURPOSES=new Set(['trial','subscription','sponsorship','platform_event','event_services','onboarding','other']);

function requirePlatformAdmin(user:any){
  if(!user || !(user.role==='admin' || user.kotc_role==='super_admin')){
    throw Object.assign(new Error('RallyHub Super Admin access required.'),{status:403});
  }
}

async function gateway(base44:any){
  const rows=await base44.asServiceRole.entities.PlatformPaymentGatewayAccount.filter({provider:'sumup',is_default:true});
  return (rows||[]).sort((a:any,b:any)=>Date.parse(b.updated_date||b.created_date||0)-Date.parse(a.updated_date||a.created_date||0))[0]||null;
}

function safeGateway(row:any){
  if(!row)return null;
  const secretName=clean(row.credential_reference,120);
  return {
    id:row.id,
    provider:row.provider,
    display_name:row.display_name,
    connection_mode:row.connection_mode,
    status:row.status,
    is_default:row.is_default,
    merchant_account_id:row.merchant_account_id||'',
    credential_reference:secretName,
    secret_configured:!!(secretName&&Deno.env.get(secretName)),
    currency:row.currency||'EUR',
    supports_payments:row.supports_payments!==false,
    supports_refunds:row.supports_refunds===true,
    allowed_purposes:row.allowed_purposes||[],
    connected_at:row.connected_at||null,
    last_verified_at:row.last_verified_at||null,
    notes:row.notes||''
  };
}

function credentials(row:any,requireMerchantCode=true){
  if(!row)throw Object.assign(new Error('No RallyHub platform payment gateway is configured.'),{status:409});
  const secretName=clean(row.credential_reference,120);
  const merchantCode=clean(row.merchant_account_id,120);
  if(!secretName)throw Object.assign(new Error('RallyHub platform gateway has no credential reference.'),{status:409});
  const apiKey=Deno.env.get(secretName)||'';
  if(!apiKey)throw Object.assign(new Error(`Base44 secret ${secretName} is not configured.`),{status:409});
  if(requireMerchantCode&&!merchantCode)throw Object.assign(new Error('RallyHub SumUp merchant code is not configured.'),{status:409});
  return {apiKey,merchantCode,secretName};
}

async function verifySumUp(row:any){
  const {apiKey,merchantCode}=credentials(row,false);
  const response=await fetch('https://api.sumup.com/v0.1/me',{headers:{Authorization:`Bearer ${apiKey}`}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Object.assign(new Error(data?.message||`SumUp verification failed (${response.status}).`),{status:502});
  const profileCode=clean(data?.merchant_profile?.merchant_code||data?.merchant_code,120);
  const merchantName=clean(data?.merchant_profile?.business_name||data?.merchant_profile?.doing_business_as?.business_name||data?.business_name,240);
  if(!profileCode)throw Object.assign(new Error('SumUp verified the API key but did not return a merchant code.'),{status:502});
  if(merchantCode && profileCode!==merchantCode){
    throw Object.assign(new Error(`The RallyHub API key belongs to merchant ${profileCode}, but the configured RallyHub merchant code is ${merchantCode}. No payment was attempted.`),{status:409});
  }
  return {merchantCode:profileCode,merchantName};
}

async function createHostedCheckout(row:any,input:any){
  const {apiKey,merchantCode}=credentials(row);
  const amount=Math.round(Number(input.amount)*100)/100;
  if(!Number.isFinite(amount)||amount<=0||amount>10)throw Object.assign(new Error('Platform test checkout amount must be between €0.01 and €10.00.'),{status:400});
  const purpose=clean(input.purposeType,80)||'other';
  if(!ALLOWED_PURPOSES.has(purpose))throw Object.assign(new Error('Unsupported RallyHub platform payment purpose.'),{status:400});
  const reference=`RH-TEST-${Date.now()}-${crypto.randomUUID().slice(0,8)}`.slice(0,64);
  const response=await fetch('https://api.sumup.com/v0.1/checkouts',{
    method:'POST',
    headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
    body:JSON.stringify({
      checkout_reference:reference,
      amount,
      currency:'EUR',
      merchant_code:merchantCode,
      description:'RallyHub platform payment test',
      hosted_checkout:{enabled:true},
      redirect_url:'https://rallyhub.ie/'
    })
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data?.id||!data?.hosted_checkout_url)throw Object.assign(new Error(data?.message||'SumUp could not create the RallyHub test checkout.'),{status:502});
  return {amount,purpose,reference,data,merchantCode};
}

async function retrieveCheckout(row:any,checkoutId:string){
  const {apiKey,merchantCode}=credentials(row);
  const response=await fetch(`https://api.sumup.com/v0.1/checkouts/${encodeURIComponent(checkoutId)}`,{headers:{Authorization:`Bearer ${apiKey}`}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Object.assign(new Error(data?.message||'Could not verify RallyHub SumUp checkout.'),{status:502});
  const tx=(Array.isArray(data?.transactions)?data.transactions:[]).find((t:any)=>String(t?.status||'').toUpperCase()==='SUCCESSFUL')||data?.transactions?.[0]||{};
  const status=String(data?.status||'PENDING').toUpperCase();
  const normalized=['PAID','SUCCESSFUL'].includes(status)?'paid':status==='REFUNDED'?'refunded':['FAILED','CANCELLED'].includes(status)?'failed':status==='EXPIRED'?'failed':'pending';
  return {data,merchantCode,transactionId:clean(tx?.id||data?.transaction_id,180),transactionCode:clean(tx?.transaction_code||data?.transaction_code,180),normalized};
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const user=await base44.auth.me().catch(()=>null);
    requirePlatformAdmin(user);
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action,80)||'status';
    let row=await gateway(base44);

    if(action==='status')return Response.json({success:true,gateway:safeGateway(row)});

    if(action==='verify'){
      const result=await verifySumUp(row);
      row=await base44.asServiceRole.entities.PlatformPaymentGatewayAccount.update(row.id,{status:'connected',merchant_account_id:result.merchantCode,last_verified_at:nowIso(),connected_at:row.connected_at||nowIso(),notes:`RallyHub platform/commercial SumUp gateway. Verified merchant: ${result.merchantName||result.merchantCode}. Tenant/club payment gateways remain separate.`});
      return Response.json({success:true,gateway:safeGateway(row),merchantName:result.merchantName});
    }

    if(action==='create_test_checkout'){
      await verifySumUp(row);
      const created=await createHostedCheckout(row,body);
      const payment=await base44.asServiceRole.entities.PlatformPaymentRecord.create({
        gateway_account_id:row.id,purpose_type:created.purpose,purpose_id:'platform_gateway_test',customer_name:'RallyHub gateway test',amount:created.amount,currency:'EUR',payment_status:'pending',provider:'sumup',provider_account_id:created.merchantCode,provider_checkout_id:String(created.data.id),provider_checkout_url:String(created.data.hosted_checkout_url),provider_payment_reference:created.reference,provider_status:String(created.data.status||'PENDING'),source_system:'platform_payment_gateway_test',notes:'Controlled RallyHub platform gateway test. This record must never be reconciled into a tenant ledger.'
      });
      return Response.json({success:true,paymentId:payment.id,checkoutId:String(created.data.id),checkoutUrl:String(created.data.hosted_checkout_url),reference:created.reference,amount:created.amount});
    }

    if(action==='verify_test_checkout'){
      const paymentId=clean(body.paymentId,180);
      const rows=await base44.asServiceRole.entities.PlatformPaymentRecord.filter({id:paymentId});
      const payment=rows?.[0];
      if(!payment||payment.gateway_account_id!==row.id||payment.source_system!=='platform_payment_gateway_test')return Response.json({error:'RallyHub platform test payment not found.'},{status:404});
      const result=await retrieveCheckout(row,clean(payment.provider_checkout_id,180));
      const saved=await base44.asServiceRole.entities.PlatformPaymentRecord.update(payment.id,{payment_status:result.normalized,provider_account_id:result.merchantCode,provider_transaction_id:result.transactionId,provider_payment_reference:result.transactionCode||payment.provider_payment_reference,provider_status:String(result.data?.status||''),payment_date:result.normalized==='paid'?new Date().toISOString().slice(0,10):payment.payment_date});
      return Response.json({success:true,payment:{id:saved.id,payment_status:saved.payment_status,provider_status:saved.provider_status,provider_transaction_id:saved.provider_transaction_id,provider_payment_reference:saved.provider_payment_reference,amount:saved.amount,currency:saved.currency}});
    }

    return Response.json({error:'Unknown platform payment gateway action.'},{status:400});
  }catch(error:any){
    console.error('platformPaymentGateway error',error?.message||error);
    return Response.json({error:error?.message||'RallyHub platform payment gateway operation failed.'},{status:error?.status||500});
  }
});
