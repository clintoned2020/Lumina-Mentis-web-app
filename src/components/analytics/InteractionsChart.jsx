import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function InteractionsChart({ interactions }) {
  const data = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const key = format(date, 'yyyy-MM-dd');
    const dayData = interactions[key] || {};
    const total = Object.values(dayData).reduce((a, b) => a + b, 0);
    return { date: format(date, 'MMM d'), interactions: total };
  });

  return (
    <div className="p-6 rounded-2xl border border-border/60 bg-card">
      <h3 className="font-heading text-lg mb-1">Daily Interactions</h3>
      <p className="text-xs text-muted-foreground mb-6">Sections explored per day — last 14 days</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
          />
          <Line type="monotone" dataKey="interactions" stroke="hsl(173,58%,39%)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(173,58%,39%)' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}