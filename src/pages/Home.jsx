import React from 'react';
import HeroSection from '../components/home/HeroSection';
import StrataOverview from '../components/home/StrataOverview';
import WellnessDashboard from '../components/dashboard/WellnessDashboard';
import ConsultBanner from '../components/shared/ConsultBanner';
import AIRecommendations from '../components/home/AIRecommendations';
import DailyAffirmation from '../components/home/DailyAffirmation';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <section className="max-w-3xl mx-auto px-6 lg:px-16 pt-8 pb-2">
        <DailyAffirmation />
      </section>
      <WellnessDashboard />
      <AIRecommendations />
      <StrataOverview />
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-16">
          <ConsultBanner />
        </div>
      </section>
      <section className="pb-10 text-center">
        <p className="text-sm text-muted-foreground">
          <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
          {' · '}
          <a href="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</a>
        </p>
      </section>
    </div>
  );
}