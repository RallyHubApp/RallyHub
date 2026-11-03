/** Pure, side-effect-free notification plans for the future native session booking cutover.
 * Nothing here sends email, push or writes to production records.
 */
const events = Object.freeze({
  invitation: 'Session invitation',
  confirmed: 'Booking confirmed',
  declined: 'Invitation declined',
  cancelled: 'Booking cancelled',
  waitlisted: 'Added to waiting list',
  promoted: 'A place is available',
  reminder: 'Session reminder',
  session_changed: 'Session details changed',
});

export function sessionNotificationPlan({event, sessionId, title, venue, startsAt, memberUserIds = [], emailFallback = true} = {}) {
  if (!Object.hasOwn(events, event)) throw new Error('Unsupported session notification event');
  const id = String(sessionId || '').trim();
  if (!id) throw new Error('Session ID required');
  const members = [...new Set(memberUserIds.map(String).map(x => x.trim()).filter(Boolean))];
  const sessionName = String(title || 'Club session').trim().slice(0, 120);
  const details = [String(venue || '').trim(), String(startsAt || '').trim()].filter(Boolean).join(' · ');
  const url = `/app?section=sessions&sessionId=${encodeURIComponent(id)}`;
  return {
    event, sessionId: id, recipients: members,
    channels: {inApp: true, push: true, emailFallback: Boolean(emailFallback)},
    payload: {title: `${events[event]} · ${sessionName}`, body: details || sessionName, url, tag: `rallyhub-session-${id}-${event}`},
    deliveryState: 'not_sent',
  };
}
