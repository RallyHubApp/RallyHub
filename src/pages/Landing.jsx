import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/41879c2e3_64c120488_logo.png';

export default function Landing() {
  const handleOpenApp = () => {
    // Navigate to auth page
    window.location.href = '/auth';
  };

  const features = [
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Create and manage matches, leagues, and tournaments across all racket sports.'
    },
    {
      icon: Users,
      title: 'Community Connection',
      description: 'Find players, connect with the community, and grow your network.'
    },
    {
      icon: MapPin,
      title: 'Court & Venue Management',
      description: 'Efficiently schedule facilities and manage venue logistics for any event.'
    },
    {
      icon: Trophy,
      title: 'Multiple Sport Support',
      description: 'Seamlessly manage Padel, Pickleball, Tennis, Badminton, and more.'
    }
  ];

  const benefits = [
    'Match creation and player coordination',
    'Real-time scoring and leaderboards',
    'Multi-sport player profiles',
    'Event and tournament management',
    'Mobile-friendly interface for active use',
    'Community dashboard for complete control'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
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
            <div className="flex items-center justify-center mb-6">
              <img 
                src={LOGO_URL} 
                alt="RallyHub" 
                className="h-16 w-16 sm:h-20 sm:w-20"
              />
            </div>
            
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 leading-relaxed">
              The community platform for Padel, Pickleball, Tennis & Badminton.
              Create matches, join games, and connect with players near you.
            </p>

            <Button
              size="lg"
              onClick={handleOpenApp}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Open App
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              Login or create an account to get started
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
            Everything You Need to Connect & Organise
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're organising friendly matches or competitive tournaments, RallyHub streamlines every aspect of community sport management.
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
                Why Choose RallyHub?
              </h2>
              <p className="text-muted-foreground mb-6">
                Built by racket sports enthusiasts for racket sports communities. We understand the unique challenges of organising matches and events, and have created tools to solve them.
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
                  className="h-32 w-32"
                />
              </div>
            </div>
          </div>
        </motion.div>
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
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the growing community of racket sports players and organisers using RallyHub to connect and manage events.
          </p>
          <Button
            size="lg"
            onClick={handleOpenApp}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-xl"
          >
            Open App
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-8 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RallyHub.ie. All rights reserved.</p>
          <p className="mt-2">Built for the racket sports community</p>
        </div>
      </div>
    </div>
  );
}