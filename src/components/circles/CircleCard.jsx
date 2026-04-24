import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, MessageSquare, Lock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FOCUS_ICONS = {
  meditation: '🧘',
  fitness: '💪',
  sleep: '😴',
  medication: '💊',
  journaling: '📓',
  mixed: '🌈',
};

const FOCUS_LABELS = {
  meditation: 'Meditation',
  fitness: 'Fitness',
  sleep: 'Sleep',
  medication: 'Medication',
  journaling: 'Journaling',
  mixed: 'Mixed',
};

export default function CircleCard({ circle, isMember, onJoin, onLeave, onOpen }) {
  const capacity = `${circle.member_emails?.length || 0}/${circle.max_members || 50}`;
  const initials = circle.name
    ?.split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`relative p-6 rounded-2xl border transition-all ${
        isMember
          ? 'bg-primary/5 border-primary/30 shadow-sm'
          : 'bg-card border-border/60 hover:shadow-md hover:border-primary/20'
      }`}
    >
      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm mb-4 flex-shrink-0"
        style={{ backgroundColor: circle.avatar_color || '#a78bfa' }}
      >
        {initials}
      </div>

      {/* Header */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-foreground line-clamp-1">{circle.name}</h3>
          {circle.is_private && (
            <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {circle.description}
        </p>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Badge variant="outline" className="text-xs capitalize rounded-full">
          {FOCUS_ICONS[circle.focus_area]} {FOCUS_LABELS[circle.focus_area]}
        </Badge>
        {circle.post_count > 0 && (
          <Badge variant="secondary" className="text-xs rounded-full">
            {circle.post_count} posts
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 pb-4 border-b border-border/40">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {capacity}
        </span>
        {circle.celebration_count > 0 && (
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-primary" />
            {circle.celebration_count} celebrations
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isMember ? (
          <>
            <Button
              size="sm"
              onClick={onOpen}
              className="flex-1 rounded-lg text-xs h-8"
            >
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onLeave}
              className="rounded-lg text-xs h-8"
            >
              Leave
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={onJoin}
            className="w-full rounded-lg text-xs h-8"
          >
            Join Circle
          </Button>
        )}
      </div>
    </motion.div>
  );
}