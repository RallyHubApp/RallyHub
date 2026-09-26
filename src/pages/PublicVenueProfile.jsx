import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarDays, ExternalLink, MapPin } from 'lucide-react';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import PublicCopyrightFooter from '@/components/public/PublicCopyrightFooter';
import Seo, { SITE_URL } from '@/components/public/Seo';
import { getClub } from '@/data/directorySeed';
import { loadPublicDirectoryState } from '@/lib/public-directory-cache';
import { trackSiteEvent } from '@/lib/site-analytics';

const countySlug = county => String(county || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const venuePath = (clubSlug, venueId) => `/pickleball-venues/${encodeURIComponent(clubSlug)}/${encodeURIComponent(venueId)}`;

export default function PublicVenueProfile() {
  const { clubSlug, venueId } = useParams();
  const seedClub = getClub(clubSlug);
  const [directoryState, setDirectoryState] = useState(null);
  const analyticsViewed = useRef(false);

  useEffect(() => {
    let active = true;
    loadPublicDirectoryState()
      .then(listings => { if (active) setDirectoryState(listings?.[clubSlug] || {}); })
      .catch(() => { if (active) setDirectoryState({}); });
    return () => { active = false; };
  }, [clubSlug]);

  const club = useMemo(() => {
    const state = directoryState || {};
    const base = seedClub || state.base;
    if (!base) return null;
    const profile = state.profile || null;
    return profile ? {
      ...base,
      ...profile,
      contact: { ...(base.contact || {}), ...(profile.contact || {}) },
      venues: Array.isArray(profile.venues) ? profile.venues : (base.venues || []),
      sessions: Array.isArray(profile.sessions) ? profile.sessions : (base.sessions || []),
      verificationStatus: state.verificationStatus || base.verificationStatus,
    } : { ...base, venues: base.venues || [], sessions: base.sessions || [] };
  }, [seedClub, directoryState]);

  useEffect(() => {
    const knownVenue = club?.venues?.find(item => String(item.id) === String(venueId));
    if (!analyticsViewed.current && club?.name && knownVenue?.name) {
      analyticsViewed.current = true;
      trackSiteEvent('venue_view', {
        clubSlug: club.slug,
        clubName: club.name,
        county: club.county,
        venueId: knownVenue.id,
        venueName: knownVenue.name
      });
    }
  }, [club, venueId]);

  if (!seedClub && directoryState === null) {
    return <div className="min-h-screen bg-background text-foreground"><PublicDirectoryHeader /><main className="container mx-auto max-w-5xl px-4 py-10"><div className="glass rounded-2xl p-6">Loading venue…</div></main></div>;
  }
  if (!club) return <Navigate to="/directory" replace />;

  const venue = (club.venues || []).find(item => String(item.id) === String(venueId));
  if (!venue) return <Navigate to={`/directory/${club.slug}`} replace />;

  const sessions = (club.sessions || []).filter(session => String(session.venueId) === String(venue.id));
  const indoorLabel = venue.indoor === true ? 'indoor' : venue.indoor === false ? 'outdoor' : '';
  const courtText = venue.courts ? `${venue.courts} pickleball court${Number(venue.courts) === 1 ? '' : 's'}` : 'pickleball venue';
  const addressText = [venue.address, venue.eircode].filter(Boolean).join(', ');
  const titlePlace = venue.shortName || venue.name;
  const description = `${titlePlace} is a ${indoorLabel ? `${indoorLabel} ` : ''}${courtText} used by ${club.name} in County ${club.county}.${sessions.length ? ` View ${sessions.length} listed weekly session${sessions.length === 1 ? '' : 's'}, times and club contact details.` : ' View venue and club contact details.'}`;
  const canonicalPath = venuePath(club.slug, venue.id);

  const venueSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: venue.name,
    url: `${SITE_URL}${canonicalPath}`,
    description,
    sport: 'Pickleball',
    ...(venue.websiteUrl ? { sameAs: [venue.websiteUrl] } : {}),
    ...(addressText ? {
      address: {
        '@type': 'PostalAddress',
        ...(venue.address ? { streetAddress: venue.address } : {}),
        addressRegion: club.county,
        addressCountry: ['Antrim','Armagh','Derry','Down','Fermanagh','Tyrone'].includes(club.county) ? 'GB' : 'IE',
        ...(venue.eircode ? { postalCode: venue.eircode } : {})
      }
    } : {}),
    ...(Number.isFinite(venue.latitude) && Number.isFinite(venue.longitude) ? {
      geo: { '@type': 'GeoCoordinates', latitude: venue.latitude, longitude: venue.longitude }
    } : {}),
    ...(venue.courts ? { numberOfRooms: Number(venue.courts) } : {}),
    isContainedInPlace: undefined,
  };
  delete venueSchema.isContainedInPlace;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'RallyHub', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Pickleball Club Directory', item: `${SITE_URL}/directory` },
      { '@type': 'ListItem', position: 3, name: `Pickleball in ${club.county}`, item: `${SITE_URL}/pickleball-clubs/${countySlug(club.county)}` },
      { '@type': 'ListItem', position: 4, name: club.name, item: `${SITE_URL}/directory/${club.slug}` },
      { '@type': 'ListItem', position: 5, name: venue.name, item: `${SITE_URL}${canonicalPath}` },
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Where is ${venue.name}?`,
        acceptedAnswer: { '@type': 'Answer', text: addressText || `${venue.name} is listed as a ${club.name} venue in County ${club.county}.` }
      },
      {
        '@type': 'Question',
        name: `Which pickleball club plays at ${venue.name}?`,
        acceptedAnswer: { '@type': 'Answer', text: `${club.name} lists ${venue.name} as one of its pickleball venues on RallyHub.` }
      },
      {
        '@type': 'Question',
        name: `When can I play pickleball at ${venue.name}?`,
        acceptedAnswer: { '@type': 'Answer', text: sessions.length ? sessions.map(session => `${session.day} ${session.start}${session.end ? `–${session.end}` : ''} (${session.level || 'club session'})`).join('; ') : `No verified weekly session times are currently listed for this venue. Contact ${club.name} before travelling.` }
      }
    ]
  };

  return <>
    <Seo
      title={`Pickleball at ${titlePlace}, ${club.county} | ${club.name} | RallyHub`}
      description={description}
      path={canonicalPath}
      structuredData={[venueSchema, breadcrumbSchema, faqSchema]}
    />
    <div className="min-h-screen bg-background text-foreground">
      <PublicDirectoryHeader />
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/directory" className="hover:text-foreground">Directory</Link><span>/</span>
          <Link to={`/pickleball-clubs/${countySlug(club.county)}`} className="hover:text-foreground">{club.county}</Link><span>/</span>
          <Link to={`/directory/${club.slug}`} className="hover:text-foreground">{club.name}</Link><span>/</span>
          <span className="text-foreground">{venue.shortName || venue.name}</span>
        </nav>

        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Pickleball venue · County {club.county}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{venue.name}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{description}</p>
            </div>
            <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">{venue.indoor === true ? 'Indoor' : venue.indoor === false ? 'Outdoor' : 'Pickleball venue'}</span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background/40 p-4"><MapPin className="h-4 w-4 text-primary"/><p className="mt-2 text-xs text-muted-foreground">Location</p><p className="mt-1 font-semibold">{addressText || `County ${club.county}`}</p></div>
            <div className="rounded-xl border border-border bg-background/40 p-4"><Building2 className="h-4 w-4 text-primary"/><p className="mt-2 text-xs text-muted-foreground">Courts</p><p className="mt-1 font-semibold">{venue.courts ? `${venue.courts} court${Number(venue.courts) === 1 ? '' : 's'}` : 'Details pending'}</p></div>
            <div className="rounded-xl border border-border bg-background/40 p-4"><CalendarDays className="h-4 w-4 text-primary"/><p className="mt-2 text-xs text-muted-foreground">Weekly sessions</p><p className="mt-1 font-semibold">{sessions.length || 'None currently listed'}</p></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {venue.mapUrl && <a href={venue.mapUrl} onClick={() => trackSiteEvent('map_click',{clubSlug:club.slug,clubName:club.name,county:club.county,venueId:venue.id,venueName:venue.name})} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">Open map <ExternalLink className="h-3.5 w-3.5"/></a>}
            {venue.websiteUrl && <a href={venue.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold">Venue website <ExternalLink className="h-3.5 w-3.5"/></a>}
            <Link to={`/directory/${club.slug}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold">View {club.name}</Link>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-bold">Pickleball sessions at {venue.shortName || venue.name}</h2>
          {sessions.length ? <div className="mt-4 space-y-3">{sessions.map(session => <div key={session.id} className="rounded-xl border border-border bg-background/40 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"><div><p className="font-bold text-primary">{session.day} · {session.start}{session.end ? `–${session.end}` : ''}</p><p className="mt-1 text-sm font-semibold">{session.level || 'Club session'}</p></div><p className="mt-2 text-xs text-muted-foreground sm:mt-0">Times can change. Contact the club before travelling.</p></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No verified weekly session times are currently listed for this venue. Contact {club.name} before travelling.</p>}
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-bold">About playing pickleball here</h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
            <div><h3 className="font-bold text-foreground">Where is {venue.name}?</h3><p>{addressText || `${venue.name} is listed as a ${club.name} venue in County ${club.county}.`}</p></div>
            <div><h3 className="font-bold text-foreground">Which club plays here?</h3><p><Link to={`/directory/${club.slug}`} className="font-semibold text-primary hover:underline">{club.name}</Link> lists this as one of its pickleball venues.</p></div>
            <div><h3 className="font-bold text-foreground">Where else can I play in {club.county}?</h3><p>See all current <Link to={`/pickleball-clubs/${countySlug(club.county)}`} className="font-semibold text-primary hover:underline">pickleball clubs and venues in County {club.county}</Link>.</p></div>
          </div>
        </section>

        <Link to={`/directory/${club.slug}`} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4"/> Back to {club.name}</Link>
      </main>
      <div className="px-4 pb-4"><PublicCopyrightFooter maxWidthClass="max-w-5xl" /></div>
    </div>
  </>;
}
