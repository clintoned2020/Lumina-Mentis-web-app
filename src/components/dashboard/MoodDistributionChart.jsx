import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MOOD_LABELS = {
  1: 'Very Low',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

const COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa'];

export default function MoodDistributionChart({ entries }) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  entries.forEach(e => { if (e.mood) counts[e.mood]++; });

  const data = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([score, count]) => ({
      name: MOOD_LABELS[score],
      value: count,
      score: parseInt(score),
    }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.score - 1]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value} entries`, name]}
          contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: '11px' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}