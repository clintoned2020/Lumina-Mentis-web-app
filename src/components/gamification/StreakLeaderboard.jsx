import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Medal } from 'lucide-react';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function StreakLeaderboard({ userPoints = [], limit = 10, showMedals = true }) {
  const sorted = useMemo(() => {
    return [...userPoints]
      .sort((a, b) => (b.longest_streak || 0) - (a.longest_streak || 0))
      .slice(0, limit);
  }, [userPoints, limit]);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="font-semibold text-foreground">Streak Leaderboard</h3>
      </div>
      <div className="space-y-2">
        {sorted.map((entry, i) => {
          const initials = entry.user_email
            ?.split('@')[0]
            .split('.')
            .map(p => p[0].toUpperCase())
            .join('') || '?';

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/60 hover:border-primary/20 transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {showMedals && i < 3 ? (
                  <span className="text-lg">{MEDALS[i]}</span>
                ) : (
                  <span className="text-xs text-muted-foreground font-semibold">#{i + 1}</span>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {entry.user_email?.split('@')[0]}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-primary font-semibold">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{entry.longest_streak || 0}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}