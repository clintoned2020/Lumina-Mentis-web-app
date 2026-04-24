import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

export default function PageViewsChart({ pageViews }) {
  // Build last 14 days data
  const data = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const key = format(date, 'yyyy-MM-dd');
    const dayData = pageViews[key] || {};
    const total = Object.values(dayData).reduce((a, b) => a + b, 0);
    return { date: format(date, 'MMM d'), views: total };
  });

  return (
    <div className="p-6 rounded-2xl border border-border/60 bg-card">
      <h3 className="font-heading text-lg mb-1">Page Views</h3>
      <p className="text-xs text-muted-foreground mb-6">Last 14 days</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(221,95%,61%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(221,95%,61%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Area type="monotone" dataKey="views" stroke="hsl(221,95%,61%)" fill="url(#viewsGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}