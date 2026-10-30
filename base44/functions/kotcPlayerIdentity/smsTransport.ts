/** Optional Android SMS relay. No direct client access to credentials. */
export function smsAvailable(){return !!(Deno.env.get('KOTC_SMS_GATEWAY_URL')&&Deno.env.get('KOTC_SMS_GATEWAY_TOKEN'));}
export function normalizeIrishMobile(value:string){
 const s=String(value||'').replace(/[\s().-]/g,'');
 const digits=s.replace(/^\+/,'');
 if(/^08\d{8}$/.test(digits))return '+353'+digits.slice(1);
 if(/^3538\d{8}$/.test(digits))return '+'+digits;
 return null;
}
export function maskMobile(value:string){return value.slice(0,4)+'••••'+value.slice(-3);}
export async function sendSmsCode(to:string,code:string){
 const url=Deno.env.get('KOTC_SMS_GATEWAY_URL')||'';
 const token=Deno.env.get('KOTC_SMS_GATEWAY_TOKEN')||'';
 if(!url||!token)throw new Error('SMS backup is not configured. Use email or ask the host.');
 const parsed=new URL(url);
 if(parsed.protocol!=='https:'||parsed.username||parsed.password)throw new Error('SMS gateway requires an HTTPS endpoint.');
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
 try{
  const response=await fetch(parsed.toString(),{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({to,message:`RallyHub KOTC verification code: ${code}. Expires in 10 minutes. Do not share this code.`}),signal:controller.signal});
  if(!response.ok)throw new Error(`SMS gateway rejected the request (${response.status}).`);
  const payload=await response.json().catch(()=>null);
  if(!payload||payload.accepted!==true)throw new Error('SMS gateway did not confirm acceptance.');
  return {accepted:true};
 }finally{clearTimeout(timeout);}
}
