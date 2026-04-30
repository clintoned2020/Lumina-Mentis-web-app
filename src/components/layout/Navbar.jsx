import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Menu, X, Shield, Sun, LogOut, ChevronDown, User, Settings, BarChart3 } from 'lucide-react';
import ProfileSettingsModal from '@/components/profile/ProfileSettingsModal';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { base44, supabase } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import NotificationBell from '@/components/notifications/NotificationBell';
import NavSearch from './NavSearch';
import NavTooltip from './NavTooltip';

const primaryLinks = [
  { label: 'Home', path: '/', description: 'Your dashboard & overview', color: 'bg-primary' },
  { label: 'Disorders', path: '/disorders', description: 'Browse mental health conditions', color: 'bg-blue-500' },
  { label: 'Root Causes', path: '/root-causes', description: 'Explore biological & environmental causes', color: 'bg-indigo-500' },
  { label: 'Remedies', path: '/remedies', description: 'Treatments, medications & lifestyle tips', color: 'bg-teal-500' },
  { label: 'Community', path: '/forum', description: 'Peer support forum & discussions', color: 'bg-violet-500' },
  { label: 'Groups', path: '/groups', description: 'Join topic-focused support groups', color: 'bg-emerald-500' },
  { label: 'Wellness', path: '/wellness', description: 'Daily habits & streak tracking', color: 'bg-orange-400' },
  { label: 'Toolbox', path: '/toolbox', description: 'Meditations, breathing & grounding', color: 'bg-teal-400' },
  { label: 'Mindfulness', path: '/mindfulness', description: 'Guided breathing techniques', color: 'bg-sky-400' },
];

const moreLinks = [
  { label: 'My Dashboard', path: '/dashboard', description: 'Your personal overview — activity, progress, and quick access to everything.', color: 'bg-blue-500' },
  { label: 'Symptom Spectrum', path: '/symptom-spectrum', description: 'Track how you\'re feeling over time and spot patterns in your mental health.', color: 'bg-green-500' },
  { label: 'Journal', path: '/journal', description: 'A private space to write, reflect, and process your thoughts — just for you.', color: 'bg-yellow-500' },
  { label: 'Messages', path: '/messages', description: 'Your private conversations with other community members.', color: 'bg-violet-500' },
  { label: 'Saved', path: '/saved', description: 'Articles, posts, and resources you\'ve bookmarked to revisit anytime.', color: 'bg-red-400' },
  { label: 'Directory', path: '/directory', description: 'Find mental health professionals, hotlines, and support resources near you.', color: 'bg-teal-500' },
  { label: 'My Activity', path: '/analytics', description: 'A log of everything you\'ve done on Lumina Mentis — posts, replies, goals, and more.', color: 'bg-orange-500' },
];
const navLinks = [...primaryLinks, ...moreLinks];

export default function Navbar({ sanctuaryMode, onToggleSanctuary, guestBanner }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const isGuest = sessionStorage.getItem('lumina_guest') === 'true';

  useEffect(() => {
    base44.auth.me().then(async (user) => {
      setCurrentUser(user);
      if (user) {
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        if (profiles.length > 0) setUserProfile(profiles[0]);
      }
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      // Clear local guest marker in case user previously browsed as guest.
      sessionStorage.removeItem('lumina_guest');
      // Use direct Supabase sign out with timeout so UI cannot get stuck.
      await Promise.race([
        supabase.auth.signOut({ scope: 'global' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Logout timeout')), 5000))
      ]);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Ensure stale local auth tokens are removed even if signOut errors.
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') && key.includes('auth-token')) {
          localStorage.removeItem(key);
        }
      });
      // Hard navigation guarantees auth-gated app re-evaluates as logged out.
      window.location.assign('/?signed_out=1');
    }
  };

  return (
    <nav className={`fixed left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 ${guestBanner ? 'top-7' : 'top-0'}`}
      style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="w-full px-4 lg:px-8">
        <div className="flex items-center gap-3 h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <span className="font-heading text-lg lg:text-xl tracking-tight whitespace-nowrap">
              Lumina Mentis
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex flex-1 items-center justify-center min-w-0">
            <div className="flex items-center gap-0.5 flex-nowrap">
              {primaryLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <NavTooltip key={link.path} label={link.label} description={link.description} color={link.color}>
                    <Link
                      to={link.path}
                      className={`relative px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 whitespace-nowrap ${
                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute inset-0 bg-primary/8 rounded-lg"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  </NavTooltip>
                );
              })}

              {/* More dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-0.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    moreLinks.some(l => l.path === location.pathname)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}>
                    More <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {moreLinks.map(link => (
                    <DropdownMenuItem key={link.path} asChild>
                      <Link to={link.path} className={location.pathname === link.path ? 'text-primary' : ''}>
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto lg:ml-0">
            <NavSearch />
            <NotificationBell currentUser={currentUser} />
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSanctuary}
              className="rounded-xl relative group"
              title={sanctuaryMode ? 'Exit Sanctuary Mode' : 'Sanctuary Mode'}
            >
              {sanctuaryMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {sanctuaryMode ? 'Light Mode' : 'Rest Mode'}
              </span>
            </Button>

            {/* User Avatar Dropdown */}
            {isGuest ? (
              <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-muted text-xs font-medium text-muted-foreground">
                <div className="w-7 h-7 rounded-full bg-border flex items-center justify-center text-muted-foreground text-xs font-bold">G</div>
                <span className="hidden lg:block">Guest</span>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted transition-colors">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                      style={{ backgroundColor: userProfile?.avatar_url ? 'transparent' : userProfile?.avatar_color || '#a78bfa' }}
                    >
                      {userProfile?.avatar_url ? (
                        <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (currentUser?.full_name || currentUser?.email || 'U')[0].toUpperCase()
                      )}
                    </div>
                    {userProfile?.username && (
                      <span className="hidden lg:block text-xs font-medium text-foreground">
                        @{userProfile.username}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: userProfile?.avatar_url ? 'transparent' : userProfile?.avatar_color || '#a78bfa' }}
                      >
                        {userProfile?.avatar_url ? (
                          <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (currentUser?.full_name || currentUser?.email || 'U')[0].toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{currentUser?.full_name || 'User'}</p>
                        {userProfile?.username && (
                          <p className="text-xs text-primary truncate">@{userProfile.username}</p>
                        )}
                        <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${currentUser?.email}`} className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  {currentUser?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/console" className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Admin Console
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      {showSettings && currentUser && (
        <ProfileSettingsModal
          user={currentUser}
          onClose={() => setShowSettings(false)}
          onSaved={(savedRow) => {
            if (savedRow) setUserProfile(savedRow);
            setShowSettings(false);
          }}
        />
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
  <Link
    key={link.path}
    to={link.path}
    onClick={() => setMobileOpen(false)}
    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
      location.pathname === link.path
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`}
  >
    {link.label}
    {link.description && (
      <span className="block text-xs text-muted-foreground font-normal mt-0.5">
        {link.description}
      </span>
    )}
  </Link>
))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}