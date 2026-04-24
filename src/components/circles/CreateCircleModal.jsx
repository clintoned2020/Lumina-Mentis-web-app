import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FOCUS_OPTIONS = [
  { value: 'meditation', label: 'Meditation', emoji: '🧘' },
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'sleep', label: 'Sleep', emoji: '😴' },
  { value: 'medication', label: 'Medication', emoji: '💊' },
  { value: 'journaling', label: 'Journaling', emoji: '📓' },
  { value: 'mixed', label: 'Mixed', emoji: '🌈' },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#a78bfa', '#f97316'];

export default function CreateCircleModal({ user, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    focus_area: 'mixed',
    is_private: false,
    max_members: 50,
  });
  const [color, setColor] = useState(COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSubmitting(true);
    try {
      await base44.entities.WellnessCircle.create({
        ...form,
        created_by: user.email,
        member_emails: [user.email],
        avatar_color: color,
      });
      onCreated();
    } catch (err) {
      console.error('Failed to create circle', err);
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
        className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 px-6 pt-6 pb-4 border-b border-border/60 flex items-center justify-between">
          <h2 className="font-heading text-xl">Create Wellness Circle</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Circle Name</label>
            <Input
              placeholder="e.g. Morning Meditators"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="rounded-xl"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
            <textarea
              placeholder="What's this circle about?"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              rows={3}
            />
          </div>

          {/* Focus Area */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Wellness Focus</label>
            <div className="grid grid-cols-2 gap-2">
              {FOCUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, focus_area: opt.value }))}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    form.focus_area === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  <span className="mr-1">{opt.emoji}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Color */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Circle Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Privacy */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_private}
              onChange={e => setForm(f => ({ ...f, is_private: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">Private circle (only invited members)</span>
          </label>

          {/* Max Members */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Max Members</label>
            <Input
              type="number"
              min={5}
              max={500}
              value={form.max_members}
              onChange={e => setForm(f => ({ ...f, max_members: parseInt(e.target.value) || 50 }))}
              className="rounded-xl"
            />
          </div>

          <Button type="submit" disabled={submitting} size="lg" className="w-full rounded-xl">
            {submitting ? 'Creating...' : 'Create Circle'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}