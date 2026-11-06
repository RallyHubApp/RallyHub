import {readFileSync} from 'node:fs';
import {strict as assert} from 'node:assert';
import {eventTemplateValues,resolveEventTemplate} from '../base44/functions/eventRegistration/templateResolver.js';
import {eventTemplateValues as webhookValues,resolveEventTemplate as webhookResolve} from '../base44/functions/paymentGatewayWebhook/templateResolver.js';
const read=p=>readFileSync(p,'utf8');
const registration=read('base44/functions/eventRegistration/delivery.ts');
const webhook=read('base44/functions/paymentGatewayWebhook/eventDelivery.ts');
for(const [name,src] of [['registration',registration],['payment webhook',webhook]]){
 for(const token of ['CommunicationBrandKit','CommunicationTemplate','event_booking_confirmed_taster_draft','renderBasicBrandedEmail','sendWithConfiguredEmailTransport'])assert(src.includes(token),`${name} missing ${token}`);
 assert(src.includes("status:'approved'"),`${name} accepts unapproved template`);
}
assert.equal(read('base44/functions/eventRegistration/templateResolver.js'),read('base44/functions/paymentGatewayWebhook/templateResolver.js'),'Event and webhook resolvers have diverged');
const event={name:'Clare Pickleball Taster',start_date:'2026-11-12',event_start_time:'12:00',event_end_time:'13:00',event_fee_amount:5.5,location:'St Joseph’s Doora-Barefield'};
const booking={id:'TEST-BOOKING-001',full_name:'Kieran Test'};
const template={purpose:'event_booking_confirmed',status:'approved',subject_template:'Confirmed {{EVENT_NAME}}',plain_text_template:'{{EVENT_DATE}} {{EVENT_START_TIME}} {{EVENT_END_TIME}} {{EVENT_FEE}} {{BOOKING_REFERENCE}} {{EVENT_VENUE}}',html_template:'<a href="{{GOOGLE_MAPS_URL}}">Find your venue</a><a href="{{VENUE_MAP_URL}}">Directions</a>'};
const expected=resolveEventTemplate([template],'booking_confirmed',eventTemplateValues(event,booking));
assert.deepEqual(webhookResolve([template],'booking_confirmed',webhookValues(event,booking)),expected);
for(const token of ['12:00','13:00','5.50','TEST-BOOKING-001','Thursday','St Joseph'])assert(expected.body.includes(token),`Missing ${token}`);
assert(expected.html.includes('maps/search')&&expected.html.includes('Find your venue'));
assert.throws(()=>webhookResolve([template],'booking_confirmed',webhookValues({...event,event_start_time:''},booking)),/missing required merge field/);
console.log('PASS: event registration/webhook parity, approved templates, brand kit, date/time/fee/reference/map and fail-closed tokens');
