import React from 'react';
import { ExternalLink, MapPin, Navigation, Clock3, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/shared/GlassCard';

export const CLARE_MEMBER_VENUES = [
  {
    id: 'corofin',
    name: 'Corofin GAA Sports Hall',
    shortName: 'Corofin',
    address: 'Corofin, Co. Clare',
    eircode: 'V95 XD56',
    mapUrl: 'https://maps.google.com/?q=V95+XD56',
    sessions: [
      { day: 'Wednesday', time: '11:30–13:30', label: 'Open play' },
    ],
  },
  {
    id: 'ennistymon',
    name: 'Ennistymon Community Centre',
    shortName: 'Ennistymon',
    address: 'Parliament Street, Ennistymon, Co. Clare',
    eircode: 'V95 X8XC',
    mapUrl: 'https://maps.app.goo.gl/xgPBCUfrBp35vu116',
    sessions: [
      { day: 'Wednesday', time: '19:00–20:00', label: 'Open play' },
      { day: 'Wednesday', time: '20:00–21:00', label: 'Open play' },
    ],
  },
  {
    id: 'doora-barefield',
    name: "St Joseph's Doora Barefield GAA Sports Hall",
    shortName: 'St Joseph’s, Doora Barefield',
    address: 'Gurteen, Quin Road, Co. Clare',
    eircode: 'V95 PD36',
    mapUrl: 'https://maps.google.com/?q=V95+PD36',
    sessions: [
      { day: 'Monday', time: '19:00–20:30', label: 'Social & Recreational' },
      { day: 'Monday', time: '20:30–22:00', label: 'Intermediate & Advanced' },
      { day: 'Thursday', time: '19:00–20:30', label: 'Social & Recreational' },
      { day: 'Thursday', time: '20:30–22:00', label: 'Intermediate & Advanced' },
    ],
  },
];

function VenueCard({ venue }) {
  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <h2 className="font-black text-base sm:text-lg text-foreground">{venue.shortName}</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{venue.name}</p>
            <p className="text-sm text-foreground mt-2">{venue.address}</p>
            <p className="text-xs font-semibold text-primary mt-1">Eircode {venue.eircode}</p>
          </div>
          <a
            href={venue.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" /> Directions
          </a>
        </div>
      </div>

      <div className="border-t border-border bg-secondary/20 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-primary" />
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Regular sessions</p>
        </div>
        <div className="space-y-2">
          {venue.sessions.map((session, index) => (
            <div key={`${venue.id}-${index}`} className="rounded-xl border border-border bg-background/60 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                <Clock3 className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">{session.day} · {session.time}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{session.label}</p>
              </div>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px]">Weekly</Badge>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

export default function MemberVenues() {
  return (
    <div className="space-y-5 sm:space-y-6 pb-20 lg:pb-0 max-w-5xl mx-auto">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Clare Pickleball</p>
        <h1 className="text-2xl sm:text-3xl font-black mt-1">Venues</h1>
        <p className="text-sm text-muted-foreground mt-1">Our regular playing locations, weekly session times and directions.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {CLARE_MEMBER_VENUES.map(venue => <VenueCard key={venue.id} venue={venue} />)}
      </div>

      <div className="rounded-xl border border-border bg-secondary/20 p-3 text-xs text-muted-foreground flex items-start gap-2">
        <ExternalLink className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p>Tap <strong className="text-foreground">Directions</strong> on any venue to open its map location. Session details shown here are the club’s regular weekly timetable.</p>
      </div>
    </div>
  );
}
