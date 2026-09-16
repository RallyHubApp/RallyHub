import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import PublicDirectoryHeader from '@/components/public/PublicDirectoryHeader';
import { getClub } from '@/data/directorySeed';
import { ArrowLeft, CalendarDays, CheckCircle2, ExternalLink, Facebook, Globe2, Mail, MapPin, MessageCircle, Phone, Users } from 'lucide-react';

const groupByDay = sessions => sessions.reduce((groups, session) => {
  (groups[session.day] ||= []).push(session);
  return groups;
}, {});

export default function PublicClubProfile() {
  const { slug } = useParams();
  const club = getClub(slug);
  if (!club) return <Navigate to="/directory" replace />;

  const schedule = groupByDay(club.sessions);

  return (
    <div className="min-h-screen bg-[#0a1628] text-foreground">
      <PublicDirectoryHeader />

      <main>
        <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(255,201,42,.12),transparent_38%)]">
          <div className="container mx-auto px-4 py-8">
            <Link to="/directory" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to directory
            </Link>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <img src={club.logoUrl} alt={`${club.name} logo`} className="w-32 h-32 rounded-3xl bg-white object-contain p-2 shadow-2xl shrink-0" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-semibold">{club.sport}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> Active listing</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{club.name}</h1>
                <p className="mt-3 text-lg text-muted-foreground max-w-3xl">{club.description}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={club.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                    <Globe2 className="w-4 h-4" /> Website
                  </a>
                  <a href={club.waitingListUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-sm font-semibold">
                    <Users className="w-4 h-4" /> Join waiting list
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
          <div className="space-y-6">
            <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Guest policy</p>
              <p className="mt-2 text-base font-semibold text-foreground">{club.guestPolicy}</p>
              <p className="mt-2 text-sm text-muted-foreground">Please contact the club before attending any session.</p>
            </section>

            <section className="glass rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Weekly sessions</h2>
              </div>
              <div className="space-y-5">
                {Object.entries(schedule).map(([day, sessions]) => (
                  <div key={day}>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">{day}</h3>
                    <div className="space-y-2">
                      {sessions.map(session => {
                        const venue = club.venues.find(v => v.id === session.venueId);
                        return (
                          <div key={session.id} className="rounded-xl border border-border bg-background/40 p-4 grid sm:grid-cols-[110px_1fr_auto] gap-2 sm:gap-4 items-center">
                            <p className="font-bold text-primary">{session.start}–{session.end}</p>
                            <div>
                              <p className="font-semibold">{session.level}</p>
                              <p className="text-sm text-muted-foreground">{venue?.name}</p>
                            </div>
                            <p className="text-sm font-semibold">Contact club</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-5">Times and availability can change. Contact the club before travelling.</p>
            </section>

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
                      <span className="rounded-full bg-accent/10 text-accent px-2 py-1 text-[10px] font-semibold">{venue.indoor ? 'INDOOR' : 'OUTDOOR'}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm">{venue.courts ? `${venue.courts} courts` : 'Court details pending'}</p>
                      <a href={venue.mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Map <ExternalLink className="w-3.5 h-3.5" /></a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="glass rounded-2xl p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Club contact</p>
              <h2 className="text-xl font-bold mt-1">Contact {club.contact.name}</h2>
              <div className="mt-4 space-y-2">
                <a href={club.contact.phoneHref} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/40">
                  <Phone className="w-4 h-4 text-primary" /><span className="text-sm font-medium">{club.contact.phone}</span>
                </a>
                <a href={club.contact.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/40">
                  <MessageCircle className="w-4 h-4 text-primary" /><span className="text-sm font-medium">WhatsApp Brian</span>
                </a>
                <a href={`mailto:${club.contact.email}`} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/40">
                  <Mail className="w-4 h-4 text-primary" /><span className="text-sm font-medium break-all">{club.contact.email}</span>
                </a>
              </div>
            </section>

            <section className="glass rounded-2xl p-5">
              <h2 className="font-bold">Club details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">County</dt><dd>{club.county}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Founded</dt><dd>{club.founded}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Affiliation</dt><dd>{club.affiliation}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Membership</dt><dd className="text-right">{club.membershipStatus}</dd></div>
              </dl>
            </section>

            <section className="glass rounded-2xl p-5">
              <h2 className="font-bold">Follow Clare Pickleball</h2>
              <div className="mt-3 flex gap-2">
                <a href={club.facebook} target="_blank" rel="noreferrer" className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl border border-border p-3 text-sm font-semibold"><Facebook className="w-4 h-4" /> Facebook</a>
                <a href={club.instagram} target="_blank" rel="noreferrer" className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl border border-border p-3 text-sm font-semibold">Instagram</a>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
