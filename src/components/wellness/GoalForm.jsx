import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

const CATEGORIES = [
  { value: 'medication', label: '💊 Medication' },
  { value: 'mindfulness', label: '🧘 Mindfulness' },
  { value: 'journaling', label: '📓 Journaling' },
  { value: 'exercise', label: '🏃 Exercise' },
  { value: 'sleep', label: '😴 Sleep' },
  { value: 'social', label: '🤝 Social' },
  { value: 'custom', label: '✨ Custom' },
];

const FREQUENCIES = ['daily', 'weekdays', 'weekends', 'custom'];

const QUICK_GOALS = [
  { title: 'Take medication', category: 'medication' },
  { title: 'Mindfulness break', category: 'mindfulness' },
  { title: 'Journaling time', category: 'journaling' },
  { title: 'Morning walk', category: 'exercise' },
  { title: 'Bedtime routine', category: 'sleep' },
  { title: 'Connect with someone', category: 'social' },
];

export default function GoalForm({ goal, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(goal || {
    title: '', category: 'custom', reminder_time: '', frequency: 'daily', note: '', is_active: true, target_days: 21
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border/60 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading text-xl">{goal ? 'Edit Goal' : 'New Wellness Goal'}</h3>
        <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick pick */}
      {!goal && (
        <div className="mb-5">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Quick Start</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_GOALS.map(q => (
              <button
                key={q.title}
                onClick={() => setForm(prev => ({ ...prev, title: q.title, category: q.category }))}
                className="px-3 py-1.5 rounded-full border border-border/60 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-all bg-background"
              >
                {q.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Goal Title *</label>
          <Input
            placeholder="e.g. Take medication"
            value={form.title}
            onChange={e => set('title', e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => set('category', c.value)}
                className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                  form.category === c.value
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border/60 text-muted-foreground hover:border-primary/30 bg-background'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Reminder Time</label>
            <Input
              type="time"
              value={form.reminder_time || ''}
              onChange={e => set('reminder_time', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Frequency</label>
            <div className="flex flex-wrap gap-1.5">
              {FREQUENCIES.map(f => (
                <button
                  key={f}
                  onClick={() => set('frequency', f)}
                  className={`px-2.5 py-1 rounded-lg border text-xs capitalize transition-all ${
                    form.frequency === f
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border/60 text-muted-foreground hover:border-primary/30 bg-background'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Milestone Target (days)</label>
          <div className="flex gap-2 flex-wrap">
            {[7, 14, 21, 30, 66, 100].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => set('target_days', d)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  form.target_days === d
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/60 text-muted-foreground hover:border-primary/30 bg-background'
                }`}
              >
                {d} days {d === 21 ? '✦' : d === 66 ? '⭐' : ''}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">21 days builds a habit · 66 days makes it automatic</p>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Personal Note (optional)</label>
          <Textarea
            placeholder="Your intention or reason for this goal..."
            value={form.note || ''}
            onChange={e => set('note', e.target.value)}
            className="h-20 resize-none text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
           <Button variant="outline" onClick={onCancel}>Cancel</Button>
           <Button
             disabled={!form.title || loading}
             onClick={() => {
               if (navigator.vibrate) navigator.vibrate(10);
               onSubmit(form);
             }}
             className="min-w-24"
           >
             {loading ? 'Saving...' : goal ? 'Update' : 'Add Goal'}
           </Button>
         </div>
      </div>
    </motion.div>
  );
}