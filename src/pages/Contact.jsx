import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-foreground">
      <div className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to RallyHub
        </Link>

        <div className="glass rounded-2xl p-8 sm:p-12 space-y-8">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Contact RallyHub</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Have a question about RallyHub, need help with an event, or want to discuss using the platform for your club or racket sports community? Get in touch and we’ll be happy to help.
            </p>
          </div>

          <div className="glass rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Email</h2>
              <a href="mailto:hello@rallyhub.ie" className="text-primary hover:underline break-all">
                hello@rallyhub.ie
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="mailto:hello@rallyhub.ie">Email RallyHub</a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/about">Learn more about RallyHub</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}