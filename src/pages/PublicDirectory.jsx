import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import { directoryClubs, irelandCounties, weekDays } from '@/data/directorySeed';
import { Search, MapPin, CalendarDays, Building2, SlidersHorizontal, ArrowRight, Check, CheckCircle2, PlusCircle, Share2, UserCheck } from 'lucide-react';
import Seo, { SITE_URL } from '@/components/public/Seo';
import { base44 } from '@/api/base44Client';
import PublicDirectoryLogo from '@/components/directory/PublicDirectoryLogo';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

const countySlug = county => county.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const clubInitials = name => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0]?.toUpperCase())
  .join('');

const normaliseSearchText = value => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const compactSearchText = value => normaliseSearchText(value).replace(/\s+/g, '');

const publicDescription = club => {
  const description = String(club?.description || '').trim();
  if (club?.verificationStatus === 'verified' && /has not yet been claimed|listing is currently unclaimed|unclaimed listing/i.test(description)) {
    return `${club.name} is listed in the RallyHub Club Directory for County ${club.county}.`;
  }
  return description;
};

const editDistance = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let northwest = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const old = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        northwest + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      northwest = old;
    }
  }
  return previous[b.length];
};

function MapAutoFit({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView([points[0].venue.latitude, points[0].venue.longitude], 11, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(points.map(({ venue }) => [venue.latitude, venue.longitude]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 11, animate: true });
  }, [map, points]);
  return null;
}

