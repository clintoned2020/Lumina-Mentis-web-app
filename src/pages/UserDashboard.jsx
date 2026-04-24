import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen, Target, Flame, Bookmark, TrendingUp,
  Smile, Zap, CheckCircle2, ArrowRight, Brain, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MoodTrendChart from '@/components/journal/MoodTrendChart';
import WellnessStreakChart from '@/components/dashboard/WellnessStreakChart';
import MoodDistributionChart from '@/components/dashboard/MoodDistributionChart';
import InsightCard from '@/components/dashboard/InsightCard';
import { format, subDays, isToday, parseISO } from 'date-fns';

const today = () => new Date().toISOString().split('T')[0];

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      if (u) {
        const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length > 0) setUserProfile(profiles[0]);
      }
    }).catch(() => {});
  }, []);

  const { data: entries = [], isLoading: loadingJournal } = useQuery({
    queryKey: ['journal-entries', user?.email],
    queryFn: () => base44.entities.JournalEntry.filter({ user_email: user.email }, '-date', 60),
    enabled: !!user,
  });

  const { data: goals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ['wellness-goals', user?.email],
    queryFn: () => base44.entities.WellnessGoal.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: saved = [] } = useQuery({
    queryKey: ['saved-resources', user?.email],
    queryFn: () => base44.entities.SavedResource.filter({ user_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  // --- Derived metrics ---
  const avgMood = entries.length
    ? (entries.reduce((s, e) => s + (e.mood || 0), 0) / entries.length).toFixed(1)
    : null;

  const avgEnergy = entries.length
    ? (entries.reduce((s, e) => s + (e.energy || 0), 0) / entries.length).toFixed(1)
    : null;

  const last7Entries = entries.filter(e => {
    const d = new Date(e.date);
    return d >= subDays(new Date(), 7);
  });

  const last7AvgMood = last7Entries.length
    ? (last7Entries.reduce((s, e) => s + (e.mood || 0), 0) / last7Entries.length).toFixed(1)
    : null;

  const moodTrend = avgMood && last7AvgMood
    ? parseFloat(last7AvgMood) > parseFloat(avgMood) ? 'up' : parseFloat(last7AvgMood) < parseFloat(avgMood) ? 'down' : 'stable'
    : 'stable';

  const todayEntry = entries.find(e => e.date === today());
  const activeGoals = goals.filter(g => g.is_active);
  const completedToday = goals.filter(g => g.last_completed_date === today());
  const totalStreak = goals.reduce((sum, g) => sum + (g.streak || 0), 0);
  const journalStreak = (() => {
    let streak = 0;
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    let check = today();
    for (const e of sorted) {
      if (e.date === check) {
        streak++;
        const d = new Date(check);
        d.setDate(d.getDate() - 1);
        check = d.toISOString().split('T')[0];
      } else break;
    }
    return streak;
  })();

  const moodEmoji = {1: '😔', 2: '😕', 3: '😐', 4: '🙂', 5: '😊'};
  const displayName = userProfile?.display_name || user?.full_name || 'there';
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 lg:py-28 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Personal Dashboard</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl tracking-tight mb-3">
              {greeting()}, {displayName} {todayEntry ? moodEmoji[todayEntry.mood] : ''}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Here's a snapshot of your mental health journey — your mood trends, wellness habits, and saved resources all in one place.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-16 space-y-10">

          {/* Quick Stat Cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              icon={BookOpen}
              label="Journal Entries"
              value={entries.length}
              sub={`${journalStreak} day streak`}
              color="text-primary"
              bg="bg-primary/8"
            />
            <StatCard
              icon={Smile}
              label="Avg Mood"
              value={avgMood ? `${avgMood}/5` : '—'}
              sub={moodTrend === 'up' ? '↑ improving' : moodTrend === 'down' ? '↓ declining' : '→ stable'}
              color="text-accent"
              bg="bg-accent/10"
              subColor={moodTrend === 'up' ? 'text-green-500' : moodTrend === 'down' ? 'text-destructive' : 'text-muted-foreground'}
            />
            <StatCard
              icon={Flame}
              label="Wellness Streak"
              value={totalStreak}
              sub={`${completedToday.length}/${activeGoals.length} done today`}
              color="text-orange-400"
              bg="bg-orange-400/10"
            />
            <StatCard
              icon={Bookmark}
              label="Saved Resources"
              value={saved.length}
              sub={`${saved.filter(s => s.resource_type === 'disorder').length} disorders · ${saved.filter(s => s.resource_type === 'remedy').length} remedies`}
              color="text-violet-500"
              bg="bg-violet-500/10"
            />
          </motion.div>

          {/* Today's Check-in Banner */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className={`flex items-center justify-between p-5 rounded-2xl border ${
              todayEntry ? 'bg-secondary/20 border-secondary/40' : 'bg-primary/5 border-primary/20'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{todayEntry ? (moodEmoji[todayEntry.mood] || '📓') : '📓'}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {todayEntry ? "Today's journal entry logged" : "No journal entry today yet"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {todayEntry
                      ? `Feeling ${todayEntry.mood_label} · Energy ${todayEntry.energy}/5`
                      : 'Take a moment to reflect on your day'}
                  </p>
                </div>
              </div>
              <Link to="/journal">
                <Button size="sm" variant={todayEntry ? 'outline' : 'default'}>
                  {todayEntry ? 'View Entry' : 'Write Now'}
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Mood & Energy Trend */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-card border border-border/60 rounded-2xl p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Mood & Energy Trend</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-primary rounded inline-block" /> Mood</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-1 bg-accent rounded inline-block" /> Energy</span>
                  </div>
                </div>
                {entries.length >= 2 ? (
                  <MoodTrendChart entries={entries} />
                ) : (
                  <EmptyChartState
                    icon="📈"
                    message="Log at least 2 journal entries to see your mood trend."
                    link="/journal"
                    linkLabel="Start Journaling"
                  />
                )}
              </div>
            </motion.div>

            {/* Mood Distribution */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="bg-card border border-border/60 rounded-2xl p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Smile className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold text-sm">Mood Distribution</h3>
                </div>
                {entries.length >= 3 ? (
                  <MoodDistributionChart entries={entries} />
                ) : (
                  <EmptyChartState
                    icon="😊"
                    message="Log a few journal entries to see how your moods are distributed."
                    link="/journal"
                    linkLabel="Start Journaling"
                  />
                )}
              </div>
            </motion.div>
          </div>

          {/* Wellness Streak Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-card border border-border/60 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Wellness Habit Completion (last 14 days)</h3>
                </div>
                <Link to="/wellness">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                    Manage Goals <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
              {goals.length > 0 ? (
                <WellnessStreakChart goals={goals} />
              ) : (
                <EmptyChartState
                  icon="🎯"
                  message="Add wellness goals to track your daily habits here."
                  link="/wellness"
                  linkLabel="Set Goals"
                />
              )}
            </div>
          </motion.div>

          {/* Insights & Saved Resources Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* AI-like Insights */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <h3 className="font-semibold text-sm">Personalized Insights</h3>
                </div>
                <div className="space-y-3">
                  {entries.length === 0 && goals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Start journaling and setting wellness goals to unlock personal insights.</p>
                  ) : (
                    <>
                      {journalStreak >= 3 && (
                        <InsightCard emoji="🔥" text={`You've journaled ${journalStreak} days in a row. Consistency is key to self-awareness.`} type="positive" />
                      )}
                      {parseFloat(last7AvgMood) > parseFloat(avgMood) && (
                        <InsightCard emoji="📈" text={`Your mood this week (${last7AvgMood}/5) is above your average (${avgMood}/5). Keep it up!`} type="positive" />
                      )}
                      {parseFloat(last7AvgMood) < parseFloat(avgMood) && (
                        <InsightCard emoji="💙" text={`Your mood this week (${last7AvgMood}/5) is below your average. Consider reaching out or exploring coping tools.`} type="gentle" />
                      )}
                      {completedToday.length === activeGoals.length && activeGoals.length > 0 && (
                        <InsightCard emoji="✅" text={`All ${activeGoals.length} wellness goals completed today. Excellent commitment!`} type="positive" />
                      )}
                      {completedToday.length === 0 && activeGoals.length > 0 && (
                        <InsightCard emoji="⏰" text={`You have ${activeGoals.length} wellness goals pending today. Small habits add up.`} type="nudge" />
                      )}
                      {saved.length > 0 && (
                        <InsightCard emoji="📚" text={`You've saved ${saved.length} resources. Revisiting saved material deepens understanding.`} type="info" />
                      )}
                      {entries.length === 0 && (
                        <InsightCard emoji="📓" text="Start your first journal entry to begin tracking your mental health journey." type="nudge" />
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Saved Resources Summary */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-violet-500" />
                    <h3 className="font-semibold text-sm">Saved Resources</h3>
                  </div>
                  <Link to="/saved">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                      View All <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                {saved.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-3">No saved resources yet.</p>
                    <Link to="/disorders">
                      <Button variant="outline" size="sm">Browse Library</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {saved.slice(0, 5).map(item => (
                      <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                        <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                          {item.resource_type === 'disorder'
                            ? <BookOpen className="w-3.5 h-3.5 text-primary" />
                            : <Target className="w-3.5 h-3.5 text-accent" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.resource_name}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs capitalize flex-shrink-0">
                          {item.resource_type}
                        </Badge>
                      </div>
                    ))}
                    {saved.length > 5 && (
                      <Link to="/saved" className="block text-xs text-primary text-center pt-1 hover:underline">
                        +{saved.length - 5} more saved
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent Journal Entries */}
          {entries.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Recent Journal Entries</h3>
                  </div>
                  <Link to="/journal">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                      Full Journal <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {entries.slice(0, 4).map(entry => (
                    <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/30">
                      <span className="text-xl">{moodEmoji[entry.mood] || '📓'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs font-medium text-muted-foreground">{format(new Date(entry.date), 'MMM d, yyyy')}</p>
                          <Badge variant="outline" className="text-xs px-1.5 py-0">{entry.mood_label || `${entry.mood}/5`}</Badge>
                        </div>
                        {entry.reflection && (
                          <p className="text-sm text-foreground truncate">{entry.reflection}</p>
                        )}
                      </div>
                      {entry.energy && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                          <Zap className="w-3 h-3" />
                          {entry.energy}/5
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: IconComp, label, value, sub, color, bg, subColor = 'text-muted-foreground' }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <IconComp className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-foreground mb-0.5">{value}</p>
      <p className="text-xs font-medium text-foreground mb-0.5">{label}</p>
      <p className={`text-xs ${subColor}`}>{sub}</p>
    </div>
  );
}

function EmptyChartState({ icon, message, link, linkLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="text-3xl mb-3">{icon}</span>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">{message}</p>
      <Link to={link}>
        <Button variant="outline" size="sm">{linkLabel}</Button>
      </Link>
    </div>
  );
}