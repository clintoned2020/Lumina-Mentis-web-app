import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomTabs from './MobileBottomTabs';
import PageTransitionWrapper from './PageTransitionWrapper';
import { usePageTracking } from '@/hooks/usePageTracking';
import DailyPromptBanner from '@/components/wellness/DailyPromptBanner';
import UsernameSetupModal from '@/components/auth/UsernameSetupModal';
import WelcomeTour from './WelcomeTour';
import { base44 } from '@/api/base44Client';

export default function AppLayout() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const isGuest = sessionStorage.getItem('lumina_guest') === 'true';
  const [sanctuaryMode, setSanctuaryMode] = useState(() => {
    // Initialize from system preference
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });
  usePageTracking();

  // Check if user needs to set up username
  useEffect(() => {
    if (isGuest) return;
    base44.auth.me().then(async (user) => {
      setCurrentUser(user);
      if (user) {
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        if (profiles.length === 0 || !profiles[0].username) {
          setShowUsernameModal(true);
        }
      }
    }).catch(() => {});
  }, []);

  // Sync with system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      // Only auto-follow system if user hasn't manually toggled
      setSanctuaryMode(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (sanctuaryMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [sanctuaryMode]);

  return (
    <div className="min-h-screen bg-background sanctuary-transition">
      {isGuest && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground text-center text-xs py-1.5 px-4 flex items-center justify-center gap-3">
          <span>You're browsing as a guest — some features require an account.</span>
          <button
            onClick={() => { sessionStorage.removeItem('lumina_guest'); window.location.reload(); }}
            className="underline font-semibold hover:opacity-80 transition-opacity"
          >
            Sign In
          </button>
        </div>
      )}
      {showUsernameModal && currentUser && (
        <UsernameSetupModal
          user={currentUser}
          onComplete={() => setShowUsernameModal(false)}
        />
      )}
      <Navbar
        sanctuaryMode={sanctuaryMode}
        onToggleSanctuary={() => setSanctuaryMode(m => !m)}
        guestBanner={isGuest}
      />
      <main className={`pb-16 lg:pb-0 ${isGuest ? 'pt-24 lg:pt-28' : 'pt-16 lg:pt-20'}`}>
        {/* Mobile optimizations: safe area, pull-to-refresh friendly */}
        <style>{`
          main {
            /* Enable native pull-to-refresh on iOS/Android */
            overscroll-behavior-y: auto;
            /* Safe area support */
            padding-left: max(1.5rem, env(safe-area-inset-left));
            padding-right: max(1.5rem, env(safe-area-inset-right));
          }
        `}</style>
        <DailyPromptBanner />
        <AnimatePresence mode="wait">
          <PageTransitionWrapper key={location.pathname}>
            <Outlet />
          </PageTransitionWrapper>
        </AnimatePresence>
      </main>
      <Footer />
      <MobileBottomTabs />
      {!isGuest && <WelcomeTour />}
    </div>
  );
}