function DirectoryMap({ clubs, heightClass = 'h-[560px]' }) {
  const points = useMemo(() => clubs
    .flatMap(club => (club.venues || []).map(venue => ({ club, venue })))
    .filter(({ venue }) => Number.isFinite(venue.latitude) && Number.isFinite(venue.longitude)), [clubs]);

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card">
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">Explore clubs on the map</h2>
          <p className="text-xs text-muted-foreground mt-1">{points.length} mapped venue{points.length === 1 ? '' : 's'} shown. Click a marker to open the club listing.</p>
        </div>
        <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Ireland</span>
      </div>
      <MapContainer center={[53.35, -7.75]} zoom={6} scrollWheelZoom className={`${heightClass} w-full`}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapAutoFit points={points} />
        {points.map(({ club, venue }) => (
          <Marker key={`${club.id}-${venue.id}`} position={[venue.latitude, venue.longitude]}>
            <Popup>
              <div className="min-w-[200px]">
                <strong>{club.name}</strong><br />
                <span>{venue.name}</span><br />
                {venue.eircode && <><span>{venue.eircode}</span><br /></>}
                <a href={`/directory/${club.slug}`} className="font-semibold">View club listing</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

const directorySearchScore = (club, rawQuery) => {
  const query = normaliseSearchText(rawQuery);
  if (!query) return 1;
  const compactQuery = compactSearchText(query);
  const queryTokens = query.split(' ').filter(Boolean);
  const fields = [
    [club.name, 120],
    [club.town, 80],
    [club.county, 70],
    [club.sport, 25],
    ...(club.venues || []).flatMap(venue => [
      [venue.name, 75], [venue.shortName, 70], [venue.address, 60], [venue.eircode, 65]
    ]),
  ].filter(([value]) => value);

  let score = 0;
  for (const [value, weight] of fields) {
    const field = normaliseSearchText(value);
    const compactField = compactSearchText(value);
    if (!field) continue;
    if (field === query) score = Math.max(score, 300 + weight);
    else if (field.startsWith(query)) score = Math.max(score, 240 + weight);
    else if (field.includes(query)) score = Math.max(score, 210 + weight);
    else if (compactQuery && compactField.includes(compactQuery)) score = Math.max(score, 200 + weight);
  }

  const searchable = fields.map(([value]) => normaliseSearchText(value)).join(' ');
  const searchableCompact = searchable.replace(/\s+/g, '');
  if (queryTokens.length > 1 && queryTokens.every(token => searchable.includes(token))) {
    score = Math.max(score, 175);
  }
  if (compactQuery && searchableCompact.includes(compactQuery)) {
    score = Math.max(score, 170);
  }

  // Small typo tolerance for ordinary words (e.g. "Dublni" → Dublin) without
  // turning a broad directory search into a noisy fuzzy match.
  if (!score && queryTokens.length === 1 && query.length >= 4) {
    const words = searchable.split(' ').filter(word => word.length >= 4);
    const tolerance = query.length >= 7 ? 2 : 1;
    if (words.some(word => Math.abs(word.length - query.length) <= tolerance && editDistance(word, query) <= tolerance)) {
      score = 90;
    }
  }

  return score;
};

export default function PublicDirectory() {
  const [searchParams] = useSearchParams();
  const manageMode = searchParams.get('manage') === '1';
  const [query, setQuery] = useState('');
  const [county, setCounty] = useState('All counties');
  const [day, setDay] = useState('Any day');
  const [view, setView] = useState('clubs');
  const [directoryState, setDirectoryState] = useState({});
  const [shareCopiedSlug, setShareCopiedSlug] = useState('');

  useEffect(() => {
    let active = true;
    base44.functions.invoke('directoryListingProfile', { action: 'public_list' })
      .then(res => { if (active && !res.data?.error) setDirectoryState(res.data?.listings || {}); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const effectiveClubs = useMemo(() => {
    const staticClubs = directoryClubs.map(club => {
      const state = directoryState[club.slug];
      const profile = state?.profile;
      if (!profile) return { ...club, verificationStatus: state?.verificationStatus || club.verificationStatus };
      return {
        ...club,
        ...profile,
        verificationStatus: state?.verificationStatus || club.verificationStatus,
        contact: { ...(club.contact || {}), ...(profile.contact || {}) },
        venues: Array.isArray(profile.venues) ? profile.venues : club.venues,
        sessions: Array.isArray(profile.sessions) ? profile.sessions : club.sessions,
      };
    });
    const staticSlugs = new Set(directoryClubs.map(club => club.slug));
    const dynamicClubs = Object.entries(directoryState)
      .filter(([slug, state]) => !staticSlugs.has(slug) && state?.base)
      .map(([slug, state]) => {
        const base = state.base || {};
        const profile = state.profile || {};
        return {
          ...base,
          ...profile,
          id: base.id || slug,
          slug,
          sport: base.sport || 'Pickleball',
          verificationStatus: state.verificationStatus || 'unclaimed',
          contact: { ...(base.contact || {}), ...(profile.contact || {}) },
          venues: Array.isArray(profile.venues) ? profile.venues : (base.venues || []),
          sessions: Array.isArray(profile.sessions) ? profile.sessions : (base.sessions || []),
        };
      });
    return [...staticClubs, ...dynamicClubs].sort((a, b) => a.name.localeCompare(b.name));
  }, [directoryState]);

  const allSessions = useMemo(() => effectiveClubs.flatMap(club => (club.sessions || []).map(session => ({...session, club}))), [effectiveClubs]);
  const listedCountyCount = useMemo(() => new Set(effectiveClubs.map(club => club.county)).size, [effectiveClubs]);
  const counties = ['All counties', ...irelandCounties];

  const filteredClubs = useMemo(() => effectiveClubs
    .map(club => ({ club, searchScore: directorySearchScore(club, query) }))
    .filter(({ club, searchScore }) => {
      const queryMatch = !query.trim() || searchScore > 0;
      const countyMatch = county === 'All counties' || club.county === county;
      const dayMatch = day === 'Any day' || (club.sessions || []).some(session => session.day === day);
      return queryMatch && countyMatch && dayMatch;
    })
    .sort((a, b) => query.trim() ? (b.searchScore - a.searchScore || a.club.name.localeCompare(b.club.name)) : a.club.name.localeCompare(b.club.name))
    .map(({ club }) => club), [effectiveClubs, query, county, day]);

  const shareClub = async club => {
    const url = `${SITE_URL}/directory/${club.slug}`;
    const text = `${club.name} on the RallyHub Club Directory`;
    if (navigator.share) {
      try {
        await navigator.share({ title: club.name, text, url });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareCopiedSlug(club.slug);
      window.setTimeout(() => setShareCopiedSlug(current => current === club.slug ? '' : current), 2200);
    } catch {
      window.location.assign(`/directory/${club.slug}`);
    }
  };

  const visibleVenueIds = new Set(filteredClubs.flatMap(club => (club.venues || []).map(v => `${club.id}:${v.id}`)));
  const directorySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'RallyHub All-Ireland Pickleball Club Directory',
    url: `${SITE_URL}/directory`,
    description: `Browse ${effectiveClubs.length} current pickleball club listings in the RallyHub directory. All 32 counties of Ireland are supported.`,
    inLanguage: 'en-IE',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: effectiveClubs.length,
      itemListElement: effectiveClubs.map((club, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: club.name,
        url: `${SITE_URL}/directory/${club.slug}`
      }))
    }
  };

  return (
    <>
      <Seo
        title="Pickleball Clubs in Ireland | RallyHub Club Directory"
        description={`Search ${effectiveClubs.length} current pickleball club listings by county, club and venue. RallyHub supports directory listings across all 32 counties of Ireland.`}
        path="/directory"
        structuredData={directorySchema}
      />
      <div className="min-h-screen bg-background text-foreground">
      <PublicDirectoryHeader />

      <section className="border-b border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,.13),transparent_42%)]">
        <div className="container mx-auto px-4 py-7 sm:py-9">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-5">
              <MapPin className="w-3.5 h-3.5" /> All-Ireland directory · all 32 counties supported
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Find a club. Find a session. Get playing.</h1>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl">
              Search public sports clubs across the whole island of Ireland by county, location, day and venue. We currently have {effectiveClubs.length} club listings across {listedCountyCount} counties, with all 32 counties available as the directory grows.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/directory?manage=1" className="inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors">
                <UserCheck className="w-4 h-4" /> Manage a listing
              </Link>
              <Link to="/directory/add" className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-700 dark:text-amber-200 hover:bg-amber-400/15 transition-colors">
                <PlusCircle className="w-4 h-4" /> Add a missing club
              </Link>
            </div>
          </div>

          {manageMode && (
            <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-foreground">Manage an existing club listing</p>
                <p className="text-sm text-muted-foreground mt-1">Search for your club below, open its profile and choose <strong className="text-foreground">Claim this listing</strong>. RallyHub verifies you before granting editing access.</p>
              </div>
              <Link to="/directory/add" className="shrink-0">
                <button className="h-10 px-4 rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-200 text-sm font-semibold hover:bg-amber-400/15 transition-colors">
                  Club not listed? Add it
                </button>
              </Link>
            </div>
          )}

          <div className="mt-5 glass-strong rounded-2xl p-3 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_200px_200px_auto]">
            <label className="relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Club, town, venue or Eircode" aria-label="Search club directory" className="w-full h-11 rounded-xl border border-input bg-background/70 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
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
              <button onClick={() => setView('map')} className={`flex-1 lg:px-4 rounded-lg text-sm font-medium ${view === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Map</button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-6">
        <section className="mb-6 rounded-xl border border-border/70 bg-card/40 px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="min-w-0">
              <h2 className="text-sm font-bold">Browse by county</h2>
              <p className="text-xs text-muted-foreground">All 32 counties · {listedCountyCount} currently have listings</p>
            </div>
            <Link to="/directory/add" className="shrink-0 text-xs font-semibold text-amber-300 hover:underline">Missing club? Add it</Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {irelandCounties.map(item => {
              const count = effectiveClubs.filter(club => club.county === item).length;
              return (
                <Link key={item} to={`/pickleball-clubs/${countySlug(item)}`} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${count ? 'border-primary/25 bg-primary/10 text-primary hover:bg-primary/15' : 'border-border text-muted-foreground hover:text-foreground'}`}>
                  {item}{count ? ` · ${count}` : ''}
                </Link>
              );
            })}
          </div>
        </section>

        {view === 'map' ? (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{filteredClubs.length} matching club{filteredClubs.length === 1 ? '' : 's'}</p>
                <h2 className="text-2xl font-bold">Club map</h2>
              </div>
              <p className="hidden sm:block text-xs text-muted-foreground">Search and county/day filters also update the map</p>
            </div>
            {filteredClubs.length ? (
              <DirectoryMap clubs={filteredClubs} />
            ) : (
              <div className="glass rounded-2xl p-10 text-center">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold">No clubs to show on the map</h3>
                <p className="text-sm text-muted-foreground mt-1">Try changing your search or filters.</p>
              </div>
            )}
          </section>
        ) : (
        <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(380px,.8fr)] gap-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{filteredClubs.length} club{filteredClubs.length === 1 ? '' : 's'} found{query.trim() ? ` for “${query.trim()}”` : ''}</p>
                <h2 className="text-2xl font-bold">{view === 'sessions' ? 'Weekly sessions' : query.trim() ? 'Best matches' : 'Club directory'}</h2>
              </div>
              <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            </div>

            {view === 'clubs' ? (
              <div className="space-y-4">
                {filteredClubs.map(club => (
                  <article key={club.id} className="glass rounded-2xl p-5 sm:p-6 hover:border-primary/30 transition-colors">
                    <div className="flex gap-4">
                      <PublicDirectoryLogo
                        src={club.logoUrl}
                        name={club.name}
                        imageClassName="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white object-contain p-1 shrink-0"
                        fallbackClassName="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl sm:text-2xl font-black text-primary shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary">{club.sport} · County {club.county}</p>
                            <h3 className="text-xl sm:text-2xl font-bold mt-1">{club.name}</h3>
                          </div>
                          {club.verificationStatus === 'unclaimed' ? (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-300"><CheckCircle2 className="w-3.5 h-3.5" /> Unclaimed listing</span>
                          ) : club.verificationStatus === 'verified' ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> Verified club listing</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> Active listing</span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{publicDescription(club)}</p>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-primary" /> {club.venues.length} venue{club.venues.length === 1 ? '' : 's'}</span>
                          <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-primary" /> {club.sessions.length ? `${club.sessions.length} weekly session${club.sessions.length === 1 ? '' : 's'}` : 'Schedule pending'}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {club.county}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-3 justify-between items-center">
                      <div className="flex flex-wrap gap-2">
                        {club.venues.filter(venue => venue.shortName || venue.name).map(venue => <span key={venue.id} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{venue.shortName || venue.name}</span>)}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {club.verificationStatus === 'unclaimed' && (
                          <Link to={`/directory/${club.slug}/claim`} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-700 dark:text-amber-200 hover:bg-amber-400/15 transition-colors">
                            <UserCheck className="w-4 h-4" /> Claim this listing
                          </Link>
                        )}
                        <button type="button" onClick={() => shareClub(club)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm font-semibold hover:border-primary/40 transition-colors" aria-label={`Share ${club.name}`}>
                          {shareCopiedSlug === club.slug ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />} {shareCopiedSlug === club.slug ? 'Link copied' : 'Share'}
                        </button>
                        <Link to={`/directory/${club.slug}`} className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm font-semibold text-primary hover:border-primary/40 transition-colors">
                          View details <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
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
                      <p className="text-sm font-semibold">Contact club</p>
                    </Link>
                  );
                })}
              </div>
            )}

            {filteredClubs.length === 0 && (
              <div className="glass rounded-2xl p-10 text-center">
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold">No matching clubs yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Try removing a filter or searching a nearby county. If the club is missing, you can add it for review.</p>
                <Link to="/directory/add" className="inline-flex mt-4 h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Add a missing club</Link>
              </div>
            )}
          </section>

          <aside className="xl:sticky xl:top-24 h-fit">
            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <div className="p-4 border-b border-border">
                <h2 className="font-bold">Venue map</h2>
                <p className="text-xs text-muted-foreground mt-1">Every venue has its own pin, even when several venues belong to one club.</p>
              </div>
              <MapContainer center={[53.35, -7.75]} zoom={6} scrollWheelZoom={false} className="h-[390px] w-full">
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {effectiveClubs
                  .flatMap(club => (club.venues || []).map(venue => ({club, venue})))
                  .filter(({club, venue}) => visibleVenueIds.has(`${club.id}:${venue.id}`) && Number.isFinite(venue.latitude) && Number.isFinite(venue.longitude))
                  .map(({club, venue}) => (
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
        )}
      </main>
      </div>
    </>
  );
}
