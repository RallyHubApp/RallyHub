/** Tenant-independent callback config: never send live payment notifications to a different app. */
export function resolveEventCheckoutUrls({callbackBase,publicBase,slug}={}){
 const callback=String(callbackBase||'').trim(),publicSite=String(publicBase||'').trim();
 for(const [name,value] of [['callback',callback],['public',publicSite]]){
  let url;try{url=new URL(value)}catch{throw new Error(`${name}_base_url_not_configured`)}
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw new Error(`${name}_base_url_invalid`);
 }
 if(!slug||!String(slug).match(/^[a-zA-Z0-9_-]+$/))throw new Error('event_slug_invalid');
 return {returnUrl:new URL('functions/paymentGatewayWebhook?provider=sumup',callback.endsWith('/')?callback:callback+'/').toString(),redirectUrl:new URL('/events/'+encodeURIComponent(slug),publicSite.endsWith('/')?publicSite:publicSite+'/').toString()};
}
