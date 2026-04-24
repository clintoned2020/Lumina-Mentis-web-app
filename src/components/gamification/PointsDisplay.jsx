import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, TrendingUp } from 'lucide-react';

export default function PointsDisplay({ userPoints, showDetails = false }) {
  if (!userPoints) return null;

  const progressPercent = ((userPoints.total_points % (100 * userPoints.current_level)) / (100 * userPoints.current_level)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border border-primary/20 rounded-2xl p-6 space-y-4"
    >
      {/* Level and Points */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Your Level
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{userPoints.current_level}</span>
            <span className="text-sm text-muted-foreground">
              {userPoints.total_points.toLocaleString()} pts
            </span>
          </div>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress to Level {userPoints.current_level + 1}</span>
          <span className="font-semibold text-primary">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          />
        </div>
      </div>

      {showDetails && (
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/30">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Goals Done</p>
            <p className="font-semibold text-foreground">{userPoints.goal_completions}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Circle Posts</p>
            <p className="font-semibold text-foreground">{userPoints.circle_contributions}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Best Streak</p>
            <p className="font-semibold text-foreground text-primary">{userPoints.longest_streak}d</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}