export type PaymentProvider='sumup'|'stripe'|'square'|'cash'|string;

export type ProviderAccount={
  provider:PaymentProvider;
  merchantAccountId?:string;
  credentialSecretName?:string;
  connectionMode?:'api_key'|'oauth'|'manual'|string;
};

export type CheckoutRequest={
  provider:PaymentProvider;
  account?:ProviderAccount|null;
  amount:number;
  currency:string;
  reference:string;
  description:string;
  redirectUrl:string;
  returnUrl?:string;
};

export type CheckoutResult={
  provider:PaymentProvider;
  checkoutId:string;
  checkoutUrl:string;
  reference:string;
  providerStatus:string;
  merchantAccountId:string;
};

export type PaymentStatusResult={
  provider:PaymentProvider;
  providerStatus:string;
  normalizedStatus:'paid'|'pending'|'failed'|'expired'|'refunded'|'unknown';
  transactionId:string;
  transactionCode:string;
  merchantAccountId:string;
  raw:any;
};

export type RefundRequest={
  provider:PaymentProvider;
  account?:ProviderAccount|null;
  transactionId:string;
  amount?:number;
  currency:string;
};

export type RefundResult={
  provider:PaymentProvider;
  providerStatus:string;
  refundId:string;
  transactionId:string;
  merchantAccountId:string;
  raw:any;
};

function requiredAmount(value:any){
  const amount=Number(value);
  if(!Number.isFinite(amount)||amount<=0) throw new Error('A valid payment amount is required.');
  return Math.round(amount*100)/100;
}

function sumUpCredentials(account?:ProviderAccount|null){
  const secretName=account?.credentialSecretName||'SUMUP_API_KEY';
  const apiKey=Deno.env.get(secretName)||'';
  const merchantAccountId=account?.merchantAccountId||Deno.env.get('SUMUP_MERCHANT_CODE')||'';
  if(!apiKey||!merchantAccountId) throw new Error('SumUp is not configured for this RallyHub club.');
  return {apiKey,merchantAccountId};
}

export function providerConfigured(provider:PaymentProvider,account?:ProviderAccount|null){
  if(provider==='cash') return true;
  if(provider==='sumup'){
    try{sumUpCredentials(account);return true}catch{return false}
  }
  return false;
}

export async function verifyProviderConnection(provider:PaymentProvider,account?:ProviderAccount|null){
  if(provider!=='sumup') return {ok:false,provider,error:`Payment provider ${provider} is not implemented yet.`};
  try{
    const {apiKey,merchantAccountId}=sumUpCredentials(account);
    const response=await fetch('https://api.sumup.com/v0.1/me',{headers:{Authorization:`Bearer ${apiKey}`}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      return {ok:false,provider:'sumup',merchantAccountId,error:data?.message||`SumUp verification failed (${response.status}).`};
    }
    const profileCode=String(data?.merchant_profile?.merchant_code||data?.merchant_code||merchantAccountId||'');
    const merchantName=String(data?.merchant_profile?.business_name||data?.merchant_profile?.doing_business_as?.business_name||data?.business_name||'');
    return {ok:true,provider:'sumup',merchantAccountId:profileCode||merchantAccountId,merchantName};
  }catch(e){
    return {ok:false,provider:'sumup',merchantAccountId:'',error:e?.message||'SumUp verification failed.'};
  }
}

export async function createCheckout(input:CheckoutRequest):Promise<CheckoutResult>{
  const amount=requiredAmount(input.amount);
  if(input.provider!=='sumup') throw new Error(`Payment provider ${input.provider} is not implemented yet.`);
  const {apiKey,merchantAccountId}=sumUpCredentials(input.account);
  const response=await fetch('https://api.sumup.com/v0.1/checkouts',{
    method:'POST',
    headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
    body:JSON.stringify({
      checkout_reference:String(input.reference).slice(0,64),
      amount,
      currency:String(input.currency||'EUR').toUpperCase(),
      merchant_code:merchantAccountId,
      description:String(input.description||'RallyHub payment').slice(0,120),
      redirect_url:input.redirectUrl,
      ...(input.returnUrl?{return_url:input.returnUrl}:{}),
      hosted_checkout:{enabled:true},
    }),
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data?.id||!data?.hosted_checkout_url){
    throw new Error(data?.message||'SumUp could not create the payment checkout.');
  }
  return {
    provider:'sumup',checkoutId:String(data.id),checkoutUrl:String(data.hosted_checkout_url),
    reference:String(input.reference),providerStatus:String(data.status||'PENDING'),merchantAccountId,
  };
}

function normalizeSumUpStatus(status:any):PaymentStatusResult['normalizedStatus']{
  const value=String(status||'').toUpperCase();
  if(['PAID','SUCCESSFUL'].includes(value))return 'paid';
  if(value==='REFUNDED')return 'refunded';
  if(['FAILED','CANCELLED'].includes(value))return 'failed';
  if(value==='EXPIRED')return 'expired';
  if(['PENDING',''].includes(value))return 'pending';
  return 'unknown';
}

export async function retrievePayment(provider:PaymentProvider,checkoutId:string,account?:ProviderAccount|null):Promise<PaymentStatusResult>{
  if(provider!=='sumup') throw new Error(`Payment provider ${provider} is not implemented yet.`);
  const {apiKey,merchantAccountId}=sumUpCredentials(account);
  const response=await fetch(`https://api.sumup.com/v0.1/checkouts/${encodeURIComponent(checkoutId)}`,{
    headers:{Authorization:`Bearer ${apiKey}`},
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data?.message||'Could not verify SumUp payment.');
  const tx=(Array.isArray(data?.transactions)?data.transactions:[]).find((t:any)=>String(t?.status||'').toUpperCase()==='SUCCESSFUL')
    || data?.transactions?.[0] || {};
  return {
    provider:'sumup',providerStatus:String(data?.status||'PENDING'),normalizedStatus:normalizeSumUpStatus(data?.status),
    transactionId:String(tx?.id||data?.transaction_id||''),
    transactionCode:String(tx?.transaction_code||data?.transaction_code||''),
    merchantAccountId:String(data?.merchant_code||merchantAccountId),raw:data,
  };
}

export async function refundPayment(input:RefundRequest):Promise<RefundResult>{
  if(input.provider!=='sumup') throw new Error(`Refunds for payment provider ${input.provider} are not implemented yet.`);
  const {apiKey,merchantAccountId}=sumUpCredentials(input.account);
  if(!input.transactionId) throw new Error('The gateway transaction ID is missing, so this payment cannot be refunded yet.');
  const partial=input.amount!==undefined&&input.amount!==null;
  const body=partial?JSON.stringify({amount:requiredAmount(input.amount)}):undefined;
  const response=await fetch(`https://api.sumup.com/v0.1/me/refund/${encodeURIComponent(input.transactionId)}`,{
    method:'POST',
    headers:partial?{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'}:{Authorization:`Bearer ${apiKey}`},
    body,
  });
  const data=response.status===204?{}:await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data?.message||'SumUp could not issue the refund.');
  return {
    provider:'sumup',providerStatus:String(data?.status||'REFUNDED'),refundId:String(data?.id||data?.refund_id||''),
    transactionId:input.transactionId,merchantAccountId,raw:data,
  };
}