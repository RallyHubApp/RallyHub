import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import { getClub } from '@/data/directorySeed';
import { ArrowLeft, CalendarDays, Check, CheckCircle2, ExternalLink, Facebook, Globe2, Link2, Lightbulb, Lock, Mail, MapPin, MessageCircle, Phone, Share2, UserCheck, Users } from 'lucide-react';
import Seo, { SITE_URL, absoluteUrl } from '@/components/public/Seo';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PublicDirectoryLogo, { normaliseDirectoryAssetUrl } from '@/components/directory/PublicDirectoryLogo';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const weekOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const groupByDay = sessions => [...(sessions || [])]
  .sort((a, b) => weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day) || String(a.start || '').localeCompare(String(b.start || '')))
  .reduce((groups, session) => {
    (groups[session.day] ||= []).push(session);
    return groups;
  }, {});

const publicDescription = club => {
  const description = String(club?.description || '').trim();
  if (club?.verificationStatus === 'verified' && /has not yet been claimed|listing is currently unclaimed|unclaimed listing/i.test(description)) {
    return `${club.name} is listed in the RallyHub Club Directory for County ${club.county}.`;
  }
  return description;
};

const publicMembershipStatus = club => {
  const status = String(club?.membershipStatus || '').trim();
  if (club?.verificationStatus === 'verified' && /unclaimed/i.test(status)) return 'Contact club';
  return status;
};

