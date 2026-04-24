import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = [
  'hsl(221,95%,61%)',
  'hsl(27,80%,52%)',
  'hsl(173,58%,39%)',
  'hsl(197,37%,54%)',
  'hsl(43,74%,56%)',
];

export default function TopDisordersChart({ disorderViews }) {
  const data = Object.entries(disorderViews || {})
    .map(([name, views]) => ({ name, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 7);

  if (data.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-border/60 bg-card flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">No disorder views recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border border-border/60 bg-card">
      <h3 className="font-heading text-lg mb-1">Most Viewed Disorders</h3>
      <p className="text-xs text-muted-foreground mb-6">All time</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={110} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
          />
          <Bar dataKey="views" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}