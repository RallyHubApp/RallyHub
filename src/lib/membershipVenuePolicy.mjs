// Clare Pickleball initial venue admission policy; no restrictions on other eligible sessions.
export const CLARE_JOINING_VENUES = Object.freeze(['ennistymon', 'shannon', 'corofin', 'clarecastle']);
export const CLARE_VENUE_ACKNOWLEDGEMENT_VERSION = '2026-10-v1';
export const CLARE_VENUE_ACKNOWLEDGEMENT = 'I understand that I am applying to join Clare Pickleball through my selected primary venue. As a member, I may participate in sessions at other Clare Pickleball venues, subject to availability and normal booking arrangements. I acknowledge that Ennis is currently full and that membership through another venue does not automatically provide access to Ennis sessions or a place on the Ennis waiting list.';
export function validateClareJoiningVenue(venue, acknowledged) {
  if (!CLARE_JOINING_VENUES.includes(venue)) return 'Choose an available Clare Pickleball joining venue. Ennis is currently full.';
  if (acknowledged !== true) return 'Please acknowledge the venue access conditions.';
  return '';
}
export function hostNotificationVenue(venue, membershipActive) {
  return membershipActive && CLARE_JOINING_VENUES.includes(venue) ? venue : null;
}
