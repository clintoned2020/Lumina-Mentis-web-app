import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Flame, Zap, Rocket, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CirclePostCard from './CirclePostCard';
import ShareMilestoneModal from './ShareMilestoneModal';

export default function CircleFeed({ circle, onBack, onLeave, user }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ['circle-posts', circle.id],
    queryFn: () => base44.entities.CirclePost.filter(
      { circle_id: circle.id },
      '-created_date',
      100
    ),
  });

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setSubmitting(true);
    try {
      await base44.entities.CirclePost.create({
        circle_id: circle.id,
        author_email: user.email,
        author_name: user.full_name,
        type: 'progress_update',
        body: message,
      });
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['circle-posts'] });
    } catch (err) {
      console.error('Failed to post', err);
    }
    setSubmitting(false);
  };

  const handleReaction = async (post, reactionType) => {
    if (!user) return;

    const reactions = Array.isArray(post.reactions) ? [...post.reactions] : [];
    const existingIdx = reactions.findIndex(r => r.email === user.email);

    if (existingIdx >= 0) {
      reactions.splice(existingIdx, 1);
    } else {
      reactions.push({ email: user.email, type: reactionType });
    }

    await base44.entities.CirclePost.update(post.id, {
      reactions,
      reaction_count: reactions.length,
    });
    queryClient.invalidateQueries({ queryKey: ['circle-posts'] });
  };

  const reactionEmojis = { clap: '👏', heart: '❤️', fire: '🔥', rocket: '🚀' };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border/60 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">{circle.name}</h1>
              <p className="text-xs text-muted-foreground">
                {circle.member_emails?.length || 0} members
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onLeave} className="rounded-lg">
            Leave
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowShareModal(true)}
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl text-xs h-10"
          >
            <Flame className="w-3.5 h-3.5 mr-1.5" />
            Share Streak
          </Button>
          <Button
            onClick={() => setShowShareModal(true)}
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl text-xs h-10"
          >
            <Heart className="w-3.5 h-3.5 mr-1.5" />
            Celebrate Win
          </Button>
        </div>

        {/* Message input */}
        <form onSubmit={handlePostMessage} className="flex gap-3">
          <Input
            placeholder="Share an update with the circle..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="rounded-xl"
          />
          <Button
            type="submit"
            disabled={submitting || !message.trim()}
            size="icon"
            className="rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {/* Feed */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-4">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CirclePostCard
                    post={post}
                    onReaction={(type) => handleReaction(post, type)}
                    currentUser={user}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Share Milestone Modal */}
      <AnimatePresence>
        {showShareModal && (
          <ShareMilestoneModal
            circle={circle}
            user={user}
            onClose={() => setShowShareModal(false)}
            onShared={() => {
              setShowShareModal(false);
              queryClient.invalidateQueries({ queryKey: ['circle-posts'] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}