import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center max-w-sm w-full"
      >
        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-7 glow-green shadow-2xl">
          <span className="text-primary font-black text-5xl leading-none">🏓</span>
        </div>

        {/* App name */}
        <h1 className="text-5xl font-black text-foreground tracking-tight mb-2">
          Dink<span className="text-primary">Master</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-10">
          Pickleball tournament management, simplified.
        </p>

        {/* Sign-in card */}
        <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-xl space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">
            Sign in to continue
          </p>
          <Button
            className="w-full bg-primary text-primary-foreground font-semibold h-11 text-base rounded-xl"
            onClick={() => base44.auth.redirectToLogin(window.location.origin + '/')}
          >
            Continue to DinkMaster
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/40 mt-8">
          © {new Date().getFullYear()} DinkMaster
        </p>
      </motion.div>
    </div>
  );
}