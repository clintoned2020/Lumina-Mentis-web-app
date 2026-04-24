import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';

/**
 * Calculates a 0-100 consistency score from active goals.
 * Score = average % of last-14-days where each goal was completed.
 */
function calcConsistency(goals) {
  const activeGoals = goals.filter(g => g.is_active);
  if (activeGoals.length === 0) return { score: 0, perGoal: [] };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const perGoal = activeGoals.map(goal => {
    const history = Array.isArray(goal.completion_history) ? goal.completion_history : [];
    const completed = last14.filter(d => history.includes(d)).length;
    return {
      id: goal.id,
      title: goal.title,
      category: goal.category,
      streak: goal.streak || 0,
      rate: Math.round((completed / 14) * 100),
    };
  });

  const score = Math.round(perGoal.reduce((s, g) => s + g.rate, 0) / perGoal.length);
  return { score, perGoal };
}

function scoreColor(score) {
  if (score >= 80) return { ring: 'stroke-green-500', text: 'text-green-600', bg: 'bg-green-500/10', label: 'Excellent' };
  if (score >= 60) return { ring: 'stroke-primary', text: 'text-primary', bg: 'bg-primary/10', label: 'Good' };
  if (score >= 40) return { ring: 'stroke-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-500/10', label: 'Building' };
  return { ring: 'stroke-muted-foreground', text: 'text-muted-foreground', bg: 'bg-muted/40', label: 'Getting Started' };
}

const CATEGORY_EMOJI = {
  medication: '💊', mindfulness: '🧘', journaling: '📓',
  exercise: '🏃', sleep: '😴', social: '🤝', custom: '⭐',
};

export default function ConsistencyScore({ goals, compact = false }) {
  const { score, perGoal } = useMemo(() => calcConsistency(goals), [goals]);
  const colors = scoreColor(score);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  if (goals.filter(g => g.is_active).length === 0) {
    return (
      <div className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 py-8">
        <Award className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Add wellness goals to see your consistency score</p>
        <Link to="/wellness" className="text-xs text-primary hover:underline flex items-center gap-1">
          Set up goals <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Consistency Score</h3>
        </div>
        <span className="text-xs text-muted-foreground">Last 14 days</span>
      </div>

      {/* Score Ring + Label */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
            <motion.circle
              cx="50" cy="50" r="40"
              fill="none"
              className={colors.ring}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} mb-2`}>
            <Award className="w-3 h-3" />
            {colors.label}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Based on {goals.filter(g => g.is_active).length} active habit{goals.filter(g => g.is_active).length !== 1 ? 's' : ''} over the past 2 weeks.
          </p>
          {!compact && (
            <Link to="/wellness" className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
              Manage habits <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Per-goal breakdown */}
      {!compact && (
        <div className="space-y-2 border-t border-border/40 pt-4">
          {perGoal.map(g => (
            <div key={g.id} className="flex items-center gap-2">
              <span className="text-base w-5 flex-shrink-0">{CATEGORY_EMOJI[g.category] || '⭐'}</span>
              <span className="text-xs flex-1 truncate">{g.title}</span>
              <div className="w-20 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${g.rate >= 80 ? 'bg-green-500' : g.rate >= 50 ? 'bg-primary' : 'bg-yellow-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${g.rate}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{g.rate}%</span>
              {g.streak > 0 && (
                <span className="text-xs text-orange-500 flex items-center gap-0.5 flex-shrink-0">
                  🔥{g.streak}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}