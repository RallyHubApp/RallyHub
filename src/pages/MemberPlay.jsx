import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/shared/GlassCard';
import { CalendarDays, ChevronLeft, ChevronRight, Download, List, MapPin, Map as MapIcon } from 'lucide-react';
import { getClub } from '@/data/directorySeed';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

const normalise = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function formatDate(value, options = {}) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IE', options);
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' });
}

function responseLabel(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'accepted') return 'Going';
  if (value === 'waiting') return 'Waiting list';
  if (value === 'declined') return 'Declined';
  if (value === 'unanswered') return 'Response needed';
  if (value === 'entered') return 'You’re entered';
  return value ? value.replaceAll('_', ' ') : null;
}

function findVenue(item, club) {
  if (!club?.venues?.length) return null;
  const haystack = normalise(`${item.venue || ''} ${item.address || ''}`);
  if (!haystack) return null;
  return club.venues.find(venue => {
    const keys = [venue.name, venue.shortName, venue.address, venue.eircode].map(normalise).filter(Boolean);
    return keys.some(key => key.length > 4 && (haystack.includes(key) || key.includes(haystack)));
  }) || null;
}

function enrichItem(item, club) {
  if (item.latitude && item.longitude) return item;
  const venue = findVenue(item, club);
  return venue ? { ...item, latitude: venue.latitude, longitude: venue.longitude, venueMapUrl: venue.mapUrl, matchedVenue: venue } : item;
}

function icsDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcs(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function calendarContent(items, name = 'RallyHub Calendar') {
  const now = icsDate(new Date().toISOString());
  const events = items.map(item => {
    const start = icsDate(item.start);
    if (!start) return '';
    const fallbackEnd = new Date(new Date(item.start).getTime() + 90 * 60 * 1000).toISOString();
    const end = icsDate(item.end || fallbackEnd);
    return ['BEGIN:VEVENT', `UID:${escapeIcs(item.id)}@rallyhub.ie`, `DTSTAMP:${now}`, `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${escapeIcs(item.title)}`, `LOCATION:${escapeIcs([item.venue, item.address].filter(Boolean).join(', '))}`, `DESCRIPTION:${escapeIcs(item.source === 'spond' ? 'Session shown through your club Spond connection.' : 'RallyHub competition or event.')}`, 'END:VEVENT'].join('\r\n');
  }).filter(Boolean).join('\r\n');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'PRODID:-//RallyHub//Member Calendar//EN', `X-WR-CALNAME:${escapeIcs(name)}`, events, 'END:VCALENDAR'].join('\r\n');
}

