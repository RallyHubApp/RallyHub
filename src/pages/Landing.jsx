import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Trophy, ArrowRight, CheckCircle2, UserCheck, PlusCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { directoryClubs } from '@/data/directorySeed';
import Seo, { SITE_URL } from '@/components/public/Seo';

const LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

export default function Landing() {
  const handleOpenApp = () => {
    base44.auth.redirectToLogin('/app');
  };

  const features = [
    {
      icon: MapPin,
      title: 'Find Clubs & Places to Play',
      description: 'Browse public club listings, venues and contact details without creating an account.'
    },
    {
      icon: Trophy,
      title: 'Competitions & Events',
      description: 'Run King of the Court, interclub challenges, tournaments and other club events.'
    },
    {
      icon: Users,
      title: 'Club & Member Management',
      description: 'Manage club people, venues, communications and day-to-day operations in one place.'
    },
    {
      icon: Calendar,
      title: 'Multi-Sport Platform',
      description: 'Built for Pickleball first, with Padel, Tennis, Badminton and other racket sports supported.'
    }
  ];

  const benefits = [
    'Public club directory with no login required',
    'Verified directory access for club representatives',
    'King of the Court and interclub competition tools',
    'Event, tournament and venue management',
    'Club and member administration',
    'Mobile-friendly tools for courtside use'
  ];

  const faq = [
    { question: 'Do I need an account to use the RallyHub Club Directory?', answer: 'No. Anyone can browse public club listings, venues and contact information without creating a RallyHub account.' },
    { question: 'How do I add a club that is missing from the directory?', answer: 'Choose Add Your Club, sign in so RallyHub can identify the submitter, and send the club details for review. Adding a directory listing does not create a RallyHub Club tenant.' },
    { question: 'How can a club update its directory listing?', answer: 'Find the club, open its profile and choose Claim this listing. RallyHub verifies the representative before granting permission to edit that public listing.' },
    { question: 'Does RallyHub cover the whole island of Ireland?', answer: 'Yes. The directory is designed around all 32 counties of Ireland and supports club listings throughout the island.' }
  ];

  const seoData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'RallyHub',
      url: SITE_URL,
      logo: LOGO_URL,
      email: 'rallyhubapp@gmail.com',
      areaServed: { '@type': 'Place', name: 'Ireland' },
      description: 'RallyHub is an all-Ireland racket-sports directory and club management platform, starting with pickleball.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'RallyHub',
      url: SITE_URL,
      inLanguage: 'en-IE',
      description: 'Find pickleball clubs and places to play across the island of Ireland and access RallyHub club and competition tools.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer }
      }))
    }
  ];

  return (
    <>
      <Seo
        title="RallyHub Ireland | Pickleball Club Directory & Club Management"
        description="Find pickleball clubs and places to play across the island of Ireland. RallyHub also provides club, competition, King of the Court, interclub and tournament management tools."
        path="/"
        structuredData={seoData}
      />
      <div className="min-h-screen bg-[#0a1628]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 py-16 sm:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200 mb-5">
              Club Directory Preview · {directoryClubs.length} clubs currently listed · details are being verified
            </div>
            <div className="flex items-center justify-center gap-3 mb-6">
              <img 
                src={LOGO_URL} 
                alt="RallyHub" 
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-none"
              />
              <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">Welcome | RallyHub</h1>
            </div>
            
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Find clubs and places to play. RallyHub also gives clubs the tools to organise members, competitions and events.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
              <Link to="/directory" className="w-full">
                <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg px-5 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Find a Club
                  <MapPin className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/directory?manage=1" className="w-full">
                <Button size="lg" variant="outline" className="w-full text-base sm:text-lg px-5 py-6 rounded-xl">
                  Manage Directory Listing
                  <UserCheck className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={handleOpenApp}
                className="w-full text-base sm:text-lg px-5 py-6 rounded-xl"
              >
                RallyHub Club Login
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="mt-5 max-w-2xl mx-auto rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div>
                <p className="font-semibold text-foreground">Can't find your club?</p>
                <p className="text-sm text-muted-foreground">Add it to the RallyHub Directory for review. This does not create a RallyHub Club account.</p>
              </div>
              <Link to="/directory/add" className="shrink-0">
                <Button variant="outline" className="border-amber-400/40 text-amber-200 hover:bg-amber-400/10">
                  Add Your Club <PlusCircle className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Browse freely. Sign in only to manage a directory listing or use the full RallyHub Club platform.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Discover, Organise & Grow Your Club
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with the public club directory, then use RallyHub's competition and club-management tools when your club is ready.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-6 text-center hover:glow-green-sm transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 sm:p-12"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                One Public Directory. Separate Club Tools.
              </h2>
              <p className="text-muted-foreground mb-6">
                Anyone can browse the directory. A verified club representative can manage their listing without becoming a RallyHub player or joining the full RallyHub Club platform.
              </p>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <img 
                  src={LOGO_URL} 
                  alt="RallyHub" 
                  className="h-32 w-32 rounded-none"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FAQ / answer-first content for people and search */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">RallyHub Directory FAQ</h2>
            <p className="text-muted-foreground mt-3">Straight answers about finding, adding and managing club listings.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {faq.map(item => (
              <article key={item.question} className="glass rounded-xl p-5">
                <h3 className="font-bold text-foreground">{item.question}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Looking for Somewhere to Play?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore the RallyHub club directory without logging in. If you run a listed club, open its profile to request verified directory access.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
            <Link to="/directory">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-xl">
                Find a Club
                <MapPin className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/directory?manage=1">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl">
                Manage Directory Listing
                <UserCheck className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/directory/add">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl">
                Add Your Club
                <PlusCircle className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={handleOpenApp} className="text-lg px-8 py-6 rounded-xl">
              RallyHub Club Login
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-8 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4 mb-3">
            <Link to="/directory" className="hover:text-primary transition-colors">Club Directory</Link>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} RallyHub.ie. All rights reserved.</p>
          <p className="mt-2">Built for the racket sports community</p>
        </div>
      </div>
      </div>
    </>
  );
}