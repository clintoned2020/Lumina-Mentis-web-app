import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const TIER_COLORS = {
  bronze: 'from-amber-400 to-amber-600',
  silver: 'from-slate-300 to-slate-500',
  gold: 'from-yellow-300 to-yellow-600',
  platinum: 'from-cyan-200 to-blue-400',
};

export default function AchievementBadges({ badges, showLocked = true, maxDisplay = 6 }) {
  if (!badges || badges.length === 0) return null;

  const displayBadges = badges.slice(0, maxDisplay);
  const locked = badges.filter(b => !b.earned_at);
  const unlocked = badges.filter(b => b.earned_at);

  return (
    <div className="space-y-4">
      {/* Unlocked Badges */}
      {unlocked.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Achievements Unlocked</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {unlocked.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative"
                title={`${badge.badge_title} - ${badge.description || ''}`}
              >
                <div
                  className={`w-full aspect-square rounded-xl bg-gradient-to-br ${
                    TIER_COLORS[badge.tier] || TIER_COLORS.bronze
                  } flex items-center justify-center text-2xl shadow-md hover:shadow-lg transition-all hover:scale-110 cursor-default`}
                >
                  {badge.badge_icon}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg text-xs font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                  {badge.badge_title}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges Preview */}
      {showLocked && locked.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Locked Achievements</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {locked.slice(0, 6).map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (unlocked.length + i) * 0.05 }}
                className="group relative"
              >
                <div className="w-full aspect-square rounded-xl bg-muted/40 flex items-center justify-center text-2xl opacity-50">
                  {badge.badge_icon}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-muted-foreground/60" />
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border rounded-lg text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                  {badge.badge_title}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}