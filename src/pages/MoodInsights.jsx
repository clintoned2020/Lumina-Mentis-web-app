import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PolarRadiusAxis, Legend
} from 'recharts';
import { TrendingUp, Brain, Calendar, Flame, Smile, Zap, BookOpen, ArrowLeft, Tag } from 'lucide-react';
import { MOODS } from '@/components/journal/MoodPicker';

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

const MOOD_COLORS = {
  'very low': '#f87171',
  'low': '#fb923c',
  'okay': '#facc15',
  'good': '#4ade80',
  'great': '#60a5fa',
};

// Custom tooltip for mood/energy line chart
function MoodTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl px-3 py-2 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export default function MoodInsights() {
  const [user, setUser] = useState(null);
  const [range, setRange] = useState(30);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allEntries = [], isLoading } = useQuery({
    queryKey: ['insights-journal', user?.email],
    queryFn: () => base44.entities.JournalEntry.filter({ user_email: user.email }, '-date', 90),
    enabled: !!user,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['insights-goals', user?.email],
    queryFn: () => base44.entities.WellnessGoal.filter({ user_email: user.email }),
    enabled: !!user,
  });

  // Filter to selected range
  const entries = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return allEntries.filter(e => new Date(e.date) >= cutoff);
  }, [allEntries, range]);

  // --- Derived datasets ---

  // 1. Mood + Energy over time (sorted ascending)
  const trendData = useMemo(() =>
    [...entries]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(e => ({
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Mood: e.mood ?? null,
        Energy: e.energy ?? null,
      })),
    [entries]
  );

  // 2. Mood distribution (bar chart)
  const moodDistData = useMemo(() => {
    const counts = {};
    MOODS.forEach(m => { counts[m.label] = 0; });
    entries.forEach(e => { if (e.mood_label) counts[e.mood_label] = (counts[e.mood_label] || 0) + 1; });
    return MOODS.map(m => ({
      name: m.label,
      count: counts[m.label] || 0,
      emoji: m.emoji,
      fill: MOOD_COLORS[m.label] || '#a78bfa',
    }));
  }, [entries]);

  // 3. Day-of-week average mood
  const dowData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const sums = Array(7).fill(0);
    const counts = Array(7).fill(0);
    entries.forEach(e => {
      if (e.mood) {
        const d = new Date(e.date).getDay();
        sums[d] += e.mood;
        counts[d]++;
      }
    });
    return days.map((day, i) => ({
      day,
      'Avg Mood': counts[i] > 0 ? parseFloat((sums[i] / counts[i]).toFixed(2)) : null,
    }));
  }, [entries]);

  // 4. Tag frequency (top 8)
  const tagData = useMemo(() => {
    const freq = {};
    entries.forEach(e => (e.tags || []).forEach(t => { freq[t] = (freq[t] || 0) + 1; }));
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));
  }, [entries]);

  // 5. Goal category distribution (radar)
  const goalRadarData = useMemo(() => {
    const cats = ['medication', 'mindfulness', 'journaling', 'exercise', 'sleep', 'social'];
    return cats.map(cat => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      Goals: goals.filter(g => g.category === cat).length,
    }));
  }, [goals]);

  // 6. Streak
  const streak = useMemo(() => {
    if (!allEntries.length) return 0;
    const sorted = [...allEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    let s = 0, check = new Date();
    check.setHours(0, 0, 0, 0);
    for (const e of sorted) {
      const d = new Date(e.date); d.setHours(0, 0, 0, 0);
      const diff = Math.floor((check - d) / 86400000);
      if (diff <= 1) { s++; check = new Date(d); check.setDate(check.getDate() - 1); }
      else break;
    }
    return s;
  }, [allEntries]);

  const avgMood = entries.length ? (entries.reduce((s, e) => s + (e.mood || 0), 0) / entries.length).toFixed(1) : null;
  const avgEnergy = entries.length ? (entries.reduce((s, e) => s + (e.energy || 0), 0) / entries.length).toFixed(1) : null;
  const topMood = moodDistData.reduce((best, m) => m.count > best.count ? m : best, moodDistData[0]);

  if (!user) return null;

  return (
    <div className="min-h-screen pb-32 pt-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-16">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-heading text-3xl lg:text-4xl">Mood & Wellness Insights</h1>
          </div>
          <p className="text-muted-foreground">Spot patterns and trends in your mental health journey over time.</p>
        </motion.div>

        {/* Range selector */}
        <div className="flex gap-2 mb-8">
          {RANGES.map(r => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                range === r.days
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-muted-foreground">Loading your data…</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No journal entries in this period.</p>
            <Link to="/journal" className="mt-3 inline-block text-sm text-primary hover:underline">
              Start journaling →
            </Link>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={Flame} label="Current Streak" value={`${streak}d`} color="text-orange-500" bg="bg-orange-500/10" />
              <StatCard icon={Smile} label="Avg Mood" value={avgMood ? `${avgMood}/5` : '—'} color="text-primary" bg="bg-primary/10" />
              <StatCard icon={Zap} label="Avg Energy" value={avgEnergy ? `${avgEnergy}/5` : '—'} color="text-yellow-500" bg="bg-yellow-500/10" />
              <StatCard icon={Calendar} label="Entries" value={entries.length} color="text-accent" bg="bg-accent/10" />
            </div>

            {/* Mood & Energy trend */}
            <ChartCard title="Mood & Energy Over Time" icon={TrendingUp} subtitle="How you've been feeling day by day">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(210,50%,60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(210,50%,60%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(280,30%,75%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(280,30%,75%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<MoodTooltip />} />
                  <Area type="monotone" dataKey="Mood" stroke="hsl(210,50%,60%)" fill="url(#moodGrad)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(210,50%,60%)' }} connectNulls />
                  <Area type="monotone" dataKey="Energy" stroke="hsl(280,30%,65%)" fill="url(#energyGrad)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(280,30%,65%)' }} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-end">
                <Legend item={{ color: 'hsl(210,50%,60%)', label: 'Mood' }} />
                <Legend item={{ color: 'hsl(280,30%,65%)', label: 'Energy' }} />
              </div>
            </ChartCard>

            <div className="grid lg:grid-cols-2 gap-6">

              {/* Mood distribution */}
              <ChartCard title="Mood Distribution" icon={Smile} subtitle={`How often each mood appeared (${range}d)`}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={moodDistData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis dataKey="emoji" tick={{ fontSize: 16 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="bg-card border border-border/60 rounded-xl px-3 py-2 shadow-lg text-xs">
                            <p className="font-semibold">{payload[0]?.payload?.name}</p>
                            <p className="text-muted-foreground">{payload[0]?.value} entries</p>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {moodDistData.map((entry, i) => (
                        <rect key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Day-of-week patterns */}
              <ChartCard title="Day-of-Week Patterns" icon={Calendar} subtitle="Which days tend to be better for you">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dowData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<MoodTooltip />} />
                    <Bar dataKey="Avg Mood" fill="hsl(210,50%,60%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Tag cloud */}
              <ChartCard title="Most Common Journal Tags" icon={Tag} subtitle="Topics you've reflected on most">
                {tagData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No tags found in this period.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {tagData.map(({ tag, count }, i) => {
                      const pct = (count / (tagData[0]?.count || 1)) * 100;
                      return (
                        <div key={tag} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-20 truncate capitalize">{tag}</span>
                          <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, delay: i * 0.05 }}
                              className="h-full bg-accent/70 rounded-full"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ChartCard>

              {/* Goal radar */}
              <ChartCard title="Wellness Goal Categories" icon={Brain} subtitle="Distribution of your wellness habits">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={goalRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Radar name="Goals" dataKey="Goals" stroke="hsl(150,35%,58%)" fill="hsl(150,35%,58%)" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="bg-card border border-border/60 rounded-xl px-3 py-2 shadow-lg text-xs">
                          <p className="font-semibold">{payload[0]?.payload?.category}</p>
                          <p>{payload[0]?.value} goal{payload[0]?.value !== 1 ? 's' : ''}</p>
                        </div>
                      ) : null
                    } />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>

            </div>

            {/* Insight summary card */}
            {entries.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/10 p-6"
              >
                <h3 className="font-heading text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Your Pattern Summary
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• You logged <span className="text-foreground font-medium">{entries.length}</span> entries over the last {range} days — that's a <span className="text-foreground font-medium">{Math.round((entries.length / range) * 100)}%</span> check-in rate.</li>
                  {avgMood && <li>• Your average mood was <span className="text-foreground font-medium">{avgMood}/5</span> — {parseFloat(avgMood) >= 3.5 ? 'generally positive 🌱' : parseFloat(avgMood) >= 2.5 ? 'mixed — keep going 💪' : "tough times. You're not alone 🤝"}.</li>}
                  {topMood?.count > 0 && <li>• Your most common mood was <span className="text-foreground font-medium capitalize">{topMood.name} {topMood.emoji}</span>, recorded {topMood.count} times.</li>}
                  {tagData[0] && <li>• "<span className="text-foreground font-medium capitalize">{tagData[0].tag}</span>" was your most frequent journal tag.</li>}
                </ul>
              </motion.div>
            )}

          </motion.div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5">
      <div className="flex items-start gap-2 mb-4">
        <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-4">
      <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function CustomLegendItem({ item }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: item.color }} />
      {item.value}
    </span>
  );
}