import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const today = () => new Date().toISOString().split('T')[0];

export default function DailyPromptBanner() {
  const [goals, setGoals] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [completedToday, setCompletedToday] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    base44.entities.WellnessGoal.filter({ user_email: user.email, is_active: true })
      .then(data => {
        setGoals(data);
        const done = data.filter(g => g.last_completed_date === today()).map(g => g.id);
        setCompletedToday(done);
      })
      .catch(() => {});
  }, [user]);

  const pendingGoals = goals.filter(g => !completedToday.includes(g.id));

  const handleComplete = async (goal) => {
    const newStreak = (goal.last_completed_date === getPreviousDay()) ? (goal.streak || 0) + 1 : 1;
    await base44.entities.WellnessGoal.update(goal.id, {
      last_completed_date: today(),
      streak: newStreak
    });
    setCompletedToday(prev => [...prev, goal.id]);
  };

  const getPreviousDay = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  if (!user || dismissed || pendingGoals.length === 0) return null;

  const categoryEmoji = {
    medication: '💊', mindfulness: '🧘', journaling: '📓',
    exercise: '🏃', sleep: '😴', social: '🤝', custom: '✨'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="mx-4 mt-4 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">
                Daily Wellness Check-in
              </p>
              <div className="flex flex-wrap gap-2">
                {pendingGoals.slice(0, 3).map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => handleComplete(goal)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border/60 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-all group"
                  >
                    <span>{categoryEmoji[goal.category] || '✨'}</span>
                    <span>{goal.title}</span>
                    <CheckCircle2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </button>
                ))}
                {pendingGoals.length > 3 && (
                  <Link
                    to="/wellness"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-background border border-border/60 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    +{pendingGoals.length - 3} more
                  </Link>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg flex-shrink-0 text-muted-foreground"
            onClick={() => setDismissed(true)}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}