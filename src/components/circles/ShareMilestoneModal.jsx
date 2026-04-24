import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileSelect } from '@/components/ui/mobile-select';

const POST_TYPES = [
  { value: 'progress_update', label: 'Progress Update', emoji: '📍' },
  { value: 'milestone', label: 'Streak Milestone', emoji: '🎯' },
  { value: 'motivation', label: 'Motivation', emoji: '💫' },
  { value: 'question', label: 'Question', emoji: '❓' },
];

export default function ShareMilestoneModal({ circle, user, onClose, onShared }) {
  const [type, setType] = useState('progress_update');
  const [body, setBody] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalStreak, setGoalStreak] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (user && type === 'milestone') {
      base44.entities.WellnessGoal.filter({ user_email: user.email })
        .then(g => setGoals(g.filter(gg => (gg.streak || 0) > 0)))
        .catch(() => {});
    }
  }, [user, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;

    setSubmitting(true);
    try {
      await base44.entities.CirclePost.create({
        circle_id: circle.id,
        author_email: user.email,
        author_name: user.full_name,
        type,
        body,
        goal_title: goalTitle || undefined,
        goal_streak: type === 'milestone' ? parseInt(goalStreak) || 0 : undefined,
      });
      onShared();
    } catch (err) {
      console.error('Failed to share', err);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 px-6 pt-6 pb-4 border-b border-border/60 flex items-center justify-between">
          <h2 className="font-heading text-xl">Share with Circle</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type selector */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">What are you sharing?</label>
            <div className="grid grid-cols-2 gap-2">
              {POST_TYPES.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    type === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  <span className="mr-1">{opt.emoji}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal selection (for milestone) */}
          {type === 'milestone' && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Select Goal</label>
                <MobileSelect
                  value={goalTitle}
                  onChange={setGoalTitle}
                  options={[
                    { value: '', label: 'Choose a goal...' },
                    ...goals.map(g => ({ value: g.title, label: `${g.title} (${g.streak} days)` }))
                  ]}
                  placeholder="Choose a goal..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Current Streak</label>
                <Input
                  type="number"
                  placeholder="e.g. 7"
                  value={goalStreak}
                  onChange={e => setGoalStreak(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </>
          )}

          {/* Body */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {type === 'milestone' ? 'Celebration message' : 'Share your update'}
            </label>
            <textarea
              placeholder={
                type === 'milestone'
                  ? 'Celebrate this milestone with the circle!'
                  : 'What progress did you make today?'
              }
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              rows={4}
              required
            />
          </div>

          <Button type="submit" disabled={submitting} size="lg" className="w-full rounded-xl">
            {submitting ? 'Sharing...' : 'Share with Circle'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}