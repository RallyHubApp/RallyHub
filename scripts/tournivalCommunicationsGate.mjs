import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const funcs=['tournivalRegistration','tournivalHostAccess','tournivalPlayerPortal','tournivalPublicRead','legacyTournamentManager'];
for(const name of funcs){
 const source=readFileSync('base44/functions/'+name+'/entry.ts','utf8');
 assert.doesNotMatch(source,/(?:\.SendEmail\s*\(|sendWithConfiguredEmailTransport\s*\(|gmail\.googleapis\.com|messages\/send|wa\.me\/|sendWhatsApp\s*\()/,
   name+' bypasses Communications Centre');
}
const engine=readFileSync('base44/functions/communicationsEngine/entry.ts','utf8');
assert.match(engine,/action==='preview_tournival'/);
assert.match(engine,/resolveApprovedTournivalTemplate/);
const templates=readFileSync('base44/functions/communicationsEngine/tournivalTemplates.ts','utf8');
assert.match(templates,/status!=='approved'/);
assert.match(templates,/status!=='active'/);
assert.match(templates,/renderBasicBrandedEmail/);
const auto=readFileSync('base44/functions/communicationsEngine/tournivalAutoDispatch.ts','utf8');
const bridge=readFileSync('base44/functions/communicationsEngine/tournivalNoticeBridge.ts','utf8');
assert.match(bridge,/if\(!queued.queued\)return queued/,'Original-only automatic dispatch required');
assert.match(bridge,/dispatchNewTournivalNotice/);
assert.match(auto,/status:'queued'/);assert.match(auto,/status:'sending'/);
assert.match(auto,/updateMany/);assert.match(auto,/validateTournivalDeliveryEligibility/);
assert.match(auto,/assessTournivalConsent/);assert.match(auto,/sendWithConfiguredEmailTransport/);
assert.match(auto,/unverified_provider_outcome/);
assert.doesNotMatch(auto,/status:'queued'\s*\}\s*\)/,'No resetting delivery after unknown provider outcome');
assert.match(templates,/tournival_post_event_thanks/);
assert.match(readFileSync('src/components/communications/TournivalTemplateManager.jsx','utf8'),/tournival_post_event_thanks/);
assert.match(templates,/deliveryPerformed:false|templateId:template.id/);
for(const [name,eventMarkers] of Object.entries({
  tournivalRegistration:['tournival_registration_received','tournival_payment_required','tournival_waitlist_added','checkout.checkoutUrl'],
  legacyTournamentManager:['tournival_host_invite','tournival_results','tournival_waitlist_promoted'],
  paymentGatewayWebhook:['tournival_payment_confirmed','verified.amount','verified.currency']
})){
 const source=readFileSync('base44/functions/'+name+'/entry.ts','utf8');
 assert.match(source,/safelyQueueTournivalNotice/,'Missing approved tenant queue bridge: '+name);
 for(const marker of eventMarkers)assert.ok(source.includes(marker),'Missing event hook '+marker+' in '+name);
}
const centre=readFileSync('base44/functions/communicationsEngine/entry.ts','utf8');
for(const action of ['queue_tournival','resend_tournival','tournival_audience',
 'dispatch_tournival','handoff_tournival_whatsapp','confirm_tournival_whatsapp']){
 assert.ok(centre.includes(action),'Missing central action '+action);
}
assert.match(centre,/status:'queued'/);
assert.match(centre,/status:'sending'/);
assert.match(centre,/CommunicationSuppression/);
const ledger=readFileSync('base44/functions/communicationsEngine/tournivalDelivery.ts','utf8');
assert.match(ledger,/tournival_communication_keys:\{\$ne:key\}/);
assert.match(ledger,/\$addToSet:\{tournival_communication_keys:key\}/);
assert.match(ledger,/CommunicationDeliveryAttempt/);
assert.match(ledger,/CommunicationCampaign/);
assert.match(ledger,/CommunicationRecipient/);
assert.match(ledger,/CommunicationEvent/);
const ui=readFileSync('src/pages/CommunicationsCentre.jsx','utf8');
assert.match(ui,/TournivalAudiencePanel/);
assert.match(ui,/TournivalTemplateManager/);
console.log('TOURNIVAL COMMUNICATIONS GATE PASS: no direct channel send; approved Centre template, tenant brand, fail-closed preview.');
