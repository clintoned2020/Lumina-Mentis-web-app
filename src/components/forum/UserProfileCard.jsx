import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserMinus, MessageSquare, ChevronUp, ExternalLink, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function UserProfileCard({ profileEmail, profileName, currentUser }) {
  const qc = useQueryClient();
  const isSelf = currentUser?.email === profileEmail;

  const { data: follows = [] } = useQuery({
    queryKey: ['follows', currentUser?.email],
    queryFn: () => base44.entities.UserFollow.filter({ follower_email: currentUser.email }),
    enabled: !!currentUser,
  });

  const { data: threads = [] } = useQuery({
    queryKey: ['forum-threads-user', profileEmail],
    queryFn: () => base44.entities.ForumThread.filter({ author_email: profileEmail }),
  });

  const isFollowing = follows.some(f => f.following_email === profileEmail);

  async function toggleFollow() {
    if (isFollowing) {
      const rec = follows.find(f => f.following_email === profileEmail);
      if (rec) await base44.entities.UserFollow.delete(rec.id);
    } else {
      await base44.entities.UserFollow.create({
        follower_email: currentUser.email,
        following_email: profileEmail,
      });
    }
    qc.invalidateQueries({ queryKey: ['follows', currentUser?.email] });
  }

  const totalUpvotes = threads.reduce((sum, t) => sum + (t.upvotes || []).length, 0);

  return (
    <div className="p-5 rounded-2xl border border-border/60 bg-card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <span className="text-primary font-semibold text-sm">
              {(profileName || profileEmail || '?')[0].toUpperCase()}
            </span>
          </div>
          <p className="font-semibold text-foreground text-sm">{profileName || profileEmail}</p>
          <p className="text-xs text-muted-foreground">{profileEmail}</p>
        </div>
        {!isSelf && currentUser && (
          <Button size="sm" variant={isFollowing ? 'outline' : 'default'} onClick={toggleFollow} className="flex items-center gap-1.5">
            {isFollowing ? <><UserMinus className="w-3.5 h-3.5" /> Unfollow</> : <><UserPlus className="w-3.5 h-3.5" /> Follow</>}
          </Button>
        )}
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{threads.length} threads</span>
        <span className="flex items-center gap-1"><ChevronUp className="w-3.5 h-3.5" />{totalUpvotes} upvotes</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Link to={`/profile/${encodeURIComponent(profileEmail)}`}>
          <Button size="sm" variant="outline" className="text-xs h-7 px-2.5">
            <ExternalLink className="w-3 h-3 mr-1" />View Profile
          </Button>
        </Link>
        {!isSelf && currentUser && (
          <Link to={`/messages?with=${encodeURIComponent(profileEmail)}`}>
            <Button size="sm" variant="outline" className="text-xs h-7 px-2.5">
              <Mail className="w-3 h-3 mr-1" />Message
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}