import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users } from 'lucide-react';

export default function CircleActivityLeaderboard({ userPoints = [], limit = 10 }) {
  const sorted = useMemo(() => {
    return [...userPoints]
      .sort((a, b) => (b.circle_contributions || 0) - (a.circle_contributions || 0))
      .slice(0, limit);
  }, [userPoints, limit]);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Community Contributors</h3>
      </div>
      <div className="space-y-2">
        {sorted.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/60 hover:border-primary/20 transition-colors"
          >
            <span className="text-xs font-semibold text-muted-foreground w-6 text-center">#{i + 1}</span>
            <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center text-xs font-bold text-secondary">
              {entry.user_email
                ?.split('@')[0]
                .split('.')
                .map(p => p[0].toUpperCase())
                .join('') || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {entry.user_email?.split('@')[0]}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-secondary font-semibold text-sm">
              <MessageSquare className="w-3.5 h-3.5" />
              {entry.circle_contributions || 0}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}