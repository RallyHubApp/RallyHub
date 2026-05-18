import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const LOGO_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

export default function AuthPage() {
  // Check if already authenticated - redirect appropriately
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (isAuthenticated) {
        // Check if access code is already validated
        try {
          const response = await base44.functions.invoke('validateAccessCode', { action: 'check_validation' });
          if (response.data.validated) {
            // User has validated access code, redirect to dashboard
            window.location.href = '/';
            return;
          }
        } catch (error) {
          // Access code not validated - redirect to access code gate (handled by AuthenticatedApp)
        }
        // If authenticated but no valid access code, redirect to home which will show access code gate
        window.location.href = '/';
      } else {
        // Not authenticated - redirect to platform auth
        base44.auth.redirectToLogin('/auth');
      }
    };
    checkAuth();
  }, []);

  // Just show loading while redirecting to platform auth
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <img 
          src={LOGO_URL} 
          alt="RallyHub" 
          className="h-16 w-16 rounded-none"
        />
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  );
}