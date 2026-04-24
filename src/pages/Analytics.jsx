import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Eye, Layers, BarChart2, Trash2 } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { getAnalyticsData, clearAnalyticsData } from '@/lib/analytics-tracker';
import { Button } from '@/components/ui/button';
import MetricCard from '../components/analytics/MetricCard';
import PageViewsChart from '../components/analytics/PageViewsChart';
import TopDisordersChart from '../components/analytics/TopDisordersChart';
import TimeSpentChart from '../components/analytics/TimeSpentChart';
import InteractionsChart from '../components/analytics/InteractionsChart';

export default function Analytics() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const data = useMemo(() => getAnalyticsData(), [refreshKey]);

  // --- Compute summary metrics ---
  const totalPageViews = useMemo(() => {
    return Object.values(data.pageViews || {})
      .flatMap(day => Object.values(day))
      .reduce((a, b) => a + b, 0);
  }, [data]);

  const totalSessions = (data.sessions || []).length;

  const avgSessionDuration = useMemo(() => {
    const sessions = data.sessions || [];
    if (!sessions.length) return '0m';
    const avg = sessions.reduce((acc, s) => acc + (s.end - s.start), 0) / sessions.length;
    const mins = Math.round(avg / 60000);
    return mins < 1 ? '<1m' : `${mins}m`;
  }, [data]);

  const totalTimeSpent = useMemo(() => {
    const secs = Object.values(data.timeSpent || {}).reduce((a, b) => a + b, 0);
    const mins = Math.round(secs / 60);
    return mins < 1 ? '<1m' : `${mins}m`;
  }, [data]);

  const topDisorder = useMemo(() => {
    const dv = data.disorderViews || {};
    const top = Object.entries(dv).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : '—';
  }, [data]);

  const todayViews = useMemo(() => {
    const key = format(new Date(), 'yyyy-MM-dd');
    const day = (data.pageViews || {})[key] || {};
    return Object.values(day).reduce((a, b) => a + b, 0);
  }, [data]);

  function handleClear() {
    clearAnalyticsData();
    setRefreshKey(k => k + 1);
  }

  return (
    <div className="min-h-screen">
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-start justify-between mb-16 flex-wrap gap-4"
          >
            <div>
              <p className="text-sm font-medium text-primary tracking-widest uppercase mb-4">
                Your Journey
              </p>
              <h1 className="font-heading text-4xl lg:text-6xl tracking-tight mb-4">
                Activity Dashboard
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                A reflection of your time on Lumina Mentis — what you've explored, how long, and where your curiosity leads.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleClear} className="flex items-center gap-2 text-muted-foreground">
              <Trash2 className="w-3.5 h-3.5" />
              Reset Data
            </Button>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
            <MetricCard title="Total Page Views" value={totalPageViews} subtitle="All time" icon={Eye} color="primary" index={0} />
            <MetricCard title="Today's Views" value={todayViews} subtitle="Today" icon={Activity} color="green" index={1} />
            <MetricCard title="Total Sessions" value={totalSessions} subtitle="Visits recorded" icon={Layers} color="purple" index={2} />
            <MetricCard title="Avg. Session" value={avgSessionDuration} subtitle="Per visit" icon={Clock} color="accent" index={3} />
            <MetricCard title="Total Time" value={totalTimeSpent} subtitle="Time reading" icon={Clock} color="primary" index={4} />
            <MetricCard title="Top Disorder" value={topDisorder} subtitle="Most visited" icon={BarChart2} color="accent" index={5} />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PageViewsChart pageViews={data.pageViews || {}} />
            <InteractionsChart interactions={data.interactions || {}} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopDisordersChart disorderViews={data.disorderViews || {}} />
            <TimeSpentChart timeSpent={data.timeSpent || {}} />
          </div>

        </div>
      </section>
    </div>
  );
}