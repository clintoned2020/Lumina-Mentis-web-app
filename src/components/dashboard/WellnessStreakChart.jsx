import React from 'react';
import { format, subDays } from 'date-fns';

const today = () => new Date().toISOString().split('T')[0];

export default function WellnessStreakChart({ goals }) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    return d.toISOString().split('T')[0];
  });

  const activeGoals = goals.filter(g => g.is_active);

  const completionByDay = days.map(day => {
    const completed = activeGoals.filter(g =>
      Array.isArray(g.completion_history) && g.completion_history.includes(day)
    ).length;
    const total = activeGoals.length;
    return { day, completed, total, pct: total > 0 ? completed / total : 0 };
  });

  return (
    <div className="space-y-3">
      {/* Grid heatmap */}
      <div className="grid grid-cols-14 gap-1.5">
        {completionByDay.map(({ day, pct }) => {
          const intensity = pct === 0 ? 'bg-muted/40' :
                            pct < 0.34 ? 'bg-orange-300/60' :
                            pct < 0.67 ? 'bg-primary/50' :
                            'bg-primary';
          return (
            <div
              key={day}
              title={`${format(new Date(day), 'MMM d')}`}
              className={`h-8 rounded-lg ${intensity} transition-all`}
            />
          );
        })}
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-14 gap-1.5">
        {completionByDay.map(({ day }, i) => (
          <div key={day} className="text-center">
            <span className="text-xs text-muted-foreground">
              {i === 0 || i === 6 || i === 13 ? format(new Date(day), 'M/d') : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted/40 inline-block" /> None</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-300/60 inline-block" /> Partial</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary/50 inline-block" /> Most</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary inline-block" /> All done</span>
      </div>
    </div>
  );
}