import React from 'react';

const typeStyles = {
  positive: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800/40',
  gentle: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/40',
  nudge: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/40',
  info: 'bg-muted/40 border-border/40',
};

export default function InsightCard({ emoji, text, type = 'info' }) {
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${typeStyles[type]}`}>
      <span className="text-lg flex-shrink-0">{emoji}</span>
      <p className="text-sm text-foreground leading-relaxed">{text}</p>
    </div>
  );
}