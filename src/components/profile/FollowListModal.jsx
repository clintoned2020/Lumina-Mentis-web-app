import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function UserRow({ email }) {
  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profile', email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: email }),
  });
  const profile = profiles[0];
  const name = profile?.display_name || email.split('@')[0];
  const avatarColor = profile?.avatar_color || '#a78bfa';

  return (
    <Link
      to={`/profile/${encodeURIComponent(email)}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors rounded-xl"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden"
        style={{ backgroundColor: profile?.avatar_url ? 'transparent' : avatarColor }}
      >
        {profile?.avatar_url
          ? <img src={profile.avatar_url} alt={name} className="w-full h-full object-cover" />
          : name[0]?.toUpperCase()
        }
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
      </div>
    </Link>
  );
}

export default function FollowListModal({ mode, email, onClose }) {
  const isFollowers = mode === 'followers';

  const { data: follows = [], isLoading } = useQuery({
    queryKey: ['follow-list', mode, email],
    queryFn: () =>
      isFollowers
        ? base44.entities.UserFollow.filter({ following_email: email })
        : base44.entities.UserFollow.filter({ follower_email: email }),
    enabled: !!email,
  });

  const emails = isFollowers
    ? follows.map(f => f.follower_email)
    : follows.map(f => f.following_email);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-card border border-border rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col overflow-hidden z-10"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
            <h3 className="font-heading text-lg">{isFollowers ? 'Followers' : 'Following'}</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {isLoading ? (
              <p className="text-center text-muted-foreground text-sm py-8">Loading...</p>
            ) : emails.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                {isFollowers ? 'No followers yet.' : 'Not following anyone yet.'}
              </p>
            ) : (
              emails.map(e => <UserRow key={e} email={e} />)
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}