import React from 'react';

const MOODS = [
  { score: 1, label: 'very low', emoji: '😔', color: 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700' },
  { score: 2, label: 'low',      emoji: '😕', color: 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700' },
  { score: 3, label: 'okay',     emoji: '😐', color: 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700' },
  { score: 4, label: 'good',     emoji: '🙂', color: 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700' },
  { score: 5, label: 'great',    emoji: '😊', color: 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700' },
];

export { MOODS };

export default function MoodPicker({ value, onChange, label = 'How are you feeling?' }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-3">{label}</p>
      <div className="flex gap-2">
        {MOODS.map(m => (
          <button
            key={m.score}
            onClick={() => onChange(m.score, m.label)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
              value === m.score
                ? `${m.color} scale-105 shadow-sm`
                : 'border-border/50 bg-background hover:border-border text-muted-foreground'
            }`}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-xs font-medium capitalize">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}