import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import { directoryClubs, irelandCounties, weekDays } from '@/data/directorySeed';
import { Search, MapPin, CalendarDays, Building2, SlidersHorizontal, ArrowRight, Check, CheckCircle2, PlusCircle, Share2, UserCheck, BellRing } from 'lucide-react';
import Seo, { SITE_URL } from '@/components/public/Seo';
import { loadPublicDirectoryState } from '@/lib/public-directory-cache';
import PublicDirectoryLogo from '@/components/directory/PublicDirectoryLogo';
import DirectoryPlayerNetworkPanel from '@/components/directory/DirectoryPlayerNetworkPanel';
import { trackSiteEvent } from '@/lib/site-analytics';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

const countySlug = county => county.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

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
      map.setView([points[0].venue.latitude, points[0].venue.longitude], 11, { animate: false });
      return;
    }
    const bounds = L.latLngBounds(points.map(({ venue }) => [venue.latitude, venue.longitude]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 11, animate: false });
  }, [map, points]);
  return null;
}

function DirectoryMap({ clubs, heightClass = 'h-[560px]' }) {
  const points = useMemo(() => clubs
    .flatMap(club => (club.venues || []).map(venue => ({ club, venue })))
    .filter(({ venue }) => Number.isFinite(venue.latitude) && Number.isFinite(venue.longitude)), [clubs]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#dbe6e8] bg-white shadow-[0_8px_24px_rgba(8,24,77,.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dbe6e8] p-4">
        <div>
          <h2 className="font-extrabold text-[#07184c]">Explore clubs on the map</h2>
          <p className="mt-1 text-xs text-[#748196]">{points.length} mapped venue{points.length === 1 ? '' : 's'} shown. Click a marker to open the club listing.</p>
        </div>
        <span className="rounded-full border border-[#b8dfc7] bg-[#eef9f3] px-3 py-1 text-xs font-bold text-[#067b3f]">Ireland</span>
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
    loadPublicDirectoryState()
      .then(listings => { if (active) setDirectoryState(listings || {}); })
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

  useEffect(() => {
    trackSiteEvent('directory_view', { metadata: { clubCount: effectiveClubs.length } });
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (!term) return;
    const timer = window.setTimeout(() => {
      trackSiteEvent(filteredClubs.length ? 'directory_search' : 'directory_zero_result', {
        searchTerm: term,
        county: county === 'All counties' ? '' : county,
        metadata: { results: filteredClubs.length, day: day === 'Any day' ? '' : day }
      });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [query, county, day, filteredClubs.length]);

  useEffect(() => {
    if (county !== 'All counties') trackSiteEvent('county_filter', { county });
  }, [county]);

  useEffect(() => {
    if (day !== 'Any day') trackSiteEvent('day_filter', { metadata: { day } });
  }, [day]);

  const shareClub = async club => {
    const url = `${SITE_URL}/directory/${club.slug}?utm_source=directory_share&utm_medium=referral&utm_campaign=club_profile_share`;
    const text = `${club.name} on the RallyHub Club Directory`;
    trackSiteEvent('share_club', { clubSlug: club.slug, clubName: club.name, county: club.county, metadata: { surface: 'directory_card' } });
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

      <div className="min-h-screen overflow-x-hidden bg-white text-[#07184c]">
        <PublicDirectoryHeader />

        <section className="border-b border-[#e4ecee] bg-[linear-gradient(115deg,#f8fcfd_0%,#f3faf7_54%,#edf7f9_100%)]">
          <div className="mx-auto grid max-w-[1380px] items-stretch px-4 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-10 xl:px-12">
            <div className="flex items-center py-8 sm:py-10 lg:min-h-[355px] lg:py-11">
              <div className="max-w-[700px]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe4d8] bg-white px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.08em] text-[#078e48] shadow-[0_6px_18px_rgba(8,33,76,.04)] sm:text-xs">
                  <MapPin className="h-3.5 w-3.5" /> Players & clubs across Ireland · all 32 counties supported
                </div>

                <h1 className="mt-5 text-[2.65rem] font-black leading-[.97] tracking-[-.05em] text-[#061545] sm:text-[3.6rem] lg:text-[4.2rem]">
                  Find a club.
                  <span className="block">Find a session.</span>
                  <span className="block text-[#0a5e5b]">Get playing.</span>
                </h1>

                <p className="mt-4 max-w-[650px] text-[14px] font-medium leading-[1.55] text-[#23365f] sm:text-[16px]">
                  Search pickleball clubs across the whole island of Ireland by county, location, day and venue. Players can also stay informed about events, coaching and other opportunities, while clubs keep their public information accurate and up to date.
                </p>

                <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                  <Link to="/directory?manage=1" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#078e48] px-5 text-[13px] font-bold text-white shadow-[0_7px_17px_rgba(7,142,72,.18)] transition hover:bg-[#067b3f]">
                    <UserCheck className="h-4 w-4" /> Manage a listing
                  </Link>
                  <Link to="/directory/add" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#cbd7dc] bg-white px-5 text-[13px] font-bold text-[#0c2257] transition hover:bg-[#f7faf9]">
                    <PlusCircle className="h-4 w-4" /> Add a missing club
                  </Link>
                  <a href="#player-network" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#b8dfc7] bg-[#eef9f3] px-5 text-[13px] font-bold text-[#067b3f] transition hover:bg-[#e4f5eb]">
                    <BellRing className="h-4 w-4" /> Player updates
                  </a>
                </div>
              </div>
            </div>

            <div className="relative hidden min-h-[355px] items-center lg:flex">
              <div className="w-full overflow-hidden rounded-[22px] border border-[#dce8e9] bg-white shadow-[0_22px_55px_rgba(8,30,70,.12)]">
                <div className="relative h-[255px] overflow-hidden bg-[#dce8e9]">
                  <img
                    src="/images/directory/rallyhub-directory-hero-approved.webp"
                    alt="Pickleball players on court with the RallyHub message Good People Great Games"
                    className="h-full w-full object-cover object-center"
                    loading="eager"
                  />
                </div>
                <div className="grid grid-cols-3 divide-x divide-[#dfe8ea] bg-white px-3 py-4">
                  <div className="px-3"><strong className="block text-[24px] font-black text-[#07184c]">{effectiveClubs.length}</strong><span className="text-[11px] text-[#67748a]">club listings</span></div>
                  <div className="px-3"><strong className="block text-[24px] font-black text-[#07184c]">{listedCountyCount}</strong><span className="text-[11px] text-[#67748a]">counties listed</span></div>
                  <div className="px-3"><strong className="block text-[24px] font-black text-[#07184c]">32</strong><span className="text-[11px] text-[#67748a]">counties supported</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {manageMode && (
          <section className="bg-white">
            <div className="mx-auto max-w-[1380px] px-4 pt-4 sm:px-6 lg:px-10 xl:px-12">
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#b8dfc7] bg-[#eef9f3] p-4 sm:flex-row sm:items-center sm:p-5">
                <div>
                  <p className="font-extrabold text-[#07184c]">Manage an existing club listing</p>
                  <p className="mt-1 text-sm text-[#52627d]">Search for your club below, open its profile and choose <strong className="text-[#07184c]">Claim this listing</strong>. RallyHub reviews the representative before granting editing access.</p>
                </div>
                <Link to="/directory/add" className="shrink-0">
                  <button className="h-10 rounded-lg border border-[#d5c18c] bg-white px-4 text-sm font-bold text-[#8e610b] transition hover:bg-[#fffaf0]">Club not listed? Add it</button>
                </Link>
              </div>
            </div>
          </section>
        )}

        <DirectoryPlayerNetworkPanel clubs={effectiveClubs} />

        <section className="bg-white">
          <div className="mx-auto max-w-[1380px] px-4 pb-2 pt-4 sm:px-6 lg:px-10 xl:px-12">
            <div className="grid gap-2.5 rounded-2xl border border-[#dbe6e8] bg-white p-2.5 shadow-[0_9px_25px_rgba(8,24,77,.055)] lg:grid-cols-[minmax(300px,1.5fr)_220px_190px_auto]">
              <label className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#738096]" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Club, town, venue or Eircode" aria-label="Search club directory" className="h-11 w-full rounded-xl border border-[#cfdde0] bg-[#fbfdfd] pl-10 pr-3 text-sm text-[#1a2c58] outline-none focus:border-[#078e48] focus:ring-2 focus:ring-[#078e48]/20" />
              </label>
              <select aria-label="Filter by county" value={county} onChange={e => setCounty(e.target.value)} className="h-11 rounded-xl border border-[#cfdde0] bg-[#fbfdfd] px-3 text-sm text-[#1a2c58]">
                {counties.map(item => <option key={item}>{item}</option>)}
              </select>
              <select aria-label="Filter by day" value={day} onChange={e => setDay(e.target.value)} className="h-11 rounded-xl border border-[#cfdde0] bg-[#fbfdfd] px-3 text-sm text-[#1a2c58]">
                <option>Any day</option>
                {weekDays.map(item => <option key={item}>{item}</option>)}
              </select>
              <div className="flex h-11 rounded-xl border border-[#cfdde0] bg-[#fbfdfd] p-1">
                {['clubs','sessions','map'].map(item => (
                  <button key={item} onClick={() => setView(item)} className={`flex-1 rounded-lg px-3 text-[12px] font-bold capitalize transition ${view === item ? 'bg-[#078e48] text-white' : 'text-[#6a778a] hover:text-[#07184c]'}`}>{item}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
              <span className="mr-1 hidden shrink-0 text-[12px] font-extrabold text-[#07184c] sm:inline">Browse by county</span>
              {irelandCounties.map(item => {
                const count = effectiveClubs.filter(club => club.county === item).length;
                return (
                  <Link key={item} to={`/pickleball-clubs/${countySlug(item)}`} className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${count ? 'border-[#b8dfc7] bg-[#eef9f3] text-[#067b3f] hover:bg-[#e4f5eb]' : 'border-[#dbe6e8] bg-white text-[#69768a] hover:text-[#07184c]'}`}>
                    {item}{count ? ` · ${count}` : ''}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <main className="bg-white">
          <div className="mx-auto max-w-[1380px] px-4 pb-8 pt-2 sm:px-6 lg:px-10 xl:px-12">
            {view === 'map' ? (
              <section>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[12px] text-[#6a778a]">{filteredClubs.length} matching club{filteredClubs.length === 1 ? '' : 's'}</p>
                    <h2 className="mt-1 text-[26px] font-black tracking-[-.03em] text-[#07184c]">Club map</h2>
                  </div>
                  <p className="hidden text-xs text-[#6a778a] sm:block">Search and county/day filters also update the map</p>
                </div>
                {filteredClubs.length ? <DirectoryMap clubs={filteredClubs} /> : (
                  <div className="rounded-2xl border border-[#dbe6e8] bg-white p-10 text-center shadow-sm">
                    <MapPin className="mx-auto mb-3 h-8 w-8 text-[#8792a4]" />
                    <h3 className="font-bold text-[#07184c]">No clubs to show on the map</h3>
                    <p className="mt-1 text-sm text-[#6a778a]">Try changing your search or filters.</p>
                  </div>
                )}
              </section>
            ) : (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
                <section>
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[12px] text-[#6a778a]">{filteredClubs.length} club{filteredClubs.length === 1 ? '' : 's'} found{query.trim() ? ` for “${query.trim()}”` : ''}</p>
                      <h2 className="mt-1 text-[26px] font-black tracking-[-.03em] text-[#07184c]">{view === 'sessions' ? 'Weekly sessions' : query.trim() ? 'Best matches' : 'Club directory'}</h2>
                    </div>
                    <SlidersHorizontal className="h-5 w-5 text-[#8a95a5]" />
                  </div>

                  {view === 'clubs' ? (
                    <div className="space-y-3">
                      {filteredClubs.map(club => (
                        <article key={club.id} className="rounded-2xl border border-[#dbe6e8] bg-white p-4 shadow-[0_6px_18px_rgba(8,24,77,.035)] transition hover:border-[#b8dfc7] sm:p-5">
                          <div className="flex gap-3 sm:gap-4">
                            <PublicDirectoryLogo
                              src={club.logoUrl}
                              name={club.name}
                              imageClassName="h-[60px] w-[60px] shrink-0 rounded-[14px] border border-[#dbe9e2] bg-white object-contain p-1 sm:h-[74px] sm:w-[74px]"
                              fallbackClassName="h-[60px] w-[60px] shrink-0 rounded-[14px] border border-[#dbe9e2] bg-[linear-gradient(145deg,#eaf8ef,#e8f0f6)] flex items-center justify-center text-lg sm:h-[74px] sm:w-[74px] sm:text-xl font-black text-[#078e48]"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <p className="text-[10px] font-extrabold uppercase tracking-[.09em] text-[#078e48]">{club.sport} · County {club.county}</p>
                                  <h3 className="mt-1 text-[18px] font-extrabold tracking-[-.02em] text-[#07184c] sm:text-[20px]">{club.name}</h3>
                                </div>
                                {club.verificationStatus === 'unclaimed' ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-[#ecd49e] bg-[#fff8e8] px-2 py-1 text-[10px] font-extrabold text-[#9b6508]"><CheckCircle2 className="h-3 w-3" /> Unclaimed listing</span>
                                ) : club.verificationStatus === 'verified' ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-[#c2e3ce] bg-[#eaf8ef] px-2 py-1 text-[10px] font-extrabold text-[#067b3f]"><CheckCircle2 className="h-3 w-3" /> Verified club listing</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-[#c2e3ce] bg-[#eaf8ef] px-2 py-1 text-[10px] font-extrabold text-[#067b3f]"><CheckCircle2 className="h-3 w-3" /> Active listing</span>
                                )}
                              </div>
                              <p className="mt-2 line-clamp-2 text-[12.5px] leading-[1.45] text-[#405174]">{publicDescription(club)}</p>
                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-[#67748a]">
                                <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-[#078e48]" /> {club.venues.length} venue{club.venues.length === 1 ? '' : 's'}</span>
                                <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-[#078e48]" /> {club.sessions.length ? `${club.sessions.length} weekly session${club.sessions.length === 1 ? '' : 's'}` : 'Schedule pending'}</span>
                                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#078e48]" /> {club.county}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col justify-between gap-3 border-t border-[#e6edef] pt-3 sm:flex-row sm:items-center">
                            <div className="flex flex-wrap gap-2">
                              {club.venues.filter(venue => venue.shortName || venue.name).slice(0,4).map(venue => <span key={venue.id} className="rounded-full bg-[#f3f7f7] px-2.5 py-1 text-[10px] font-medium text-[#506078]">{venue.shortName || venue.name}</span>)}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {club.verificationStatus === 'unclaimed' && (
                                <Link to={`/directory/${club.slug}/claim`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#ecd49e] bg-[#fff8e8] px-3 text-[11px] font-bold text-[#946109] transition hover:bg-[#fff5db]">
                                  <UserCheck className="h-3.5 w-3.5" /> Claim this listing
                                </Link>
                              )}
                              <button type="button" onClick={() => shareClub(club)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#cfdbdf] bg-white px-3 text-[11px] font-bold text-[#07184c] transition hover:bg-[#f7faf9]" aria-label={`Share ${club.name}`}>
                                {shareCopiedSlug === club.slug ? <Check className="h-3.5 w-3.5 text-[#078e48]" /> : <Share2 className="h-3.5 w-3.5" />} {shareCopiedSlug === club.slug ? 'Link copied' : 'Share'}
                              </button>
                              <Link to={`/directory/${club.slug}`} className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#078e48] px-3 text-[11px] font-bold text-white transition hover:bg-[#067b3f]">
                                View club <ArrowRight className="h-3.5 w-3.5" />
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
                          <Link key={session.id} to={`/directory/${session.club.slug}`} className="flex items-center gap-4 rounded-xl border border-[#dbe6e8] bg-white p-4 shadow-[0_5px_14px_rgba(8,24,77,.03)] transition hover:border-[#b8dfc7]">
                            <div className="w-14 shrink-0 text-center">
                              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#778397]">{session.day.slice(0,3)}</p>
                              <p className="font-extrabold text-[#078e48]">{session.start}</p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[#07184c]">{session.level}</p>
                              <p className="truncate text-sm text-[#6a778a]">{session.club.name} · {venue?.shortName}</p>
                            </div>
                            <p className="hidden text-xs font-bold text-[#07184c] sm:block">Contact club</p>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {filteredClubs.length === 0 && (
                    <div className="rounded-2xl border border-[#dbe6e8] bg-white p-10 text-center shadow-sm">
                      <Search className="mx-auto mb-3 h-8 w-8 text-[#8792a4]" />
                      <h3 className="font-bold text-[#07184c]">No matching clubs yet</h3>
                      <p className="mt-1 text-sm text-[#6a778a]">Try removing a filter or searching a nearby county. If the club is missing, you can add it for review.</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Link to="/directory/add" className="inline-flex h-10 items-center rounded-lg bg-[#078e48] px-4 text-sm font-bold text-white">Add a missing club</Link>
                        <a href="#player-network" className="inline-flex h-10 items-center rounded-lg border border-[#cbd7dc] bg-white px-4 text-sm font-bold text-[#07184c]">Invite the club by WhatsApp / email</a>
                      </div>
                    </div>
                  )}
                </section>

                <aside className="hidden h-fit xl:sticky xl:top-24 xl:block">
                  <div className="overflow-hidden rounded-2xl border border-[#dbe6e8] bg-white shadow-[0_8px_24px_rgba(8,24,77,.05)]">
                    <div className="border-b border-[#dbe6e8] p-4">
                      <h2 className="font-extrabold text-[#07184c]">Explore clubs on the map</h2>
                      <p className="mt-1 text-xs text-[#748196]">Mapped venues update with the same filters.</p>
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
                                {venue.eircode && <><span>{venue.eircode}</span><br /></>}
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
          </div>
        </main>

        <footer className="mt-4 bg-[#053c56] text-white">
          <div className="bg-[#053c56] text-white">
            <div className="mx-auto flex min-h-[70px] max-w-[1380px] flex-col items-center justify-center gap-3 px-4 py-4 text-center sm:px-6 md:flex-row md:justify-between md:text-left lg:px-10 xl:px-12">
              <div>
                <div className="font-black">RallyHub</div>
                <div className="mt-1 text-[8px] font-bold tracking-[.30em] text-white/90">PLAY • CONNECT • BELONG</div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-bold text-white/85">
                <Link to="/directory">Directory</Link>
                <Link to="/events">Events</Link>
                <Link to="/directory/help">Club Guide</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
              </div>
            </div>
          </div>
          <div className="mx-auto flex min-h-[36px] max-w-[1380px] items-center justify-center border-t border-white/10 px-4 py-2 text-center text-[10px] font-medium text-white/70 sm:px-6 sm:text-[11px] lg:px-10 xl:px-12">© 2026 RallyHub All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}
