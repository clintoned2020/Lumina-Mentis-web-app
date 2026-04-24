import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, TrendingUp, Smile, Zap, Activity, Calendar,
  ChevronRight, Flame, Target, Brain, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MoodTrendChart from '@/components/journal/MoodTrendChart';
import { MOODS } from '@/components/journal/MoodPicker';
import ConsistencyScore from '@/components/wellness/ConsistencyScore';

const today = () => new Date().toISOString().split('T')[0];

export default function WellnessDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Journal entries
  const { data: journalEntries = [] } = useQuery({
    queryKey: ['dashboard-journal', user?.email],
    queryFn: () => base44.entities.JournalEntry.filter({ user_email: user.email }, '-date', 30),
    enabled: !!user,
  });

  // Wellness goals
  const { data: goals = [] } = useQuery({
    queryKey: ['dashboard-goals', user?.email],
    queryFn: () => base44.entities.WellnessGoal.filter({ user_email: user.email, is_active: true }),
    enabled: !!user,
  });

  if (!user) return null;

  const todayEntry = journalEntries.find(e => e.date === today());
  const currentMood = MOODS.find(m => m.score === todayEntry?.mood);
  
  // Calculate stats
  const avgMood = journalEntries.length
    ? (journalEntries.reduce((s, e) => s + (e.mood || 0), 0) / journalEntries.length).toFixed(1)
    : null;
  const avgEnergy = journalEntries.length
    ? (journalEntries.reduce((s, e) => s + (e.energy || 0), 0) / journalEntries.length).toFixed(1)
    : null;

  // Calculate streak (consecutive days with entries)
  const calculateStreak = () => {
    if (journalEntries.length === 0) return 0;
    const sorted = [...journalEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    for (const entry of sorted) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((checkDate - entryDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        checkDate = entryDate;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();
  const activeGoals = goals.filter(g => g.is_active);
  const completedToday = goals.filter(g => g.last_completed_date === today()).length;

  // Mood distribution
  const moodDistribution = journalEntries.reduce((acc, entry) => {
    const mood = MOODS.find(m => m.score === entry.mood);
    if (mood) {
      acc[mood.label] = (acc[mood.label] || 0) + 1;
    }
    return acc;
  }, {});

  // Recent tags from journal
  const recentTags = [...new Set(journalEntries.flatMap(e => e.tags || []))].slice(0, 6);

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl lg:text-3xl tracking-tight mb-1">
                Your Wellness Journey
              </h2>
              <p className="text-sm text-muted-foreground">
                Personal insights from your journal and activities
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/insights">
                <Button variant="outline" size="sm" className="rounded-xl">
                  <TrendingUp className="w-4 h-4 mr-1" /> Insights
                </Button>
              </Link>
              <Link to="/journal">
                <Button variant="outline" size="sm" className="rounded-xl">
                  Open Journal <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
            <StatCard
              icon={Flame}
              label="Journal Streak"
              value={`${streak} day${streak !== 1 ? 's' : ''}`}
              color="text-orange-500"
              bgColor="bg-orange-500/10"
            />
            <StatCard
              icon={Smile}
              label="Avg Mood"
              value={avgMood ? `${avgMood}/5` : '—'}
              color="text-primary"
              bgColor="bg-primary/10"
            />
            <StatCard
              icon={Zap}
              label="Avg Energy"
              value={avgEnergy ? `${avgEnergy}/5` : '—'}
              color="text-yellow-500"
              bgColor="bg-yellow-500/10"
            />
            <StatCard
              icon={Target}
              label="Goals Today"
              value={`${completedToday}/${activeGoals.length}`}
              color="text-green-500"
              bgColor="bg-green-500/10"
            />
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Mood Trend Chart */}
            <div className="lg:col-span-2 bg-card border border-border/60 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Mood & Energy Trend</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1 bg-primary rounded" /> Mood
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1 bg-accent rounded" /> Energy
                  </span>
                </div>
              </div>
              {journalEntries.length >= 2 ? (
                <MoodTrendChart entries={journalEntries} />
              ) : (
                <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                  Add more journal entries to see your trend
                </div>
              )}
            </div>

            {/* Today's Check-in */}
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Today</h3>
              </div>
              {todayEntry ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{currentMood?.emoji || '📓'}</span>
                    <div>
                      <p className="font-medium capitalize">{todayEntry.mood_label}</p>
                      <p className="text-xs text-muted-foreground">Energy: {todayEntry.energy}/5</p>
                    </div>
                  </div>
                  {todayEntry.reflection && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {todayEntry.reflection}
                    </p>
                  )}
                  <Link to="/journal">
                    <Button variant="outline" size="sm" className="w-full rounded-xl">
                      View Entry
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-3xl mb-3">📓</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    No check-in yet today
                  </p>
                  <Link to="/journal">
                    <Button size="sm" className="rounded-xl">
                      Log Today
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Consistency Score + Bottom Row */}
          <div className="grid lg:grid-cols-2 gap-4 mt-4">
            <ConsistencyScore goals={goals} compact />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mt-4">
            {/* Mood Distribution */}
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">Mood Distribution (30 days)</h3>
              </div>
              {journalEntries.length > 0 ? (
                <div className="space-y-2">
                  {MOODS.slice().reverse().map(mood => {
                    const count = moodDistribution[mood.label] || 0;
                    const percentage = journalEntries.length > 0 
                      ? (count / journalEntries.length) * 100 
                      : 0;
                    return (
                      <div key={mood.label} className="flex items-center gap-3">
                        <span className="text-lg w-6">{mood.emoji}</span>
                        <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="h-full bg-primary/60 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No mood data yet
                </p>
              )}
            </div>

            {/* Activity Summary */}
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Activity Summary</h3>
              </div>
              <div className="space-y-3">
                <ActivityRow
                  icon={BookOpen}
                  label="Journal Entries"
                  value={journalEntries.length}
                  subtitle="in the last 30 days"
                />
                <ActivityRow
                  icon={Target}
                  label="Active Goals"
                  value={activeGoals.length}
                  subtitle="wellness habits"
                />
                <ActivityRow
                  icon={Brain}
                  label="Unique Topics"
                  value={recentTags.length}
                  subtitle="tracked in journal"
                />
              </div>
              {recentTags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <p className="text-xs text-muted-foreground mb-2">Recent Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {recentTags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full bg-muted/60 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-4">
      <div className={`w-8 h-8 rounded-xl ${bgColor} flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function ActivityRow({ icon: Icon, label, value, subtitle }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-right">
        <span className="font-semibold">{value}</span>
        <span className="text-xs text-muted-foreground ml-1">{subtitle}</span>
      </div>
    </div>
  );
}