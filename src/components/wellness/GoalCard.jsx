import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Flame, Pencil, Trash2, ToggleLeft, ToggleRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categoryEmoji = {
  medication: '💊', mindfulness: '🧘', journaling: '📓',
  exercise: '🏃', sleep: '😴', social: '🤝', custom: '✨'
};

const today = () => new Date().toISOString().split('T')[0];

export default function GoalCard({ goal, onComplete, onEdit, onDelete, onToggleActive }) {
  const isCompletedToday = goal.last_completed_date === today();
  const target = goal.target_days || 21;
  const streak = goal.streak || 0;
  const pct = Math.min(100, Math.round((streak / target) * 100));
  const isAchieved = streak >= target;

  const barColor = isAchieved
    ? 'bg-amber-400'
    : pct >= 75 ? 'bg-green-500'
    : pct >= 40 ? 'bg-primary'
    : 'bg-muted-foreground/40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border transition-all ${
        isAchieved
          ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
          : isCompletedToday
          ? 'bg-secondary/30 border-secondary/50'
          : goal.is_active
          ? 'bg-card border-border/60 hover:border-primary/30 hover:shadow-sm'
          : 'bg-muted/30 border-border/30 opacity-60'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Complete toggle */}
        <button
          onClick={() => !isCompletedToday && onComplete(goal)}
          disabled={isCompletedToday}
          className="mt-0.5 flex-shrink-0"
        >
          {isCompletedToday ? (
            <CheckCircle2 className="w-6 h-6 text-primary" />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground/50 hover:text-primary transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-base">{categoryEmoji[goal.category]}</span>
            <span className={`font-semibold text-sm ${isCompletedToday ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {goal.title}
            </span>
            <Badge variant="outline" className="text-xs capitalize">{goal.category}</Badge>
            {goal.reminder_time && (
              <Badge variant="secondary" className="text-xs">⏰ {goal.reminder_time}</Badge>
            )}
            {isAchieved && (
              <Badge className="text-xs bg-amber-400 text-amber-900 border-0">🏆 Milestone reached!</Badge>
            )}
          </div>

          {goal.note && (
            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{goal.note}</p>
          )}

          {/* Progress bar */}
          <div className="mt-3 mb-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-muted-foreground">
                {isAchieved ? `🎯 ${target}-day milestone achieved` : `${streak} / ${target} day goal`}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">{pct}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            {streak > 0 && (
              <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                <Flame className="w-3.5 h-3.5" />
                {streak} day streak
              </span>
            )}
            {isCompletedToday && !isAchieved && (
              <span className="text-xs text-primary font-medium">✓ Done today</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => onToggleActive(goal)}>
            {goal.is_active
              ? <ToggleRight className="w-4 h-4 text-primary" />
              : <ToggleLeft className="w-4 h-4 text-muted-foreground" />
            }
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => onEdit(goal)}>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => onDelete(goal)}>
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}