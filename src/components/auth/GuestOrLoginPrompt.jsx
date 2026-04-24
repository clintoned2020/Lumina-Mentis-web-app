import React from 'react';
import { Brain, Sparkles, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: BookOpen, text: 'In-depth mental health education' },
  { icon: Users, text: 'Supportive community & groups' },
  { icon: Sparkles, text: 'Personal wellness tracking' },
];

export default function GuestOrLoginPrompt({ onGuest, onLogin, onSignup }) {
  // Fall back to onLogin if no dedicated signup handler provided
  onSignup = onSignup || onLogin;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted px-4 py-10">
      <div className="max-w-sm w-full text-center space-y-8">

        {/* Logo & Headline */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-4xl tracking-tight">Lumina Mentis</h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            A sanctuary of understanding for mental health, community, and wellness.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="flex flex-col gap-2 text-left">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border/50">
              <Icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground">{text}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Button onClick={onSignup} className="w-full rounded-xl h-12 text-sm font-semibold shadow-sm">
            Create a Free Account
          </Button>
          <Button onClick={onLogin} variant="outline" className="w-full rounded-xl h-12 text-sm">
            Sign In
          </Button>
          <button
            onClick={onGuest}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Just browsing? Continue as guest →
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
          {' '}and{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
}