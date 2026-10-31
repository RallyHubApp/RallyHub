/** Delegated hosts must be explicitly assigned to this venue. */
export const venueKey=value=>String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
export function venueHostMatches(config,venue){
 if(!config||config.active!==true||!venue||venue.status!=='active')return false;
 if(config.venue_id)return config.venue_id===venue.id;
 const key=venueKey(config.venue_key);
 // Legacy membership host keys are canonical single-token venue names.
 // Do not infer access from partial/fuzzy names or arbitrary prefixes.
 return !!key&&key===venueKey(venue.name);
}
export function isConfiguredHost(configs,venue,email){
 const key=String(email||'').trim().toLowerCase();
 return !!key&&(configs||[]).some(c=>venueHostMatches(c,venue)&&(c.host_emails||[]).some(e=>String(e||'').trim().toLowerCase()===key));
}
