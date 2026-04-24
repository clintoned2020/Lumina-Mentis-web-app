import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, EyeOff, Pin, Send, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ReplyCard from '../components/forum/ReplyCard';
import UserProfileCard from '../components/forum/UserProfileCard';
import ConsultBanner from '../components/shared/ConsultBanner';
import FlagButton from '../components/forum/FlagButton';
import SubPageHeader from '../components/layout/SubPageHeader';
import { notifyNewReply } from '@/lib/notifications';

export default function ForumThread() {
  const threadId = window.location.pathname.split('/forum/')[1];
  const [currentUser, setCurrentUser] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [posting, setPosting] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: threads = [], isLoading: loadingThread } = useQuery({
    queryKey: ['forum-thread', threadId],
    queryFn: () => base44.entities.ForumThread.filter({ id: threadId }),
  });
  const thread = threads[0];

  const { data: replies = [], isLoading: loadingReplies } = useQuery({
    queryKey: ['forum-replies', threadId],
    queryFn: () => base44.entities.ForumReply.filter({ thread_id: threadId }),
  });

  const isAdmin = currentUser?.role === 'admin';
  const isAuthor = currentUser?.email === thread?.author_email;

  async function handleReply(e) {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setPosting(true);
    const reply = await base44.entities.ForumReply.create({
      thread_id: threadId,
      body: replyBody,
      author_email: currentUser.email,
      author_name: currentUser.full_name || currentUser.email,
      upvotes: [],
      is_helpful: false,
      is_hidden: false,
    });
    await base44.entities.ForumThread.update(threadId, { reply_count: (thread?.reply_count || 0) + 1 });
    // Fire notifications (don't block posting)
    notifyNewReply({ thread, reply, currentUser }).catch(() => {});
    setReplyBody('');
    setPosting(false);
    qc.invalidateQueries({ queryKey: ['forum-replies', threadId] });
    qc.invalidateQueries({ queryKey: ['forum-thread', threadId] });
  }

  async function toggleModeration(field) {
    await base44.entities.ForumThread.update(threadId, { [field]: !thread[field] });
    qc.invalidateQueries({ queryKey: ['forum-thread', threadId] });
  }

  if (loadingThread) return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <Skeleton className="h-10 w-64 mb-4" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-3/4" />
    </div>
  );

  if (!thread) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Thread not found.</p>
        <Link to="/forum" className="text-primary hover:underline">← Back to Forum</Link>
      </div>
    </div>
  );

  const visibleReplies = replies.filter(r => isAdmin || !r.is_hidden);

  return (
    <div className="min-h-screen">
      <SubPageHeader title={thread?.title} backPath="/forum" />
      <section className="py-10 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-16">

          <Link to="/forum" className="hidden lg:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Forum
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Thread Header */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="p-6 rounded-2xl border border-border/60 bg-card">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="capitalize">{thread.topic_tag}</Badge>
                    {thread.is_pinned && <Badge className="bg-accent/10 text-accent border-accent/20">Pinned</Badge>}
                    {thread.is_locked && <Badge variant="secondary">Locked</Badge>}
                    {thread.is_hidden && <Badge variant="destructive">Hidden</Badge>}
                  </div>
                  <h1 className="font-heading text-2xl lg:text-3xl tracking-tight mb-4">{thread.title}</h1>
                  <p className="text-muted-foreground leading-relaxed mb-4">{thread.body}</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs text-muted-foreground">
                      Posted by{' '}
                      <a href={`/profile/${encodeURIComponent(thread.author_email)}`} className="font-medium text-foreground/70 hover:text-primary transition-colors">
                        {thread.author_name || thread.author_email}
                      </a>
                    </p>
                    <FlagButton currentUser={currentUser} contentType="thread" contentId={thread.id} contentPreview={thread.body} />
                  </div>

                  {/* Admin Tools */}
                  {isAdmin && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/50 flex-wrap">
                      <button onClick={() => toggleModeration('is_pinned')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/70 transition-colors">
                        <Pin className="w-3.5 h-3.5" />{thread.is_pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button onClick={() => toggleModeration('is_locked')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/70 transition-colors">
                        <Lock className="w-3.5 h-3.5" />{thread.is_locked ? 'Unlock' : 'Lock'}
                      </button>
                      <button onClick={() => toggleModeration('is_hidden')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                        <EyeOff className="w-3.5 h-3.5" />{thread.is_hidden ? 'Unhide' : 'Hide'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Consult Banner */}
              <ConsultBanner />

              {/* Replies */}
              <div>
                <h2 className="font-heading text-xl mb-4">{visibleReplies.length} {visibleReplies.length === 1 ? 'Reply' : 'Replies'}</h2>
                <div className="space-y-3">
                  {loadingReplies ? (
                    [1,2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
                  ) : (
                    visibleReplies.map(reply => (
                      <ReplyCard
                        key={reply.id}
                        reply={reply}
                        currentUser={currentUser}
                        isAdmin={isAdmin}
                        isThreadAuthor={isAuthor}
                        onUpdate={() => qc.invalidateQueries({ queryKey: ['forum-replies', threadId] })}
                        onOptimisticUpvote={(r) => {
                          qc.setQueryData(['forum-replies', threadId], (old = []) =>
                            old.map(x => {
                              if (x.id !== r.id) return x;
                              const upvotes = x.upvotes || [];
                              const hasVoted = upvotes.includes(currentUser.email);
                              return { ...x, upvotes: hasVoted ? upvotes.filter(e => e !== currentUser.email) : [...upvotes, currentUser.email] };
                            })
                          );
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Reply Form */}
              {currentUser && !thread.is_locked && (
                <form onSubmit={handleReply} className="space-y-3">
                  <textarea
                    value={replyBody}
                    onChange={e => setReplyBody(e.target.value)}
                    placeholder="Share your response or support..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={posting || !replyBody.trim()} className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {posting ? 'Posting...' : 'Reply'}
                    </Button>
                  </div>
                </form>
              )}
              {thread.is_locked && (
                <p className="text-sm text-muted-foreground text-center py-4 border border-border/40 rounded-xl">
                  This thread is locked and no longer accepting replies.
                </p>
              )}
              {!currentUser && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sign in to reply to this thread.
                </p>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <UserProfileCard
                profileEmail={thread.author_email}
                profileName={thread.author_name}
                currentUser={currentUser}
              />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}