import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Calendar, Flame, Target, Award, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
const today = () => new Date().toISOString().split('T')[0];

function getLast30Days() {
  const dates = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export default function WellnessProgress() {
  const [user, setUser] = useState(null);
  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: goals = [] } = useQuery({
    queryKey: ['wellness-goals', user?.email],
    queryFn: () => base44.entities.WellnessGoal.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const range = parseInt(timeRange);
  const dates = useMemo(() => {
    const all = getLast30Days();
    if (range <= 30) return all.slice(all.length - range);
    
    const extended = [];
    const baseDate = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      extended.push(d.toISOString().split('T')[0]);
    }
    return extended;
  }, [range]);

  const activeGoals = useMemo(() => goals.filter(g => g.is_active), [goals]);

  // Daily completion data for chart
  const dailyData = useMemo(() => {
    return dates.map(date => {
      const completedCount = activeGoals.filter(g =>
        Array.isArray(g.completion_history) && g.completion_history.includes(date)
      ).length;
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: completedCount,
        total: activeGoals.length,
        percent: activeGoals.length > 0 ? Math.round((completedCount / activeGoals.length) * 100) : 0,
      };
    });
  }, [dates, activeGoals]);

  // Category breakdown
  const categoryData = useMemo(() => {
    return activeGoals.reduce((acc, goal) => {
      const existing = acc.find(c => c.name === goal.category);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: goal.category, value: 1 });
      }
      return acc;
    }, []).sort((a, b) => b.value - a.value);
  }, [activeGoals]);

  // Streak data
  const streakStats = useMemo(() => {
    const streaks = activeGoals.map(g => g.streak || 0).filter(s => s > 0);
    return {
      longestStreak: streaks.length > 0 ? Math.max(...streaks) : 0,
      avgStreak: streaks.length > 0 ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) : 0,
      streakCount: streaks.length,
      totalStreak: streaks.reduce((a, b) => a + b, 0),
    };
  }, [activeGoals]);

  // Overall stats
  const stats = useMemo(() => {
    if (activeGoals.length === 0) return { completionRate: 0, consistency: 0 };

    const last14 = dates.slice(Math.max(0, dates.length - 14));
    const completionsByGoal = activeGoals.map(goal => {
      const history = Array.isArray(goal.completion_history) ? goal.completion_history : [];
      const count = last14.filter(d => history.includes(d)).length;
      return count / last14.length;
    });

    const consistency = Math.round(
      completionsByGoal.reduce((a, b) => a + b, 0) / completionsByGoal.length * 100
    );

    const todayCompleted = activeGoals.filter(g =>
      Array.isArray(g.completion_history) && g.completion_history.includes(today())
    ).length;

    return {
      completionRate: activeGoals.length > 0 ? Math.round((todayCompleted / activeGoals.length) * 100) : 0,
      consistency,
    };
  }, [activeGoals, dates]);

  // Trend (improvement)
  const trend = useMemo(() => {
    if (dailyData.length < 2) return null;
    const firstWeek = dailyData.slice(0, 7).reduce((a, b) => a + b.percent, 0) / 7;
    const lastWeek = dailyData.slice(-7).reduce((a, b) => a + b.percent, 0) / 7;
    const change = Math.round(lastWeek - firstWeek);
    return { change, improving: change >= 0 };
  }, [dailyData]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 lg:py-20 border-b border-border/40 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Progress Tracking</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl tracking-tight mb-2">
              Your Wellness Journey
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Visualize your progress across wellness goals with comprehensive charts and streaks.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-16 space-y-8">

          {activeGoals.length === 0 ? (
            <div className="text-center py-20">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <h2 className="font-heading text-2xl mb-2">No active goals yet</h2>
              <p className="text-muted-foreground mb-6">Start by adding wellness goals to see your progress.</p>
              <Button className="rounded-xl" onClick={() => window.location.href = '/wellness'}>
                Add Wellness Goals
              </Button>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Today's Progress</p>
                      <p className="text-3xl font-bold text-foreground">{stats.completionRate}%</p>
                      <p className="text-xs text-muted-foreground mt-2">of goals completed</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Consistency</p>
                      <p className="text-3xl font-bold text-foreground">{stats.consistency}%</p>
                      <p className="text-xs text-muted-foreground mt-2">last 14 days</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Longest Streak</p>
                      <p className="text-3xl font-bold text-foreground">{streakStats.longestStreak}</p>
                      <p className="text-xs text-muted-foreground mt-2">consecutive days</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Trend</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">{trend?.change || 0}%</span>
                        {trend && (
                          <span className={trend.improving ? 'text-green-500' : 'text-destructive'}>
                            {trend.improving ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">vs first week</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Time range selector */}
              <div className="flex gap-2 justify-center">
                {[
                  { label: '7D', value: '7' },
                  { label: '30D', value: '30' },
                  { label: '90D', value: '90' },
                ].map(({ label, value }) => (
                  <Button
                    key={value}
                    variant={timeRange === value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange(value)}
                    className="rounded-lg"
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Daily completion chart */}
              <Card className="p-6 rounded-2xl">
                <h3 className="font-semibold text-sm mb-4">Daily Completion Rate</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      formatter={(value) => [`${value}%`, 'Completion']}
                    />
                    <Bar dataKey="percent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Layout for pie chart and streaks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category breakdown */}
                {categoryData.length > 0 && (
                  <Card className="p-6 rounded-2xl">
                    <h3 className="font-semibold text-sm mb-4">Goals by Category</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name} (${value})`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {/* Streak info */}
                <Card className="p-6 rounded-2xl">
                  <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Streak Statistics
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Longest Streak</p>
                      <p className="text-2xl font-bold text-orange-500">{streakStats.longestStreak} days</p>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Goals with Streaks</p>
                      <p className="text-2xl font-bold text-foreground">{streakStats.streakCount}</p>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Average Streak</p>
                      <p className="text-2xl font-bold text-primary">{streakStats.avgStreak} days</p>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Streak Days</p>
                      <p className="text-2xl font-bold text-accent">{streakStats.totalStreak}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Insights */}
              <Card className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <h3 className="font-semibold text-sm mb-3">Insights</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {stats.consistency >= 80 && (
                    <li>✨ You're crushing it! Maintain this consistency to build lasting habits.</li>
                  )}
                  {stats.consistency >= 60 && stats.consistency < 80 && (
                    <li>🎯 You're making great progress. A few more completions to reach excellence!</li>
                  )}
                  {stats.consistency < 60 && (
                    <li>💪 Keep going! Building habits takes time. Focus on today's goals.</li>
                  )}
                  {activeGoals.length > 5 && (
                    <li>👀 Tip: You have {activeGoals.length} active goals. Consider focusing on your top 3-5.</li>
                  )}
                  {trend && trend.improving && (
                    <li>📈 Great trend! Your completion rate is improving week over week.</li>
                  )}
                </ul>
              </Card>
            </>
          )}
        </div>
      </section>
    </div>
  );
}