export default function PublicClubProfile() {
  const { slug } = useParams();
  const location = useLocation();
  const seedClub = getClub(slug);
  const previewMode = new URLSearchParams(location.search).get('preview') === '1';
  const { user, isAuthenticated } = useAuth();
  const [dynamicBase, setDynamicBase] = useState(null);
  const [publicProfile, setPublicProfile] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(seedClub?.verificationStatus || 'unclaimed');
  const [hasDirectoryAccess, setHasDirectoryAccess] = useState(false);
  const [loadingListing, setLoadingListing] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [clubInterestOpen, setClubInterestOpen] = useState(false);
  const [clubInterestBusy, setClubInterestBusy] = useState(false);
  const [clubInterestDone, setClubInterestDone] = useState(false);
  const [clubInterestMessage, setClubInterestMessage] = useState('');
  const [clubInterest, setClubInterest] = useState({ interestType: 'demo', contactPhone: user?.directory_mobile || '' });
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState('');
  const [feedback, setFeedback] = useState({ category: 'improvement', area: 'directory', message: '', importance: 'important', contactOk: true });

  useEffect(() => {
    let active = true;
    setLoadingListing(true);

    // When an editor has just saved this listing, use the confirmed save response
    // immediately while we fetch the canonical public record. This avoids showing
    // the previous SPA-rendered profile until the visitor manually refreshes.
    try {
      const cached = JSON.parse(sessionStorage.getItem(`rallyhub-directory-profile-${slug}`) || 'null');
      if (cached?.profile && Date.now() - Number(cached.savedAt || 0) < 5 * 60 * 1000) {
        setPublicProfile(cached.profile);
      }
    } catch {}

    base44.functions.invoke('directoryListingProfile', { action: previewMode ? 'private_get' : 'public_get', listingSlug: slug, refresh: Date.now() })
      .then(res => {
        if (!active || res.data?.error) return;
        setDynamicBase(res.data?.base || null);
        setPublicProfile(res.data?.profile || null);
        setVerificationStatus(res.data?.verificationStatus || seedClub?.verificationStatus || 'unclaimed');
        try { sessionStorage.removeItem(`rallyhub-directory-profile-${slug}`); } catch {}
      })
      .catch(() => {})
      .finally(() => { if (active) setLoadingListing(false); });
    return () => { active = false; };
  }, [slug, seedClub, location.search, previewMode]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) { setHasDirectoryAccess(false); return; }
    if (user.role === 'admin') { setHasDirectoryAccess(true); return; }
    let active = true;
    Promise.allSettled([
      base44.functions.invoke('directoryClaim', { action: 'status', listingSlug: slug }),
      base44.entities.DirectoryListingAccess.filter({ listing_slug: slug, user_id: user.id, status: 'active' }),
    ]).then(([statusResult, accessResult]) => {
      if (!active) return;
      const functionAccess = statusResult.status === 'fulfilled' && !statusResult.value?.data?.error && !!statusResult.value?.data?.hasAccess;
      const directAccess = accessResult.status === 'fulfilled' && Array.isArray(accessResult.value) && accessResult.value.some(row => row.status === 'active');
      setHasDirectoryAccess(functionAccess || directAccess);
    }).catch(() => {});
    return () => { active = false; };
  }, [slug, isAuthenticated, user?.id, user?.role]);

  const baseClub = seedClub || dynamicBase;
  if (loadingListing && !baseClub) {
    return <div className="min-h-screen bg-background text-foreground"><PublicDirectoryHeader /><main className="container mx-auto px-4 py-10"><div className="glass rounded-2xl p-6">Loading club listing…</div></main></div>;
  }
  if (!baseClub) return <Navigate to="/directory" replace />;
  const club = publicProfile ? {
    ...baseClub,
    ...publicProfile,
    verificationStatus,
    contact: { ...(baseClub.contact || {}), ...(publicProfile.contact || {}) },
    venues: Array.isArray(publicProfile.venues) ? publicProfile.venues : (baseClub.venues || []),
    sessions: Array.isArray(publicProfile.sessions) ? publicProfile.sessions : (baseClub.sessions || []),
  } : { ...baseClub, verificationStatus, venues: baseClub.venues || [], sessions: baseClub.sessions || [], contact: baseClub.contact || {} };

  const schedule = groupByDay(club.sessions);
  const displayDescription = publicDescription(club);
  const displayMembershipStatus = publicMembershipStatus(club);
  const displayLogoUrl = normaliseDirectoryAssetUrl(club.logoUrl);
  const profileUrl = `${SITE_URL}/directory/${club.slug}`;
  const socialLinks = [club.website, club.facebook, club.instagram].filter(Boolean);
  const submitClubInterest = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?returnTo=${encodeURIComponent(location.pathname)}`;
      return;
    }
    setClubInterestBusy(true);
    try {
      const res = await base44.functions.invoke('rallyHubClubInterest', {
        action: 'submit',
        listingSlug: club.slug,
        clubName: club.name,
        contactName: user?.full_name || user?.display_name || '',
        contactEmail: user?.email || '',
        contactPhone: clubInterest.contactPhone,
        interestType: clubInterest.interestType,
        features: [],
      });
      if (res.data?.error) throw new Error(res.data.error);
      setClubInterestMessage(res.data?.message || '');
      setClubInterestDone(true);
    } catch (error) {
      window.alert(error?.message || 'Could not add you to the RallyHub Club waiting list right now.');
    } finally {
      setClubInterestBusy(false);
    }
  };
  const submitFeedback = async () => {
    setFeedbackBusy(true);
    try {
      const res = await base44.functions.invoke('clubFeedback', {
        action: 'submit',
        listingSlug: club.slug,
        clubName: club.name,
        feedbackType: feedback.category,
        area: feedback.area,
        message: feedback.message,
        importance: feedback.importance,
        contactOk: feedback.contactOk,
        pagePath: window.location.pathname,
        userAgent: navigator.userAgent,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setFeedbackResponse(res.data?.message || '');
      setFeedbackDone(true);
    } catch (error) {
      window.alert(error?.message || 'Could not send your feedback right now.');
    } finally {
      setFeedbackBusy(false);
    }
  };
  const clubSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: club.name,
    url: profileUrl,
    sport: club.sport || 'Pickleball',
    description: displayDescription,
    areaServed: { '@type': 'AdministrativeArea', name: `County ${club.county}` },
    ...(displayLogoUrl ? { logo: absoluteUrl(displayLogoUrl) } : {}),
    ...(socialLinks.length ? { sameAs: socialLinks } : {}),
    ...(club.contact?.email || club.contact?.phone ? {
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'club contact',
        ...(club.contact?.email ? { email: club.contact.email } : {}),
        ...(club.contact?.phone ? { telephone: club.contact.phone } : {})
      }
    } : {}),
    location: (club.venues || []).map(venue => ({
      '@type': 'SportsActivityLocation',
      name: venue.name,
      ...(venue.address || venue.eircode ? {
        address: {
          '@type': 'PostalAddress',
          ...(venue.address ? { streetAddress: venue.address } : {}),
          addressRegion: club.county,
          ...(venue.eircode ? { postalCode: venue.eircode } : {})
        }
      } : {}),
      ...(Number.isFinite(venue.latitude) && Number.isFinite(venue.longitude) ? {
        geo: { '@type': 'GeoCoordinates', latitude: venue.latitude, longitude: venue.longitude }
      } : {})
    }))
  };
  const seoDescription = `${club.name} in County ${club.county}: venues, club information${club.sessions?.length ? ', weekly sessions' : ''} and contact details on the RallyHub all-Ireland pickleball directory.`;
  const shareText = `${club.name} on the RallyHub Club Directory`;
  const shareClub = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: club.name, text: shareText, url: profileUrl });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    setShareOpen(value => !value);
  };
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = profileUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 2200);
  };
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${profileUrl}`)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(club.name)}&body=${encodeURIComponent(`${shareText}\n\n${profileUrl}`)}`;

  return (
    <>
      <Seo
        title={`${club.name} | Pickleball in ${club.county} | RallyHub`}
        description={seoDescription}
        path={`/directory/${club.slug}`}
        image={displayLogoUrl ? absoluteUrl(displayLogoUrl) : undefined}
        type="profile"
        structuredData={clubSchema}
      />
      <div className="min-h-screen bg-background text-foreground">
      <PublicDirectoryHeader />

      <main>
        <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(255,201,42,.12),transparent_38%)]">
          <div className="container mx-auto px-4 py-8">
            <Link to="/directory" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to directory
            </Link>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <PublicDirectoryLogo
                src={club.logoUrl}
                name={club.name}
                imageClassName="w-32 h-32 rounded-3xl bg-white object-contain p-2 shadow-2xl shrink-0"
                fallbackClassName="w-32 h-32 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl font-black text-primary shadow-2xl shrink-0"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-semibold">{club.sport}</span>
                  {club.verificationStatus === 'unclaimed' ? (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-300"><CheckCircle2 className="w-3.5 h-3.5" /> Unclaimed listing</span>
                  ) : club.verificationStatus === 'verified' ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> Verified club listing</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> Active listing</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3"><h1 className="text-4xl sm:text-5xl font-black tracking-tight">{club.name}</h1>{previewMode && <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-500">PREVIEW ONLY · NOT PUBLIC</span>}</div>
                <p className="mt-3 text-lg text-muted-foreground max-w-3xl">{displayDescription}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {club.website && <a href={club.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"><Globe2 className="w-4 h-4" /> Website</a>}
                  {club.waitingListUrl && <a href={club.waitingListUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-sm font-semibold"><Users className="w-4 h-4" /> {club.joiningCtaLabel || 'Contact club'}</a>}
                  {!club.website && !club.waitingListUrl && club.contact?.phoneHref && <a href={club.contact.phoneHref} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"><Phone className="w-4 h-4" /> Contact club</a>}
                  {!club.website && !club.waitingListUrl && !club.contact?.phoneHref && club.contact?.email && <a href={`mailto:${club.contact.email}`} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"><Mail className="w-4 h-4" /> Contact club</a>}
                  <div className="relative">
                    <button type="button" onClick={shareClub} aria-expanded={shareOpen} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-sm font-semibold hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <Share2 className="w-4 h-4" /> Share club
                    </button>
                    {shareOpen && (
                      <div className="absolute left-0 sm:right-0 sm:left-auto top-12 z-30 w-64 rounded-2xl border border-border bg-card p-3 shadow-2xl" role="menu" aria-label={`Share ${club.name}`}>
                        <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Share this club</p>
                        <a href={whatsappShareUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-primary/10" role="menuitem"><MessageCircle className="w-4 h-4 text-primary" /> WhatsApp</a>
                        <a href={emailShareUrl} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-primary/10" role="menuitem"><Mail className="w-4 h-4 text-primary" /> Email</a>
                        <button type="button" onClick={copyShareLink} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-primary/10" role="menuitem">
                          {shareCopied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4 text-primary" />} {shareCopied ? 'Link copied' : 'Copy link'}
                        </button>
                        <p className="px-1 pt-2 text-[11px] text-muted-foreground">On supported phones and browsers, Share opens your device share sheet with your usual apps.</p>
                      </div>
                    )}
                  </div>
                  {hasDirectoryAccess && (
                    <Link to={`/directory/${club.slug}/edit`} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
                      <UserCheck className="w-4 h-4" /> Edit your listing
                    </Link>
                  )}
                  {!hasDirectoryAccess && club.verificationStatus === 'unclaimed' && (
                    <Link to={`/directory/${club.slug}/claim`} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-amber-300/60 bg-amber-300 text-slate-950 text-sm font-bold hover:bg-amber-200 transition-colors shadow-sm">
                      <UserCheck className="w-4 h-4" /> Claim this listing
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
          <div className="space-y-6">
            <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">{club.policyLabel || 'Club policy'}</p>
              <p className="mt-2 text-base font-semibold text-foreground">{club.guestPolicy}</p>
              {String(club.guestPolicy || '').trim().toLowerCase() !== 'contact the club before attending a session.' && <p className="mt-2 text-sm text-muted-foreground">Please contact the club before attending any session.</p>}
            </section>

            <section className="glass rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Weekly sessions</h2>
              </div>
              {club.scheduleUpdatedAt && (
                <p className="text-xs text-muted-foreground -mt-3 mb-5">Schedule supplied by the club · last updated {club.scheduleUpdatedAt}</p>
              )}
              {club.sessions?.length ? (
                <div className="space-y-5">
                  {Object.entries(schedule).map(([day, sessions]) => (
                  <div key={day}>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">{day}</h3>
                    <div className="space-y-2">
                      {sessions.map(session => {
                        const venue = club.venues.find(v => v.id === session.venueId);
                        return (
                          <div key={session.id} className="rounded-xl border border-border bg-background/40 p-4 grid sm:grid-cols-[110px_1fr_auto] gap-2 sm:gap-4 items-center">
                            <p className="font-bold text-primary">{session.end ? `${session.start}–${session.end}` : session.start}</p>
                            <div>
                              <p className="font-semibold">{session.level}</p>
                              <p className="text-sm text-muted-foreground">{venue?.name}</p>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                {session.meetTime && <span>Meet {session.meetTime}</span>}
                                {session.price !== null && session.price !== undefined && session.price !== '' && <span>€{Number(session.price).toFixed(Number(session.price) % 1 ? 2 : 0)}</span>}
                                {session.paymentMethod && <span>{session.paymentMethod}</span>}
                                {session.capacity && <span>Capacity {session.capacity}</span>}
                                {session.host && <span>Host: {session.host}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:justify-end">
                              {!session.showPublicJoinLink && <p className="text-sm font-semibold">Contact club</p>}
                              {session.showPublicJoinLink && session.publicJoinUrl && (
                                <a
                                  href={session.publicJoinUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground"
                                >
                                  Join session <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-background/40 p-5">
                  <p className="font-semibold">Schedule details pending</p>
                  <p className="text-sm text-muted-foreground mt-1">Weekly session times have not yet been supplied to RallyHub. Contact the club directly before travelling.</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-5">Times and availability can change. Contact the club before travelling.</p>
            </section>

            {club.levelGuide?.length > 0 && (
              <section className="glass rounded-2xl p-5 sm:p-6">
                <h2 className="text-xl font-bold">Which session should I attend?</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Unless stated otherwise, sessions use doubles format.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {club.levelGuide.map(level => (
                    <div key={level.name} className="rounded-xl border border-border bg-background/40 p-4">
                      <h3 className="font-semibold text-primary">{level.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="glass rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Club venues</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {club.venues.map(venue => (
                  <article key={venue.id} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{venue.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{venue.address}{venue.eircode ? ` · ${venue.eircode}` : ''}</p>
                      </div>
                      <span className="rounded-full bg-accent/10 text-accent px-2 py-1 text-[10px] font-semibold">{venue.indoor === true ? 'INDOOR' : venue.indoor === false ? 'OUTDOOR' : 'VENUE'}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm">{venue.courts ? `${venue.courts} courts` : 'Court details pending'}{venue.playType ? ` · ${venue.playType}` : ''}</p>
                      <div className="flex items-center gap-3">
                        {venue.websiteUrl && <a href={venue.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Venue <ExternalLink className="w-3.5 h-3.5" /></a>}
                        {venue.mapUrl && <a href={venue.mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Map <ExternalLink className="w-3.5 h-3.5" /></a>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            {hasDirectoryAccess && (
              <section className="rounded-2xl border border-primary/35 bg-primary/10 p-5">
                <div className="flex items-center gap-2 text-primary">
                  <UserCheck className="w-5 h-5" />
                  <h2 className="font-bold">You manage this listing</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Update the club's public contact details, venues, sessions and joining information.</p>
                <Link to={`/directory/${club.slug}/edit`} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Edit your listing
                </Link>
                <button type="button" onClick={() => { setClubInterestDone(false); setClubInterestMessage(''); setClubInterestOpen(true); }} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-4 py-3 text-sm font-semibold text-foreground hover:border-primary/40 transition-colors">
                  <Lock className="w-4 h-4" /> RallyHub Club — join the waiting list
                </button>
                <button type="button" onClick={() => { setFeedbackDone(false); setFeedbackResponse(''); setFeedbackOpen(true); }} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-4 py-3 text-sm font-semibold text-foreground hover:border-primary/40 transition-colors">
                  <Lightbulb className="w-4 h-4" /> Feedback & ideas
                </button>
              </section>
            )}
            {!hasDirectoryAccess && club.verificationStatus === 'unclaimed' && (
              <section className="rounded-2xl border border-amber-400/35 bg-amber-400/10 p-5">
                <div className="flex items-center gap-2 text-amber-200">
                  <UserCheck className="w-5 h-5" />
                  <h2 className="font-bold">Is this your club?</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Claim the listing to verify your connection and manage the club's public directory details.</p>
                <Link to={`/directory/${club.slug}/claim`} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-200 transition-colors">
                  Claim this listing
                </Link>
              </section>
            )}
            <section className="glass rounded-2xl p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Club contact</p>
              <h2 className="text-xl font-bold mt-1">{club.contact?.name ? `Contact ${club.contact.name}` : 'Contact details'}</h2>
              <div className="mt-4 space-y-2">
                {club.contact.phoneHref && club.contact.phone && <a href={club.contact.phoneHref} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/40"><Phone className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{club.contact.phone}</span></a>}
                {club.contact.whatsapp && <a href={club.contact.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/40"><MessageCircle className="w-4 h-4 text-primary" /><span className="text-sm font-medium">WhatsApp {club.contact.name}</span></a>}
                {club.contact.email && <a href={`mailto:${club.contact.email}`} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/40"><Mail className="w-4 h-4 text-primary" /><span className="text-sm font-medium break-all">{club.contact.email}</span></a>}
                {!club.contact?.phoneHref && !club.contact?.email && <><p className="text-sm text-muted-foreground">No direct contact details have been supplied yet.</p>{hasDirectoryAccess && <Link to={`/directory/${club.slug}/edit#contact`} className="inline-flex mt-2 text-sm font-semibold text-primary hover:underline">Add public contact details</Link>}</>}
              </div>
            </section>

            <section className="glass rounded-2xl p-5">
              <h2 className="font-bold">Club details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">County</dt><dd>{club.county}</dd></div>
                {club.town && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Town / area</dt><dd className="text-right">{club.town}</dd></div>}
                {club.founded && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Founded</dt><dd>{club.founded}</dd></div>}
                {club.affiliation && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Affiliation</dt><dd>{club.affiliation}</dd></div>}
                {displayMembershipStatus && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Membership</dt><dd className="text-right">{displayMembershipStatus}</dd></div>}
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Listing</dt><dd className="text-right">{club.verificationStatus === 'verified' ? 'Verified club representative' : 'RallyHub directory listing'}</dd></div>
              </dl>
            </section>

            {(club.facebook || club.instagram || club.waiverUrl) && (
              <section className="glass rounded-2xl p-5">
                <h2 className="font-bold">Club links</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {club.facebook && <a href={club.facebook} target="_blank" rel="noreferrer" className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl border border-border p-3 text-sm font-semibold"><Facebook className="w-4 h-4" /> Facebook</a>}
                  {club.instagram && <a href={club.instagram} target="_blank" rel="noreferrer" className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl border border-border p-3 text-sm font-semibold">Instagram</a>}
                  {club.waiverUrl && <a href={club.waiverUrl} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center gap-2 rounded-xl border border-border p-3 text-sm font-semibold">Club waiver <ExternalLink className="w-3.5 h-3.5" /></a>}
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>

      <Dialog open={clubInterestOpen} onOpenChange={setClubInterestOpen}>
        <DialogContent className="sm:max-w-lg">
          {clubInterestDone ? (
            <div className="py-3">
              <CheckCircle2 className="w-11 h-11 text-primary" />
              <h2 className="text-2xl font-black mt-4">You’re on the list</h2>
              <p className="text-sm text-muted-foreground mt-2">{clubInterestMessage || 'Thanks. We’ll contact you when RallyHub Club demos or further information become available.'}</p>
              <p className="text-xs text-muted-foreground mt-3">Your free RallyHub Directory listing remains completely separate and available.</p>
              <Button className="mt-5 w-full" onClick={() => setClubInterestOpen(false)}>Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>RallyHub Club is still under development</DialogTitle>
                <DialogDescription>Join the waiting list if you’d like a demo, further information, or an update when RallyHub Club becomes available.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
                  <strong>Your Directory listing stays separate.</strong>
                  <span className="block text-muted-foreground mt-1">Joining this waiting list does not change your free RallyHub Directory access.</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">I’m interested in</p>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[['demo','A demo'],['information','More information'],['notify','Launch updates']].map(([value,label]) => (
                      <button key={value} type="button" onClick={() => setClubInterest(v => ({...v, interestType:value}))} className={`rounded-lg border px-2 py-2 text-xs font-semibold ${clubInterest.interestType===value?'border-primary bg-primary/10 text-primary':'border-border text-muted-foreground'}`}>{label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold">Mobile number</label>
                  <input value={clubInterest.contactPhone} onChange={e => setClubInterest(v => ({...v,contactPhone:e.target.value}))} placeholder="Optional mobile number" className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm" />
                </div>
                <Button className="w-full" onClick={submitClubInterest} disabled={clubInterestBusy}>{clubInterestBusy ? 'Adding you…' : 'Join the RallyHub Club waiting list'}</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-lg">
          {feedbackDone ? (
            <div className="py-3">
              <CheckCircle2 className="w-11 h-11 text-primary" />
              <h2 className="text-2xl font-black mt-4">Feedback received</h2>
              <p className="text-sm text-muted-foreground mt-2">{feedbackResponse}</p>
              <Button className="mt-5 w-full" onClick={() => setFeedbackOpen(false)}>Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Feedback & ideas</DialogTitle>
                <DialogDescription>Tell us what could work better, what is confusing, or what you would like RallyHub to do next.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold">What type of feedback is this?</label>
                  <select value={feedback.category} onChange={e => setFeedback(v => ({...v,category:e.target.value}))} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="issue">Something isn’t working</option>
                    <option value="confusing">Something is confusing</option>
                    <option value="improvement">Suggestion or improvement</option>
                    <option value="feature_request">Feature request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold">Which area?</label>
                  <select value={feedback.area} onChange={e => setFeedback(v => ({...v,area:e.target.value}))} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {[['directory','Directory'],['club_profile','Club profile'],['sessions_venues','Sessions & venues'],['login_access','Login & access'],['rallyhub_club','RallyHub Club'],['competitions','Competitions'],['other','Other']].map(([value,label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold">Tell us about it</label>
                  <textarea value={feedback.message} onChange={e => setFeedback(v => ({...v,message:e.target.value}))} rows={5} maxLength={4000} placeholder="What happened, what would make this better, or what would you like us to add?" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold">How important is this to your club?</label>
                  <select value={feedback.importance} onChange={e => setFeedback(v => ({...v,importance:e.target.value}))} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="nice_to_have">Nice to have</option>
                    <option value="important">Important</option>
                    <option value="blocking">Preventing us from doing something</option>
                  </select>
                </div>
                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" checked={feedback.contactOk} onChange={e => setFeedback(v => ({...v,contactOk:e.target.checked}))} className="mt-1" />
                  <span>It’s okay for RallyHub to contact me about this feedback.</span>
                </label>
                <Button className="w-full" onClick={submitFeedback} disabled={feedbackBusy || !feedback.message.trim()}>{feedbackBusy ? 'Sending…' : 'Send feedback'}</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}