function downloadCalendar(items, filename = 'rallyhub-calendar.ics', name = 'RallyHub Calendar') {
  if (!items.length) return;
  const blob = new Blob([calendarContent(items, name)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function addToCalendar(item) {
  const start = icsDate(item.start);
  if (!start) return;
  downloadCalendar([item], `${String(item.title || 'rallyhub-event').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}.ics`, item.title || 'RallyHub Event');
}

function MonthView({ items }) {
  const firstActivity = items[0]?.start ? new Date(items[0].start) : new Date();
  const [cursor, setCursor] = useState(new Date(firstActivity.getFullYear(), firstActivity.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayStart = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = Array.from({ length: mondayStart + daysInMonth }, (_, index) => index < mondayStart ? null : index - mondayStart + 1);
  while (cells.length % 7) cells.push(null);
  const byDay = new Map();
  items.forEach(item => {
    const d = new Date(item.start);
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    const day = d.getDate();
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(item);
  });
  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="w-4 h-4" /></Button>
        <p className="font-bold">{cursor.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}</p>
        <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="w-4 h-4" /></Button>
      </div>
      <div className="grid grid-cols-7 border-b border-border bg-secondary/20">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => <div key={day} className="py-2 text-center text-[10px] font-semibold text-muted-foreground">{day}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          const dayItems = day ? byDay.get(day) || [] : [];
          return (
            <div key={`${day || 'blank'}-${index}`} className="min-h-20 sm:min-h-24 border-r border-b border-border last:border-r-0 p-1.5 sm:p-2">
              {day && <><p className="text-xs font-semibold">{day}</p><div className="mt-1 space-y-1">{dayItems.slice(0, 2).map(item => <div key={item.id} title={item.title} className={`rounded-md px-1.5 py-1 text-[9px] sm:text-[10px] font-semibold truncate ${item.source==='club_event'?'bg-primary text-primary-foreground ring-1 ring-primary/30':'bg-primary/10 text-primary'}`} >{formatTime(item.start)} {item.title}</div>)}{dayItems.length > 2 && <p className="text-[9px] text-muted-foreground">+{dayItems.length - 2} more</p>}</div></>}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

export default function MemberPlay({ previewData = null }) {
  const [view, setView] = useState('schedule');
  const { data: fetchedPlay = null, isLoading, error } = useQuery({
    queryKey: ['member-portal-play'],
    queryFn: async () => {
      const res = await base44.functions.invoke('memberPortal', { action: 'play' });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.play || null;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    enabled: !previewData,
  });
  const play = previewData || fetchedPlay;

  const directoryClub = play?.club?.slug ? getClub(play.club.slug) : null;
  const items = useMemo(() => (play?.items || []).map(item => enrichItem(item, directoryClub)), [play?.items, directoryClub]);
  const mapItems = items.filter(item => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)));
  const mapCenter = mapItems.length ? [Number(mapItems[0].latitude), Number(mapItems[0].longitude)] : [53.35, -7.75];

  if (isLoading) return <div className="glass rounded-xl p-6 text-sm text-muted-foreground">Loading your calendar…</div>;
  if (error) return <div className="glass rounded-xl p-6 text-sm text-destructive">{error.message || 'Could not load your calendar.'}</div>;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0 max-w-6xl mx-auto">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{play?.club?.name || 'RallyHub'}</p>
        <h1 className="text-2xl sm:text-3xl font-black mt-1">Play</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personal schedule. Spond sessions are included only when the connector identifies you as an invited participant.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" disabled={!items.length} onClick={() => downloadCalendar(items, 'rallyhub-calendar.ics', `${play?.club?.name || 'RallyHub'} Calendar`)}><Download className="w-3.5 h-3.5" /> Connect / export calendar</Button>
          <span className="text-[11px] text-muted-foreground">Works with Apple Calendar, Google Calendar, Outlook and other calendar apps that import .ics files.</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary/40 p-1">
        {[
          ['schedule', List, 'Schedule'], ['month', CalendarDays, 'Month'], ['map', MapIcon, 'Map']
        ].map(([key, Icon, label]) => (
          <button key={key} onClick={() => setView(key)} className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors ${view === key ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {play?.spond?.status === 'connected' && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
          Spond connected to <span className="font-semibold text-foreground">{play.spond.connection?.group_name || 'your club group'}</span>. Only sessions where your Spond identity appears in that event’s invitation/response data are shown.
        </div>
      )}

      {play?.spond?.status === 'identity_not_matched' && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">RallyHub has not safely matched your Spond identity yet, so no Spond sessions are shown. This prevents unrelated club sessions being exposed.</div>
      )}

      {view === 'schedule' && (
        <div className="space-y-3">
          {items.length === 0 && <GlassCard className="text-center py-10"><CalendarDays className="w-8 h-8 mx-auto text-muted-foreground mb-2" /><p className="font-semibold">Nothing upcoming yet</p><p className="text-xs text-muted-foreground mt-1">Your invited sessions and entered competitions will appear here.</p></GlassCard>}
          {items.map(item => (
            <GlassCard key={item.id} className={`p-4 sm:p-5 ${item.source==='club_event'?'border-primary/30 ring-1 ring-primary/10':''}`}>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-12 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] uppercase text-muted-foreground">{formatDate(item.start, { month: 'short' })}</span>
                  <span className="text-xl font-black text-primary leading-none">{new Date(item.start).getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0"><h2 className="font-bold truncate">{item.title}</h2><p className="text-xs text-muted-foreground mt-1">{formatDate(item.start, { weekday: 'short', day: 'numeric', month: 'short' })} · {formatTime(item.start)}{item.end ? `–${formatTime(item.end)}` : ''}</p></div>
                    <Badge variant="outline" className="text-[9px] shrink-0">{item.source === 'spond' ? 'Spond' : 'RallyHub'}</Badge>
                  </div>
                  {(item.venue || item.address) && <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />{item.venue || item.address}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {responseLabel(item.response_status) && <Badge className="bg-primary/15 text-primary text-[10px]">{responseLabel(item.response_status)}</Badge>}
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => addToCalendar(item)}><Download className="w-3.5 h-3.5" /> Add to calendar</Button>
                    {item.venueMapUrl && <a href={item.venueMapUrl} target="_blank" rel="noreferrer"><Button variant="ghost" size="sm" className="h-8 text-xs">Directions</Button></a>}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {view === 'month' && <MonthView items={items} />}

      {view === 'map' && (
        <GlassCard className="p-0 overflow-hidden">
          {mapItems.length ? (
            <MapContainer center={mapCenter} zoom={9} scrollWheelZoom className="h-[58vh] min-h-[420px] w-full">
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {mapItems.map(item => (
                <Marker key={item.id} position={[Number(item.latitude), Number(item.longitude)]}>
                  <Popup><div className="text-sm"><strong>{item.title}</strong><br />{formatDate(item.start, { weekday: 'short', day: 'numeric', month: 'short' })} · {formatTime(item.start)}<br />{item.venue || item.address || ''}</div></Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="py-12 px-5 text-center"><MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" /><p className="font-semibold">No mapped activity yet</p><p className="text-xs text-muted-foreground mt-1">Events with a recognised venue will appear here.</p></div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
