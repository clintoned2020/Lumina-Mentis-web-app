import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';

const MOOD_LABELS = { 1: '😔', 2: '😕', 3: '😐', 4: '🙂', 5: '😊' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const mood = payload[0]?.value;
  const energy = payload[1]?.value;
  return (
    <div className="bg-card border border-border/60 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {mood && <p className="text-muted-foreground">Mood: {MOOD_LABELS[Math.round(mood)]} {mood}/5</p>}
      {energy && <p className="text-muted-foreground">Energy: ⚡ {energy}/5</p>}
    </div>
  );
};

export default function MoodTrendChart({ entries }) {
  const data = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map(e => ({
      date: format(parseISO(e.date), 'MMM d'),
      mood: e.mood,
      energy: e.energy,
    }));

  if (data.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        Add at least 2 entries to see your mood trend.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
        <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#moodGrad)" dot={{ r: 3, fill: 'hsl(var(--primary))' }} name="mood" />
        <Area type="monotone" dataKey="energy" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#energyGrad)" dot={{ r: 3, fill: 'hsl(var(--accent))' }} name="energy" />
      </AreaChart>
    </ResponsiveContainer>
  );
}