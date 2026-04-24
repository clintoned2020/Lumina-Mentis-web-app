import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Flame, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import GoalCard from '@/components/wellness/GoalCard';
import GoalForm from '@/components/wellness/GoalForm';
import DailyChecklistSummary from '@/components/wellness/DailyChecklistSummary';
import ConsistencyScore from '@/components/wellness/ConsistencyScore';
import ConsultBanner from '@/components/shared/ConsultBanner';
import PointsDisplay from '@/components/gamification/PointsDisplay';

const today = () => new Date().toISOString().split('T')[0];
const getPreviousDay = () => {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export default function Wellness() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [userPoints, setUserPoints] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: userPointsData } = useQuery({
    queryKey: ['user-points', user?.email],
    queryFn: () => {
      if (!user) return null;
      return base44.entities.UserPoints.filter({ user_email: user.email })
        .then(results => results[0] || null);
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (userPointsData) setUserPoints(userPointsData);
  }, [userPointsData]);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['wellness-goals', user?.email],
    queryFn: () => base44.entities.WellnessGoal.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const completedToday = goals.filter(g => g.last_completed_date === today());
  const activeGoals = goals.filter(g => g.is_active);
  const totalStreak = goals.reduce((sum, g) => sum + (g.streak || 0), 0);

  const handleSubmit = async (form) => {
    setSaving(true);
    const data = { ...form, user_email: user.email };
    if (editingGoal) {
      await base44.entities.WellnessGoal.update(editingGoal.id, data);
    } else {
      await base44.entities.WellnessGoal.create(data);
    }
    setSaving(false);
    setShowForm(false);
    setEditingGoal(null);
    queryClient.invalidateQueries({ queryKey: ['wellness-goals'] });
  };

  const handleComplete = async (goal) => {
    const newStreak = goal.last_completed_date === getPreviousDay() ? (goal.streak || 0) + 1 : 1;
    const history = Array.isArray(goal.completion_history) ? goal.completion_history : [];
    const todayStr = today();
    await base44.entities.WellnessGoal.update(goal.id, {
      last_completed_date: todayStr,
      streak: newStreak,
      completion_history: history.includes(todayStr) ? history : [...history, todayStr],
    });

    // Award points for completing goal
    if (user) {
      await base44.functions.invoke('awardPoints', {
        user_email: user.email,
        action_type: 'goal_completion',
        action_id: goal.id,
      }).catch(() => {});
    }

    queryClient.invalidateQueries({ queryKey: ['wellness-goals'] });
    queryClient.invalidateQueries({ queryKey: ['user-points'] });
  };

  const handleDelete = async (goal) => {
    await base44.entities.WellnessGoal.delete(goal.id);
    queryClient.invalidateQueries({ queryKey: ['wellness-goals'] });
  };

  const handleToggleActive = async (goal) => {
    await base44.entities.WellnessGoal.update(goal.id, { is_active: !goal.is_active });
    queryClient.invalidateQueries({ queryKey: ['wellness-goals'] });
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 lg:py-28 border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Daily Wellness</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl tracking-tight mb-4">
              Your Wellness Goals
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Set gentle daily reminders for the habits that support your mental wellbeing — medication, mindfulness, journaling, and more. Small steps, every day.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-16 space-y-8">

          {/* Points Display */}
          {userPoints && (
            <PointsDisplay userPoints={userPoints} showDetails={false} />
          )}

          {/* Daily Checklist Summary */}
          {goals.length > 0 && (
            <DailyChecklistSummary goals={goals} onComplete={handleComplete} />
          )}

          {/* Consistency Score */}
          {goals.length > 0 && (
            <ConsistencyScore goals={goals} />
          )}

          {/* Stats */}
          {goals.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Active Goals', value: activeGoals.length, icon: Target, color: 'text-primary' },
                { label: 'Done Today', value: `${completedToday.length}/${activeGoals.length}`, icon: CheckCircle2, color: 'text-green-500' },
                { label: 'Total Streak Days', value: totalStreak, icon: Flame, color: 'text-orange-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card border border-border/60 rounded-2xl p-5 text-center">
                  <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <GoalForm
                goal={editingGoal}
                onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setEditingGoal(null); }}
                loading={saving}
              />
            )}
          </AnimatePresence>

          {/* Actions */}
          {!showForm && (
            <div className="flex gap-3">
              <Button
                onClick={() => { setEditingGoal(null); setShowForm(true); }}
                className="flex-1 rounded-2xl h-12"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
              {goals.length > 0 && (
                <Link to="/wellness-progress" className="flex-1">
                  <Button variant="outline" className="w-full rounded-2xl h-12">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Progress
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Goals list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted/30 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : goals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-2xl mb-2">No goals yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Start by adding your first wellness goal. Even one small daily habit can make a meaningful difference.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {/* Active goals first */}
              {goals
                .sort((a, b) => {
                  if (a.is_active && !b.is_active) return -1;
                  if (!a.is_active && b.is_active) return 1;
                  const aDone = a.last_completed_date === today();
                  const bDone = b.last_completed_date === today();
                  if (!aDone && bDone) return -1;
                  if (aDone && !bDone) return 1;
                  return 0;
                })
                .map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onComplete={handleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))
              }
            </div>
          )}

          <ConsultBanner />
        </div>
      </section>
    </div>
  );
}