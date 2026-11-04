/** Read-only invitation data; booking/payment/cancellation remain owned by eventRegistration. */
export async function resolveTasterInvitation(sdk,activity,{tenantId,clubId}){
 if(!activity?.linked_event_id)throw Error('Linked booking event required');
 const [events,venues,hosts]=await Promise.all([
  sdk.asServiceRole.entities.Tournament.filter({id:activity.linked_event_id,tenant_id:tenantId,host_club_id:clubId},'-created_date',1),
  sdk.asServiceRole.entities.Venue.filter({id:activity.venue_id,tenant_id:tenantId,club_id:clubId,status:'active'},'-created_date',1),
  activity.host_user_id?sdk.asServiceRole.entities.User.filter({id:activity.host_user_id,active_tenant_id:tenantId,active_club_id:clubId},'-created_date',1):Promise.resolve([])
 ]);
 const event=events?.[0],venue=venues?.[0],host=hosts?.[0];
 if(!event||!venue||!host)throw Error('Linked event, venue or host could not be resolved');
 if(event.venue_id&&event.venue_id!==activity.venue_id)throw Error('Linked event venue mismatch');
 if(Number(event.event_capacity)!==Number(activity.capacity))throw Error('Linked event capacity mismatch');
 if(String(event.start_date||'').slice(0,10)!==String(activity.starts_at||'').slice(0,10))throw Error('Linked event date mismatch');
 const ready=event.event_booking_enabled===true&&event.event_registration_mode==='rallyhub'&&event.event_publish_status==='published'&&event.event_public_visible===true&&!!event.event_slug;
 if(!ready)throw Error('Linked event registration is not publicly bookable');
 // Public /events/:slug opens the existing EventRegistrationDialog; no new form.
 const bookingPath='/events/'+encodeURIComponent(event.event_slug);
 const scope={event_id:event.id,tenant_id:tenantId,club_id:clubId};
 const rows=await sdk.asServiceRole.entities.EventRegistration.filter(scope,'-created_date',500);
 if(!Array.isArray(rows)||rows.length>=500)throw Error('Cannot verify complete registration inventory');
 const now=Date.now();let occupied=0;
 for(const r of rows){
  if(r.event_id!==event.id||r.tenant_id!==tenantId||r.club_id!==clubId)throw Error('Registration scope mismatch');
  if(['pending_approval','confirmed','cash_confirmed'].includes(r.registration_status)||r.registration_status==='approved_payment_hold'&&Date.parse(r.payment_hold_expires_at)>now)occupied++;
 }
 const offer=activity.configuration?.membership_offer||{};
 const missing=[];
 for(const [key,value] of Object.entries({venue_address:venue.address,host_name:host.name||host.full_name,booking_path:bookingPath,membership_day:offer.day,membership_start_time:offer.start_time,membership_end_time:offer.end_time,membership_venue:offer.venue}))if(!value)missing.push(key);
 if(event.event_fee_amount==null)missing.push('event_fee_amount');
 const available=Math.max(0,Number(event.event_capacity)-occupied);
 return {eventId:event.id,activityId:activity.id,bookingPath,fields:{event_name:activity.title,event_start:activity.starts_at,event_end:activity.ends_at,venue_name:venue.name,venue_address:venue.address,host_name:host.name||host.full_name,event_price:event.event_fee_amount,available_places:available,membership_day:offer.day,membership_start_time:offer.start_time,membership_end_time:offer.end_time,membership_venue:offer.venue},ready:missing.length===0&&available>0,missing,issues:available===0?['event_full']:[],readOnly:true};
}
