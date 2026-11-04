/** Canonical, fail-closed fields for the reusable waiting-list taster invitation.
 * No placeholder is considered ready until its authoritative record is resolved.
 */
export const TASTER_INVITATION_FIELDS=Object.freeze({
 first_name:'recipient.first_name',event_name:'ClubActivity.title',event_day:'ClubActivity.starts_at',event_date:'ClubActivity.starts_at',event_start_time:'ClubActivity.starts_at',event_end_time:'ClubActivity.ends_at',venue_name:'Venue.name',venue_address:'Venue.address',host_name:'User.name',event_price:'linked_event.event_fee_amount',available_places:'linked_event.capacity_minus_active_registrations',booking_url:'linked_event.registration_destination',membership_day:'ClubActivity.configuration.membership_offer.day',membership_start_time:'ClubActivity.configuration.membership_offer.start_time',membership_end_time:'ClubActivity.configuration.membership_offer.end_time',membership_venue:'ClubActivity.configuration.membership_offer.venue'
});
export function tasterInvitationData({activity,venue,host,event,occupied,bookingUrl,firstName}={}){
 const offer=activity?.configuration?.membership_offer||{};
 const iso=String(activity?.starts_at||'');
 const d=iso&&Number.isFinite(Date.parse(iso))?new Date(iso):null;
 const dateFmt=d?new Intl.DateTimeFormat('en-IE',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Dublin'}).format(d):'';
 const dayFmt=d?new Intl.DateTimeFormat('en-IE',{weekday:'long',timeZone:'Europe/Dublin'}).format(d):'';
 const time=v=>v?new Intl.DateTimeFormat('en-IE',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Europe/Dublin'}).format(new Date(v)):'';
 const capacity=Number(event?.event_capacity);
 const remaining=Number.isSafeInteger(capacity)&&capacity>=0&&Number.isSafeInteger(occupied)&&occupied>=0?Math.max(0,capacity-occupied):null;
 const fields={first_name:firstName||'',event_name:activity?.title||'',event_day:dayFmt,event_date:dateFmt,event_start_time:d?time(activity.starts_at):'',event_end_time:activity?.ends_at&&Number.isFinite(Date.parse(activity.ends_at))?time(activity.ends_at):'',venue_name:venue?.name||'',venue_address:venue?.address||'',host_name:host?.name||host?.full_name||'',event_price:Number.isFinite(Number(event?.event_fee_amount))&&event?.event_fee_amount!=null?Number(event.event_fee_amount).toFixed(2):'',available_places:remaining,booking_url:bookingUrl||'',membership_day:offer.day||'',membership_start_time:offer.start_time||'',membership_end_time:offer.end_time||'',membership_venue:offer.venue||''};
 const missing=Object.keys(TASTER_INVITATION_FIELDS).filter(k=>fields[k]===''||fields[k]===null||fields[k]===undefined);
 return {fields,ready:missing.length===0&&remaining>0,missing,issues:remaining===0?['event_full']:[],sendReady:false};
}
