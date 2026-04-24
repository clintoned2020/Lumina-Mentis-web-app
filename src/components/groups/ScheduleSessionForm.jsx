import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function ScheduleSessionForm({ groupId, currentUser, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: 60,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.scheduled_at) return;
    setSaving(true);
    await base44.entities.GroupSession.create({
      group_id: groupId,
      ...form,
      duration_minutes: Number(form.duration_minutes),
      facilitator_email: currentUser.email,
      facilitator_name: currentUser.full_name || currentUser.email,
      status: 'upcoming',
      rsvp_emails: [],
    });
    setSaving(false);
    onCreated();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-5 rounded-2xl border border-primary/20 bg-card"
    >
      <h4 className="font-heading text-lg mb-4">Schedule a Live Session</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          placeholder="Session title"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <textarea
          placeholder="Description (optional)"
          rows={2}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Date & Time</label>
            <input
              required
              type="datetime-local"
              value={form.scheduled_at}
              onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="w-32">
            <label className="text-xs text-muted-foreground mb-1 block">Duration (min)</label>
            <input
              type="number"
              min={15}
              max={240}
              value={form.duration_minutes}
              onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="submit" size="sm" disabled={saving}>{saving ? 'Scheduling...' : 'Schedule Session'}</Button>
        </div>
      </form>
    </motion.div>
  );
}