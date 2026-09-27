import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const booking = read('base44/functions/guestSessionBooking/entry.ts');
const webhook = read('base44/functions/paymentGatewayWebhook/entry.ts');
const memberPortal = read('base44/functions/memberPortal/entry.ts');
const schema = JSON.parse(read('base44/entities/GuestSessionBooking.jsonc'));
const publicRequest = read('src/pages/PublicGuestRequest.jsx');
const privateBooking = read('src/pages/PublicGuestSessionBooking.jsx');

const memberStart = booking.indexOf("if(action==='public_member_lookup'||action==='public_member_submit')");
const guestStart = booking.indexOf('const tokenValue=clean(body.token,80)', memberStart);
assert(memberStart >= 0 && guestStart > memberStart, 'Member booking branch must exist before guest token branch');
const memberBlock = booking.slice(memberStart, guestStart);

assert(memberBlock.includes('resolveActiveMember'), 'Member flow must validate against the membership database');
assert(booking.includes('No membership record found. Please follow the guest booking process.'), 'Unknown member must fail closed into guest process');
assert(booking.includes("m.membership_status==='paid_active'"), 'Only paid/active memberships may use member fallback');
assert(booking.includes("m.relationship_type==='member'"), 'Only member relationships may use member fallback');
assert(booking.includes('methods.push(\'name\')') && booking.includes('methods.push(\'email\')') && booking.includes('methods.push(\'mobile\')'), 'Name, email and mobile matching must all remain available');
assert(memberBlock.includes('loadInvitedMemberSpondSessions'), 'Member fallback must load personalised Spond sessions');
assert(booking.includes('memberIsInvitedToSpondEvent(event,person,memberId)'), 'Spond booking events must be filtered to the exact member invite list');
assert(!booking.includes('(event?.recipients?.group?.members||[]).forEach'), 'Broad Spond group visibility must not be treated as a personal session invite');
assert(booking.includes("scheduled:'false'"), 'Member booking must exclude Spond invitations that have not been sent yet');
assert(booking.includes("addProfileInfo:'true'"), 'Member booking must request Spond profile info for robust event-level identity matching');
assert(booking.includes('event?.responses?.unconfirmedIds'), 'Spond unconfirmed invitees must remain eligible once the invitation exists');
assert(booking.includes('if(!venueMatch)return null'), 'Spond booking must fail closed when event venue does not match the configured session');
assert(memberPortal.includes('memberIsInvitedToSpondEvent(event, { emails, phones, names }, memberId)'), 'Member portal must use the same exact Spond invite rule');
assert(!memberPortal.includes('(event?.recipients?.group?.members || []).forEach'), 'Member portal must not treat broad Spond group visibility as an invite');
assert(memberPortal.includes("scheduled:'false'"), 'Member portal must exclude unsent Spond invitations');
assert(memberPortal.includes('event?.responses?.unconfirmedIds'), 'Member portal must include Spond unconfirmed invitees once invited');
assert(memberBlock.includes("const selected=(spond.sessions||[]).find"), 'Selected Spond occurrence must be revalidated on submit');
assert(!memberBlock.includes('waiverAccepted'), 'Member flow must not require the guest waiver');
assert(!memberBlock.includes('codeAccepted'), 'Member flow must not require guest Code of Conduct re-acceptance');
assert(memberBlock.includes("participant_type:'member'"), 'Member bookings must be recorded as member');
assert(memberBlock.includes('booking_note:clean(body.bookingNote,1000)'), 'Member host note must be stored');
assert(booking.includes("participant_type:'guest'"), 'Guest bookings must still be recorded as guest');
assert(booking.includes('booking_note:clean(body.bookingNote,1000)'), 'Guest host note must be stored');
assert(booking.includes('body.waiverAccepted!==true') && booking.includes('body.codeAccepted!==true'), 'Guest legal acceptance must remain enforced');
assert(booking.includes('resolveSessionHostContact'), 'Booking flow must resolve the configured session host from the Directory schedule');
assert(booking.includes('sendHostBookingEmail'), 'Booking flow must email the session host after confirmation');
assert(booking.includes("action==='admin_resend_host_email'"), 'Admin must be able to resend a booking directly to the session host');
assert(booking.includes("hostName:host?.name||''") && booking.includes("hostMobile:host?.mobile||''"), 'Admin booking list must expose the resolved host contact for email/WhatsApp follow-up');
assert(booking.includes('host:String(s.host||\'\')'), 'Directory session templates must retain the configured host');
assert(booking.includes('link.created_by_user_id&&emailKey(link.notification_email||\'\')'), 'Auto-created member fallback sessions must reuse the club admin booking-notification address when available');

assert(webhook.includes("const isMember=booking.participant_type==='member'"), 'Payment webhook must distinguish member from guest');
assert(webhook.includes("const participantLabel=isMember?'Member':'Guest'"), 'Payment webhook messaging must label participant correctly');
assert(webhook.includes('booking.booking_note'), 'Payment webhook/session-host summary must include optional note');
assert(webhook.includes('resolveSessionHostContact'), 'Payment webhook must resolve the configured session host');
assert(webhook.includes('sendHostBookingEmail'), 'Successful online payments must email the session host automatically');
assert(webhook.includes("emailKey(host.email)!==emailKey(session.notification_email||'')"), 'Webhook must avoid duplicate host/admin email when the same person receives both');
assert(webhook.includes("${isMember?'':`<div"), 'Member webhook email must suppress guest-only waiver block');

assert(schema.properties?.participant_type?.enum?.includes('member') && schema.properties?.participant_type?.enum?.includes('guest'), 'Booking schema must support member and guest participants');
assert(schema.properties?.booking_note?.type === 'string', 'Booking schema must retain optional host note');
const required = new Set(schema.required || []);
for (const field of ['waiver_version','waiver_accepted','code_of_conduct_version','code_of_conduct_accepted','privacy_notice_version','privacy_acknowledged','cancellation_policy_version','cancellation_policy_accepted','photo_video_consent']) {
  assert(!required.has(field), `${field} must not be globally required because member bookings skip guest forms`);
}
assert(required.has('participant_type'), 'participant_type must remain required');

assert(publicRequest.includes('I’m an existing member') && publicRequest.includes('I’m a guest'), 'Public entry must offer member and guest journeys');
assert(publicRequest.includes('Only upcoming Spond sessions you are invited to are shown'), 'Member UI must state personalised Spond visibility');
assert(publicRequest.includes('bookingNote:memberForm.bookingNote'), 'Member note must be sent to booking backend');
assert(publicRequest.includes('htmlFor="memberFullName"') && publicRequest.includes('id="memberFullName"'), 'Member form labels must be accessible/tappable');
assert(privateBooking.includes("bookingNote:''"), 'Private guest booking must retain host note state');
assert(privateBooking.includes("bookingNote',e.target.value"), 'Private guest booking must allow entering a host note');

console.log('MEMBER/GUEST BOOKING GATE: PASS');
console.log('Verified: member identity fail-closed, active membership, name/email/mobile matching, personalised Spond filtering + submit recheck, guest/member separation, optional host notes, webhook messaging, guest legal controls, accessible mobile form labels.');
