import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, ChevronUp, Pin, Lock, Eye, EyeOff, PinOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const tagColors = {
  anxiety: 'bg-yellow-500/10 text-yellow-600',
  depression: 'bg-blue-500/10 text-blue-600',
  schizophrenia: 'bg-purple-500/10 text-purple-600',
  adhd: 'bg-orange-500/10 text-orange-600',
  general: 'bg-muted text-muted-foreground',
  medication: 'bg-red-500/10 text-red-600',
  coping: 'bg-green-500/10 text-green-600',
  relationships: 'bg-pink-500/10 text-pink-600',
  recovery: 'bg-primary/10 text-primary',
};

export default function ThreadCard({ thread, currentUser, index, onUpvote, onModerate }) {
  const upvoted = (thread.upvotes || []).includes(currentUser?.email);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`group p-5 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-300 ${
        thread.is_hidden ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Upvote */}
        <button
          onClick={() => onUpvote(thread)}
          className={`flex flex-col items-center gap-0.5 pt-1 min-w-[44px] min-h-[44px] justify-center transition-colors ${
            upvoted ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          }`}
        >
          <ChevronUp className="w-5 h-5" />
          <span className="text-xs font-semibold">{(thread.upvotes || []).length}</span>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {thread.is_pinned && <Pin className="w-3.5 h-3.5 text-accent flex-shrink-0" />}
            {thread.is_locked && <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
            {thread.is_hidden && <EyeOff className="w-3.5 h-3.5 text-destructive flex-shrink-0" />}
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${tagColors[thread.topic_tag] || tagColors.general}`}>
              {thread.topic_tag}
            </span>
          </div>
          <Link to={`/forum/${thread.id}`}>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1 line-clamp-2">
              {thread.title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{thread.body}</p>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">{thread.author_name || thread.author_email}</span>
              <span>{formatDistanceToNow(new Date(thread.created_date), { addSuffix: true })}</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {thread.reply_count || 0}
              </span>
            </div>

            {/* Admin inline controls */}
            {isAdmin && onModerate && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onModerate(thread, 'pin')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${thread.is_pinned ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-accent hover:bg-accent/10'}`}
                  title={thread.is_pinned ? 'Unpin' : 'Pin to top'}
                >
                  {thread.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => onModerate(thread, 'lock')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${thread.is_locked ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
                  title={thread.is_locked ? 'Unlock' : 'Lock replies'}
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onModerate(thread, 'hide')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${thread.is_hidden ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'}`}
                  title={thread.is_hidden ? 'Unhide' : 'Hide thread'}
                >
                  {thread.is_hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}