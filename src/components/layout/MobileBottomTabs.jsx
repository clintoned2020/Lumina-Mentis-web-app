import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Brain, MessageSquare, Heart, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const BASE_TABS = [
  { id: 'home',      label: 'Home',      root: '/',          icon: Home },
  { id: 'disorders', label: 'Disorders', root: '/disorders',  icon: Brain },
  { id: 'community', label: 'Community', root: '/forum',      icon: MessageSquare },
  { id: 'wellness',  label: 'Wellness',  root: '/wellness',   icon: Heart },
];

// Which tab "owns" a given pathname prefix?
function getTabId(pathname, tabs) {
  // Most-specific match wins
  const sorted = [...tabs].sort((a, b) => b.root.length - a.root.length);
  const match = sorted.find(t => pathname === t.root || pathname.startsWith(t.root + '/'));
  return match?.id ?? tabs[0].id;
}

export default function MobileBottomTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const profileRoot = user ? `/profile/${encodeURIComponent(user.email)}` : '/forum';

  const tabs = [
    ...BASE_TABS,
    { id: 'profile', label: 'Profile', root: profileRoot, icon: User, matchPrefix: '/profile' },
  ];

  // Per-tab stack: remember last visited path within that tab
  const stackRef = useRef({});

  // Track the active tab
  const activeTabId = getTabId(
    location.pathname,
    tabs.map(t => ({ ...t, root: t.matchPrefix ?? t.root }))
  );

  // Save current path into the active tab's stack whenever location changes
  useEffect(() => {
    stackRef.current[activeTabId] = location.pathname + location.search;
  }, [location.pathname, location.search, activeTabId]);

  function handleTabPress(tab) {
    // Haptic feedback on tab press
    if (navigator.vibrate) navigator.vibrate(10);

    const isActive = (tab.matchPrefix ?? tab.root) === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(tab.matchPrefix ?? tab.root);

    if (isActive) {
      // Re-tap active tab → reset to root
      stackRef.current[tab.id] = tab.root;
      navigate(tab.root, { replace: true });
    } else {
      // Navigate to last known path in that tab, or root
      const dest = stackRef.current[tab.id] || tab.root;
      navigate(dest);
    }
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/60 select-none"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const matchPrefix = tab.matchPrefix ?? tab.root;
          const active = matchPrefix === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(matchPrefix);

          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab)}
              role="tab"
              aria-selected={active}
              aria-label={tab.label}
              /* Minimum 44×44 touch target with safe padding */
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[48px] px-2 py-3 transition-all active:bg-primary/5 ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-6 h-6 transition-transform duration-150 ${active ? 'scale-110' : ''}`} />
              <span className="text-xs font-semibold leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}