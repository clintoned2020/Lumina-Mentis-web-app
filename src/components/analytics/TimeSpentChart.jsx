import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export default function TimeSpentChart({ timeSpent }) {
  const data = Object.entries(timeSpent || {})
    .map(([section, seconds]) => ({ section, minutes: Math.round(seconds / 60) }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 8);

  if (data.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-border/60 bg-card flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">No time data recorded yet. Browse around!</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border border-border/60 bg-card">
      <h3 className="font-heading text-lg mb-1">Time Spent by Section</h3>
      <p className="text-xs text-muted-foreground mb-4">Minutes per area</p>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="section" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
          <Radar dataKey="minutes" stroke="hsl(27,80%,52%)" fill="hsl(27,80%,52%)" fillOpacity={0.2} strokeWidth={2} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}