import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import { directoryClubs, weekDays } from '@/data/directorySeed';
import { Search, MapPin, CalendarDays, Building2, SlidersHorizontal, ArrowRight, CheckCircle2 } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

const allSessions = directoryClubs.flatMap(club => club.sessions.map(session => ({...session, club})));

export default function PublicDirectory() {
  const [query, setQuery] = useState('');
  const [county, setCounty] = useState('All counties');
  const [day, setDay] = useState('Any day');
  const [view, setView] = useState('clubs');

  const counties = ['All counties', ...new Set(directoryClubs.map(club => club.county))];

  const filteredClubs = useMemo(() => directoryClubs.filter(club => {
    const text = query.trim().toLowerCase();
    const searchable = [club.name, club.sport, club.county, ...club.venues.flatMap(v => [v.name, v.address, v.eircode])].join(' ').toLowerCase();
    const queryMatch = !text || searchable.includes(text);
    const countyMatch = county === 'All counties' || club.county === county;
    const dayMatch = day === 'Any day' || club.sessions.some(session => session.day === day);
    return queryMatch && countyMatch && dayMatch;
  }), [query, county, day]);

  const visibleVenueIds = new Set(filteredClubs.flatMap(club => club.venues.map(v => `${club.id}:${v.id}`)));

  return (
    <div className="min-h-screen bg-[#0a1628] text-foreground">
      <PublicDirectoryHeader />

      <section className="border-b border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,.13),transparent_42%)]">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-5">
              <MapPin className="w-3.5 h-3.5" /> Starting with pickleball across Ireland
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Find a club. Find a session. Get playing.</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Search public sports clubs by location, day and venue. One club can operate from several locations, each with its own map pin and timetable.
            </p>
          </div>

          <div className="mt-8 glass-strong rounded-2xl p-3 sm:p-4 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_200px_200px_auto]">
            <label className="relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Club, town, venue or Eircode" className="w-full h-11 rounded-xl border border-input bg-background/70 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            </label>
            <select value={county} onChange={e => setCounty(e.target.value)} className="h-11 rounded-xl border border-input bg-background/70 px-3 text-sm">
              {counties.map(item => <option key={item}>{item}</option>)}
            </select>
            <select value={day} onChange={e => setDay(e.target.value)} className="h-11 rounded-xl border border-input bg-background/70 px-3 text-sm">
              <option>Any day</option>
              {weekDays.map(item => <option key={item}>{item}</option>)}
            </select>
            <div className="flex rounded-xl border border-input p-1 bg-background/70">
              <button onClick={() => setView('clubs')} className={`flex-1 lg:px-4 rounded-lg text-sm font-medium ${view === 'clubs' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Clubs</button>
              <button onClick={() => setView('sessions')} className={`flex-1 lg:px-4 rounded-lg text-sm font-medium ${view === 'sessions' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Sessions</button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(380px,.8fr)] gap-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{filteredClubs.length} club{filteredClubs.length === 1 ? '' : 's'} found</p>
                <h2 className="text-2xl font-bold">{view === 'clubs' ? 'Club directory' : 'Weekly sessions'}</h2>
              </div>
              <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            </div>

            {view === 'clubs' ? (
              <div className="space-y-4">
                {filteredClubs.map(club => (
                  <article key={club.id} className="glass rounded-2xl p-5 sm:p-6 hover:border-primary/30 transition-colors">
                    <div className="flex gap-4">
                      <img src={club.logoUrl} alt={`${club.name} logo`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white object-contain p-1 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary">{club.sport} · County {club.county}</p>
                            <h3 className="text-xl sm:text-2xl font-bold mt-1">{club.name}</h3>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> Active listing</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{club.description}</p>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-primary" /> {club.venues.length} venues</span>
                          <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-primary" /> {club.sessions.length} weekly sessions</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {club.county}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-2 justify-between items-center">
                      <div className="flex flex-wrap gap-2">
                        {club.venues.map(venue => <span key={venue.id} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{venue.shortName}</span>)}
                      </div>
                      <Link to={`/directory/${club.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                        View club <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {allSessions.filter(({club, day: sessionDay}) => filteredClubs.some(c => c.id === club.id) && (day === 'Any day' || sessionDay === day)).map(session => {
                  const venue = session.club.venues.find(v => v.id === session.venueId);
                  return (
                    <Link key={session.id} to={`/directory/${session.club.slug}`} className="glass rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
                      <div className="w-14 text-center shrink-0">
                        <p className="text-xs uppercase text-muted-foreground">{session.day.slice(0,3)}</p>
                        <p className="font-bold text-primary">{session.start}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{session.level}</p>
                        <p className="text-sm text-muted-foreground truncate">{session.club.name} · {venue?.shortName}</p>
                      </div>
                      <p className="text-sm font-semibold">{session.price == null ? 'Contact club' : `€${session.price.toFixed(2)}`}</p>
                    </Link>
                  );
                })}
              </div>
            )}

            {filteredClubs.length === 0 && (
              <div className="glass rounded-2xl p-10 text-center">
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold">No matching clubs yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Try removing a filter or searching a nearby county.</p>
              </div>
            )}
          </section>

          <aside className="xl:sticky xl:top-24 h-fit">
            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <div className="p-4 border-b border-border">
                <h2 className="font-bold">Venue map</h2>
                <p className="text-xs text-muted-foreground mt-1">Every venue has its own pin, even when several venues belong to one club.</p>
              </div>
              <MapContainer center={[52.88, -9.02]} zoom={9} scrollWheelZoom={false} className="h-[460px] w-full">
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {directoryClubs.flatMap(club => club.venues.map(venue => ({club, venue}))).filter(({club, venue}) => visibleVenueIds.has(`${club.id}:${venue.id}`)).map(({club, venue}) => (
                  <Marker key={`${club.id}-${venue.id}`} position={[venue.latitude, venue.longitude]}>
                    <Popup>
                      <div className="min-w-[190px]">
                        <strong>{club.name}</strong><br />
                        <span>{venue.name}</span><br />
                        <span>{venue.eircode}</span><br />
                        <a href={`/directory/${club.slug}`} className="font-semibold">View listing</a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
