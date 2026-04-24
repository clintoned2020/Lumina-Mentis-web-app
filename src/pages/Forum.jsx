import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThreadCard from '../components/forum/ThreadCard';
import NewThreadForm from '../components/forum/NewThreadForm';
import TopicSubscriptionButton from '../components/forum/TopicSubscriptionButton';
import { Skeleton } from '@/components/ui/skeleton';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/shared/PullToRefreshIndicator';

const TAGS = ['all', 'general', 'anxiety', 'depression', 'schizophrenia', 'adhd', 'medication', 'coping', 'relationships', 'recovery'];
const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'top',    label: 'Top' },
  { key: 'active', label: 'Active' },
];

export default function Forum() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTag, setActiveTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const qc = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: threads = [], isLoading, refetch } = useQuery({
    queryKey: ['forum-threads'],
    queryFn: () => base44.entities.ForumThread.list('-created_date', 100),
  });

  const ptr = usePullToRefresh(refetch);
  const isAdmin = currentUser?.role === 'admin';

  const filtered = threads
    .filter(t => isAdmin ? true : !t.is_hidden)
    .filter(t => activeTag === 'all' || t.topic_tag === activeTag)
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      if (sortBy === 'top')    return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
      if (sortBy === 'active') return (b.reply_count || 0) - (a.reply_count || 0);
      if (sortBy === 'oldest') return new Date(a.created_date) - new Date(b.created_date);
      return new Date(b.created_date) - new Date(a.created_date); // newest
    });

  async function handleUpvote(thread) {
    if (!currentUser) return;
    const upvotes = thread.upvotes || [];
    const hasVoted = upvotes.includes(currentUser.email);
    const updated = hasVoted
      ? upvotes.filter(e => e !== currentUser.email)
      : [...upvotes, currentUser.email];

    qc.setQueryData(['forum-threads'], (old = []) =>
      old.map(t => t.id === thread.id ? { ...t, upvotes: updated } : t)
    );
    try {
      await base44.entities.ForumThread.update(thread.id, { upvotes: updated });
    } catch {
      qc.invalidateQueries({ queryKey: ['forum-threads'] });
    }
  }

  async function handleModerate(thread, action) {
    const patch =
      action === 'pin'  ? { is_pinned: !thread.is_pinned } :
      action === 'lock' ? { is_locked: !thread.is_locked } :
      action === 'hide' ? { is_hidden: !thread.is_hidden } : {};

    qc.setQueryData(['forum-threads'], (old = []) =>
      old.map(t => t.id === thread.id ? { ...t, ...patch } : t)
    );
    try {
      await base44.entities.ForumThread.update(thread.id, patch);
    } catch {
      qc.invalidateQueries({ queryKey: ['forum-threads'] });
    }
  }

  return (
    <div className="min-h-screen">
      <PullToRefreshIndicator {...ptr} />
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-16">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-primary tracking-widest uppercase mb-3">Community</p>
                <h1 className="font-heading text-4xl lg:text-5xl tracking-tight mb-3">The Forum</h1>
                <p className="text-muted-foreground leading-relaxed max-w-xl">
                  A safe space to share experiences, ask questions, and support one another on the journey to understanding mental health.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {isAdmin && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-full">
                    <Shield className="w-3.5 h-3.5" /> Admin Mode
                  </span>
                )}
                {currentUser && (
                  <Button onClick={() => setShowForm(s => !s)} className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    New Thread
                  </Button>
                )}
              </div>
            </div>

            {/* Tag filters */}
            <div className="flex flex-wrap gap-2 mb-3">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeTag === tag
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Sort + subscription row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-1">
                {SORTS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      sortBy === key ? 'text-primary bg-primary/8' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <TopicSubscriptionButton topic={activeTag} />
            </div>
          </motion.div>

          {/* New Thread Form */}
          <AnimatePresence>
            {showForm && (
              <NewThreadForm
                onClose={() => setShowForm(false)}
                onCreated={() => qc.invalidateQueries({ queryKey: ['forum-threads'] })}
                currentUser={currentUser}
              />
            )}
          </AnimatePresence>

          {/* Thread List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((thread, i) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  currentUser={currentUser}
                  index={i}
                  onUpvote={handleUpvote}
                  onModerate={isAdmin ? handleModerate : null}
                />
              ))}
              {filtered.length === 0 && (
                <div className="py-20 text-center text-muted-foreground">
                  No threads yet. Be the first to start a discussion.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}