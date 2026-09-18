import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarDays, MapPin, PlusCircle } from 'lucide-react';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import Seo, { SITE_URL } from '@/components/public/Seo';
import { directoryClubs, irelandCounties } from '@/data/directorySeed';
import { loadPublicDirectoryState } from '@/lib/public-directory-cache';

const countySlug = county => county.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function CountyDirectory() {
  const { countySlug: slug } = useParams();
  const county = irelandCounties.find(item => countySlug(item) === slug);
  const [directoryState, setDirectoryState] = useState({});

  useEffect(() => {
    let active = true;
    loadPublicDirectoryState()
      .then(listings => { if (active) setDirectoryState(listings || {}); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const allClubs = useMemo(() => {
    const staticClubs = directoryClubs.map(club => {
      const state = directoryState[club.slug];
      const profile = state?.profile;
      return profile ? {
        ...club,
        ...profile,
        verificationStatus: state?.verificationStatus || club.verificationStatus,
        contact: { ...(club.contact || {}), ...(profile.contact || {}) },
        venues: Array.isArray(profile.venues) ? profile.venues : club.venues,
        sessions: Array.isArray(profile.sessions) ? profile.sessions : club.sessions,
      } : { ...club, verificationStatus: state?.verificationStatus || club.verificationStatus };
    });
    const staticSlugs = new Set(directoryClubs.map(club => club.slug));
    const dynamicClubs = Object.entries(directoryState)
      .filter(([itemSlug, state]) => !staticSlugs.has(itemSlug) && state?.base)
      .map(([itemSlug, state]) => ({
        ...state.base,
        ...(state.profile || {}),
        id: state.base?.id || itemSlug,
        slug: itemSlug,
        sport: state.base?.sport || 'Pickleball',
        verificationStatus: state.verificationStatus || 'unclaimed',
        contact: { ...(state.base?.contact || {}), ...(state.profile?.contact || {}) },
        venues: Array.isArray(state.profile?.venues) ? state.profile.venues : (state.base?.venues || []),
        sessions: Array.isArray(state.profile?.sessions) ? state.profile.sessions : (state.base?.sessions || []),
      }));
    return [...staticClubs, ...dynamicClubs];
  }, [directoryState]);

  if (!county) return <Navigate to="/directory" replace />;

  const clubs = allClubs.filter(club => club.county === county);
  const venueCount = clubs.reduce((sum, club) => sum + (club.venues?.length || 0), 0);
  const sessionCount = clubs.reduce((sum, club) => sum + (club.sessions?.length || 0), 0);
  const hasListings = clubs.length > 0;

  const schema = hasListings ? {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Pickleball clubs in County ${county}`,
    url: `${SITE_URL}/pickleball-clubs/${slug}`,
    description: `Browse pickleball clubs, venues and contact information in County ${county} on RallyHub.`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: clubs.length,
      itemListElement: clubs.map((club, index) => ({
        '@type': 'ListItem', position: index + 1, name: club.name, url: `${SITE_URL}/directory/${club.slug}`
      }))
    }
  } : null;

  const description = hasListings
    ? `Find ${clubs.length} pickleball club${clubs.length === 1 ? '' : 's'} and ${venueCount} listed venue${venueCount === 1 ? '' : 's'} in County ${county}. View club details, places to play and contact information on RallyHub.`
    : `RallyHub supports pickleball listings in County ${county}, but no club is currently listed there. Add your club to help complete the all-Ireland directory.`;

  return (
    <>
      <Seo
        title={`Pickleball Clubs in ${county} | RallyHub Ireland`}
        description={description}
        path={`/pickleball-clubs/${slug}`}
        robots={hasListings ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' : 'noindex,follow'}
        structuredData={schema}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PublicDirectoryHeader />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to="/directory" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to all-Ireland directory
          </Link>

          <section className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">County {county}</p>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-2">Pickleball clubs in {county}</h1>
            <p className="text-base sm:text-lg text-muted-foreground mt-3 max-w-3xl">{description}</p>
            {hasListings && (
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Building2 className="w-4 h-4 text-primary" /> {clubs.length} club{clubs.length === 1 ? '' : 's'}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {venueCount} venue{venueCount === 1 ? '' : 's'}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-primary" /> {sessionCount || 'Schedules being added'}{sessionCount ? ` weekly session${sessionCount === 1 ? '' : 's'}` : ''}</span>
              </div>
            )}
          </section>

          {hasListings ? (
            <div className="grid md:grid-cols-2 gap-4">
              {clubs.map(club => (
                <article key={club.id || club.slug} className="glass rounded-2xl p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">{club.sport || 'Pickleball'} · County {county}</p>
                      <h2 className="text-xl font-bold mt-1">{club.name}</h2>
                    </div>
                    <span className={`text-[11px] font-semibold ${club.verificationStatus === 'verified' ? 'text-green-400' : 'text-amber-300'}`}>{club.verificationStatus === 'verified' ? 'Verified' : 'Unclaimed'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{club.description}</p>
                  <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                    <span>{club.venues?.length || 0} venue{club.venues?.length === 1 ? '' : 's'}</span>
                    <span>{club.sessions?.length ? `${club.sessions.length} weekly session${club.sessions.length === 1 ? '' : 's'}` : 'Schedule pending'}</span>
                  </div>
                  <div className="mt-auto pt-5 flex flex-wrap gap-2">
                    <Link to={`/directory/${club.slug}`} className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground">View club</Link>
                    {club.verificationStatus !== 'verified' && <Link to={`/directory/${club.slug}/claim`} className="inline-flex h-9 items-center rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 text-sm font-semibold text-amber-700 dark:text-amber-200">Claim listing</Link>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center">
              <PlusCircle className="w-9 h-9 text-primary mx-auto" />
              <h2 className="text-xl font-bold mt-4">Know a club in {county}?</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">Help us complete the 32-county directory. A club representative can submit basic details for review without joining the full RallyHub Club platform.</p>
              <Link to="/directory/add" className="inline-flex mt-5 h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Add a club in {county}</Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
