export const EVENT_TYPES = [
  ['all','All'],
  ['tournament','Tournament'],
  ['interclub','Interclub'],
  ['league','League'],
  ['social','Social'],
  ['coaching','Coaching / Clinic'],
  ['camp','Camp'],
  ['open_day','Open Day'],
  ['exhibition','Exhibition'],
  ['other','Other'],
];

export const EVENT_LEVELS = ['Beginner','Recreational','Social','Improver','Intermediate','Advanced','Competition','Open','3.0-','3.5-','4.0+'];
export const EVENT_AGE_GROUPS = ['All ages','18+','35+','40+','50+','60+','65+','70+','Junior'];
export const EVENT_DISCIPLINES = ['Singles','Gender Doubles','Mixed Doubles','Open Doubles','Team'];

export const slugifyEvent = value => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 90);

export const eventPath = event => `/events/${event?.event_slug || `${slugifyEvent(event?.name)}-${String(event?.id || '').slice(-6)}`}`;

export function dateAtNoon(value) {
  if (!value) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function prettyEventDate(value, options = {}) {
  const d = dateAtNoon(value);
  if (!d) return value || '';
  return d.toLocaleDateString('en-IE', { day:'numeric', month:'short', year:'numeric', ...options });
}

export function prettyEventDateRange(event) {
  if (!event?.start_date) return '';
  const start = dateAtNoon(event.start_date);
  const end = dateAtNoon(event.end_date || event.start_date);
  if (!start || !end) return event.start_date;
  if (event.start_date === (event.end_date || event.start_date)) return start.toLocaleDateString('en-IE',{day:'numeric',month:'short',year:'numeric'});
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${start.getDate()} – ${end.getDate()} ${start.toLocaleDateString('en-IE',{month:'short',year:'numeric'})}`;
  }
  return `${start.toLocaleDateString('en-IE',{day:'numeric',month:'short'})} – ${end.toLocaleDateString('en-IE',{day:'numeric',month:'short',year:'numeric'})}`;
}

export function registrationState(event, now = new Date()) {
  const open = event?.event_registration_open_at ? new Date(event.event_registration_open_at) : null;
  const close = event?.event_registration_close_at ? new Date(event.event_registration_close_at) : null;
  const mode = event?.event_registration_mode || (event?.event_registration_url ? 'external' : 'none');
  const hasRegistration = mode !== 'none';
  const invitationOnly = (event?.event_tags || []).some(tag => String(tag || '').trim().toLowerCase() === 'invitation only');
  if (!hasRegistration) return { key:'none', label:'No booking required', tone:'neutral', actionable:false };
  if (invitationOnly && mode === 'contact') return { key:'invite_only', label:'Invitation only', tone:'amber', actionable:true };
  if (open && !Number.isNaN(open.getTime()) && now < open) {
    const days = Math.ceil((open.getTime() - now.getTime()) / 86400000);
    return { key:'opening_soon', label:days <= 14 ? `Opens in ${days} day${days===1?'':'s'}` : `Opens ${open.toLocaleDateString('en-IE',{day:'numeric',month:'short'})}`, tone:'blue', actionable:false, date:open };
  }
  if (close && !Number.isNaN(close.getTime()) && now > close) {
    return { key:'closed', label:'Registration closed', tone:'slate', actionable:false, date:close };
  }
  if (close && !Number.isNaN(close.getTime())) {
    const days = Math.ceil((close.getTime() - now.getTime()) / 86400000);
    if (days <= 7) return { key:'closing_soon', label:days <= 1 ? 'Closes today' : `Closes in ${days} days`, tone:'amber', actionable:true, date:close };
  }
  return { key:'open', label:'Open for booking', tone:'green', actionable:true, date:close };
}

export function registrationActionLabel(event, state = registrationState(event)) {
  if (state.key === 'opening_soon') return 'Remind me';
  if (event?.event_registration_mode === 'contact') return state.key === 'invite_only' ? 'Request invitation' : 'Contact organiser';
  if (event?.event_registration_mode === 'none') return 'Event details';
  return 'Register / Book';
}

export const eventStatusClass = state => ({
  green:'bg-[#078e48] text-white border-[#078e48]',
  blue:'bg-[#eaf3ff] text-[#1459b7] border-[#b9d3f7]',
  amber:'bg-[#fff2c8] text-[#8b5a00] border-[#f0cd63]',
  slate:'bg-[#eef1f5] text-[#48546b] border-[#d5dae2]',
  neutral:'bg-[#f4f6f8] text-[#52627d] border-[#dbe2e8]',
}[state?.tone] || 'bg-[#f4f6f8] text-[#52627d] border-[#dbe2e8]');

export function eventTags(event, max = 3) {
  const tags = [];
  const type = EVENT_TYPES.find(([key]) => key === event?.event_category)?.[1];
  if (type && type !== 'All') tags.push(type);
  if (event?.event_indoor_outdoor) tags.push(event.event_indoor_outdoor === 'mixed' ? 'Indoor / Outdoor' : event.event_indoor_outdoor[0].toUpperCase()+event.event_indoor_outdoor.slice(1));
  for (const value of event?.event_levels || []) if (!tags.includes(value)) tags.push(value);
  for (const value of event?.event_age_groups || []) if (!tags.includes(value)) tags.push(value);
  for (const value of event?.event_disciplines || []) if (!tags.includes(value)) tags.push(value);
  for (const value of event?.event_tags || []) if (!tags.includes(value)) tags.push(value);
  return tags.slice(0,max);
}

function localDateTime(date, time = '12:00') {
  if (!date) return null;
  const d = new Date(`${date}T${time || '12:00'}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function icsDate(date) {
  return date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
}
function icsEscape(value) {
  return String(value || '').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
}

export function eventCalendarPayload(event, url = '') {
  const start = localDateTime(event?.start_date, event?.event_start_time || '12:00') || new Date();
  let end = localDateTime(event?.end_date || event?.start_date, event?.event_end_time || event?.event_start_time || '13:00');
  if (!end || end <= start) end = new Date(start.getTime() + 90 * 60000);
  const description = [event?.event_public_summary || event?.description || '', url].filter(Boolean).join('\n\n');
  return { start, end, description };
}

export function downloadEventCalendar(event, url = '') {
  const {start,end,description} = eventCalendarPayload(event,url);
  const body = [
    'BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN','METHOD:PUBLISH','PRODID:-//RallyHub//Events//EN',
    'BEGIN:VEVENT',`UID:${icsEscape(event?.id || slugifyEvent(event?.name))}@rallyhub.ie`,`DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,`DTEND:${icsDate(end)}`,`SUMMARY:${icsEscape(event?.name)}`,
    `LOCATION:${icsEscape(event?.location || '')}`,`DESCRIPTION:${icsEscape(description)}`,'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([body],{type:'text/calendar;charset=utf-8'});
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = `${slugifyEvent(event?.name || 'rallyhub-event') || 'rallyhub-event'}.ics`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(href);
}

export function googleCalendarUrl(event, url = '') {
  const {start,end,description} = eventCalendarPayload(event,url);
  const fmt = d => d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const params = new URLSearchParams({action:'TEMPLATE',text:event?.name || 'RallyHub event',dates:`${fmt(start)}/${fmt(end)}`,details:description,location:event?.location || ''});
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(event, url = '') {
  const {start,end,description} = eventCalendarPayload(event,url);
  const params = new URLSearchParams({path:'/calendar/action/compose',rru:'addevent',subject:event?.name || 'RallyHub event',startdt:start.toISOString(),enddt:end.toISOString(),body:description,location:event?.location || ''});
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
