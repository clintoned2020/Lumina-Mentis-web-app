import React from 'react';
import { ChevronUp, Star, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { base44 } from '@/api/base44Client';
import FlagButton from './FlagButton';
import { Link } from 'react-router-dom';

export default function ReplyCard({ reply, currentUser, isAdmin, isThreadAuthor, onUpdate, onOptimisticUpvote, thread }) {
  const upvoted = (reply.upvotes || []).includes(currentUser?.email);

  async function toggleUpvote() {
    if (!currentUser) return;
    // Optimistic update
    if (onOptimisticUpvote) onOptimisticUpvote(reply);
    const upvotes = reply.upvotes || [];
    const updated = upvoted
      ? upvotes.filter(e => e !== currentUser.email)
      : [...upvotes, currentUser.email];
    try {
      await base44.entities.ForumReply.update(reply.id, { upvotes: updated });
    } catch {
      onUpdate(); // revert on error
    }
  }

  async function toggleHelpful() {
    await base44.entities.ForumReply.update(reply.id, { is_helpful: !reply.is_helpful });
    onUpdate();
  }

  async function toggleHide() {
    await base44.entities.ForumReply.update(reply.id, { is_hidden: !reply.is_hidden });
    onUpdate();
  }

  if (reply.is_hidden && !isAdmin) return null;

  return (
    <div className={`flex gap-4 p-5 rounded-2xl border transition-all ${
      reply.is_helpful ? 'border-green-500/30 bg-green-500/5' : 'border-border/60 bg-card'
    } ${reply.is_hidden ? 'opacity-50' : ''}`}>
      {/* Upvote */}
      <button
        onClick={toggleUpvote}
        className={`flex flex-col items-center gap-0.5 pt-1 min-w-[32px] transition-colors ${
          upvoted ? 'text-primary' : 'text-muted-foreground hover:text-primary'
        }`}
      >
        <ChevronUp className="w-4 h-4" />
        <span className="text-xs font-semibold">{(reply.upvotes || []).length}</span>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {reply.is_helpful && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 mb-2">
            <Star className="w-3.5 h-3.5 fill-green-500" />
            Marked as Helpful
          </div>
        )}
        <p className="text-sm text-foreground leading-relaxed mb-3">{reply.body}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="font-medium text-foreground/70">{reply.author_name || reply.author_email}</span>
          <span>{formatDistanceToNow(new Date(reply.created_date), { addSuffix: true })}</span>
          {(isAdmin || isThreadAuthor) && (
            <button onClick={toggleHelpful} className="hover:text-green-600 transition-colors">
              {reply.is_helpful ? '★ Unmark helpful' : '☆ Mark helpful'}
            </button>
          )}
          {isAdmin && (
            <button onClick={toggleHide} className="flex items-center gap-1 hover:text-destructive transition-colors">
              <EyeOff className="w-3 h-3" />
              {reply.is_hidden ? 'Unhide' : 'Hide'}
            </button>
          )}
          <FlagButton currentUser={currentUser} contentType="reply" contentId={reply.id} contentPreview={reply.body} />
          {reply.author_email && (
            <Link to={`/profile/${encodeURIComponent(reply.author_email)}`} className="hover:text-primary transition-colors">
              View profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}