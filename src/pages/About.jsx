import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Calendar, ArrowLeft } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-foreground">
      <div className="container mx-auto px-4 py-12 sm:py-16 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to RallyHub
        </Link>

        <div className="glass rounded-2xl p-8 sm:p-12 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">About RallyHub</h1>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              RallyHub is a community-focused sports management app built to help racket sport clubs, organisers, coaches, and players run better events with less admin. The app supports the practical day-to-day work of organising pickleball, padel, tennis, badminton, and other racket sport communities, from creating tournaments and managing player lists to tracking matches, scores, leaderboards, courts, and live event progress. It is designed for club volunteers who need simple tools, competitive organisers who need reliable formats, and players who want a clear place to register, follow fixtures, and stay connected.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              RallyHub is especially useful for tournament days, social ladders, King of the Court sessions, mixed doubles events, inter-club competitions, and recurring community sessions where fairness, speed, and clarity matter. Organisers can build events, add players, share registration links, view live scoring pages, and keep participants informed without relying on messy spreadsheets or scattered messages. Players benefit from a mobile-friendly experience that makes it easier to see what is happening and take part.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The app is built by RallyHub for the racket sports community, with a strong focus on practical club needs, accessible design, and tools that work well on both desktop and mobile devices.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-4">
            <div className="glass rounded-xl p-5">
              <Users className="w-5 h-5 text-primary mb-3" />
              <h2 className="text-base font-semibold mb-2">For Communities</h2>
              <p className="text-sm text-muted-foreground">Bring players, organisers, and clubs together in one simple platform.</p>
            </div>
            <div className="glass rounded-xl p-5">
              <Calendar className="w-5 h-5 text-primary mb-3" />
              <h2 className="text-base font-semibold mb-2">For Events</h2>
              <p className="text-sm text-muted-foreground">Plan, run, and follow tournaments, matches, courts, and scoring.</p>
            </div>
            <div className="glass rounded-xl p-5">
              <Trophy className="w-5 h-5 text-primary mb-3" />
              <h2 className="text-base font-semibold mb-2">For Players</h2>
              <p className="text-sm text-muted-foreground">Register, compete, track progress, and stay connected with your club.</p>
            </div>
          </div>

          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/contact">Contact RallyHub</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}