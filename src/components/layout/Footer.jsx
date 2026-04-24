import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Heart, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <span className="font-heading text-xl">Lumina Mentis</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A sanctuary of understanding. Transforming the complexity of mental health into clarity and empowerment.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Explore</h4>
            <div className="space-y-3">
              <Link to="/disorders" className="block text-sm text-foreground hover:text-primary transition-colors">Disorders Library</Link>
              <Link to="/root-causes" className="block text-sm text-foreground hover:text-primary transition-colors">Root Causes</Link>
              <Link to="/symptom-spectrum" className="block text-sm text-foreground hover:text-primary transition-colors">Symptom Spectrum</Link>
              <Link to="/remedies" className="block text-sm text-foreground hover:text-primary transition-colors">Remedies & Medication</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Important</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              This application provides educational information only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
            </p>
            <a
              href="mailto:admin@lumina-mentis.org"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6"
            >
              <Mail className="w-4 h-4" />
              Contact the Admin
            </a>

            {/* Google Play Store Badge */}
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Get the App</p>
              <a
                href="https://play.google.com/store/apps/details?id=com.luminamentis.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <img
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Get it on Google Play"
                  className="h-12 w-auto"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Emergency / Crisis Banner */}
        <div className="mt-12 p-5 rounded-2xl bg-destructive/8 border border-destructive/20">
          <p className="text-sm font-semibold text-destructive mb-3 uppercase tracking-wide">
            🚨 In an Emergency? Call 911 Immediately
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            If you or someone you know is in immediate danger, please call <strong>911</strong> or go to your nearest emergency room. This platform is not a crisis service.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:988"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium text-primary"
            >
              📞 <span><strong>988</strong> — Suicide &amp; Crisis Lifeline</span>
            </a>
            <a
              href="tel:18007842433"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors text-sm font-medium text-accent-foreground"
            >
              📞 <span><strong>1-800-784-2433</strong> — National Crisis Hotline</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Lumina Mentis. Information is empowerment.
          </p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="text-xs text-muted-foreground hover:text-foreground underline transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-xs text-muted-foreground hover:text-foreground underline transition-colors">Terms of Service</a>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Built with</span>
              <Heart className="w-3 h-3 text-accent fill-accent" />
              <span>for mental health awareness</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}