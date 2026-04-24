import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { notifyFollowedUserPost } from '@/lib/notifications';
import { useQueryClient } from '@tanstack/react-query';

const TAGS = ['general', 'anxiety', 'depression', 'schizophrenia', 'adhd', 'medication', 'coping', 'relationships', 'recovery'];

export default function NewThreadForm({ onClose, onCreated, currentUser }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState('general');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticThread = {
      id: optimisticId,
      title,
      body,
      topic_tag: tag,
      author_email: currentUser.email,
      author_name: currentUser.full_name || currentUser.email,
      upvotes: [],
      reply_count: 0,
      is_pinned: false,
      is_hidden: false,
      is_locked: false,
      created_date: new Date().toISOString(),
    };

    // Optimistically add to cache
    qc.setQueryData(['forum-threads'], (old = []) => [optimisticThread, ...old]);
    onClose();

    const thread = await base44.entities.ForumThread.create({
      title, body, topic_tag: tag,
      author_email: currentUser.email,
      author_name: currentUser.full_name || currentUser.email,
      upvotes: [], reply_count: 0,
      is_pinned: false, is_hidden: false, is_locked: false,
    });

    // Replace optimistic entry with real one
    qc.setQueryData(['forum-threads'], (old = []) =>
      old.map(t => t.id === optimisticId ? thread : t)
    );

    base44.entities.UserFollow.filter({ following_email: currentUser.email })
      .then(follows => notifyFollowedUserPost({ thread, authorUser: currentUser, followerEmails: follows.map(f => f.follower_email) }))
      .catch(() => {});

    setLoading(false);
    onCreated();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 rounded-2xl border border-border/60 bg-card mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-xl">Start a New Discussion</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Thread title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex flex-wrap gap-2">
          {TAGS.map(t => (
            <button
              type="button"
              key={t}
              onClick={() => setTag(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                tag === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          required
          placeholder="Share your thoughts, questions, or experiences..."
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post Thread'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}