/** Release gate: run before publishing changes touching live member/payment/event journeys.
 * Configuration names only; never print secret values. Requires explicit production readiness flags.
 */
import {resolveEventCheckoutUrls} from '../base44/functions/eventRegistration/checkoutUrls.mjs';
const required=['RALLYHUB_EVENT_CALLBACK_BASE_URL','RALLYHUB_EVENT_PUBLIC_BASE_URL'];
const missing=required.filter(k=>!process.env[k]);
if(missing.length){console.error(`BLOCK RELEASE: missing ${missing.join(', ')}`);process.exitCode=1}
else{
 try{
  const urls=resolveEventCheckoutUrls({callbackBase:process.env.RALLYHUB_EVENT_CALLBACK_BASE_URL,publicBase:process.env.RALLYHUB_EVENT_PUBLIC_BASE_URL,slug:'release-gate-test'});
  const expectedHost=new URL(process.env.RALLYHUB_EVENT_PUBLIC_BASE_URL).host;
  if(new URL(urls.redirectUrl).host!==expectedHost||!urls.returnUrl.includes('/functions/paymentGatewayWebhook?provider=sumup'))throw Error('Unexpected event checkout URLs');
  console.log('Event checkout URL configuration: valid');
 }catch(e){console.error('BLOCK RELEASE: invalid event checkout URL configuration',e.message);process.exitCode=1}
}
if(process.env.LIVE_WORKFLOW_REGRESSION_VERIFIED!=='yes'){
 console.error('BLOCK RELEASE: live event, guest, membership and notification regression evidence not confirmed');process.exitCode=1;
}
