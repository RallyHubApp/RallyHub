// Pure, portable Directory audience policy. Never reads tenant people or consents.
const lower = v => String(v ?? '').trim().toLowerCase();
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower(v));
export function directoryEmailKey(value) { return lower(value); }
export function directoryAudience(subscribers = [], suppressions = [], filter = {}, now = new Date()) {
  const topic = lower(filter.topic), county = lower(filter.county), clubSlug = lower(filter.clubSlug);
  const maxAgeMonths = Number.isInteger(filter.maxAgeMonths) && filter.maxAgeMonths > 0 && filter.maxAgeMonths <= 60 ? filter.maxAgeMonths : 24;
  const consentCutoff = new Date(now);
  consentCutoff.setMonth(consentCutoff.getMonth() - maxAgeMonths);
  const suppress = new Set(suppressions.filter(r => r.channel === 'email' && r.status === 'active').map(r => lower(r.email_hash)));
  const seen = new Set();
  const eligible = []; const counts = {total:subscribers.length, unsubscribed:0, noEmailOptIn:0, noEmail:0, expiredConsent:0, suppressed:0, outsideSegment:0, duplicate:0};
  for (const person of subscribers) {
    if (person.status !== 'active') {counts.unsubscribed++; continue;}
    if (person.email_opt_in !== true) {counts.noEmailOptIn++; continue;}
    const address = lower(person.email);
    if (!validEmail(address)) {counts.noEmail++; continue;}
    const consentAt = Date.parse(person.consent_at || '');
    if (!person.consent_version || !Number.isFinite(consentAt) || consentAt > now.getTime() || consentAt < consentCutoff.getTime()) {counts.expiredConsent++; continue;}
    if (suppress.has(address)) {counts.suppressed++; continue;}
    const topics = Array.isArray(person.topics) ? person.topics.map(lower) : [];
    if ((topic && !topics.includes(topic)) || (county && lower(person.county) !== county) || (clubSlug && lower(person.club_slug) !== clubSlug)) {counts.outsideSegment++; continue;}
    if (seen.has(address)) {counts.duplicate++; continue;}
    seen.add(address); eligible.push({subscriberId:person.id, email:address, firstName:person.first_name||'', consentAt:person.consent_at, consentVersion:person.consent_version});
  }
  return {eligible,eligibleCount:eligible.length,excluded:counts,policy:{maxAgeMonths,topic,county,clubSlug,transactional:false}};
}
