import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Flame, Zap, Rocket, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const POST_ICONS = {
  progress_update: '📍',
  milestone: '🎯',
  motivation: '💫',
  question: '❓',
};

const REACTION_EMOJIS = {
  clap: { icon: Zap, label: 'Clap', color: 'text-yellow-500' },
  heart: { icon: Heart, label: 'Love', color: 'text-red-500' },
  fire: { icon: Flame, label: 'Fire', color: 'text-orange-500' },
  rocket: { icon: Rocket, label: 'Rocket', color: 'text-blue-500' },
};

export default function CirclePostCard({ post, onReaction, currentUser }) {
  const userReactionType = post.reactions?.find(r => r.email === currentUser?.email)?.type;

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 hover:border-border transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{POST_ICONS[post.type]}</span>
            <span className="font-semibold text-sm text-foreground">{post.author_name}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {post.type === 'milestone' && post.goal_streak && `🔥 ${post.goal_streak}-day streak on ${post.goal_title}`}
            {post.type === 'progress_update' && post.goal_title && `📍 ${post.goal_title} progress`}
            {!post.goal_title && post.type.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Body */}
      <p className="text-sm text-foreground leading-relaxed mb-4">{post.body}</p>

      {/* Title if present */}
      {post.title && (
        <p className="text-sm font-medium text-foreground mb-3">{post.title}</p>
      )}

      {/* Reactions */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(REACTION_EMOJIS).map(([type, { icon: Icon, label, color }]) => {
          const hasReacted = userReactionType === type;
          const count = post.reactions?.filter(r => r.type === type).length || 0;

          return (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              onClick={() => onReaction(type)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                hasReacted
                  ? `${color} bg-accent/20 border-accent/50 border`
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/60 border border-border/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {count > 0 && <span>{count}</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}