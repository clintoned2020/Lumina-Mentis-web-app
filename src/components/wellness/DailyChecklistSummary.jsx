import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];

const categoryEmoji = {
  medication: '💊', mindfulness: '🧘', journaling: '📓',
  exercise: '🏃', sleep: '😴', social: '🤝', custom: '✨'
};

export default function DailyChecklistSummary({ goals, onComplete }) {
  const active = goals.filter(g => g.is_active);
  if (active.length === 0) return null;

  const done = active.filter(g => g.last_completed_date === today());
  const pct = Math.round((done.length / active.length) * 100);

  const barColor = pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-primary' : 'bg-amber-400';

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base text-foreground">Today's Checklist</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {done.length} of {active.length} habits completed
          </p>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${pct === 100 ? 'text-green-500' : 'text-foreground'}`}>{pct}%</span>
          {pct === 100 && <p className="text-xs text-green-500 font-medium">All done! 🎉</p>}
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-5">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Individual checklist items */}
      <div className="space-y-2">
        {active.map(g => {
          const isDone = g.last_completed_date === today();
          return (
            <button
              key={g.id}
              onClick={() => !isDone && onComplete(g)}
              disabled={isDone}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-left ${
                isDone
                  ? 'border-secondary/50 bg-secondary/20 opacity-80'
                  : 'border-border/50 bg-background hover:border-primary/30 hover:bg-primary/5'
              }`}
            >
              {isDone
                ? <CheckCircle2 className="w-4.5 h-4.5 text-primary flex-shrink-0" style={{ width: '18px', height: '18px' }} />
                : <Circle className="w-4.5 h-4.5 text-muted-foreground/50 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
              }
              <span className="text-sm mr-1">{categoryEmoji[g.category]}</span>
              <span className={`text-sm flex-1 ${isDone ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                {g.title}
              </span>
              {g.streak > 0 && (
                <span className="text-[11px] text-orange-500 font-medium flex-shrink-0">🔥 {g.streak}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}